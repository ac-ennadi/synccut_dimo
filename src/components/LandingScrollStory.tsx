'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, ArrowRight, Check, CheckCircle2, MessageSquareText, Play, ShieldCheck, UserCheck } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const videoId = 'nVmXsBNfwHY';

const steps = [
  {
    number: '01',
    eyebrow: 'One cut. One place.',
    title: 'Watch the latest cut.',
    description: 'Clients open the latest cut and its related notes in one secure workspace.',
    bullets: ['One home for every version', 'Private client access'],
    icon: Play,
  },
  {
    number: '02',
    eyebrow: 'Feedback stays with the cut.',
    title: 'Feedback that makes sense.',
    description: 'Clients leave notes as they watch. Every comment stays connected to its moment, so your next edit starts with clear direction.',
    bullets: ['Timecoded client notes', 'A shared conversation'],
    icon: MessageSquareText,
  },
  {
    number: '03',
    eyebrow: 'Keep the project moving.',
    title: 'Review, revise, approve.',
    description: 'Track revisions and approval in one place. Your team and client can see where the project stands and what happens next.',
    bullets: ['Version history in one place', 'Clear approval status'],
    icon: CheckCircle2,
  },
];

export function LandingScrollStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const heroCopyRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLElement | null)[]>([]);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useGSAP(() => {
    const section = sectionRef.current;
    const mediaWindow = windowRef.current;
    const copy = copyRef.current;
    const heroCopy = heroCopyRef.current;
    if (!section || !mediaWindow || !copy || !heroCopy) return;

    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const cards = stepRefs.current.filter(Boolean) as HTMLElement[];
      const tabs = tabRefs.current.filter(Boolean) as HTMLButtonElement[];
      let currentStepIndex = -1;
      const setStep = (index: number) => {
        if (index === currentStepIndex) return;
        currentStepIndex = index;
        cards.forEach((card, i) => {
          card.classList.toggle('is-active', i === index);
          card.setAttribute('aria-hidden', String(i !== index));
        });
        tabs.forEach((tab, i) => {
          tab.classList.toggle('is-active', i === index);
          tab.setAttribute('aria-selected', String(i === index));
        });
        section.dataset.activeStep = String(index + 1);
      };
      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=300%',
          scrub: 0.8,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      setStep(0);
      gsap.set(mediaWindow, { width: 'min(92vw, 1440px)', xPercent: -50, yPercent: -50, x: 0, scale: 1.08, left: '50%', right: 'auto', top: '110%' });
      gsap.set(copy, { opacity: 0, x: -34 });
      gsap.set(heroCopy, { autoAlpha: 1, y: 0 });
      gsap.set(cards, { autoAlpha: 0, y: 24 });
      gsap.set(cards[0], { autoAlpha: 1, y: 0 });
      gsap.set('.story-tab-progress', { xPercent: 0 });

      // Open on a broad, centered video, then settle into the right-hand review window.
      timeline.to(mediaWindow, { width: 'min(62vw, 980px)', xPercent: 0, left: 'auto', right: '2.2vw', top: '50%', scale: 1, duration: 0.24 }, 0);
      timeline.to(heroCopy, { autoAlpha: 0, y: -28, duration: 0.12 }, 0.06);
      timeline.to(copy, { autoAlpha: 1, x: 0, duration: 0.2 }, 0.12);

      // The copy and tab state share these exact timeline boundaries.
      timeline.addLabel('step-2', 0.5);
      timeline.to(cards[0], { autoAlpha: 0, y: -20, duration: 0.08 }, 'step-2');
      timeline.to(cards[1], { autoAlpha: 1, y: 0, duration: 0.08 }, 'step-2+=0.04');
      timeline.to(mediaWindow, { right: 'auto', left: '2.2vw', width: '62vw', duration: 0.16 }, 'step-2');
      timeline.to('.story-tab-progress', { xPercent: 100, x: 10, duration: 0.16 }, 'step-2');
      timeline.add(() => setStep(1), 'step-2+=0.08');

      timeline.addLabel('step-3', 0.75);
      timeline.to(cards[1], { autoAlpha: 0, y: -20, duration: 0.08 }, 'step-3');
      timeline.to(cards[2], { autoAlpha: 1, y: 0, duration: 0.08 }, 'step-3+=0.04');
      timeline.to(mediaWindow, { left: 'auto', right: '2.2vw', width: '62vw', duration: 0.16 }, 'step-3');
      timeline.to('.story-tab-progress', { xPercent: 200, x: 20, duration: 0.16 }, 'step-3');
      timeline.add(() => setStep(2), 'step-3+=0.08');

      // Drive active tabs from scroll progress so state stays synchronized while scrubbing backwards.
      timeline.eventCallback('onUpdate', () => {
        const p = timeline.progress();
        setStep(p < 0.5 ? 0 : p < 0.75 ? 1 : 2);
      });

      return () => timeline.scrollTrigger?.kill();
    });

    mm.add('(max-width: 1023px), (prefers-reduced-motion: reduce)', () => {
      const cards = stepRefs.current.filter(Boolean) as HTMLElement[];
      const tabs = tabRefs.current.filter(Boolean) as HTMLButtonElement[];
      cards.forEach((card) => card.setAttribute('aria-hidden', 'false'));
      const triggers = cards.map((card, index) => ScrollTrigger.create({
        trigger: card,
        start: 'top center',
        end: 'bottom center',
        onToggle: ({ isActive }) => {
          if (!isActive) return;
          tabs.forEach((tab, i) => {
            tab.classList.toggle('is-active', i === index);
            tab.setAttribute('aria-selected', String(i === index));
          });
        },
      }));
      return () => triggers.forEach((trigger) => trigger.kill());
    });

    return () => mm.revert();
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} id="how-it-works" className="scroll-story" aria-label="See how SyncCut works">
      <div className="story-hero-copy" id="home" ref={heroCopyRef}>
        <div className="hero-kicker"><span className="kicker-dot" /> Video feedback, all in one place</div>
        <h1>Your team points at it.<br /><span>Your agent ships it.</span></h1>
        <p>Watch the latest cut, share feedback, and keep every revision in one place.</p>
        <div className="hero-actions">
          <Link className="button-primary" href="/client/login"><UserCheck size={17} /> Log in as client <ArrowRight size={17} /></Link>
          <a className="button-secondary" href="https://youtu.be/nVmXsBNfwHY" target="_blank" rel="noreferrer"><span className="button-play"><Play size={13} fill="currentColor" /></span> View the demo</a>
        </div>
        <div className="hero-trust"><span><ShieldCheck size={16} /> Private client review</span><i /><span><Check size={15} /> Every note stays in context</span></div>
        <div className="story-scroll-cue" aria-hidden="true"><span>SCROLL TO EXPLORE</span><ArrowDown size={14} /></div>
      </div>
      <div className="scroll-story-copy" ref={copyRef}>
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <article ref={(node) => { stepRefs.current[index] = node; }} className={`scroll-story-card story-step-${index + 1}${index === 0 ? ' is-active' : ''}`} key={step.number} aria-hidden={index !== 0}>
              <div className="feature-progress"><b>{step.number}</b><span className="progress-segment" /><span className={`progress-segment${index > 0 ? ' progress-done' : ''}`} /><span className={`progress-segment${index > 1 ? ' progress-done' : ''}`} /></div>
              <div className="feature-eyebrow"><Icon size={15} /> {step.eyebrow}</div>
              <h2>{step.title}</h2>
              <p>{step.description}</p>
              <ul>{step.bullets.map((bullet) => <li key={bullet}><CheckCircle2 size={16} /> {bullet}</li>)}</ul>
            </article>
          );
        })}
      </div>

      <div className="scroll-story-stage">
        <div className="scroll-story-player-wrap" ref={windowRef}>
          <div className="visual-window">
            <div className="visual-topbar">
              <div className="story-tabs" role="tablist" aria-label="Demo steps">
                {steps.map((step, index) => <button ref={(node) => { tabRefs.current[index] = node; }} key={step.number} className={`story-tab${index === 0 ? ' is-active' : ''}`} role="tab" aria-selected={index === 0} aria-controls="story-video"><span>{step.number}</span>{index === 0 ? step.eyebrow : `Step ${step.number}`}</button>)}
                <span className="story-tab-progress" />
              </div>
              <a className="visual-demo-link" href={`https://youtu.be/${videoId}`} target="_blank" rel="noreferrer"><span className="demo-play"><Play size={11} fill="currentColor" /></span> View full demo</a>
            </div>
            <div className="scroll-story-player" id="story-video">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&controls=1&playsinline=1&loop=1&playlist=${videoId}&rel=0&modestbranding=1`}
                title="SyncCut product demo"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
            <div className="visual-footer"><span><i /> VIDEO IN MOTION</span><span>SYNC CUT <b>/</b> PRODUCT DEMO</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}
