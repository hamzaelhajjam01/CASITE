import { ArrowUp } from 'lucide-react';
import ChatbotWidget from '../components/ChatbotWidget';
import WhatsAppIcon from '../components/icons/WhatsAppIcon';

// ─── Column Data ────────────────────────────────────────────
const productLinks = [
  { label: 'Get a quote', href: '/quote' },
  { label: 'Coverage', href: '/#coverage' },
  { label: 'Benefits', href: '/#why-polarguard' },
  { label: 'FAQ', href: '/#faq' },
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
                    href="https://wa.me/15799877798"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-inter text-[14px] text-[#9AA0A6] hover:text-white transition-colors"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 fill-[#168A5A]" />
                    +1 (579) 987-7798
                  </a>
                </li>
                <li>
                  <a
                    href="https://wa.me/15799877798"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-inter text-[14px] text-[#9AA0A6] hover:text-white transition-colors"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 fill-[#168A5A]" />
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

      {/* Live Chatbot */}
      <ChatbotWidget />
    </>
  );
}
