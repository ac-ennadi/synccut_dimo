'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, ArrowRight, CheckCircle2, Play, ShieldCheck, UserCheck } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger, useGSAP);
ScrollTrigger.config({ ignoreMobileResize: true });

const videoId = 'nVmXsBNfwHY';
const positionVideos = [
  '/videos/position-01.mp4',
  '/videos/position-02.mp4',
  '/videos/position-03.mp4',
] as const;

const steps = [
  {
    number: '01',
    label: 'Script & review',
    title: 'Watch the latest cut alongside the script.',
    description: 'Give clients full context. Review video drafts directly next to the approved script, scene breakdown, and voiceovers.',
    bullets: ['Script and video on one screen', 'Secure, private client portals'],
    frameTime: undefined,
  },
  {
    number: '02',
    label: 'Frame-accurate feedback',
    title: 'Feedback pinned to the exact frame.',
    description: 'Stop decoding vague emails like "fix that part in the middle." Clients click to drop timecoded notes right where edits are needed.',
    bullets: ['Frame-accurate timestamped notes', 'Color & visual style references'],
    frameTime: '00:24',
  },
  {
    number: '03',
    label: 'Progress & approval',
    title: 'Track stages, revise, approve.',
    description: 'Eliminate status update messages. Show clients exact project progress—from Script to Shoot to Final Cut—so everyone stays on schedule.',
    bullets: ['Real-time stage pipeline', 'One-click final cut approval'],
    frameTime: undefined,
  },
];

function FeatureVideo({ positionIndex = 0, mobile = false }: { positionIndex?: number; mobile?: boolean }) {
  return (
    <video
      key={positionVideos[positionIndex]}
      className={`${mobile ? '' : 'pointer-events-none '}h-full w-full object-contain`}
      src={positionVideos[positionIndex]}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      onCanPlay={(event) => {
        void event.currentTarget.play();
      }}
      aria-label={`SyncCut position ${String(positionIndex + 1).padStart(2, '0')} video preview`}
    />
  );
}

function MobileFeaturePreview({ frameTime, positionIndex }: { frameTime?: string; positionIndex: number }) {
  return (
    <div className="mt-8 w-full max-w-full overflow-hidden rounded-2xl border border-white/10 bg-black p-2 shadow-[0_20px_60px_rgba(0,0,0,0.35)] lg:hidden">
      <div className="aspect-video w-full overflow-hidden rounded-xl">
        <div className="relative h-full w-full">
          <FeatureVideo positionIndex={positionIndex} mobile />
          {frameTime && (
            <span className="absolute bottom-3 left-3 rounded-md border border-emerald-300/30 bg-[#071713]/90 px-2 py-1 font-mono text-[10px] font-semibold text-emerald-200">
              Feedback at {frameTime}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function LandingScrollStory() {
  const [activeStep, setActiveStep] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const heroHeadingRef = useRef<HTMLHeadingElement>(null);
  const heroSubtitleRef = useRef<HTMLParagraphElement>(null);
  const heroDetailsRef = useRef<HTMLDivElement>(null);
  const stepsColumnRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabContainerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const section = sectionRef.current;
    const hero = heroRef.current;
    const heroDetails = heroDetailsRef.current;
    const stepsColumn = stepsColumnRef.current;
    const media = mediaRef.current;
    const heroHeading = heroHeadingRef.current;
    const heroSubtitle = heroSubtitleRef.current;
    const stepPanels = stepRefs.current.filter(Boolean) as HTMLDivElement[];
    const tabs = tabRefs.current.filter(Boolean) as HTMLButtonElement[];
    if (!section || !hero || !heroDetails || !stepsColumn || !media || !heroHeading || !heroSubtitle || stepPanels.length !== 3 || tabs.length !== 3) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      gsap.set([hero, stepsColumn, ...stepPanels, media], { clearProps: 'all', autoAlpha: 1 });
      return;
    }

    gsap.from([heroHeading, heroSubtitle], {
      y: 40,
      autoAlpha: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out',
      clearProps: 'transform,opacity,visibility',
    });

    const updateActiveStep = (index: number) => {
      setActiveStep(index);
      section.dataset.activeStep = String(index + 1);
    };

    const buildDesktopTimeline = () => {
      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=400%',
          scrub: 0.8,
          pin: section,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      gsap.set(hero, { autoAlpha: 1, y: 0 });
      gsap.set(stepsColumn, {
        autoAlpha: 0,
      });
      gsap.set(stepPanels, { autoAlpha: 0, y: 28 });
      gsap.set(media, {
        left: '8%', top: '78%', bottom: 'auto', width: '78%', height: '70vh',
        xPercent: 0, yPercent: 0, borderRadius: 16,
      });
      updateActiveStep(0);

      timeline.to(hero, { autoAlpha: 0, y: -56, duration: 1 }, 0);
      timeline.to(heroDetails, { autoAlpha: 0, duration: 0.32 }, 0);
      timeline.to(media, {
        top: '50%', left: '52%', width: '44%', height: 'calc(24.75vw + 60px)', yPercent: -50, borderRadius: 24, duration: 1,
      }, 0);

      timeline.to(stepsColumn, { autoAlpha: 1, duration: 0.18 }, 1);
      timeline.to(stepPanels[0], { autoAlpha: 1, y: 0, duration: 0.24 }, 1.08);
      timeline.to(stepPanels[0], { autoAlpha: 0, y: -28, duration: 0.2 }, 2);
      timeline.to(stepPanels[1], { autoAlpha: 1, y: 0, duration: 0.2 }, 2.12);
      timeline.to(stepPanels[1], { autoAlpha: 0, y: -28, duration: 0.2 }, 3);
      timeline.to(stepPanels[2], { autoAlpha: 1, y: 0, duration: 0.2 }, 3.12);
      timeline.to({}, { duration: 0.68 }, 3.32);

      let activeIndex = -1;
      timeline.eventCallback('onUpdate', () => {
        const time = timeline.time();
        const nextIndex = time < 2.12 ? 0 : time < 3.12 ? 1 : 2;
        if (nextIndex !== activeIndex) {
          activeIndex = nextIndex;
          updateActiveStep(nextIndex);
        }
      });

      return () => timeline.scrollTrigger?.kill();
    };

    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px)', () => {
      gsap.fromTo(media,
        { rotateX: 12, scale: 0.9, transformPerspective: 1200 },
        {
          rotateX: 0,
          scale: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
            invalidateOnRefresh: true,
          },
        },
      );
      return buildDesktopTimeline();
    });
    mm.add('(max-width: 1023px)', () => {
      gsap.set([hero, stepsColumn, ...stepPanels, media], {
        autoAlpha: 1,
        clearProps: 'transform,opacity,visibility,top,left,right,bottom,width,height',
      });
      section.dataset.activeStep = '1';
      gsap.utils.toArray<HTMLElement>('.mobile-feature-card').forEach((card) => {
        gsap.from(card, {
          y: 20,
          autoAlpha: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: card, start: 'top 85%', once: true },
        });
      });
    });

    let resizeTimer: number | undefined;
    const refreshAfterResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => ScrollTrigger.refresh(), 150);
    };
    window.addEventListener('resize', refreshAfterResize);

    return () => {
      window.removeEventListener('resize', refreshAfterResize);
      window.clearTimeout(resizeTimer);
      mm.revert();
    };
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      aria-label="See how SyncCut works"
      className="relative h-screen h-[100dvh] w-full max-w-full overflow-hidden bg-[#08090c] text-white max-lg:h-auto max-lg:min-h-screen max-lg:overflow-visible"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_76%_45%,rgba(99,102,241,0.12),transparent_42%),radial-gradient(ellipse_at_12%_62%,rgba(16,185,129,0.09),transparent_38%)]" />

      {/* All animation geometry is measured against this centered, full-height frame. */}
      <div className="relative mx-auto h-full w-full max-w-7xl max-w-full max-lg:flex max-lg:h-auto max-lg:min-h-screen max-lg:flex-col max-lg:px-4 max-lg:pb-12 sm:max-lg:px-6">
        {/* Hero headline occupies the upper half while the wide video peeks up from below. */}
        <div ref={heroRef} id="home" className="box-border absolute left-1/2 top-[7%] z-20 mx-auto flex w-full max-w-5xl -translate-x-1/2 flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8 max-lg:static max-lg:z-20 max-lg:w-full max-lg:max-w-none max-lg:translate-x-0 max-lg:px-0 max-lg:pb-8 max-lg:pt-14">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-100">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.75)]" />
            Video collaboration, all on one page
          </div>
          <h1 ref={heroHeadingRef} className="box-border w-full max-w-full break-words text-3xl font-bold leading-tight tracking-tight text-center text-[#f5f6fa] sm:text-5xl md:text-5xl lg:text-6xl xl:text-7xl">
            Clients review it. Editors cut it.<br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">Projects ship.</span>
          </h1>
          <p ref={heroSubtitleRef} className="box-border mx-auto mt-5 max-w-md text-xs leading-7 text-white/65 sm:text-sm md:max-w-xl md:text-base">
            Unify script notes, project stages, timecoded feedback, and style references into one clean workspace.
          </p>
          <div ref={heroDetailsRef} className="box-border w-full">
          <div className="box-border mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/client/login" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-blue-500 px-5 text-sm font-bold text-[#06110d] shadow-[0_8px_26px_rgba(16,185,129,0.18)] transition hover:-translate-y-0.5">
              <UserCheck size={17} /> Log in as client <ArrowRight size={17} />
            </Link>
            <a href={`https://youtu.be/${videoId}`} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/15 bg-white/[0.035] px-5 text-sm font-semibold text-white transition hover:border-white/30">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-white/10 text-emerald-300"><Play size={12} fill="currentColor" /></span>
              View the demo
            </a>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[11px] text-white/60">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5"><ShieldCheck size={15} className="text-emerald-300" /> No client login required</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5"><CheckCircle2 size={15} className="text-emerald-300" /> Every note stays in context</span>
          </div>
          <div className="mt-5 inline-flex items-center gap-2 text-[9px] tracking-[0.14em] text-white/45">
            SCROLL TO EXPLORE <ArrowDown size={13} className="text-emerald-300" />
          </div>
          </div>
        </div>

        {/* Step content is stacked in one left-hand column and revealed by the same scrubbed timeline. */}
        <div ref={stepsColumnRef} className="feature-wrapper absolute left-[3%] top-1/2 z-10 h-[70vh] w-1/2 -translate-y-1/2 opacity-0 max-lg:static max-lg:z-10 max-lg:h-auto max-lg:w-full max-lg:translate-y-0 max-lg:opacity-100">
          {steps.map((step, index) => {
            return (
              <div
                ref={(node) => { stepRefs.current[index] = node; }}
                key={step.number}
                aria-hidden={index !== activeStep}
                className="mobile-feature-card pointer-events-none box-border absolute inset-0 flex w-full max-w-xl flex-col justify-center px-4 md:px-8 max-lg:static max-lg:min-h-0 max-lg:w-full max-lg:max-w-full max-lg:px-0 max-lg:py-10"
              >
                <div className="mb-4 inline-flex w-fit items-center rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-emerald-300">{step.number}</div>
                <h2 className="mt-4 max-w-lg text-3xl font-bold leading-[1.02] tracking-[-0.065em] text-[#f5f6fa] md:text-5xl lg:text-6xl">{step.title}</h2>
                <p className="mt-4 max-w-md text-sm leading-7 text-white/65">{step.description}</p>
                <ul className="mt-6 grid gap-3 text-[13px] text-white/80 gsap-reveal">
                  {step.bullets.map((bullet) => <li className="gsap-checkmark flex items-center gap-2.5" key={bullet}><CheckCircle2 size={15} className="shrink-0 text-emerald-300" />{bullet}</li>)}
                </ul>
                <MobileFeaturePreview frameTime={step.frameTime} positionIndex={index} />
              </div>
            );
          })}
        </div>

        {/* The window starts wide and low, then GSAP moves it into the right column. */}
        <div ref={mediaRef} className="absolute bottom-[-20%] left-[10%] z-10 h-[70vh] w-[80%] overflow-hidden rounded-2xl border border-white/10 bg-gray-900 shadow-[0_30px_100px_rgba(0,0,0,0.6),0_12px_80px_rgba(16,185,129,0.11),0_0_48px_rgba(99,102,241,0.12)] max-lg:hidden">
          <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[inherit] p-3 sm:p-4 max-[768px]:h-auto">
            <div className="mb-3 flex h-9 shrink-0 items-center justify-between gap-3">
              <div ref={tabContainerRef} className="flex w-full min-w-0 items-center gap-2 overflow-x-auto scroll-smooth pr-4 no-scrollbar">
                {steps.map((step, index) => (
                  <button
                    ref={(node) => { tabRefs.current[index] = node; }}
                    key={step.number}
                    type="button"
                    role="tab"
                    aria-selected={index === activeStep}
                    aria-controls="sync-cut-demo-video"
                    onClick={() => setActiveStep(index)}
                    className={`flex-shrink-0 whitespace-nowrap truncate rounded-full px-2.5 py-2 text-xs font-semibold transition-colors md:text-sm sm:px-3 ${index === activeStep ? 'bg-white/10 text-white' : 'text-white/45'}`}
                  >
                    <span className="mr-1.5 font-mono text-emerald-300">{step.number}</span>{step.label}
                  </button>
                ))}
              </div>
              <a href={`https://youtu.be/${videoId}`} target="_blank" rel="noreferrer" className="hidden shrink-0 items-center gap-2 text-xs font-semibold text-white/80 transition hover:text-emerald-300 sm:inline-flex">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-gray-950"><Play size={10} fill="currentColor" /></span> View full demo
              </a>
            </div>
            <div id="sync-cut-demo-video" className="aspect-video w-full shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black">
              <div className="relative h-full w-full">
                <FeatureVideo positionIndex={activeStep} />
                {steps[activeStep].frameTime && (
                  <span className="absolute bottom-4 left-4 rounded-md border border-emerald-300/30 bg-[#071713]/90 px-2.5 py-1.5 font-mono text-xs font-semibold text-emerald-200">
                    Feedback at {steps[activeStep].frameTime}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
