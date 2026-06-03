import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  {
    question: 'What provinces does PolarGuard operate in?',
    answer:
      'PolarGuard currently provides auto insurance in Ontario, Alberta, British Columbia, Quebec, Nova Scotia, and New Brunswick. We\'re expanding to additional provinces throughout 2025. Each province has unique regulations, and our coverage is fully compliant with local requirements.',
  },
  {
    question: 'How is my premium calculated?',
    answer:
      'Your premium is based on several factors: your driving record, vehicle make and model, annual mileage, location, age, and coverage selections. We use advanced analytics to price fairly — safe drivers save more. You can lower your premium by bundling with home insurance, increasing your deductible, or enrolling in our safe driver program.',
  },
  {
    question: 'What is accident forgiveness?',
    answer:
      'Accident forgiveness is included with every PolarGuard policy at no extra cost. It means your first at-fault accident won\'t increase your premium. This protection applies after you\'ve been claim-free for three years. It\'s our way of recognizing that even the best drivers can have a bad day.',
  },
  {
    question: 'How does the disappearing deductible work?',
    answer:
      'For every year you\'re claim-free, your collision deductible decreases by 20%. After five consecutive claim-free years, your deductible could reach $0. If you do make a claim, your deductible resets to the original amount — but you\'ll start earning reductions again right away.',
  },
  {
    question: 'Can I manage my policy online?',
    answer:
      'Absolutely. Our mobile app and web portal let you view your policy, make payments, file claims, update your information, and access your digital pink card 24/7. You can also chat with our support team directly through the app with an average response time under 5 minutes.',
  },
  {
    question: 'What is included with roadside assistance?',
    answer:
      'Our 24/7 roadside assistance includes: towing (up to 200km), battery boost, flat tire change, fuel delivery (up to 10L), lockout service, and winching. It\'s included with every comprehensive policy at no additional cost, anywhere in Canada.',
  },
  {
    question: 'How do I file a claim?',
    answer:
      'File a claim through our mobile app, online portal, or by calling our 24/7 claims line at 1-800-POLAR-1. You\'ll need your policy number, details about the incident, and photos if available. Most claims are assigned an adjuster within 24 hours, and simple claims can be resolved in as little as 3–5 business days.',
  },
  {
    question: 'Is my data secure with PolarGuard?',
    answer:
      'Yes. PolarGuard uses bank-level 256-bit encryption for all data transmission and storage. We\'re fully compliant with PIPEDA (Canada\'s privacy law) and undergo regular third-party security audits. We never sell your data to third parties.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section id="faq" className="bg-pg-bg py-24 lg:py-[120px]">
      <div className="max-w-[800px] mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center bg-pg-accent-muted text-pg-accent font-inter text-[12px] font-medium tracking-[0.04em] uppercase rounded-full px-4 py-1.5">
            FAQs
          </span>
          <h2 className="mt-4 font-satoshi font-medium text-pg-text-primary text-[28px] sm:text-[36px] lg:text-[44px] leading-[1.15] tracking-[-0.01em]">
            Frequently asked questions
          </h2>
          <p className="mt-3 font-inter text-pg-text-secondary text-base">
            Everything you need to know about PolarGuard auto insurance.
          </p>
        </div>

        {/* Accordion */}
        <div className="border-t border-pg-border">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-pg-border">
              <button
                className="w-full flex items-center justify-between py-6 text-left group"
                onClick={() => toggle(i)}
              >
                <span className="font-inter font-semibold text-pg-text-primary text-[15px] lg:text-[16px] pr-8 group-hover:text-pg-accent transition-colors">
                  {faq.question}
                </span>
                <span className="shrink-0 text-pg-text-secondary transition-transform duration-300">
                  {openIndex === i ? (
                    <Minus size={20} />
                  ) : (
                    <Plus size={20} />
                  )}
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === i ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="font-inter text-pg-text-secondary text-[14px] lg:text-[15px] leading-[1.7]">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-8">
          <button className="inline-flex items-center font-inter text-[14px] font-semibold text-pg-text-primary border border-pg-border px-6 py-3 rounded-lg hover:border-pg-accent hover:text-pg-accent transition-all">
            View All FAQs
          </button>
        </div>
      </div>
    </section>
  );
}
