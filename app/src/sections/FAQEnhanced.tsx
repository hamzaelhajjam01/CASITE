import { useEffect, useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'Who underwrites PolarShield and how do I verify your RIBO brokerage license?',
    answer: 'PolarShield Auto Insurance is operated by Polaris Insurance & Risk Management Services Inc., a licensed brokerage registered with the Registered Insurance Brokers of Ontario (RIBO Reg #10129). You can verify our brokerage directly on the official RIBO registry at www.ribo.com. All policies are underwritten directly by TD General Insurance Company (FSRA Code #216 in Ontario, regulated by AIRB under Form SPF 1 in Alberta, and SPF 1 in Nova Scotia), administered by TD Insurance Direct Agency Inc. in Markham.',
  },
  {
    question: 'How fast do I get an official pink slip for ServiceOntario or Alberta Registry plate registration?',
    answer: 'Once your vehicle VIN and driver details are submitted and payment is verified, your official 2-page Canadian TD Pink Slip is issued digitally in 15 to 25 minutes. It contains your exact VIN, policy number, and statutory coverage details, and is 100% legally recognized at all ServiceOntario centres, Alberta Registries, and by police roadside across Canada.',
  },
  {
    question: 'Can I get insurance if I was previously cancelled for non-payment or had lapses?',
    answer: 'Yes, 100%. Having a past cancellation for non-payment or insurance gap often triggers massive facility surcharges with standard brokers. Under our group affinity underwriting, short-term prepaid policies and month-to-month plans are approved without high-risk price penalties. Because you pay upfront via Interac e-Transfer, there are no bank NSF risks and past payment history does not disqualify you.',
  },
  {
    question: 'Can I get temporary insurance for an In-Transit permit to move or sell a car in Alberta?',
    answer: 'Yes. Alberta Registries require proof of active Alberta insurance (Form SPF 1) to issue In-Transit Permits or plates. We offer 30-day flat trials or month-to-month plans from $136/vehicle with our 20% multi-vehicle discount. You can register your car, drive legally between Calgary, Red Deer, or Edmonton, keep it active until sold, and cancel anytime with $0 cancellation fees.',
  },
  {
    question: 'Is a digital pink slip on my smartphone legally valid in Ontario and Alberta?',
    answer: 'Yes. Under the Ontario Compulsory Automobile Insurance Act and provincial regulatory standards in Alberta and Nova Scotia, electronic pink slips displayed on your smartphone are 100% legal for police roadside checks, plate renewals, and registry transfers. A high-resolution printable 2-page PDF is also provided for your glovebox.',
  },
  {
    question: 'Can G2, GDL, foreign licence, or new immigrant drivers get covered?',
    answer: 'Yes. We accept Ontario G2 and G licences, Alberta Class 5 GDL and full Class 5, Nova Scotia Class 5 and Class 6N learner motorcycle licences, and valid international/foreign licences without unfair surcharges.',
  },
  {
    question: 'Do I pay monthly or can I split my payments?',
    answer: 'Our website rates are structured as one-time prepaid terms (3, 6, or 12 months) — saving you 10%–20%, requiring no credit check, and avoiding monthly bank auto-debits or $48 NSF penalty fees. If you prefer to pay monthly or split your payment into convenient e-Transfer installments, you can arrange a customized schedule directly with our licensed broker on WhatsApp at +1 (984) 378-9320.',
  },
  {
    question: "What's the difference between Basic and Full coverage in dollars?",
    answer: 'Basic covers injury and damage you cause to others (liability, accident benefits, DCPD, uninsured motorist). Full adds collision and comprehensive — the parts that repair or replace YOUR car after at-fault accidents, theft, vandalism, hail, and animal strikes. Full is required by every lender if your car is financed or leased.',
  },
  {
    question: 'What does my deductible actually mean?',
    answer: 'The deductible is the portion of a claim you pay before the insurer pays the rest. Example: a $4,200 repair bill with a $500 deductible — you pay $500, the insurer pays $3,700. With a $1,000 deductible the same claim costs you $1,000 and the insurer covers $3,200. A $500 deductible adds about $80 per term to your premium; $1,000 keeps the premium lower.',
  },
  {
    question: "What's NOT covered?",
    answer: 'Mechanical breakdown, normal wear & tear, personal items stolen from inside the car (your tenant or home policy covers these), and damage from racing or commercial use are not covered by auto insurance.',
  },
  {
    question: 'Is this a final policy?',
    answer: "No. The quote you see is an estimate based on your VIN, postal code, and license class. A licensed broker reviews your file before activation to confirm final pricing, coverage limits, and insurer placement. You'll receive your official pink slip (proof of insurance) only after broker approval and payment.",
  },
  {
    question: 'How do I activate?',
    answer: 'Pay by Interac e-Transfer only — we don\'t currently accept credit or debit cards. Upload your e-Transfer screenshot and a licensed broker matches it to your application, usually within 15-25 minutes. Your quote preview holds for about 30 minutes, so it\'s best to pay before it expires.',
  },
  {
    question: 'Can I choose basic or full coverage?',
    answer: 'Yes. You can select Basic (third-party liability + accident benefits + DCPD + uninsured motorist) or Full (everything in Basic + collision + comprehensive + glass + loss of use). You can also choose your deductible: $500 or $1,000.',
  },
];

function AccordionItem({ item, isOpen, onToggle }: {
  item: FAQItem; isOpen: boolean; onToggle: () => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [item.answer]);

  return (
    <div
      className="bg-white border border-[#E6E8EB] rounded-[12px] overflow-hidden transition-all duration-300"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 text-left"
      >
        <span className={`font-inter text-[16px] font-medium pr-6 transition-colors ${
          isOpen ? 'text-[#168A5A]' : 'text-[#111]'
        }`}>
          {item.question}
        </span>
        <div className="shrink-0 text-[#168A5A] transition-transform duration-300">
          {isOpen ? (
            <X size={20} strokeWidth={2} />
          ) : (
            <Plus size={20} strokeWidth={2} />
          )}
        </div>
      </button>

      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? height + 24 : 0 }}
      >
        <div ref={contentRef} className="px-6 pb-6">
          <div className="border-t border-[#E6E8EB] pt-4">
            <p className="font-inter text-[#5F6368] text-[15px] leading-[1.6]">
              {item.answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FAQEnhanced() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section id="faq" ref={sectionRef} className="bg-[#F7F7F5] py-24 lg:py-[120px]">
      <div className="max-w-[750px] mx-auto px-6 lg:px-12">

        {/* Header */}
        <div className="text-center mb-12">
          <p className={`font-inter text-[12px] uppercase tracking-[0.2em] text-[#5F6368] mb-4 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            FAQ
          </p>
          <h2 className={`font-satoshi font-semibold text-[#111] text-[32px] sm:text-[36px] lg:text-[40px] leading-[1.1] transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Common questions
          </h2>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{ transitionDelay: `${200 + i * 80}ms` }}
            >
              <AccordionItem
                item={faq}
                isOpen={openIndex === i}
                onToggle={() => toggle(i)}
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
