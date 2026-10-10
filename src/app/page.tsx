'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowRight,
  Check,
  Clapperboard,
  MessageSquareText,
  Play,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { LandingScrollStory } from '@/components/LandingScrollStory';

export default function HomePage() {
  const router = useRouter();
  const { currentUser, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && currentUser) {
      router.push(currentUser.role === 'Editor' ? '/editor' : '/client');
    }
  }, [currentUser, isLoading, router]);

  if (isLoading) {
    return (
      <main className="landing-loading">
        <div className="landing-spinner" aria-label="Loading" />
      </main>
    );
  }

  return (
    <main className="landing-page">
      <header className="landing-header">
        <a className="landing-brand" href="#home" aria-label="SyncCut home">
          <span className="brand-mark"><Clapperboard size={19} strokeWidth={2.2} /></span>
          <span>SyncCut</span>
        </a>
        <nav className="landing-nav" aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#for-editors">For editors</a>
          <span className="nav-divider" />
          <Link className="nav-login" href="/client/login">Sign in</Link>
          <Link className="nav-cta" href="/client/login">Open your workspace <ArrowRight size={15} /></Link>
        </nav>
      </header>

      <section className="hero-section" id="home">
        <div className="hero-glow hero-glow-left" />
        <div className="hero-glow hero-glow-right" />
        <div className="hero-copy">
          <div className="hero-kicker"><span className="kicker-dot" /> Video feedback, all in one place</div>
          <h1>Review the cut.<br /><span>Make the next one better.</span></h1>
          <p className="hero-description">
            Watch the latest cut, share feedback, and keep every revision in one place.
          </p>
          <div className="hero-actions">
            <Link className="button-primary" href="/client/login">
              <UserCheck size={17} /> Log in as client <ArrowRight size={17} />
            </Link>
            <a className="button-secondary" href="#how-it-works"><span className="button-play"><Play size={13} fill="currentColor" /></span> See how it works</a>
          </div>
          <div className="hero-trust">
            <span><ShieldCheck size={16} /> Private client review</span>
            <i />
            <span><Check size={15} /> Every note stays in context</span>
          </div>
        </div>

        <div className="hero-showcase" aria-label="Video preview placeholder">
          <div className="showcase-topbar">
            <div className="window-dots"><i /><i /><i /></div>
            <span className="showcase-project"><span className="project-pulse" /> PROJECT REVIEW <b>·</b> LATEST CUT</span>
            <span className="showcase-version">PREVIEW</span>
          </div>
          <div className="showcase-screen">
            
            <div className="screen-copy"><span>VIDEO REVIEW</span><strong>Your video<br />will appear here.</strong></div>
            
            
            
          </div>
          <div className="showcase-controls">
            <div className="control-user"><span><MessageSquareText size={14} /></span><b>Feedback</b></div>
            <div className="control-comment">Leave notes on specific moments in the cut.</div>
            <div className="control-tag">VIDEO NOTES</div>
          </div>
          
        </div>
        <a className="scroll-cue" href="#how-it-works"><span>SCROLL TO EXPLORE</span><ArrowDown size={14} /></a>
      </section>

      <section className="intro-strip" id="how-it-works">
        <span className="section-label">THE SYNC CUT FLOW</span>
        <p>From the first watch to the final approval, the whole conversation stays together.</p>
        <div className="step-indicators"><span>01</span><i /><span>02</span><i /><span>03</span></div>
      </section>

      <LandingScrollStory />

      <section className="editor-callout" id="for-editors">
        <div className="callout-icon"><Clapperboard size={20} /></div>
        <div><span className="section-label">MADE FOR THE WHOLE CREW</span><h2>One shared space.<br /><span>A smoother finish.</span></h2><p>Clients review. Editors take the lead. Everyone sees the next step.</p></div>
        <div className="callout-actions"><Link className="button-primary" href="/client/login">Get started <ArrowRight size={17} /></Link><Link className="editor-link" href="/editor/login">Editor sign in <ArrowRight size={15} /></Link></div>
      </section>

      <footer className="landing-footer">
        <a className="landing-brand" href="#home"><span className="brand-mark"><Clapperboard size={17} /></span><span>SyncCut</span></a>
        <span className="footer-note">A clearer way to bring every cut across the finish line.</span>
        <div className="footer-links"><Link href="/client/login">Client sign in</Link><Link href="/editor/login">Editor sign in</Link></div>
        <span className="footer-copy">© {new Date().getFullYear()} SyncCut</span>
      </footer>
    </main>
  );
}










