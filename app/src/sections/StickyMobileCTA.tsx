import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import WhatsAppIcon from '../components/icons/WhatsAppIcon';

export default function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let isInsideQuote = false;

    const checkVisibility = () => {
      const scrolledEnough = window.scrollY > 300;
      setVisible(scrolledEnough && !isInsideQuote);
    };

    const quoteEl = document.getElementById('quote');
    let observer: IntersectionObserver | null = null;

    if (quoteEl) {
      observer = new IntersectionObserver(
        ([entry]) => {
          isInsideQuote = entry.isIntersecting;
          checkVisibility();
        },
        { threshold: 0.05 }
      );
      observer.observe(quoteEl);
    }

    window.addEventListener('scroll', checkVisibility, { passive: true });
    checkVisibility();

    return () => {
      window.removeEventListener('scroll', checkVisibility);
      if (observer && quoteEl) {
        observer.unobserve(quoteEl);
      }
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden safe-area-pb transition-all duration-300">
      <div className="bg-white/95 backdrop-blur-xl border-t border-pg-border shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-satoshi text-pg-text-primary text-[14px] font-medium truncate">
              Get your free quote
            </p>
            <p className="font-inter text-pg-text-muted text-[11px] truncate">
              Under 3 minutes &middot; No commitment
            </p>
          </div>
          <a
            href="/quote"
            className="shrink-0 inline-flex items-center gap-1.5 bg-pg-accent text-white font-inter text-[13px] font-semibold px-5 py-2.5 rounded-xl hover:bg-pg-accent-secondary transition-all active:scale-95 shadow-[0_2px_12px_rgba(22,138,90,0.3)]"
          >
            Start
            <ArrowRight size={14} />
          </a>
          <a
            href="https://wa.me/15799877798"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 w-10 h-10 rounded-full bg-[#168A5A] hover:bg-[#13784E] text-white flex items-center justify-center transition-all active:scale-95 shadow-[0_2px_10px_rgba(22,138,90,0.25)]"
            title="Chat on WhatsApp"
            aria-label="Chat on WhatsApp"
          >
            <WhatsAppIcon className="w-5 h-5 fill-white text-white shrink-0 aspect-square" />
          </a>
        </div>
      </div>
    </div>
  );
}
