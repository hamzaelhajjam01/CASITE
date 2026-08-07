import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

import WhatsAppIcon from '../components/icons/WhatsAppIcon';

// ─── Nav Links mapped to section IDs ────────────────────────
interface NavLink {
  label: string;
  href: string;
  sectionId?: string;
}

const navLinks: NavLink[] = [
  { label: 'Coverage', href: '#coverage', sectionId: 'coverage' },
  { label: 'About', href: '#why-polarguard', sectionId: 'why-polarguard' },
  { label: 'Testimonials', href: '#testimonials', sectionId: 'testimonials' },
  { label: 'FAQ', href: '#faq', sectionId: 'faq' },
  { label: 'Contact', href: '#footer', sectionId: 'footer' },
];

// ─── Component ──────────────────────────────────────────────
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');

  // Track scroll for navbar shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Intersection Observer for active section
  useEffect(() => {
    const sectionIds = navLinks.map((l) => l.sectionId).filter(Boolean) as string[];
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id);
          }
        },
        { threshold: 0.35, rootMargin: '-72px 0px 0px 0px' }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const handleMobileClick = () => setMobileOpen(false);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-[64px] lg:h-[72px] flex items-center bg-white transition-all duration-300 ${
        scrolled ? 'shadow-[0_1px_0_rgba(0,0,0,0.06)]' : ''
      }`}
    >
      <div className="max-w-container mx-auto w-full px-6 lg:px-12 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center shrink-0">
          <img
            src="/images/logo-dark.png?v=2"
            alt="PolarGuard Insurance"
            className="h-[44px] w-auto"
          />
        </a>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = activeSection === link.sectionId;
            return (
              <a
                key={link.label}
                href={link.href}
                className={`relative flex items-center gap-1 font-inter text-[14px] font-medium px-3 py-2 transition-all duration-200 ${
                  isActive
                    ? 'text-[#168A5A]'
                    : 'text-[#111] hover:text-[#168A5A]'
                }`}
              >
                {link.label}
                {/* Active indicator */}
                <span
                  className={`absolute bottom-0 left-3 right-3 h-[2px] bg-[#168A5A] rounded-full transition-all duration-200 ${
                    isActive ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                  }`}
                />
              </a>
            );
          })}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden lg:flex items-center gap-3">
          <a
            href="https://wa.me/15799877798"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-inter text-[14px] font-semibold px-5 py-2.5 rounded-full text-white bg-[#168A5A] hover:bg-[#13784E] shadow-[0_2px_10px_rgba(22,138,90,0.2)] transition-all duration-300 shrink-0 whitespace-nowrap"
          >
            <WhatsAppIcon className="w-4 h-4 fill-white text-white shrink-0 aspect-square" />
            <span className="shrink-0 whitespace-nowrap">+1 (579) 987-7798</span>
          </a>
          <a
            href="#quote"
            className="font-inter text-[14px] font-semibold px-5 py-2.5 rounded-lg bg-[#111] text-white hover:bg-[#222] transition-all duration-300 shrink-0 whitespace-nowrap"
          >
            Get My Pink Slip
          </a>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="lg:hidden p-2 text-[#111]"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="absolute top-[64px] lg:top-[72px] left-0 right-0 bg-white border-b border-[#E6E8EB] shadow-lg lg:hidden">
          <div className="px-6 py-6 flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive = activeSection === link.sectionId;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className={`font-inter text-[15px] font-medium py-3 px-2 rounded-lg transition-colors ${
                    isActive ? 'text-[#168A5A] bg-[#F0FDF4]' : 'text-[#111]'
                  }`}
                  onClick={handleMobileClick}
                >
                  {link.label}
                </a>
              );
            })}
            <div className="flex flex-col gap-3 pt-4 border-t border-[#E6E8EB] mt-2">
              <a
                href="https://wa.me/15799877798"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 font-inter text-[14px] font-semibold text-white bg-[#168A5A] hover:bg-[#13784E] px-5 py-2.5 rounded-full text-center shrink-0 whitespace-nowrap"
                onClick={handleMobileClick}
              >
                <WhatsAppIcon className="w-4 h-4 fill-white text-white shrink-0 aspect-square" />
                <span className="shrink-0 whitespace-nowrap">+1 (579) 987-7798</span>
              </a>
              <a
                href="#quote"
                className="font-inter text-[14px] font-semibold px-5 py-2.5 rounded-lg bg-[#111] text-white text-center hover:bg-[#222]"
                onClick={handleMobileClick}
              >
                Get My Pink Slip
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
