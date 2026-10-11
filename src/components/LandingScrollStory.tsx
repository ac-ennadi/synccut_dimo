'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, ArrowRight, CheckCircle2, Play, ShieldCheck, UserCheck } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const videoId = 'nVmXsBNfwHY';

const steps = [
  {
    number: '01',
    label: 'One cut. One place.',
    title: 'Watch the latest cut.',
    description: 'Clients open the latest cut and its related notes in one secure workspace.',
    bullets: ['One home for every version', 'Private client access'],
  },
  {
    number: '02',
    label: 'Feedback stays with the cut.',
    title: 'Feedback that makes sense.',
    description: 'Clients leave notes as they watch. Every comment stays connected to its moment, so your next edit starts with clear direction.',
    bullets: ['Timecoded client notes', 'A shared conversation'],
  },
  {
    number: '03',
    label: 'Keep the project moving.',
    title: 'Review, revise, approve.',
    description: 'Track revisions and approval in one place. Your team and client can see where the project stands and what happens next.',
    bullets: ['Version history in one place', 'Clear approval status'],
  },
];

export function LandingScrollStory() {
  const [activeStep, setActiveStep] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const heroDetailsRef = useRef<HTMLDivElement>(null);
  const stepsColumnRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const activeTab = tabRefs.current[activeStep];
    if (!activeTab || !tabContainerRef.current) return;

    activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activeStep]);

  useGSAP(() => {
    const section = sectionRef.current;
    const hero = heroRef.current;
    const heroDetails = heroDetailsRef.current;
    const stepsColumn = stepsColumnRef.current;
    const media = mediaRef.current;
    const stepPanels = stepRefs.current.filter(Boolean) as HTMLDivElement[];
    const tabs = tabRefs.current.filter(Boolean) as HTMLButtonElement[];
    if (!section || !hero || !heroDetails || !stepsColumn || !media || stepPanels.length !== 3 || tabs.length !== 3) return;

    const updateActiveStep = (index: number) => {
      setActiveStep(index);
      section.dataset.activeStep = String(index + 1);
    };

    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
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
    gsap.set(stepsColumn, { autoAlpha: 0 });
    gsap.set(stepPanels, { autoAlpha: 0, y: 28 });
    gsap.set(media, {
      left: '10%',
      // Start below the hero details; the first scroll phase lifts the frame into place.
      top: '78%',
      bottom: 'auto',
      width: '80%',
      height: '70vh',
      xPercent: 0,
      yPercent: 0,
      borderRadius: 16,
    });
    updateActiveStep(0);

    // Phase 1: lift the headline and explicitly move the frame out of its clipped hero position.
    timeline.to(hero, { autoAlpha: 0, y: -56, duration: 1 }, 0);
    timeline.to(heroDetails, { autoAlpha: 0, duration: 0.32 }, 0);
    timeline.to(media, {
      top: '50%',
      left: '55%',
      width: '45%',
      height: '60vh',
      yPercent: -50,
      borderRadius: 24,
      duration: 1,
    }, 0);

    // Phase 2: the text column and first step arrive after the frame reaches its right-hand position.
    timeline.to(stepsColumn, { autoAlpha: 1, duration: 0.18 }, 1);
    timeline.to(stepPanels[0], { autoAlpha: 1, y: 0, duration: 0.24 }, 1.08);

    // Phase 3 and 4: each copy change and tab highlight share one scroll threshold.
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
    });

    mm.add('(max-width: 1023px), (prefers-reduced-motion: reduce)', () => {
      updateActiveStep(0);
      const triggers = stepPanels.map((panel, index) => ScrollTrigger.create({
        trigger: panel,
        start: 'top 60%',
        end: 'bottom 60%',
        onToggle: ({ isActive }) => { if (isActive) updateActiveStep(index); },
      }));
      return () => triggers.forEach((trigger) => trigger.kill());
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
      className="relative h-screen w-full overflow-hidden bg-[#08090c] text-white max-lg:h-auto max-lg:min-h-screen max-lg:overflow-visible motion-reduce:h-auto motion-reduce:min-h-screen motion-reduce:overflow-visible"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_76%_45%,rgba(99,102,241,0.12),transparent_42%),radial-gradient(ellipse_at_12%_62%,rgba(16,185,129,0.09),transparent_38%)]" />

      {/* All animation geometry is measured against this centered, full-height frame. */}
      <div className="relative mx-auto h-full w-full max-w-7xl max-lg:flex max-lg:h-auto max-lg:flex-col max-lg:gap-8 max-lg:px-5 max-lg:pb-10 motion-reduce:flex motion-reduce:h-auto motion-reduce:flex-col motion-reduce:gap-8 motion-reduce:px-5 motion-reduce:pb-10">
        {/* Hero headline occupies the upper half while the wide video peeks up from below. */}
        <div ref={heroRef} id="home" className="box-border absolute left-1/2 top-[7%] z-20 mx-auto flex w-full max-w-5xl -translate-x-1/2 flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8 max-lg:relative max-lg:left-auto max-lg:top-auto max-lg:order-0 max-lg:translate-x-0 max-lg:pt-16 motion-reduce:relative motion-reduce:left-auto motion-reduce:top-auto motion-reduce:order-0 motion-reduce:translate-x-0 motion-reduce:pt-16">
          <div className="mb-5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/65">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.75)]" />
            Video feedback, all in one place
          </div>
          <h1 className="box-border w-full break-words text-2xl font-bold leading-tight tracking-tight text-center text-[#f5f6fa] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
            Your team points at it.<br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">Your agent ships it.</span>
          </h1>
          <p className="box-border mx-auto mt-5 max-w-md text-xs leading-7 text-white/65 sm:text-sm md:max-w-xl md:text-base">
            Watch the latest cut, share feedback, and keep every revision in one place.
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
          <div className="mt-5 flex items-center justify-center gap-4 text-[11px] text-white/50">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck size={15} className="text-emerald-300" /> Private client review</span>
            <span className="h-3 w-px bg-white/15" />
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={15} className="text-emerald-300" /> Every note stays in context</span>
          </div>
          <div className="mt-5 inline-flex items-center gap-2 text-[9px] tracking-[0.14em] text-white/45">
            SCROLL TO EXPLORE <ArrowDown size={13} className="text-emerald-300" />
          </div>
          </div>
        </div>

        {/* Step content is stacked in one left-hand column and revealed by the same scrubbed timeline. */}
        <div ref={stepsColumnRef} className="absolute left-[3%] top-1/2 z-10 h-[70vh] w-1/2 -translate-y-1/2 opacity-0 max-lg:relative max-lg:order-2 max-lg:left-auto max-lg:top-auto max-lg:h-auto max-lg:w-full max-lg:translate-y-0 max-lg:opacity-100 motion-reduce:relative motion-reduce:order-2 motion-reduce:left-auto motion-reduce:top-auto motion-reduce:h-auto motion-reduce:w-full motion-reduce:translate-y-0 motion-reduce:opacity-100">
          {steps.map((step, index) => {
            return (
              <div
                ref={(node) => { stepRefs.current[index] = node; }}
                key={step.number}
                aria-hidden={index !== activeStep}
                className="pointer-events-none box-border absolute inset-0 flex w-full max-w-xl flex-col justify-center px-4 md:px-8 max-lg:relative max-lg:inset-auto max-lg:mb-12 max-lg:min-h-[45vh] motion-reduce:relative motion-reduce:inset-auto motion-reduce:mb-12 motion-reduce:min-h-[45vh]"
              >
                <div className="mb-4 inline-flex w-fit items-center rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-emerald-300">{step.number}</div>
                <h2 className="mt-4 max-w-lg text-3xl font-bold leading-[1.02] tracking-[-0.065em] text-[#f5f6fa] md:text-5xl lg:text-6xl">{step.title}</h2>
                <p className="mt-4 max-w-md text-sm leading-7 text-white/65">{step.description}</p>
                <ul className="mt-6 grid gap-3 text-[13px] text-white/80">
                  {step.bullets.map((bullet) => <li className="flex items-center gap-2.5" key={bullet}><CheckCircle2 size={15} className="shrink-0 text-emerald-300" />{bullet}</li>)}
                </ul>
              </div>
            );
          })}
        </div>

        {/* The window starts wide and low, then GSAP moves it into the right column. */}
        <div ref={mediaRef} className="absolute bottom-[-20%] left-[10%] z-10 h-[70vh] w-[80%] overflow-hidden rounded-2xl border border-white/10 bg-gray-900 shadow-[0_30px_100px_rgba(0,0,0,0.6),0_12px_80px_rgba(16,185,129,0.11),0_0_48px_rgba(99,102,241,0.12)] max-lg:relative max-lg:order-1 max-lg:inset-auto max-lg:h-[56vw] max-lg:min-h-[260px] max-lg:w-full max-lg:rounded-2xl motion-reduce:relative motion-reduce:order-1 motion-reduce:inset-auto motion-reduce:h-[56vw] motion-reduce:min-h-[260px] motion-reduce:w-full">
          <div className="flex h-full flex-col overflow-hidden rounded-[inherit] p-3 sm:p-4">
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
            <div id="sync-cut-demo-video" className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-white/10 bg-black">
              <iframe
                className="pointer-events-none h-full w-full border-0 object-cover"
                src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&controls=0&playsinline=1&loop=1&playlist=${videoId}&rel=0&modestbranding=1`}
                title="SyncCut product demo"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
