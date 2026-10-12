'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight,
  Clapperboard,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { LandingScrollStory } from '@/components/LandingScrollStory';
import { LandingMotion } from '@/components/LandingMotion';
import { BrandLogo } from '@/components/BrandLogo';

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
          <BrandLogo variant="dark" className="h-[26px] w-auto sm:h-[30px]" priority />
        </a>
        <nav className="landing-nav" aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#for-editors">For editors</a>
          <span className="nav-divider" />
          <Link className="nav-login" href="/client/login">Sign in</Link>
          <Link className="nav-cta" href="/client/login">Open your workspace <ArrowRight size={15} /></Link>
        </nav>
      </header>

      <LandingScrollStory />
      <LandingMotion />

      <section className="editor-callout landing-cta" id="for-editors">
        <div className="callout-icon"><Clapperboard size={20} /></div>
        <div><span className="section-label">MADE FOR EDITORS &amp; CREATIVE TEAMS</span><h2>One page for them.<br /><span>Fewer revisions for you.</span></h2><p>The cleanest way to bring video projects across the finish line without email chaos.</p></div>
        <div className="callout-actions"><Link className="button-primary" href="/client/login">Open your workspace <ArrowRight size={17} /></Link><Link className="editor-link" href="/editor/login">Editor sign in <ArrowRight size={15} /></Link></div>
      </section>

      <footer className="landing-footer">
        <a className="landing-brand" href="#home" aria-label="SyncCut home">
          <BrandLogo variant="dark" className="h-[22px] w-auto sm:h-[24px]" />
        </a>
        <span className="footer-note">SyncCut • A clearer way to bring every cut across the finish line.</span>
        <div className="footer-links"><Link href="/client/login">Client sign in</Link><Link href="/editor/login">Editor sign in</Link></div>
        <span className="footer-copy">© {new Date().getFullYear()} SyncCut</span>
      </footer>
    </main>
  );
}








