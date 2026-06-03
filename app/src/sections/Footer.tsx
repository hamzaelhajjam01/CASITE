import { Phone, MessageCircle, ArrowUp } from 'lucide-react';

// ─── Column Data ────────────────────────────────────────────
const productLinks = [
  { label: 'Get a quote', href: '#quote' },
  { label: 'Coverage', href: '#coverage' },
  { label: 'Benefits', href: '#why-polarguard' },
  { label: 'FAQ', href: '#faq' },
];

const legalLinks = [
  { label: 'Privacy', href: '#' },
  { label: 'Terms', href: '#' },
  { label: 'Disclosure', href: '#' },
];

// ─── Component ──────────────────────────────────────────────
export default function Footer() {
  return (
    <>
      <footer id="footer" className="relative">
        {/* Background image */}
        <img
          src="/images/footer-bg.png?v=2"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 0 }}
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-[#081826]/50" style={{ zIndex: 1 }} />
        <div className="relative max-w-container mx-auto px-6 lg:px-12 py-16 lg:py-20" style={{ zIndex: 2 }}>

          {/* Main Grid: Logo left, 3 columns right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">

            {/* Logo + Tagline Column */}
            <div className="lg:col-span-5">
              {/* Logo */}
              <a href="#" className="block mb-5">
                <img
                  src="/images/logo-white.png?v=2"
                  alt="PolarGuard Insurance"
                  className="h-[44px] w-auto"
                />
              </a>

              {/* Tagline */}
              <p className="font-inter text-[#9AA0A6] text-[14px] leading-[1.7] max-w-[360px] mb-4">
                Independent Canadian auto brokerage offering 3-month prepaid quote previews with same-day broker review.
              </p>

              {/* Disclaimer */}
              <p className="font-inter text-[#9AA0A6]/60 text-[12px] leading-[1.6] max-w-[360px]">
                PolarGuard Insurance operates independently and is not affiliated with any bank.
              </p>
            </div>

            {/* Spacer */}
            <div className="hidden lg:block lg:col-span-1" />

            {/* Column 1 — Product */}
            <div className="lg:col-span-2">
              <h4 className="font-inter text-[14px] font-semibold text-white uppercase tracking-[0.05em] mb-5">
                Product
              </h4>
              <ul className="space-y-3">
                {productLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="font-inter text-[14px] text-[#9AA0A6] hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2 — Contact */}
            <div className="lg:col-span-2">
              <h4 className="font-inter text-[14px] font-semibold text-white uppercase tracking-[0.05em] mb-5">
                Contact
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="tel:1-800-POLAR-1"
                    className="inline-flex items-center gap-2 font-inter text-[14px] text-[#9AA0A6] hover:text-white transition-colors"
                  >
                    <Phone size={14} strokeWidth={2} />
                    1-800-POLAR-1
                  </a>
                </li>
                <li>
                  <a
                    href="https://wa.me/18007652743"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-inter text-[14px] text-[#9AA0A6] hover:text-white transition-colors"
                  >
                    <MessageCircle size={14} strokeWidth={2} />
                    WhatsApp support
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3 — Legal */}
            <div className="lg:col-span-2">
              <h4 className="font-inter text-[14px] font-semibold text-white uppercase tracking-[0.05em] mb-5">
                Legal
              </h4>
              <ul className="space-y-3">
                {legalLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="font-inter text-[14px] text-[#9AA0A6] hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom Bar */}
        <div className="relative border-t border-white/[0.06]" style={{ zIndex: 2 }}>
          <div className="max-w-container mx-auto px-6 lg:px-12 py-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <p className="font-inter text-[13px] text-[#9AA0A6]/60">
                &copy; 2026 PolarGuard Insurance Inc. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <a
                  href="#hero"
                  className="inline-flex items-center gap-1.5 font-inter text-[12px] text-[#9AA0A6]/50 hover:text-white transition-colors"
                >
                  <ArrowUp size={12} strokeWidth={2} />
                  Back to top
                </a>
                <p className="font-inter text-[12px] text-[#9AA0A6]/40">
                  Estimated quotes only. Final pricing depends on broker review and underwriting.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Chat Button */}
      <button className="fixed bottom-6 right-6 z-50 bg-[#168A5A] hover:bg-[#1FA36A] text-white font-inter text-[14px] font-semibold px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
        <MessageCircle size={18} strokeWidth={2} />
        Ask PolarGuard
      </button>
    </>
  );
}
