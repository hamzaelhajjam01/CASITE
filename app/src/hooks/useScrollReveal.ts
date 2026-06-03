import { useEffect, useRef, useState } from 'react';

interface ScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: ScrollRevealOptions = {}
) {
  const { threshold = 0.15, triggerOnce = true } = options;
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) observer.disconnect();
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, triggerOnce]);

  return { ref, isVisible };
}

export function getRevealClass(
  isVisible: boolean,
  direction: 'up' | 'down' | 'left' | 'right' = 'up',
  delay: number = 0
): string {
  const base = 'transition-all duration-700 ease-out';
  const delayStyle = delay > 0 ? ` transition-delay-[${delay}ms]` : '';

  if (isVisible) {
    return `${base}${delayStyle} opacity-100 translate-y-0 translate-x-0`;
  }

  const transforms: Record<string, string> = {
    up: 'opacity-0 translate-y-8',
    down: 'opacity-0 -translate-y-8',
    left: 'opacity-0 translate-x-8',
    right: 'opacity-0 -translate-x-8',
  };

  return `${base}${delayStyle} ${transforms[direction]}`;
}
