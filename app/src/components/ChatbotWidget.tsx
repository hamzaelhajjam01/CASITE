import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { MessageCircle, X, Send, Paperclip, CheckCircle, ExternalLink, HelpCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import WhatsAppIcon from './icons/WhatsAppIcon';

interface ActionButton {
  text: string;
  payload: string;
  actionType: 'whatsapp' | 'open_quote' | 'send_text';
}

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  actionButtons?: ActionButton[];
  policyNumber?: string;
  isActivated?: boolean;
}

const WHATSAPP_URL = 'https://wa.me/15799877798';
const WHATSAPP_PHONE = '+1 (579) 987-7798';

export default function ChatbotWidget() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [chatMounted, setChatMounted] = useState(false);
  const [showAlertBubble, setShowAlertBubble] = useState(true);
  const [stickyVisible, setStickyVisible] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activePolicyNumber, setActivePolicyNumber] = useState<string | null>(null);
  const [policyStatus, setPolicyStatus] = useState<string>('pending');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track sticky CTA visibility to shift floating button on mobile
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

  // Mount-then-animate pattern for chat opening smoothness
  useEffect(() => {
    if (isOpen) {
      setChatMounted(true);
    } else {
      const timer = setTimeout(() => setChatMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Auto-scroll feed to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const toggleChat = () => {
    setIsOpen(prev => !prev);
    setShowAlertBubble(false);
  };

  // Initial welcome greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting: Message = {
        id: '0',
        type: 'bot',
        content: `👋 Hi! I'm Edward, Senior Insurance Broker at PolarGuard Insurance.

How can I help you today? Ask me anything about our prepaid coverage plans, official TD Pink Slips, pricing, or payment details. If you'd like to speak with a human broker right away, our WhatsApp support team is also online!`,
        timestamp: new Date(),
        actionButtons: [
          {
            text: '💬 Live Agent on WhatsApp (Instant Support)',
            payload: WHATSAPP_URL,
            actionType: 'whatsapp',
          },
          {
            text: '📋 Get an Instant Quote & Pink Slip',
            payload: '/quote',
            actionType: 'open_quote',
          },
          {
            text: '❓ How does prepaid insurance work?',
            payload: 'How does prepaid auto insurance work and what plans do you offer?',
            actionType: 'send_text',
          },
          {
            text: '🏛️ Is this accepted at ServiceOntario?',
            payload: 'Is your TD Pink Slip 100% accepted at ServiceOntario and police across Canada?',
            actionType: 'send_text',
          },
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

Your e-Transfer receipt for Policy ${activePolicyNumber} has been verified by the broker. Your official TD Motor Vehicle Liability Card is active!`,
              timestamp: new Date(),
              policyNumber: activePolicyNumber,
              isActivated: true,
              actionButtons: [
                {
                  text: '💬 Chat on WhatsApp for Policy Copies',
                  payload: WHATSAPP_URL,
                  actionType: 'whatsapp',
                },
                {
                  text: '📋 View Quote & Account Page',
                  payload: '/quote',
                  actionType: 'open_quote',
                },
              ],
            },
          ]);
        }
      } catch (err) {}
    }, 3000);

    return () => clearInterval(interval);
  }, [activePolicyNumber, policyStatus]);

  // Helper to determine intelligent action buttons for bot answers
  const detectActionButtons = (replyText: string, userText: string): ActionButton[] => {
    const buttons: ActionButton[] = [];
    const lowerReply = replyText.toLowerCase();
    const lowerUser = userText.toLowerCase();

    // 1. Quote or Pink Card intent
    const quoteKeywords = [
      'quote',
      'pink card',
      'pink slip',
      'apply',
      'buy insurance',
      'get covered',
      'polarguard.ca/quote',
      '/quote',
      'price generator',
    ];
    const isQuoteIntent = quoteKeywords.some(kw => lowerUser.includes(kw) || lowerReply.includes(kw));
    if (isQuoteIntent) {
      buttons.push({
        text: '📋 Open Quote Generator (/quote)',
        payload: '/quote',
        actionType: 'open_quote',
      });
    }

    // 2. Fallback / WhatsApp escalation intent
    const fallbackKeywords = [
      'whatsapp',
      "don't have",
      "do not have",
      "unable to",
      "can't access",
      "cannot access",
      "human agent",
      "support agent",
      "live agent",
      "contact us",
      "touch with you",
      "reach out",
      "live broker",
      "speak with",
      "real person",
      "human broker",
      '579',
      '987-7798',
    ];
    const isFallbackIntent = fallbackKeywords.some(kw => lowerReply.includes(kw) || lowerUser.includes('human') || lowerUser.includes('agent') || lowerUser.includes('person'));
    if (isFallbackIntent || buttons.length === 0) {
      buttons.push({
        text: '💬 Chat on WhatsApp (Instant Agent)',
        payload: WHATSAPP_URL,
        actionType: 'whatsapp',
      });
    }

    return buttons;
  };

  // Handle Action Button Clicks
  const handleActionButtonClick = (payload: string, actionType: ActionButton['actionType'], buttonText: string) => {
    if (actionType === 'whatsapp') {
      window.open(payload || WHATSAPP_URL, '_blank');
      return;
    }

    if (actionType === 'open_quote') {
      if (window.location.pathname === '/quote') {
        const quoteEl = document.getElementById('quote');
        if (quoteEl) {
          quoteEl.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        navigate('/quote');
      }
      return;
    }

    if (actionType === 'send_text') {
      handleSendMessage(payload || buttonText);
      return;
    }
  };

  // Handle General Text Input & AI Chat Dispatch
  const handleSendMessage = async (userMessage: string) => {
    const cleanInput = userMessage.trim();
    if (!cleanInput) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: cleanInput,
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
          const actionButtons = detectActionButtons(data.text, cleanInput);
          const botResponse: Message = {
            id: (Date.now() + 1).toString(),
            type: 'bot',
            content: data.text,
            timestamp: new Date(),
            actionButtons: actionButtons.length > 0 ? actionButtons : undefined,
          };

          const elapsed = Date.now() - startTime;
          const remainingDelay = Math.max(800 - elapsed, 150);

          setTimeout(() => {
            setMessages(prev => [...prev, botResponse]);
            setIsLoading(false);
          }, remainingDelay);
          return;
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
    }

    // Fallback if AI backend is unavailable or has no answer
    const elapsed = Date.now() - startTime;
    const remainingDelay = Math.max(800 - elapsed, 150);

    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: `I don't have the answer to that right now, but our licensed human brokerage team is available live on WhatsApp to help you immediately!`,
        timestamp: new Date(),
        actionButtons: [
          {
            text: `💬 Chat on WhatsApp (${WHATSAPP_PHONE})`,
            payload: WHATSAPP_URL,
            actionType: 'whatsapp',
          },
          {
            text: '📋 Open Dedicated Quote Page (/quote)',
            payload: '/quote',
            actionType: 'open_quote',
          },
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
            coverage_type: 'Standard Prepaid Auto Insurance',
            term: '3m',
            deductible: '500',
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
              content: `✅ RECEIPT RECEIVED & SENT TO BROKER!

Policy Reference: ${targetPolicy}
Status: ⏳ Verification In Progress (15-25 mins)

Our brokerage team has received your proof of payment on Telegram. You can also message our support agent on WhatsApp for instant priority verification!`,
              timestamp: new Date(),
              policyNumber: targetPolicy,
              actionButtons: [
                {
                  text: '💬 WhatsApp Instant Broker Support (+1 579 987-7798)',
                  payload: WHATSAPP_URL,
                  actionType: 'whatsapp',
                },
              ],
            },
          ]);
        } else {
          throw new Error('Notification failed');
        }
      } catch (err) {
        setIsLoading(false);
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            type: 'bot',
            content: `I received your receipt! To get your policy verified immediately, please send it directly to our live WhatsApp support agent at ${WHATSAPP_PHONE}.`,
            timestamp: new Date(),
            actionButtons: [
              {
                text: '💬 Send on WhatsApp (+1 579 987-7798)',
                payload: WHATSAPP_URL,
                actionType: 'whatsapp',
              },
            ],
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

      {/* Unread Chat Bubble Trigger */}
      {!isOpen && showAlertBubble && (
        <div
          onClick={toggleChat}
          style={{
            bottom: stickyVisible ? '9.5rem' : '5.25rem',
            transition: 'bottom 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          className="fixed lg:!bottom-20 right-6 z-50 bg-white border border-gray-200 text-[#111] font-inter text-[13px] p-3 rounded-2xl shadow-2xl flex items-center gap-3 cursor-pointer hover:shadow-2xl hover:scale-[1.02] transform origin-bottom-right animate-bounce max-w-[290px]"
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
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white font-bold text-[9px] shadow-md animate-pulse">
              1
            </span>
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center justify-between gap-1 mb-0.5">
              <span className="font-bold text-[12px] text-[#111] leading-none">Edward</span>
              <span className="text-[10px] text-gray-400 font-medium leading-none">Support Broker</span>
            </div>
            <p className="text-[12px] text-gray-700 font-medium leading-tight truncate">
              Need assistance? Chat with Edward 👋
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
          className="fixed lg:!bottom-6 right-6 z-50 bg-[#168A5A] hover:bg-[#1FA36A] text-white font-inter text-[14px] font-semibold px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          aria-label="Open chat"
        >
          <MessageCircle size={18} strokeWidth={2} />
          <span>Chat with Edward</span>
        </button>
      )}

      {/* Chat Window Container */}
      {chatMounted && (
        <div
          style={{
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.97)',
            transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transformOrigin: 'bottom right',
          }}
          className="fixed bottom-24 lg:bottom-6 right-4 sm:right-6 z-[60] w-[calc(100vw-2rem)] sm:w-[410px] h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200"
        >
          {/* Header */}
          <div className="bg-[#168A5A] text-white p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-white/20 overflow-hidden shadow-md border border-white/40 flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256"
                    alt="Edward - PolarGuard Support"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#22C55E] border-2 border-[#168A5A] rounded-full shadow-sm"></span>
              </div>
              <div>
                <h3 className="font-semibold text-[14px] leading-tight">Edward · PolarGuard Support</h3>
                <p className="text-[11px] opacity-90">Licensed Senior Insurance Broker</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 bg-[#25D366] hover:bg-[#20bd5a] text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm transition-colors"
                title="Instant Support on WhatsApp"
              >
                <WhatsAppIcon size={12} className="text-white fill-white" />
                <span>WhatsApp</span>
              </a>
              <button
                onClick={toggleChat}
                className="hover:bg-[#1FA36A] p-1 rounded-lg transition-colors text-white"
                aria-label="Close chat"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Trust notice bar */}
          <div className="bg-[#F0FDF4] border-b border-[#A7DAB9]/50 px-3 py-1.5 flex items-center justify-between text-[11px] text-[#168A5A]">
            <div className="flex items-center gap-1 font-medium">
              <ShieldCheck size={13} className="shrink-0" />
              <span>Official PolarGuard Broker Assistant</span>
            </div>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#168A5A] underline font-semibold hover:text-[#13784E]"
            >
              Instant Agent
            </a>
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
                      {msg.actionButtons.map((btn, idx) => {
                        const isWhatsApp = btn.actionType === 'whatsapp';
                        const isQuote = btn.actionType === 'open_quote';

                        return (
                          <button
                            key={idx}
                            onClick={() => handleActionButtonClick(btn.payload, btn.actionType, btn.text)}
                            className={`w-full text-left font-semibold py-2 px-3 rounded-lg text-[12px] flex items-center justify-between transition-all ${
                              isWhatsApp
                                ? 'bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#168A5A] border border-[#168A5A]/30'
                                : isQuote
                                ? 'bg-[#F7F9FA] hover:bg-[#EDF2F7] text-[#1E293B] border border-gray-200'
                                : 'bg-[#F9FAFB] hover:bg-[#F3F4F6] text-gray-700 border border-gray-200'
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              {isWhatsApp && <WhatsAppIcon size={14} className="text-[#168A5A] fill-[#168A5A] shrink-0" />}
                              <span>{btn.text}</span>
                            </span>
                            {isWhatsApp ? (
                              <ExternalLink size={13} className="text-[#168A5A] shrink-0" />
                            ) : isQuote ? (
                              <ArrowRight size={13} className="text-[#1E293B] shrink-0" />
                            ) : (
                              <HelpCircle size={13} className="text-gray-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
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
                        onClick={() => handleActionButtonClick('/quote', 'open_quote', 'View Quote')}
                        className="w-full bg-[#168A5A] hover:bg-[#13784E] text-white font-semibold py-2 px-3 rounded-lg text-[12px] flex items-center justify-center gap-1.5 transition-all shadow-sm"
                      >
                        <ArrowRight size={14} /> Go to Quote Portal
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
                placeholder="Ask Edward anything or get help..."
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
