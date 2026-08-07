import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Paperclip, CheckCircle, FileText, Sparkles } from 'lucide-react';

interface ChatQuoteCollected {
  vin: string;
  year: string;
  make: string;
  model: string;
  fullName: string;
  dob: string;
  license: string;
  street: string;
  city: string;
  postal: string;
  province: string;
  term: '1m' | '3m' | '6m' | '12m';
  coverage: 'basic' | 'full';
  extraDrivers: number;
  additionalDrivers?: string;
}

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  qaId?: string;
  actionButtons?: {
    text: string;
    payload: string;
    actionType: 'start_quote' | 'select_license' | 'select_term' | 'select_coverage' | 'select_drivers' | 'finish_jump' | 'scam_check' | 'whatsapp';
  }[];
  policyNumber?: string;
  isActivated?: boolean;
}

// ─── Canadian Postal Code & Province Detector ─────────────────
const POSTAL_PROVINCE_MAP: Record<string, { code: string; name: string }> = {
  'A': { code: 'NL', name: 'Newfoundland & Labrador' },
  'B': { code: 'NS', name: 'Nova Scotia' },
  'C': { code: 'PE', name: 'Prince Edward Island' },
  'E': { code: 'NB', name: 'New Brunswick' },
  'G': { code: 'QC', name: 'Quebec' },
  'H': { code: 'QC', name: 'Quebec' },
  'J': { code: 'QC', name: 'Quebec' },
  'K': { code: 'ON', name: 'Ontario' },
  'L': { code: 'ON', name: 'Ontario' },
  'M': { code: 'ON', name: 'Ontario' },
  'N': { code: 'ON', name: 'Ontario' },
  'P': { code: 'ON', name: 'Ontario' },
  'R': { code: 'MB', name: 'Manitoba' },
  'S': { code: 'SK', name: 'Saskatchewan' },
  'T': { code: 'AB', name: 'Alberta' },
  'V': { code: 'BC', name: 'British Columbia' },
  'X': { code: 'NT', name: 'Northwest Territories' },
  'Y': { code: 'YT', name: 'Yukon' },
};

// ─── Strict Validation Helpers ────────────────────────────────
function isValidVIN(vin: string): boolean {
  const clean = vin.trim().toUpperCase();
  if (clean.length !== 17) return false;
  if (/[IOQ]/i.test(clean)) return false;
  if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(clean)) return false;
  return true;
}

function isValidCanadianPostal(text: string): boolean {
  const postalMatch = text.match(/[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d/i);
  return !!postalMatch;
}

function parsePostalAndProvince(text: string) {
  const clean = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const postalMatch = text.match(/[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d/i) || text.match(/[A-Za-z]\d[A-Za-z]/i);
  const postal = postalMatch ? postalMatch[0].toUpperCase() : (clean.slice(0, 6) || 'M5V 2T6');
  const firstChar = postal[0] || 'M';
  const prov = POSTAL_PROVINCE_MAP[firstChar] || { code: 'ON', name: 'Ontario' };

  let street = '100 Bay St';
  let city = 'Toronto';

  const parts = text.split(/[,;\n]/).map(p => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    street = parts[0];
    city = parts[1];
  } else if (parts.length === 1) {
    street = parts[0];
  }

  return { postal, province: prov.code, provinceName: prov.name, street, city };
}

function parseNameAndStrictDOB(text: string) {
  let dob = '';
  let fullName = text.trim();

  const dateMatch = text.match(/\b(19\d\d|20\d\d)[-/.](0[1-9]|1[0-2])[-/.](0[1-9]|[12]\d|3[01])\b/) ||
                    text.match(/\b(0[1-9]|1[0-2])[-/.](0[1-9]|[12]\d|3[01])[-/.](19\d\d|20\d\d)\b/);

  if (dateMatch) {
    dob = dateMatch[0].replace(/[/.]/g, '-');
    fullName = text.replace(dateMatch[0], '').trim();
  }

  fullName = fullName.replace(/[,;:=]/g, ' ').replace(/\s+/g, ' ').trim();
  const nameParts = fullName.split(' ').filter(p => p.length >= 2);
  const validName = nameParts.length >= 2 ? fullName : '';

  return { fullName: validName, dob };
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [chatMounted, setChatMounted] = useState(false); // for ease-in animation
  const [showAlertBubble, setShowAlertBubble] = useState(true);
  const [stickyVisible, setStickyVisible] = useState(false); // tracks sticky CTA bar
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Flow Step Tracker
  // 0: idle | 1: ask_vin (typed) | 2: ask_name_dob (typed) | 3: ask_address_postal (typed) | 35: select_license | 4: select_term | 41: select_coverage | 42: select_drivers | 45: ask_additional_driver_names (typed) | 5: jump
  const [chatStep, setChatStep] = useState<number>(0);
  const [collected, setCollected] = useState<Partial<ChatQuoteCollected>>({
    term: '3m',
    coverage: 'basic',
    extraDrivers: 0,
    license: 'G',
    province: 'ON',
  });

  const [activePolicyNumber, setActivePolicyNumber] = useState<string | null>(null);
  const [policyStatus, setPolicyStatus] = useState<string>('pending');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track sticky CTA visibility to shift FAB on mobile
  useEffect(() => {
    let isInsideQuote = false;
    const checkSticky = () => {
      setStickyVisible(window.scrollY > 300 && !isInsideQuote);
    };
    const quoteEl = document.getElementById('quote');
    let observer: IntersectionObserver | null = null;
    if (quoteEl) {
      observer = new IntersectionObserver(([entry]) => {
        isInsideQuote = entry.isIntersecting;
        checkSticky();
      }, { threshold: 0.05 });
      observer.observe(quoteEl);
    }
    window.addEventListener('scroll', checkSticky, { passive: true });
    checkSticky();
    return () => {
      window.removeEventListener('scroll', checkSticky);
      if (observer && quoteEl) observer.unobserve(quoteEl);
    };
  }, []);

  // Mount-then-animate pattern for chat open ease
  useEffect(() => {
    if (isOpen) {
      setChatMounted(true);
    } else {
      const timer = setTimeout(() => setChatMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Auto-scroll feed
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, chatStep]);

  // Dispatch collected data to VINQuoteSystem and jump directly to Step 4 Activation
  const dispatchToPinkCardGenerator = (finalData: Partial<ChatQuoteCollected>) => {
    const fullData: ChatQuoteCollected = {
      vin: finalData.vin || '2C3CDZF95MH104829',
      year: finalData.year || '2021',
      make: finalData.make || 'Dodge',
      model: finalData.model || 'Charger',
      fullName: finalData.fullName || 'John Smith',
      dob: finalData.dob || '1992-05-14',
      license: finalData.license || 'G',
      street: finalData.street || '100 Bay St',
      city: finalData.city || 'Toronto',
      postal: finalData.postal || 'M5V 2T6',
      province: finalData.province || 'ON',
      term: finalData.term || '3m',
      coverage: finalData.coverage || 'basic',
      extraDrivers: finalData.extraDrivers || 0,
      additionalDrivers: finalData.additionalDrivers || '',
    };

    setIsOpen(false);
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent('populate-pink-card-quote', {
          detail: {
            vehicle: {
              vin: fullData.vin,
              year: fullData.year,
              make: fullData.make,
              model: fullData.model,
            },
            driver: {
              license: fullData.license,
              dob: fullData.dob,
              postal: fullData.postal,
              province: fullData.province,
            },
            coverage: {
              term: fullData.term,
              type: fullData.coverage,
              deductible: '500',
              extraDrivers: fullData.extraDrivers,
            },
            pinkCard: {
              fullName: fullData.fullName,
              street: fullData.street,
              city: fullData.city,
              additionalDrivers: fullData.additionalDrivers, // Printed directly on Pink Card!
            },
            view: 'activate', // Jumps directly to Step 4 Activation & TD Pink Card Preview!
          },
        })
      );
    }, 150);
  };

  const toggleChat = () => {
    setIsOpen(prev => !prev);
    setShowAlertBubble(false);
  };

  // Initialize chatbot greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting: Message = {
        id: '0',
        type: 'bot',
        content: `👋 Hi! I'm Edward, Senior Insurance Broker at PolarGuard Insurance.

Let's build your TD Pink Card right here in chat! I will gather your details step-by-step and take you directly to your Watermarked TD Pink Slip Preview & Payment page!`,
        timestamp: new Date(),
        actionButtons: [
          { text: '🚗 Start In-Chat Pink Card Setup', payload: 'start', actionType: 'start_quote' },
        ],
      };
      setMessages([greeting]);
    }
  }, [isOpen, messages.length]);

  // Real-time Telegram approval listener
  useEffect(() => {
    if (!activePolicyNumber || policyStatus === 'active') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/notify/status/${activePolicyNumber}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === 'active') {
          setPolicyStatus('active');
          clearInterval(interval);
          setMessages(prev => [
            ...prev,
            {
              id: Date.now().toString(),
              type: 'bot',
              content: `🎉 PAYMENT VERIFIED & ACTIVATED!

Your e-Transfer receipt for Policy ${activePolicyNumber} has been verified by the broker on Telegram. Your TD Motor Vehicle Liability Card is official, active, and ready to download!`,
              timestamp: new Date(),
              policyNumber: activePolicyNumber,
              isActivated: true,
              actionButtons: [
                { text: '📄 Download Official TD Pink Slip (PDF)', payload: activePolicyNumber, actionType: 'finish_jump' },
              ],
            },
          ]);
        }
      } catch (err) {}
    }, 3000);

    return () => clearInterval(interval);
  }, [activePolicyNumber, policyStatus]);

  // Handle Step Action Buttons (Enforcing 5000ms Typing Delay)
  const handleActionButtonClick = (payload: string, actionType: string, buttonText: string) => {
    if (actionType === 'scam_check') {
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), type: 'user', content: buttonText, timestamp: new Date() },
      ]);
      setIsLoading(true);

      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            type: 'bot',
            content: `I completely understand your caution! Online insurance can feel tricky, so being careful is super smart.

PolarGuard Insurance is 100% legitimate, registered, and operates independently under DESOLOC LLC with underwriting by TD General Insurance Company.

Every policy generates an official Canadian Motor Vehicle Liability Card (TD Pink Card) recognized at ServiceOntario, Service Alberta, ICBC, SAAQ, and across Canada.

You can also speak directly with our licensed broker on WhatsApp at +1 (579) 987-7798 anytime!`,
            timestamp: new Date(),
            actionButtons: [
              { text: '🚗 Start In-Chat Pink Card Setup', payload: 'start', actionType: 'start_quote' },
              { text: '💬 WhatsApp Live Broker', payload: 'https://wa.me/15799877798', actionType: 'whatsapp' },
            ],
          },
        ]);
        setIsLoading(false);
      }, 5000);
      return;
    }

    if (actionType === 'whatsapp') {
      window.open(payload, '_blank');
      return;
    }

    // Start Step 1: VIN (User MUST TYPE VIN)
    if (actionType === 'start_quote') {
      setChatStep(1);
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), type: 'user', content: buttonText, timestamp: new Date() },
      ]);
      setIsLoading(true);

      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            type: 'bot',
            content: `Awesome! Step 1 of 4: Vehicle VIN 🚘

Please TYPE your 17-character VIN in the chat input below:`,
            timestamp: new Date(),
          },
        ]);
        setIsLoading(false);
      }, 5000);
      return;
    }

    // Step 3b: License Class Selected -> Ask Term
    if (actionType === 'select_license') {
      const updated = { ...collected, license: payload };
      setCollected(updated);
      setChatStep(4);

      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), type: 'user', content: buttonText, timestamp: new Date() },
      ]);
      setIsLoading(true);

      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            type: 'bot',
            content: `License Recorded: ${payload}! 💳

Step 4a of 4: Select your Prepaid Term length:`,
            timestamp: new Date(),
            actionButtons: [
              { text: '⭐ 3 Months ($481 - Recommended Standard)', payload: '3m', actionType: 'select_term' },
              { text: '⏱️ 1 Month ($226 - Plate Renewal)', payload: '1m', actionType: 'select_term' },
              { text: '🔥 6 Months (Save 15% - $818)', payload: '6m', actionType: 'select_term' },
              { text: '💎 12 Months (Save 25% - $1443)', payload: '12m', actionType: 'select_term' },
            ],
          },
        ]);
        setIsLoading(false);
      }, 5000);
      return;
    }

    // Step 4a: Term Selected -> Ask Coverage Tier
    if (actionType === 'select_term') {
      const termVal = payload as '1m' | '3m' | '6m' | '12m';
      const updated = { ...collected, term: termVal };
      setCollected(updated);

      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), type: 'user', content: buttonText, timestamp: new Date() },
      ]);
      setIsLoading(true);

      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            type: 'bot',
            content: `Term Selected: ${termVal.toUpperCase()} Prepaid! 🛡️

Step 4b of 4: Select your Coverage Tier:`,
            timestamp: new Date(),
            actionButtons: [
              { text: '🛡️ Basic Coverage (Liability + DCPD)', payload: 'basic', actionType: 'select_coverage' },
              { text: '🌟 Full Coverage (+ Collision & Comprehensive)', payload: 'full', actionType: 'select_coverage' },
            ],
          },
        ]);
        setIsLoading(false);
      }, 5000);
      return;
    }

    // Step 4b: Coverage Selected -> Ask Additional Drivers
    if (actionType === 'select_coverage') {
      const covVal = payload as 'basic' | 'full';
      const updated = { ...collected, coverage: covVal };
      setCollected(updated);

      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), type: 'user', content: buttonText, timestamp: new Date() },
      ]);
      setIsLoading(true);

      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            type: 'bot',
            content: `Coverage Selected: ${covVal === 'full' ? 'Full Coverage' : 'Basic Coverage'}! 👥

Step 4c of 4: Are there any additional drivers to include on the Pink Card policy?`,
            timestamp: new Date(),
            actionButtons: [
              { text: '👤 Just me (0 Extra Drivers)', payload: '0', actionType: 'select_drivers' },
              { text: '👥 +1 Additional Driver ($40/mo)', payload: '1', actionType: 'select_drivers' },
              { text: '👥 +2 Additional Drivers ($80/mo)', payload: '2', actionType: 'select_drivers' },
            ],
          },
        ]);
        setIsLoading(false);
      }, 5000);
      return;
    }

    // Step 4c: Additional Drivers Selected
    if (actionType === 'select_drivers') {
      const extraD = parseInt(payload, 10) || 0;
      const updated = { ...collected, extraDrivers: extraD };
      setCollected(updated);

      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), type: 'user', content: buttonText, timestamp: new Date() },
      ]);
      setIsLoading(true);

      if (extraD > 0) {
        setChatStep(45);
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              id: Date.now().toString(),
              type: 'bot',
              content: `Got it! Please TYPE the Full Name(s) of the ${extraD} additional driver(s) so we can print them on your official TD Pink Card (e.g. "Sarah Smith"):`,
              timestamp: new Date(),
            },
          ]);
          setIsLoading(false);
        }, 5000);
        return;
      }

      // If 0 extra drivers, jump directly to Step 4 Activation!
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            type: 'bot',
            content: `All set, ${updated.fullName || 'Primary Driver'}! 🎉

I've populated all your information (Name, VIN, Address, License, Term, and Coverage) into your policy.

Taking you straight to your **10-Second Watermarked TD Pink Slip Preview & Payment Page** now! 🚀`,
            timestamp: new Date(),
          },
        ]);
        setIsLoading(false);
        dispatchToPinkCardGenerator(updated);
      }, 5000);
      return;
    }

    if (actionType === 'finish_jump') {
      dispatchToPinkCardGenerator(collected);
      return;
    }
  };

  // Handle General Text Input & Strict Validation Per Step (Enforcing 5000ms Delay)
  const handleSendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;

    // STEP 1: Typing VIN manually -> Strict 17-character VIN check
    if (chatStep === 1) {
      const vinInput = userMessage.trim().toUpperCase();

      if (!isValidVIN(vinInput)) {
        setMessages(prev => [
          ...prev,
          { id: Date.now().toString(), type: 'user', content: userMessage, timestamp: new Date() },
        ]);
        setIsLoading(true);

        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              id: Date.now().toString(),
              type: 'bot',
              content: `⚠️ Invalid VIN format!

A valid Canadian VIN must be exactly 17 characters long without spaces or letters I, O, Q.

Please check your vehicle registration or dashboard and re-enter your 17-character VIN:`,
              timestamp: new Date(),
            },
          ]);
          setIsLoading(false);
        }, 5000);
        setInputValue('');
        return;
      }

      const updated = { ...collected, vin: vinInput, year: '2021', make: 'Dodge', model: 'Charger' };
      setCollected(updated);
      setChatStep(2);

      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), type: 'user', content: userMessage, timestamp: new Date() },
      ]);
      setIsLoading(true);

      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            type: 'bot',
            content: `Vehicle Registered (VIN: ${vinInput})! 🚘

Step 2 of 4: Primary Driver Details 👤

Please TYPE your Full Name (First & Last) and Date of Birth (YYYY-MM-DD) in the chat input below (e.g. "John Smith 1994-05-12"):`,
            timestamp: new Date(),
          },
        ]);
        setIsLoading(false);
      }, 5000);
      setInputValue('');
      return;
    }

    // STEP 2: Typing Name & Strict DOB (YYYY-MM-DD) -> Strict check
    if (chatStep === 2) {
      const parsed = parseNameAndStrictDOB(userMessage);

      if (!parsed.fullName || !parsed.dob) {
        setMessages(prev => [
          ...prev,
          { id: Date.now().toString(), type: 'user', content: userMessage, timestamp: new Date() },
        ]);
        setIsLoading(true);

        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              id: Date.now().toString(),
              type: 'bot',
              content: `⚠️ Information incomplete for your Pink Card!

Please enter BOTH your Full Name (First & Last Name) AND your Date of Birth in YYYY-MM-DD format (e.g. "John Smith 1994-05-12"):`,
              timestamp: new Date(),
            },
          ]);
          setIsLoading(false);
        }, 5000);
        setInputValue('');
        return;
      }

      const updated = { ...collected, fullName: parsed.fullName, dob: parsed.dob };
      setCollected(updated);
      setChatStep(3);

      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), type: 'user', content: userMessage, timestamp: new Date() },
      ]);
      setIsLoading(true);

      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            type: 'bot',
            content: `Got it, ${parsed.fullName} (DOB: ${parsed.dob})! 📍

Step 3 of 4: Address & Canadian Postal Code (Zip Code)

Please TYPE your Street Address and Postal Code below (e.g. "100 Bay St, Toronto M5V 2T6" or "Calgary T2P 1J9"):`,
            timestamp: new Date(),
          },
        ]);
        setIsLoading(false);
      }, 5000);
      setInputValue('');
      return;
    }

    // STEP 3a: Typing Address & Postal Code -> Strict Canadian Postal Check
    if (chatStep === 3) {
      if (!isValidCanadianPostal(userMessage)) {
        setMessages(prev => [
          ...prev,
          { id: Date.now().toString(), type: 'user', content: userMessage, timestamp: new Date() },
        ]);
        setIsLoading(true);

        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              id: Date.now().toString(),
              type: 'bot',
              content: `⚠️ Invalid Canadian Postal Code!

Canadian postal codes follow the A1A 1A1 format (e.g. "M5V 2T6" or "T2P 1J9").

Please re-enter your Street Address and valid Postal Code (e.g. "100 Bay St, Toronto M5V 2T6"):`,
              timestamp: new Date(),
            },
          ]);
          setIsLoading(false);
        }, 5000);
        setInputValue('');
        return;
      }

      const parsedLoc = parsePostalAndProvince(userMessage);
      const updated = { ...collected, postal: parsedLoc.postal, province: parsedLoc.province, street: parsedLoc.street, city: parsedLoc.city };
      setCollected(updated);
      setChatStep(35);

      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), type: 'user', content: userMessage, timestamp: new Date() },
      ]);
      setIsLoading(true);

      let licenseBtns = [
        { text: '💳 Full G License', payload: 'G', actionType: 'select_license' as const },
        { text: '💳 G2 License (+5%)', payload: 'G2', actionType: 'select_license' as const },
        { text: '💳 G1 License (+15%)', payload: 'G1', actionType: 'select_license' as const },
      ];

      if (parsedLoc.province === 'AB') {
        licenseBtns = [
          { text: '💳 Class 5 Full', payload: 'Class 5', actionType: 'select_license' as const },
          { text: '💳 Class 5 GDL (+5%)', payload: 'Class 5 GDL', actionType: 'select_license' as const },
          { text: '💳 Class 7 (+15%)', payload: 'Class 7', actionType: 'select_license' as const },
        ];
      } else if (parsedLoc.province === 'BC') {
        licenseBtns = [
          { text: '💳 Class 5 Full', payload: 'Class 5', actionType: 'select_license' as const },
          { text: '💳 Class 7 Novice (N)', payload: 'Class 7 N', actionType: 'select_license' as const },
        ];
      } else if (parsedLoc.province === 'QC') {
        licenseBtns = [
          { text: '💳 Class 5 Permis', payload: 'Class 5', actionType: 'select_license' as const },
          { text: '💳 Permis Probatoire', payload: 'Probatoire', actionType: 'select_license' as const },
        ];
      }

      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            type: 'bot',
            content: `Address Recorded: ${parsedLoc.street}, ${parsedLoc.city} (${parsedLoc.postal})! 📍
Detected Province: ${parsedLoc.provinceName} (${parsedLoc.province})

Please select your License Class (or type it below):`,
            timestamp: new Date(),
            actionButtons: licenseBtns,
          },
        ]);
        setIsLoading(false);
      }, 5000);
      setInputValue('');
      return;
    }

    // Custom license class typed in Step 3b
    if (chatStep === 35) {
      handleActionButtonClick(userMessage, 'select_license', userMessage);
      setInputValue('');
      return;
    }

    // STEP 4d: Typing Additional Driver Name(s) -> Strict check
    if (chatStep === 45) {
      const addNames = userMessage.trim();
      if (!addNames || addNames.length < 2) {
        setMessages(prev => [
          ...prev,
          { id: Date.now().toString(), type: 'user', content: userMessage, timestamp: new Date() },
        ]);
        setIsLoading(true);

        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              id: Date.now().toString(),
              type: 'bot',
              content: `⚠️ Please enter the full name of your additional driver(s) (e.g. "Sarah Smith"):`,
              timestamp: new Date(),
            },
          ]);
          setIsLoading(false);
        }, 5000);
        setInputValue('');
        return;
      }

      const updated = { ...collected, additionalDrivers: addNames };
      setCollected(updated);

      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), type: 'user', content: userMessage, timestamp: new Date() },
      ]);
      setIsLoading(true);

      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            type: 'bot',
            content: `Additional Driver(s) Recorded: "${addNames}"! 📄

I've populated all your information (Primary: ${updated.fullName}, Additional: ${addNames}, VIN, Address, License, Term, and Coverage) into your policy.

Taking you straight to your **10-Second Watermarked TD Pink Slip Preview & Payment Page** now! 🚀`,
            timestamp: new Date(),
          },
        ]);
        setIsLoading(false);
        dispatchToPinkCardGenerator(updated);
      }, 5000);
      setInputValue('');
      return;
    }

    // Explicit request to start Pink Card setup flow
    if (/\b(?:start|create|build|make|generate|get)\s*(?:a\s*)?(?:quote|pink card|pink slip|setup|policy)\b/i.test(userMessage)) {
      handleActionButtonClick('start', 'start_quote', userMessage);
      setInputValue('');
      return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: userMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    const startTime = Date.now();

    try {
      const conversationHistory = [...messages, userMsg].map(m => ({
        role: m.type === 'user' ? ('user' as const) : ('model' as const),
        text: m.content,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversationHistory }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.text) {
          const botResponse: Message = {
            id: (Date.now() + 1).toString(),
            type: 'bot',
            content: data.text,
            timestamp: new Date(),
          };

          botResponse.actionButtons = [
            { text: '🚗 Start In-Chat Pink Card Setup', payload: 'start', actionType: 'start_quote' },
          ];

          const elapsed = Date.now() - startTime;
          const remainingDelay = Math.max(5000 - elapsed, 500);

          setTimeout(() => {
            setMessages(prev => [...prev, botResponse]);
            setIsLoading(false);
          }, remainingDelay);
          return;
        }
      }
    } catch (err) {}

    // AI unavailable — show high-demand message with WhatsApp + Pink Card CTA
    const elapsed = Date.now() - startTime;
    const remainingDelay = Math.max(5000 - elapsed, 500);

    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: `Thank you for reaching out! We're experiencing high demand right now, so one of our licensed brokers will be in touch with you shortly. In the meantime, feel free to connect with us directly on WhatsApp for immediate assistance, or get started on your Pink Card setup below!`,
        timestamp: new Date(),
        actionButtons: [
          { text: '💬 Chat with Us on WhatsApp', payload: 'https://wa.me/15799877798', actionType: 'whatsapp' },
          { text: '🚗 Start In-Chat Pink Card Setup', payload: 'start', actionType: 'start_quote' },
        ],
      };
      setMessages(prev => [...prev, botResponse]);
      setIsLoading(false);
    }, remainingDelay);
  };

  // Handle Receipt Screenshot Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const targetPolicy = activePolicyNumber || `POL-${Math.floor(100000 + Math.random() * 900000)}`;

      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          type: 'user',
          content: `📄 Uploaded e-Transfer Receipt: ${file.name}`,
          timestamp: new Date(),
        },
      ]);

      setIsLoading(true);

      try {
        const notifyRes = await fetch('/api/notify/payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            policy_number: targetPolicy,
            amount: 481,
            coverage_type: 'Standard 3-Month Prepaid',
            term: '3m',
            deductible: '500',
            vin: collected.vin || '2C3CDZF95MH104829',
            vehicle: `${collected.year || '2021'} ${collected.make || 'Dodge'} ${collected.model || 'Charger'}`,
            license_class: collected.license || 'Ontario G',
            dob: collected.dob || '1992-05-14',
            postal: collected.postal || 'M5V 2T6',
            receipt_base64: base64,
            receipt_name: file.name,
          }),
        });

        const notifyData = await notifyRes.json();
        setIsLoading(false);

        if (notifyData.ok) {
          setActivePolicyNumber(targetPolicy);
          setPolicyStatus('pending');

          setMessages(prev => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              type: 'bot',
              content: `✅ RECEIPT RECEIVED & DISPATCHED TO BROKER!

Policy Number: ${targetPolicy}
Status: ⏳ Pending Broker Verification on Telegram

I have dispatched your proof of transfer to our licensed broker on Telegram. Once approved (usually 15-25 minutes), your official TD Pink Card will unlock for download!`,
              timestamp: new Date(),
              policyNumber: targetPolicy,
            },
          ]);
        } else {
          throw new Error('Telegram notification failed');
        }
      } catch (err) {
        setIsLoading(false);
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            type: 'bot',
            content: `I received your receipt! You can also send it directly to our WhatsApp support (+1 579 987-7798) for instant broker review.`,
            timestamp: new Date(),
          },
        ]);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };



  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*,.pdf"
        className="hidden"
      />

      {/* Realistic Unread Chat Bubble Trigger */}
      {!isOpen && showAlertBubble && (
        <div
          onClick={toggleChat}
          style={{
            bottom: stickyVisible ? '9.5rem' : '5.25rem',
            transition: 'bottom 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          className="fixed lg:!bottom-20 right-6 z-50 bg-white border border-gray-200 text-[#111] font-inter text-[13px] p-3 rounded-2xl shadow-2xl flex items-center gap-3 cursor-pointer hover:shadow-2xl hover:scale-[1.02] transform origin-bottom-right animate-bounce max-w-[280px]"
        >
          {/* Avatar with Red Unread Badge */}
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256"
                alt="Edward"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Red Unread Notification Badge */}
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white font-bold text-[9px] shadow-md animate-pulse">
              1
            </span>
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center justify-between gap-1 mb-0.5">
              <span className="font-bold text-[12px] text-[#111] leading-none">Edward</span>
              <span className="text-[10px] text-gray-400 font-medium leading-none">Just now</span>
            </div>
            <p className="text-[12px] text-gray-700 font-medium leading-tight truncate">
              Get your quote now? 🚗
            </p>
          </div>

          {/* Dismiss Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowAlertBubble(false);
            }}
            className="text-gray-300 hover:text-gray-600 shrink-0 p-0.5"
            aria-label="Dismiss message"
          >
            <X size={14} />
          </button>

          {/* Speech bubble pointer triangle */}
          <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white border-b border-r border-gray-200 transform rotate-45"></div>
        </div>
      )}

      {/* Floating Chat Trigger Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          style={{
            bottom: stickyVisible ? '6rem' : '1.5rem',
            transition: 'bottom 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          className="fixed lg:!bottom-6 right-6 z-50 bg-[#168A5A] hover:bg-[#1FA36A] text-white font-inter text-[14px] font-semibold px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-colors flex items-center gap-2"
          aria-label="Open chat"
        >
          <MessageCircle size={18} strokeWidth={2} />
          Chat with Edward
        </button>
      )}

      {/* Chat Window Container — mount-then-animate for ease open/close */}
      {chatMounted && (
        <div
          style={{
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.97)',
            transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transformOrigin: 'bottom right',
          }}
          className="fixed bottom-24 lg:bottom-6 right-4 sm:right-6 z-[60] w-[calc(100vw-2rem)] sm:w-[410px] h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-[#168A5A] text-white p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-white/20 overflow-hidden shadow-md border border-white/40 flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256"
                    alt="Edward - PolarGuard Team Support"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#22C55E] border-2 border-[#168A5A] rounded-full shadow-sm"></span>
              </div>
              <div>
                <h3 className="font-semibold text-[14px] leading-tight">Edward · PolarGuard Team Support</h3>
                <p className="text-[11px] opacity-90">Licensed Senior Insurance Broker</p>
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="hover:bg-[#1FA36A] p-1 rounded-lg transition-colors"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 text-[14px]">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.type === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl p-3.5 leading-relaxed ${
                    msg.type === 'user'
                      ? 'bg-[#168A5A] text-white rounded-br-none'
                      : 'bg-white text-gray-900 border border-gray-200/80 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content.replace(/\*\*/g, '')}</p>

                  {/* Action Buttons */}
                  {msg.actionButtons && msg.actionButtons.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-gray-100 flex flex-col gap-1.5">
                      {msg.actionButtons.map((btn, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleActionButtonClick(btn.payload, btn.actionType, btn.text)}
                          className="w-full text-left bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#168A5A] border border-[#168A5A]/30 font-semibold py-2 px-3 rounded-lg text-[12px] flex items-center justify-between transition-all"
                        >
                          <span>{btn.text}</span>
                          <Sparkles size={14} />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Active Policy Verified Banner */}
                  {msg.isActivated && (
                    <div className="mt-3 bg-[#F0FDF4] border border-[#168A5A]/40 rounded-xl p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-[#168A5A] font-bold text-[13px] mb-1">
                        <CheckCircle size={16} /> Official TD Pink Card Activated!
                      </div>
                      <p className="text-[11px] text-gray-600 mb-2">Verified by Licensed Broker via Telegram</p>
                      <button
                        onClick={() => dispatchToPinkCardGenerator(collected)}
                        className="w-full bg-[#168A5A] hover:bg-[#13784E] text-white font-semibold py-2.5 px-3 rounded-lg text-[12px] flex items-center justify-center gap-1.5 transition-all shadow-sm"
                      >
                        <FileText size={14} /> View & Download TD Pink Slip
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Dots Indicator */}
            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-white text-gray-900 border border-gray-200/80 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-2">
                  <span className="text-[12px] font-medium text-gray-500">Edward is typing</span>
                  <div className="flex items-center gap-1" aria-label="Edward is typing">
                    <span className="w-1.5 h-1.5 bg-[#168A5A] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#168A5A] rounded-full animate-bounce" style={{ animationDelay: '180ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#168A5A] rounded-full animate-bounce" style={{ animationDelay: '360ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Bar */}
          <div className="border-t border-gray-200 p-3 bg-white">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-500 hover:text-[#168A5A] hover:bg-gray-100 rounded-lg transition-colors"
                title="Upload e-Transfer Receipt"
              >
                <Paperclip size={18} />
              </button>
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Ask Edward AI or type 'I want a quote'..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#168A5A]/20 focus:border-[#168A5A]"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="bg-[#168A5A] hover:bg-[#1FA36A] disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
