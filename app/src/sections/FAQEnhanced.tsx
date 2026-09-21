import { useEffect, useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'Do I pay monthly or can I split my payments?',
    answer: 'Our website rates are structured as one-time prepaid terms (3, 6, or 12 months) — saving you 10%–20%, requiring no credit check, and avoiding monthly bank auto-debits or $48 NSF penalty fees. If you prefer to pay monthly or split your payment into convenient e-Transfer installments, you can arrange a customized schedule directly with our licensed broker on WhatsApp at +1 (579) 987-7798.',
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
