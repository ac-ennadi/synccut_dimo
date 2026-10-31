'use client';

import Link from 'next/link';
import { ArrowRight, Check, Clapperboard, MessageSquare, Play, Sparkles } from 'lucide-react';

export function LandingHero() {
  return (
    <section className="duo-hero relative overflow-hidden px-4 pb-20 pt-12 sm:px-6 sm:pb-24 sm:pt-16 lg:px-8">
      <div className="duo-hero-inner mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
        <div className="relative z-10 max-w-2xl">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/80 px-3.5 py-1.5 text-xs font-medium text-neutral-600 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            A shared review room for every cut
          </div>
          <h1 className="max-w-xl text-5xl font-semibold leading-[1.02] tracking-[-0.055em] text-neutral-950 sm:text-6xl lg:text-[4.5rem]">
            The cut.
            <br />
            The context.
            <br />
            <span className="text-neutral-400">In sync.</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-neutral-600 sm:text-lg sm:leading-8">
            Keep the video, approved script, and frame-accurate feedback together. Clients see what matters. Editors always know what to do next.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/client/login" className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#0071e3] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0077ed] active:scale-[.98]">
              Open client portal <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link href="/editor/login" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white px-6 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50">
              <Clapperboard className="h-4 w-4" /> Editor sign in
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs text-neutral-500 sm:text-sm">
            <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-600" /> No client account needed</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-600" /> Notes pinned to the frame</span>
          </div>
        </div>

        <div className="duo-stage relative mx-auto w-full max-w-2xl" aria-label="SyncCut keeps a video review and its creative notes side by side">
          <div className="duo-device rounded-[2rem] border border-white/90 bg-white p-2 shadow-[0_32px_100px_-38px_rgba(22,32,48,.35)] sm:rounded-[2.4rem] sm:p-3">
            <div className="duo-topline flex items-center justify-between px-3 py-2.5 sm:px-4">
              <span className="flex items-center gap-2 text-xs font-semibold text-neutral-700"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Nike · Summer campaign</span>
              <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-medium text-neutral-500">Cut V3 · In review</span>
            </div>
            <div className="duo-panels grid gap-2 sm:grid-cols-[1.32fr_.68fr] sm:gap-2.5">
              <div className="duo-video relative flex min-h-[240px] flex-col justify-between overflow-hidden rounded-[1.45rem] p-4 text-white sm:min-h-[350px] sm:p-5">
                <div className="duo-video-art" aria-hidden="true" />
                <div className="relative z-10 flex items-start justify-between">
                  <span className="rounded-full border border-white/20 bg-black/25 px-2.5 py-1 text-[10px] text-white/80 backdrop-blur">00:24 / 01:12</span>
                  <Sparkles className="h-4 w-4 text-white/80" />
                </div>
                <div className="relative z-10 flex items-center justify-center">
                  <span className="grid h-14 w-14 place-items-center rounded-full border border-white/35 bg-white/20 shadow-lg backdrop-blur-md"><Play className="ml-0.5 h-5 w-5 fill-white" /></span>
                </div>
                <div className="relative z-10">
                  <div className="mb-3 h-1 overflow-hidden rounded-full bg-white/25"><div className="h-full w-[38%] rounded-full bg-white" /></div>
                  <div className="flex items-center justify-between text-[10px] text-white/75"><span>Summer campaign · Color pass</span><span>4K · 24 fps</span></div>
                </div>
              </div>
              <div className="duo-notes rounded-[1.45rem] bg-[#f5f5f7] p-4 sm:p-4">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                  <div><p className="text-[10px] font-medium uppercase tracking-[.12em] text-neutral-500">Creative notes</p><p className="mt-1 text-xs font-semibold text-neutral-800">Script & feedback</p></div>
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-[#0071e3] shadow-sm"><MessageSquare className="h-4 w-4" /></span>
                </div>
                <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
                  <div className="flex items-center justify-between"><span className="text-[10px] font-semibold text-neutral-500">SCENE 02</span><span className="text-[10px] font-mono text-[#0071e3]">00:24</span></div>
                  <p className="mt-2 text-xs font-medium leading-5 text-neutral-800">“Every stride, every second, every heartbeat.”</p>
                  <p className="mt-2 border-l-2 border-[#0071e3] pl-2 text-[11px] leading-4 text-neutral-500">Hold the runner shot one second longer before the beat drop.</p>
                  <div className="mt-3 flex items-center gap-2 text-[10px] text-neutral-500"><span className="grid h-5 w-5 place-items-center rounded-full bg-neutral-100 font-semibold text-neutral-600">SJ</span> Sarah · Client</div>
                </div>
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-[10px] text-neutral-500"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Script approved <span className="ml-auto text-neutral-400">V3</span></div>
              </div>
            </div>
            <div className="flex items-center justify-between px-3 py-3 sm:px-4">
              <span className="text-[10px] text-neutral-500">One link. One current cut. Everyone aligned.</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700"><Check className="h-3.5 w-3.5" /> Ready for review</span>
            </div>
          </div>
          <div className="duo-hinge" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
