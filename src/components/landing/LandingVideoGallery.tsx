'use client';

import { useEffect, useRef } from 'react';
import { ScrollReveal } from './ScrollReveal';

const videos = [
  {
    src: '/videos/position-01.mp4',
    label: '01',
    title: 'Keep the brief with the cut',
    description: 'Give clients one place to find the approved script, scene notes, and visual references.',
  },
  {
    src: '/videos/position-02.mp4',
    label: '02',
    title: 'Make feedback specific',
    description: 'Clients can leave a note while watching, with the video time attached for the editor.',
  },
  {
    src: '/videos/position-03.mp4',
    label: '03',
    title: 'Keep revisions moving',
    description: 'Share new cuts, follow review status, and record approval in the same project.',
  },
];

export function LandingVideoGallery() {
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);

  useEffect(() => {
    const elements = videoRefs.current.filter((video): video is HTMLVideoElement => video !== null);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
            void video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: [0, 0.55, 1] },
    );

    elements.forEach((video) => observer.observe(video));
    return () => observer.disconnect();
  }, []);

  return (
    <section aria-labelledby="landing-videos-title" className="bg-white px-5 pb-20 sm:px-8 sm:pb-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-end justify-between gap-4 border-t border-[#d6d6d6] pt-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#707070]">How SyncCut works</p>
            <h2 id="landing-videos-title" className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#1d1d1f] sm:text-3xl">
              From first brief to final approval.
            </h2>
          </div>
          <span className="pb-1 text-xs tabular-nums text-[#86868b]">01 — 03</span>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {videos.map((video, index) => (
            <ScrollReveal key={video.src} className="min-w-0" delay={index * 70}>
              <figure>
                <video
                  ref={(element) => { videoRefs.current[index] = element; }}
                  muted
                  loop
                  playsInline
                  preload="none"
                  aria-label={video.label}
                  className="aspect-video w-full rounded-2xl bg-black object-contain"
                >
                  <source src={video.src} type="video/mp4" />
                  Your browser does not support embedded video.
                </video>
                <figcaption className="pt-4">
                  <p className="text-xs font-medium tabular-nums text-[#86868b]">{video.label}</p>
                  <h3 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-[#1d1d1f]">{video.title}</h3>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-[#707070]">{video.description}</p>
                </figcaption>
              </figure>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
