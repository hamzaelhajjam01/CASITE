import { ArrowRight, ShieldCheck, Zap, UserX } from 'lucide-react';

export default function Hero() {
  return (
    <section id="hero"
      className="relative min-h-[100dvh] flex items-center overflow-hidden"
      style={{ minHeight: '800px' }}
    >
      {/* Background image */}
      <img
        src="/images/hero-winter-suv.png"
        alt="Luxury SUV driving through snowy Canadian Rockies"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: 0 }}
      />

      {/* Dark overlay for text readability */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, rgba(8,24,38,0.78) 0%, rgba(8,24,38,0.55) 50%, rgba(8,24,38,0.35) 100%)',
          zIndex: 1,
        }}
      />

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[200px]"
        style={{
          background: 'linear-gradient(to top, rgba(8,24,38,0.4) 0%, transparent 100%)',
          zIndex: 1,
        }}
      />

      <div className="relative z-10 max-w-container mx-auto w-full px-6 lg:px-12 pt-[100px] pb-20">
        <div className="grid lg:grid-cols-[58%_42%] gap-12 lg:gap-8 items-center">

          {/* ─── LEFT ─── */}
          <div className="flex flex-col">

            {/* Badge */}
            <span className="inline-flex w-fit font-inter text-[12px] uppercase tracking-[0.15em] text-white/60 mb-6">
              Short-Term Auto Insurance &middot; Canada
            </span>

            {/* Headline */}
            <h1 className="font-satoshi font-bold text-white text-[40px] sm:text-[48px] lg:text-[56px] leading-[1.1] tracking-[-0.02em]">
              Get your pink slip in minutes
            </h1>

            {/* Subheadline with bold emphasis */}
            <p className="mt-6 font-inter text-white/70 text-[16px] leading-[1.6] max-w-[480px]">
              Quote your VIN, prepay once, and get a valid <span className="text-white font-semibold">pink slip (proof of insurance)</span> accepted at every Canadian provincial registry. Short-term policies (1 to 3 months) are <span className="text-white font-semibold">not subject to a driver background check</span>. That means you&apos;re treated as a <span className="text-white font-semibold">low-risk driver</span> — and <span className="text-white font-semibold">previous cancellations or lapses don&apos;t count against you</span>.
            </p>

            {/* Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#quote"
                className="group inline-flex items-center gap-2 bg-white text-[#081826] font-inter text-[15px] font-semibold px-7 py-3.5 rounded-full hover:bg-white/90 transition-all active:scale-[0.98]"
              >
                Get My Pink Slip
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </a>
              <a
                href="#coverage"
                className="inline-flex items-center gap-2 text-white font-inter text-[15px] font-medium px-7 py-3.5 rounded-full border border-white/30 hover:bg-white/[0.04] hover:border-white/40 transition-all"
              >
                Compare coverage
              </a>
            </div>

            {/* Trust line */}
            <p className="mt-4 font-inter text-white/50 text-[13px] flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40 shrink-0">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              Pink slip = your official liability slip / proof of insurance
            </p>

            {/* Three trust badges */}
            <div className="mt-8 flex flex-wrap gap-6">
              {[
                { icon: ShieldCheck, title: 'No Background Check', sub: 'Instant approval' },
                { icon: Zap, title: 'Low-risk Driver Rating', sub: 'Best possible rate' },
                { icon: UserX, title: "Cancellations Don't Matter", sub: 'Clean slate policy' },
              ].map(item => (
                <div key={item.title} className="flex flex-col items-start gap-2">
                  <div className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/[0.06] flex items-center justify-center">
                    <item.icon size={18} className="text-[#1FA36A]" />
                  </div>
                  <div>
                    <p className="font-inter text-white text-[13px] font-semibold leading-tight">{item.title}</p>
                    <p className="font-inter text-white/40 text-[11px] mt-0.5">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── RIGHT: Quote Card Image ─── */}
          <div className="flex justify-center lg:justify-end" style={{ transform: 'rotate(-2deg)' }}>
            <img
              src="/images/quote-card-new.png?v=1"
              alt="PolarGuard quote preview showing $389 CAD prepaid 3-month policy with full coverage, driver verified, and same-day activation"
              className="w-full max-w-[340px] lg:max-w-[400px] xl:max-w-[420px] h-auto"
              style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.25))' }}
              loading="eager"
              width="420"
              height="480"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
