'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function LandingMotion() {
  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const reveals = gsap.utils.toArray<HTMLElement>('.gsap-reveal');
    reveals.forEach((element) => {
      gsap.from(element, {
        y: 28,
        autoAlpha: 0,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 80%',
          once: true,
        },
      });
    });

    gsap.from('.gsap-checkmark', {
      y: 18,
      autoAlpha: 0,
      duration: 0.45,
      stagger: 0.15,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.gsap-checkmark',
        start: 'top 80%',
        once: true,
      },
    });

    gsap.fromTo('.landing-cta',
      { scale: 0.95, boxShadow: '0 0 0 rgba(16,185,129,0)' },
      {
        scale: 1,
        boxShadow: '0 0 72px rgba(16,185,129,0.18)',
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.landing-cta',
          start: 'top 80%',
          once: true,
        },
      },
    );
  });

  return null;
}
