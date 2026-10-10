'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, MessageSquareText, Play } from 'lucide-react';

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
  const storyRef = useRef<HTMLElement>(null);
  const playerFrameRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [playerVisible, setPlayerVisible] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => setReduceMotion(motionQuery.matches);
    updateMotionPreference();
    motionQuery.addEventListener('change', updateMotionPreference);
    return () => motionQuery.removeEventListener('change', updateMotionPreference);
  }, []);

  useEffect(() => {
    const story = storyRef.current;
    const playerFrame = playerFrameRef.current;
    if (!story || !playerFrame) return;

    const playerObserver = new IntersectionObserver(([entry]) => {
      setPlayerVisible(entry.isIntersecting && entry.intersectionRatio > 0.15);
    }, { threshold: [0, 0.15, 0.5] });
    playerObserver.observe(playerFrame);

    const updateActiveStep = () => {
      const center = window.innerHeight / 2;
      const cards = Array.from(story.querySelectorAll<HTMLElement>('[data-story-step]'));
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;
      cards.forEach((card, index) => {
        const bounds = card.getBoundingClientRect();
        const distance = Math.abs(bounds.top + bounds.height / 2 - center);
        if (distance < closestDistance) { closestIndex = index; closestDistance = distance; }
      });
      setActiveStep(closestIndex);
    };
    window.addEventListener('scroll', updateActiveStep, { passive: true });
    window.addEventListener('resize', updateActiveStep);
    updateActiveStep();

    return () => {
      playerObserver.disconnect();
      window.removeEventListener('scroll', updateActiveStep);
      window.removeEventListener('resize', updateActiveStep);
    };
  }, []);

  const currentStep = steps[activeStep] ?? steps[0];

  return (
    <section ref={storyRef} className="scroll-story" aria-label="See how SyncCut works">
      <div className="scroll-story-copy">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <article className={`scroll-story-card ${activeStep === index ? 'is-active' : ''}`} data-story-step key={step.number}>
              <div className="feature-progress"><b>{step.number}</b><span /><span className={index > 0 ? 'progress-done' : ''} /><span className={index > 1 ? 'progress-done' : ''} /></div>
              <div className="feature-eyebrow"><Icon size={15} /> {step.eyebrow}</div>
              <h2>{step.title}</h2>
              <p>{step.description}</p>
              <ul>{step.bullets.map((bullet) => <li key={bullet}><CheckCircle2 size={16} /> {bullet}</li>)}</ul>
            </article>
          );
        })}
      </div>

      <div className="scroll-story-stage">
        <div className="scroll-story-player-wrap">
          <div className="visual-window">
            <div className="visual-topbar"><div className="window-dots"><i /><i /><i /></div><span>SYNC CUT <b>/</b> {currentStep.number} — {currentStep.eyebrow.toUpperCase()}</span><span className="visual-live"><i /> {reduceMotion ? 'PLAY' : 'SCROLL'}</span></div>
            <div ref={playerFrameRef} className="scroll-story-player">
              {playerVisible ? (
                <iframe
                  key={reduceMotion ? 'manual' : 'scroll-play'}
                  src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=${reduceMotion ? 0 : 1}&mute=${reduceMotion ? 0 : 1}&controls=${reduceMotion ? 1 : 0}&playsinline=1&loop=1&playlist=${videoId}&rel=0&modestbranding=1`}
                  title="SyncCut landing page video"
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              ) : (
                <div className="scroll-story-loading"><span className="project-pulse" /> Scroll to play the video</div>
              )}
              <div className="scroll-story-step-indicator" aria-live="polite"><span>{currentStep.number}</span><i /><span>03</span></div>
            </div>
            <div className="visual-footer"><span><i /> VIDEO IN MOTION</span><span>{currentStep.number} <b>/</b> 03</span></div>
          </div>
          <div className="visual-halo" />
        </div>
      </div>
    </section>
  );
}
