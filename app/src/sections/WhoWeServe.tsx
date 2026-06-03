import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Car, GraduationCap, Users, Crown } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const audiences = [
  {
    icon: Car,
    title: 'Daily Commuters',
    description:
      'Toronto to Mississauga every day? Protect your ride with coverage designed for high-mileage drivers. Bundle with home insurance for maximum savings.',
  },
  {
    icon: GraduationCap,
    title: 'New Drivers',
    description:
      "Just got your G2? We offer competitive rates for young drivers with good grades and driver training discounts. Everyone starts somewhere.",
  },
  {
    icon: Users,
    title: 'Families',
    description:
      'Multi-car household? Save with our family bundle. Add teen drivers without the sticker shock — we reward safe driving, not punish inexperience.',
  },
  {
    icon: Crown,
    title: 'Luxury & Classic Cars',
    description:
      'Your Porsche or classic Mustang deserves specialized coverage. Agreed value protection, OEM parts guarantee, and collector car expertise.',
  },
];

export default function WhoWeServe() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = cardsRef.current?.querySelectorAll('.audience-card');
      if (cards) {
        gsap.fromTo(
          cards,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
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
      id="about"
      ref={sectionRef}
      className="bg-pg-bg py-24 lg:py-[120px]"
    >
      <div className="max-w-container mx-auto px-6 lg:px-12">
        {/* Section Label */}
        <div className="mb-12">
          <span className="inline-flex items-center bg-pg-accent-muted text-pg-accent font-inter text-[12px] font-medium tracking-[0.04em] uppercase rounded-full px-4 py-1.5">
            Who We Serve
          </span>
          <h2 className="mt-4 font-satoshi font-medium text-pg-text-primary text-[28px] sm:text-[36px] lg:text-[44px] leading-[1.15] tracking-[-0.01em]">
            Insurance for every kind of Canadian driver
          </h2>
        </div>

        {/* Audience Cards */}
        <div ref={cardsRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {audiences.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="audience-card bg-white border border-pg-border rounded-3xl p-8 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-full bg-pg-accent-muted flex items-center justify-center mb-5">
                  <Icon size={28} className="text-pg-accent" strokeWidth={1.5} />
                </div>
                <h3 className="font-satoshi font-medium text-pg-text-primary text-[22px] leading-[1.25] mb-3">
                  {item.title}
                </h3>
                <p className="font-inter text-pg-text-secondary text-[14px] leading-[1.65]">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
