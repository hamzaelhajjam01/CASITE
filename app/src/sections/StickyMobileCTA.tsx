import { useEffect, useState } from 'react';
import { ArrowRight, X } from 'lucide-react';

export default function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!dismissed && window.scrollY > 400) {
        setVisible(true);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dismissed]);

  if (dismissed || !visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden safe-area-pb">
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
            href="#quote"
            className="shrink-0 inline-flex items-center gap-1.5 bg-pg-accent text-white font-inter text-[13px] font-semibold px-5 py-2.5 rounded-xl hover:bg-pg-accent-secondary transition-all active:scale-95 shadow-[0_2px_12px_rgba(22,138,90,0.3)]"
          >
            Start
            <ArrowRight size={14} />
          </a>
          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-pg-text-muted hover:text-pg-text-primary hover:bg-pg-accent-muted transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
