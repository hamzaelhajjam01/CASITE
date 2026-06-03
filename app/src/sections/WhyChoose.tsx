import { useEffect, useRef, useState } from 'react';

// ─── Features Data ──────────────────────────────────────────

const features = [
  {
    icon: '/images/icon-full-coverage.png',
    title: 'No background check',
    description: "Short-term policies (1–3 months) skip the driver history pull. You're rated as a clean, low-risk driver from day one.",
  },
  {
    icon: '/images/icon-vin-verification.png',
    title: "Cancellations don't matter",
    description: 'Previous lapses, non-payment cancellations or missed renewals won\'t disqualify you or inflate your premium.',
  },
  {
    icon: '/images/icon-winter-protection.png',
    title: 'Plate & registration ready',
    description: 'Valid proof of insurance accepted at ServiceOntario, Service Alberta, ICBC, SAAQ and other provincial registries for plate stickers, registration and ownership transfers.',
  },
  {
    icon: '/images/icon-fast-claims.png',
    title: 'VIN-based instant quote',
    description: 'Just your VIN, postal code and license class — no long forms, no credit pull, no phone calls.',
  },
  {
    icon: '/images/icon-nationwide.png',
    title: 'Basic or full coverage',
    description: 'Pick third-party liability or full collision + comprehensive with a $500 or $1,000 deductible.',
  },
  {
    icon: '/images/icon-multi-vehicle.png',
    title: 'Same-day activation',
    description: 'Pay by Interac e-Transfer, send the screenshot, and receive your pink card the same day.',
  },
];

// ─── Component ──────────────────────────────────────────────

export default function WhyChoose() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="why-polarguard" ref={ref} className="bg-pg-bg py-24 lg:py-[120px]">
      <div className="max-w-container mx-auto px-6 lg:px-12">

        {/* Header */}
        <div className={`text-center mb-14 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <p className="font-inter text-[12px] uppercase tracking-[0.2em] text-pg-text-secondary mb-4">
            Why PolarGuard
          </p>
          <h2 className="font-satoshi font-semibold text-pg-text-primary text-[32px] sm:text-[36px] lg:text-[40px] leading-[1.15] max-w-[600px] mx-auto">
            A premium brokerage experience, built around your VIN
          </h2>
          <p className="mt-4 font-inter text-pg-text-secondary text-[16px] max-w-[540px] mx-auto">
            Everything a modern Canadian driver needs — clean, fast, and broker-reviewed before activation.
          </p>
        </div>

        {/* Feature Grid: 3 columns × 2 rows */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className={`group bg-white border border-pg-border rounded-[16px] p-8 hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all duration-300 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionDelay: `${i * 80}ms`, transitionDuration: '600ms' }}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center group-hover:scale-105 transition-transform">
                <img
                  src={feature.icon}
                  alt={feature.title}
                  className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
                  loading="lazy"
                  width="48"
                  height="48"
                />
              </div>
              <h3 className="font-inter font-semibold text-pg-text-primary text-[18px] mt-5 mb-2 leading-tight">
                {feature.title}
              </h3>
              <p className="font-inter text-pg-text-secondary text-[14px] leading-[1.6]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
