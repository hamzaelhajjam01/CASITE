import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ShieldCheck, HeartHandshake, TrendingDown, Wrench } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: ShieldCheck,
    title: 'Comprehensive Coverage',
    description:
      'Full protection for collisions, theft, vandalism, and weather damage. Drive knowing you\'re covered for whatever the Canadian roads throw your way.',
  },
  {
    icon: HeartHandshake,
    title: 'Accident Forgiveness',
    description:
      'Your first at-fault accident won\'t increase your premium. We believe in second chances — because nobody\'s perfect, especially on winter roads.',
  },
  {
    icon: TrendingDown,
    title: 'Disappearing Deductible',
    description:
      'Your deductible drops every year you\'re claim-free. After five years, it could reach $0. Safe driving should be rewarded, and we put money back in your pocket.',
  },
  {
    icon: Wrench,
    title: '24/7 Roadside Assistance',
    description:
      'Flat tire on the 401? Dead battery in a snowstorm? Our roadside team is one call away, anywhere in Canada, any time of day — included with every policy.',
  },
];

export default function Features() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = cardsRef.current?.querySelectorAll('.feature-card');
      if (cards) {
        gsap.fromTo(
          cards,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 85%',
              once: true,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="coverage"
      ref={sectionRef}
      className="bg-pg-bg py-24 lg:py-[120px]"
    >
      <div className="max-w-container mx-auto px-6 lg:px-12">
        {/* Section Label */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center bg-pg-accent-muted text-pg-accent font-inter text-[12px] font-medium tracking-[0.04em] uppercase rounded-full px-4 py-1.5">
            Our Coverage
          </span>
          <h2 className="mt-4 font-satoshi font-medium text-pg-text-primary text-[28px] sm:text-[36px] lg:text-[44px] leading-[1.15] tracking-[-0.01em] max-w-[600px] mx-auto">
            Protection that goes the distance
          </h2>
        </div>

        {/* Feature Cards Grid */}
        <div ref={cardsRef} className="grid sm:grid-cols-2 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="feature-card bg-white border border-pg-border rounded-3xl p-8 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-pg-accent-muted flex items-center justify-center mb-6">
                  <Icon size={24} className="text-pg-accent" strokeWidth={2} />
                </div>
                <h3 className="font-satoshi font-medium text-pg-text-primary text-[24px] lg:text-[28px] leading-[1.25] mb-3">
                  {feature.title}
                </h3>
                <p className="font-inter text-pg-text-secondary text-[15px] leading-[1.65]">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
