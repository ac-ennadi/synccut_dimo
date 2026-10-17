'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Clapperboard, Sparkles, CheckCircle, Shield } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';

export function StatsAndCTASection() {
  const stats = [
    { value: '70%', label: 'Faster revision cycles', detail: 'Less time decoding feedback' },
    { value: '0', label: 'Missing timecodes', detail: 'Frame-stamped with one click' },
    { value: '100%', label: 'Script context retention', detail: 'Brief always beside the cut' },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Stats Counter Bar */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 sm:p-8 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-neutral-800">
            {stats.map((stat, idx) => (
              <div key={stat.label} className={idx > 0 ? 'pt-6 md:pt-0 md:pl-6' : ''}>
                <div className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm font-semibold text-white">
                  {stat.label}
                </div>
                <div className="text-xs text-neutral-500 mt-0.5">
                  {stat.detail}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Editor Spotlight Callout (#for-editors) */}
      <section id="for-editors" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-neutral-900/80 to-neutral-950 p-8 sm:p-12 shadow-2xl backdrop-blur-md">
          {/* Subtle glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl"
          />

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-950/80 border border-indigo-800/60 px-3 py-1 text-xs font-semibold text-indigo-300">
                <Clapperboard className="h-3.5 w-3.5 text-indigo-400" />
                <span>Made for Video Editors & Post Houses</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                One page for them.
                <br />
                <span className="text-indigo-400">Fewer revisions for you.</span>
              </h2>
              <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
                Stop wrestling with endless revision spreadsheets, timestamp confusion, and missing assets.
                Set up a project in under 60 seconds and give your clients a review experience they will love.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <Link
                href="/editor/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 active:scale-98"
              >
                <Clapperboard className="h-4 w-4" />
                <span>Open Editor Cockpit</span>
              </Link>
              <Link
                href="/client/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-900/80 px-6 py-3.5 text-sm font-semibold text-neutral-300 transition hover:bg-neutral-800 hover:text-white"
              >
                <span>Client Portal Demo</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final Action CTA Banner */}
      <section className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3.5 py-1 text-xs font-semibold text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Ready for effortless reviews?</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl leading-tight">
            Start delivering video projects with complete clarity.
          </h2>
          <p className="mx-auto max-w-xl text-neutral-400 text-sm sm:text-base">
            No software installation required. Works directly in any modern desktop, tablet, or mobile browser.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/client/login"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-7 py-3.5 text-sm font-bold text-neutral-950 shadow-xl shadow-emerald-500/25 transition hover:brightness-110 active:scale-98"
            >
              <span>Get Started Now</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Clean Footer */}
      <footer className="border-t border-neutral-800/80 bg-neutral-950 py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <Link href="/" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg">
              <BrandLogo variant="dark" className="h-6 w-auto" />
            </Link>
            <span className="hidden sm:inline text-neutral-700" aria-hidden="true">•</span>
            <span className="text-xs text-neutral-400">
              A clearer way to bring every cut across the finish line.
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs font-medium text-neutral-400">
            <Link href="/client/login" className="transition hover:text-white">
              Client Portal
            </Link>
            <Link href="/editor/login" className="transition hover:text-white">
              Editor Cockpit
            </Link>
            <span className="text-neutral-700" aria-hidden="true">•</span>
            <span className="text-neutral-500 font-mono text-[11px]">
              © {new Date().getFullYear()} SyncCut
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
