import { Star } from 'lucide-react';

const partners = [
  'CAA',
  'Intact Insurance',
  'Economical',
  'Wawanesa',
  'Travelers Canada',
  'Coachman',
  'Pembridge',
  'Jevco',
];

export default function LogoMarquee() {
  return (
    <section className="bg-pg-bg py-10 overflow-hidden">
      <div className="max-w-container mx-auto px-6 lg:px-12 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} fill="#F5A623" stroke="#F5A623" />
            ))}
          </div>
          <span className="font-inter text-[14px] text-pg-text-secondary">
            <strong className="text-pg-text-primary">4.9</strong> — Trusted by 15,000+ Canadian drivers
          </span>
        </div>
      </div>

      <div className="relative">
        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-pg-bg to-transparent z-10" />
        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-pg-bg to-transparent z-10" />

        <div className="flex animate-marquee">
          {[...partners, ...partners].map((name, i) => (
            <div
              key={`${name}-${i}`}
              className="flex-shrink-0 mx-10 lg:mx-14"
            >
              <span className="font-satoshi font-bold text-[18px] lg:text-[22px] text-pg-text-muted/40 tracking-tight whitespace-nowrap uppercase">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
