'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    // Keep the editor workspace on native scrolling so nested panels and the
    // client preview modal receive mouse-wheel events normally.
    if (pathname.startsWith('/editor')) return;

    const lenis = new Lenis({
      autoRaf: false,
      anchors: true,
      smoothWheel: true,
      syncTouch: false,
      lerp: 0.1,
      respectReducedMotion: true,
    });
    const onScroll = () => ScrollTrigger.update();
    const onTick = (time: number) => lenis.raf(time * 1000);

    lenis.on('scroll', onScroll);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off('scroll', onScroll);
      gsap.ticker.remove(onTick);
      lenis.destroy();
    };
  }, [pathname]);

  return null;
}
