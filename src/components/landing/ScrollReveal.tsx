'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function ScrollReveal({ children, className, delay = 0 }: ScrollRevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || !('IntersectionObserver' in window)) {
      element.dataset.revealed = 'true';
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        element.dataset.revealed = 'true';
        observer.unobserve(element);
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' });

    element.dataset.revealReady = 'true';
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={elementRef}
      className={className}
      data-reveal
      style={{ '--reveal-delay': `${Math.min(Math.max(delay, 0), 320)}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
