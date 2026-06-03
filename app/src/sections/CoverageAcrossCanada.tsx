import { useEffect, useRef, useState } from 'react';

const locations = [
  {
    title: 'Urban Ontario',
    sub: 'Toronto, Ottawa & GTA',
    desc: 'Full coverage for high-density city driving. DCPD and comprehensive collision protection on every commute.',
    image: '/images/canada-toronto.png?v=2',
  },
  {
    title: 'Western Canada',
    sub: 'British Columbia & Alberta Coast',
    desc: 'Mountain passes and coastal highways. Protection for winding roads, rain, and changing elevations.',
    image: '/images/canada-coastal.png?v=2',
  },
  {
    title: 'The Rockies',
    sub: 'Alberta & BC Mountain Roads',
    desc: 'Winter-grade coverage for snow, ice, and steep mountain grades. Drive with confidence year-round.',
    image: '/images/canada-rockies.png?v=2',
  },
];

export default function CoverageAcrossCanada() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
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

  return (
    <section ref={ref} style={{ background: '#0a0a0a' }}>
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10 py-20 lg:py-28">

        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <p className="font-inter text-[12px] uppercase tracking-[0.2em] text-[#888] mb-4">
            Nationwide Coverage
          </p>
          <h2 className="font-satoshi font-semibold text-white text-[32px] sm:text-[40px] lg:text-[44px] leading-[1.1]">
            Coverage across Canada
          </h2>
          <p className="mt-4 font-inter text-[#888] text-[16px] max-w-[520px] mx-auto leading-relaxed">
            From downtown Toronto to the Rocky Mountains. PolarGuard protects drivers in every province and every terrain.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((loc, i) => (
            <div
              key={loc.title}
              className={`group relative rounded-[16px] overflow-hidden cursor-pointer transition-all duration-500 aspect-[16/9] md:aspect-[3/4] hover:-translate-y-1 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${300 + i * 150}ms` }}
            >
              {/* Image — scaled to crop out the white polaroid frame */}
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={loc.image}
                  alt={`${loc.title} — ${loc.sub}`}
                  className="w-full h-full object-cover transition-all duration-300 group-hover:opacity-100 group-hover:scale-105"
                  style={{ opacity: 0.85, transform: 'scale(1.35)' }}
                  loading="lazy"
                />
              </div>

              {/* Gradient overlay at bottom */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 45%, transparent 70%)',
                }}
              />

              {/* Location badge — top left */}
              <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                <span className="font-inter text-[14px] font-semibold text-white">{loc.title}</span>
              </div>

              {/* Content — bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                <p className="font-inter text-[13px] text-[#aaa] mb-2">{loc.sub}</p>
                <p className="font-inter text-[14px] text-[#ccc] leading-[1.6]">{loc.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={`mt-16 text-center transition-all duration-700 delay-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="font-inter text-[13px] text-[#555]">
            All policies are underwritten by TD General Insurance Company and valid in every Canadian province.
          </p>
        </div>

      </div>
    </section>
  );
}
