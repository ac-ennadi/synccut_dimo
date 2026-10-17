'use client';

import React from 'react';
import { X, Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function ComparisonSection() {
  const painPoints = [
    'Vague feedback like "Fix that shot in the middle somewhere"',
    'Expired Dropbox/Drive links scattered across 30-message email chains',
    'Clients giving notes that directly contradict the approved script',
    'Constant "What\'s the status of the cut?" check-in messages',
    'Clients forgetting which video link is the latest version',
  ];

  const benefits = [
    'Every note is stamped to the exact second (e.g. 01:24) with one click',
    'One permanent, secure project link with always-up-to-date video cuts',
    'The approved script & voiceovers sit right next to the video player',
    'Real-time stage pipeline (Script → Shoot → Edit → Final Review)',
    'The latest cut is always front-and-center with one-click sign-off',
  ];

  return (
    <section id="comparison" className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center space-y-3">
        <span className="text-xs font-mono font-semibold uppercase tracking-widest text-emerald-400">
          The Difference
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
          Say goodbye to email review chaos
        </h2>
        <p className="text-neutral-400 text-base sm:text-lg">
          See why top editors and production companies switch to SyncCut.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
        {/* The Old Way */}
        <div className="rounded-2xl border border-rose-900/40 bg-neutral-900/40 p-6 sm:p-8 backdrop-blur-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-950/60 border border-rose-800/50 px-3 py-1 text-xs font-semibold text-rose-400">
              <X className="h-3.5 w-3.5" />
              <span>The Old Way (Email, Drives & PDFs)</span>
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">
              Confusion, delays & revision loops
            </h3>
            <p className="text-sm text-neutral-400">
              Juggling attachments, messy timecodes, and missing assets burns hours and frustrates clients.
            </p>

            <ul className="space-y-3.5 pt-2 text-sm text-neutral-300">
              {painPoints.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-950/80 text-rose-400 border border-rose-900">
                    <X className="h-3 w-3" />
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t border-neutral-800 text-xs text-rose-400/80 font-mono">
            Result: Average 5+ revision cycles and wasted production days.
          </div>
        </div>

        {/* The SyncCut Way */}
        <div className="relative rounded-2xl border border-emerald-500/40 bg-gradient-to-b from-emerald-950/30 to-neutral-900/80 p-6 sm:p-8 shadow-xl shadow-emerald-950/20 backdrop-blur-sm space-y-6 flex flex-col justify-between ring-1 ring-emerald-500/20">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-950/80 border border-emerald-800/60 px-3 py-1 text-xs font-semibold text-emerald-400">
              <Check className="h-3.5 w-3.5" />
              <span>The SyncCut Way (One Unified Portal)</span>
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">
              Clarity, instant context & fast approvals
            </h3>
            <p className="text-sm text-neutral-300">
              One shared screen where script, cut, timecodes, and client sign-off work in perfect harmony.
            </p>

            <ul className="space-y-3.5 pt-2 text-sm text-neutral-200">
              {benefits.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    <Check className="h-3 w-3" />
                  </span>
                  <span className="font-medium">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t border-emerald-900/40 flex items-center justify-between">
            <span className="text-xs text-emerald-400 font-mono font-semibold">
              Result: 70% faster turnarounds & delighted clients.
            </span>
            <Link
              href="/client/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition"
            >
              <span>Try it out</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
