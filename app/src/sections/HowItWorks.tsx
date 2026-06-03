import { useEffect, useRef, useState } from 'react';

export default function HowItWorks() {
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
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="bg-white py-[60px]">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">

        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <p className="font-inter text-[12px] uppercase tracking-[0.2em] text-[#5F6368] mb-4">
            How It Works
          </p>
          <h2 className="font-satoshi font-semibold text-[#111] text-[32px] sm:text-[36px] lg:text-[40px] leading-[1.1]">
            Get covered in under 5 minutes
          </h2>
          <p className="mt-4 font-inter text-[#5F6368] text-[16px] max-w-[500px] mx-auto">
            Three simple steps from VIN to pink slip. No calls, no paperwork.
          </p>
        </div>

        {/* Process Image — desktop only */}
        <div className={`hidden lg:block transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <img
            src="/images/how-it-works.png"
            alt="Three-step process: 1. Enter your VIN, 2. Customize coverage, 3. Get covered with your pink slip"
            className="w-full rounded-[16px]"
            loading="eager"
            width="1200"
            height="420"
          />
        </div>

        {/* Mobile: 3 stacked step images (1, 2, 3) */}
        <div className={`lg:hidden flex flex-col gap-8 transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <img src="/images/how-step1-vin.png" alt="Step 1: Enter your VIN" className="w-full max-w-[360px] mx-auto rounded-[16px]" loading="lazy" />
          <img src="/images/how-step2-coverage.png" alt="Step 2: Customize Coverage" className="w-full max-w-[360px] mx-auto rounded-[16px]" loading="lazy" />
          <img src="/images/how-step3-covered.png" alt="Step 3: Get Covered" className="w-full max-w-[360px] mx-auto rounded-[16px]" loading="lazy" />
        </div>

      </div>
    </section>
  );
}
