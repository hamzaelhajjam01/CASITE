import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function CTABanner() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="quote"
      ref={sectionRef}
      className="bg-pg-dark py-20 lg:py-[100px]"
    >
      <div className="max-w-container mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-[60%_40%] gap-10 lg:gap-8 items-center">
          {/* Left: Text */}
          <div>
            <h2 className="font-satoshi font-medium text-white text-[28px] sm:text-[36px] lg:text-[44px] leading-[1.15] tracking-[-0.01em]">
              Join 15,000+ Canadian drivers who trust PolarGuard
            </h2>
            <p className="mt-4 font-inter text-white/70 text-base leading-relaxed">
              Get a quote in under 3 minutes. No commitment, no pressure — just honest Canadian coverage.
            </p>
          </div>

          {/* Right: Buttons */}
          <div className="flex flex-col items-start lg:items-end gap-4">
            <div className="flex flex-col sm:flex-row lg:flex-col gap-4 w-full sm:w-auto">
              <a
                href="#"
                className="animate-pulse-btn inline-flex items-center justify-center bg-white text-pg-text-primary font-inter text-[14px] font-semibold px-8 py-3.5 rounded-lg hover:bg-white/90 transition-all text-center"
              >
                Get Your Quote
              </a>
              <a
                href="#"
                className="inline-flex items-center justify-center text-white font-inter text-[14px] font-semibold px-8 py-3.5 rounded-lg border border-white/30 hover:bg-white/10 transition-all text-center"
              >
                Speak to an Advisor
              </a>
            </div>
            <p className="font-inter text-[12px] text-white/50 tracking-wide">
              No credit check required. Cancel anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
