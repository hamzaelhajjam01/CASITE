import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, X } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const comparisonData = [
  { feature: 'Annual premium (average sedan)', traditional: '$1,800–$2,400', polar: '$1,200–$1,800', isText: true },
  { feature: 'Quote time', traditional: '30–60 minutes', polar: 'Under 3 minutes', isText: true },
  { feature: 'Accident forgiveness', traditional: false, polar: true },
  { feature: 'Disappearing deductible', traditional: false, polar: true },
  { feature: '24/7 roadside assistance', traditional: false, polar: true },
  { feature: 'Online claims filing', traditional: 'Limited', polar: 'Full digital', isText: true },
  { feature: 'Bundle discount', traditional: '5–10%', polar: 'Up to 25%', isText: true },
  { feature: 'Claims response time', traditional: '3–5 days', polar: '24 hours', isText: true },
  { feature: 'Canadian-owned', traditional: 'Varies', polar: true },
];

export default function Comparison() {
  const sectionRef = useRef<HTMLElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const rows = tableRef.current?.querySelectorAll('.comp-row');
      if (rows) {
        gsap.fromTo(
          rows,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.4,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
              once: true,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const renderValue = (value: boolean | string, isPolar: boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check size={20} className="text-pg-accent" strokeWidth={2.5} />
      ) : (
        <X size={20} className="text-red-500" strokeWidth={2.5} />
      );
    }
    return (
      <span className={`font-inter text-[14px] ${isPolar ? 'text-pg-accent font-medium' : 'text-white/60'}`}>
        {value}
      </span>
    );
  };

  return (
    <section ref={sectionRef} className="bg-pg-dark-alt py-24 lg:py-[120px]">
      <div className="max-w-[900px] mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center bg-white/[0.12] text-white font-inter text-[12px] font-medium tracking-[0.04em] uppercase rounded-full px-4 py-1.5">
            Comparison
          </span>
          <h2 className="mt-4 font-satoshi font-medium text-white text-[28px] sm:text-[36px] lg:text-[44px] leading-[1.15] tracking-[-0.01em]">
            The smarter way to insure your vehicle
          </h2>
          <p className="mt-4 font-inter text-white/60 text-base leading-relaxed max-w-[560px] mx-auto">
            PolarGuard offers modern coverage with transparent pricing, digital-first service, and rewards for safe driving. See how we compare to traditional insurers.
          </p>
        </div>

        {/* Comparison Table */}
        <div
          ref={tableRef}
          className="border border-pg-border-dark rounded-2xl overflow-hidden"
        >
          {/* Header Row */}
          <div className="grid grid-cols-2 bg-white/[0.04]">
            <div className="px-6 py-5 font-inter font-semibold text-white text-[15px]">
              Traditional Insurers
            </div>
            <div className="px-6 py-5 font-inter font-semibold text-white text-[15px] border-l-[3px] border-l-pg-accent">
              PolarGuard
            </div>
          </div>

          {/* Data Rows */}
          {comparisonData.map((row, i) => (
            <div
              key={row.feature}
              className={`comp-row grid grid-cols-2 ${i % 2 === 1 ? 'bg-white/[0.02]' : ''} hover:bg-white/[0.04] transition-colors`}
            >
              <div className="px-6 py-4 flex items-center justify-between border-t border-pg-border-dark">
                <span className="font-inter text-white text-[14px]">{row.feature}</span>
                <div className="flex items-center">
                  {renderValue(row.traditional, false)}
                </div>
              </div>
              <div className="px-6 py-4 flex items-center justify-between border-t border-pg-border-dark border-l-[3px] border-l-pg-accent">
                <span className="font-inter text-white/40 text-[14px] hidden sm:block">{row.feature}</span>
                <div className="flex items-center">
                  {renderValue(row.polar, true)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="mt-6 text-center font-inter text-[12px] text-white/40 tracking-wide">
          *Based on average premiums for Ontario drivers with clean records, 2024. Actual rates vary by province, vehicle, and driving history.
        </p>
      </div>
    </section>
  );
}
