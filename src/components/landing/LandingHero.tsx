'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Clapperboard, Sparkles, ShieldCheck, Zap } from 'lucide-react';

export function LandingHero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24">
      {/* Background ambient lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-indigo-500/15 blur-[120px] rounded-full"
      />

      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        {/* Kicker badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3.5 py-1 text-xs font-semibold text-emerald-400 backdrop-blur-sm shadow-xs mb-6">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="tracking-wide uppercase font-mono text-[11px]">Video Collaboration Reimagined</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl lg:text-7xl leading-[1.08] sm:leading-[1.05]">
          Clients review it.
          <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
            Editors cut it. Projects ship.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-base text-neutral-400 sm:text-lg md:text-xl leading-relaxed">
          Replace messy email threads and confusing timestamps with one shared, real-time workspace.
          Script context, frame-accurate feedback, and stage tracking in a single view.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/client/login"
            className="group inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3.5 text-sm font-bold text-neutral-950 shadow-lg shadow-emerald-500/25 transition-all hover:brightness-110 active:scale-98 sm:w-auto"
          >
            <span>Open Client Portal</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/editor/login"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-900/90 px-6 py-3.5 text-sm font-semibold text-neutral-200 shadow-sm backdrop-blur-sm transition-all hover:bg-neutral-800 hover:text-white sm:w-auto"
          >
            <Clapperboard className="h-4 w-4 text-indigo-400" />
            <span>Editor Cockpit</span>
          </Link>
        </div>

        {/* Trust Badges Bar */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-neutral-400 sm:text-sm">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Zero client sign-up friction</span>
          </div>
          <span className="hidden sm:inline text-neutral-700" aria-hidden="true">•</span>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Frame-accurate timestamps</span>
          </div>
          <span className="hidden sm:inline text-neutral-700" aria-hidden="true">•</span>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Real-time stage pipeline</span>
          </div>
          <span className="hidden sm:inline text-neutral-700" aria-hidden="true">•</span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Secure signed playback</span>
          </div>
        </div>
      </div>
    </section>
  );
}
