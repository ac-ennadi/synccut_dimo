import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

export function LandingHero() {
  return (
    <section className="landing-hero bg-white px-5 pb-24 pt-20 text-center sm:px-8 sm:pb-28 sm:pt-24">
      <ScrollReveal className="mx-auto max-w-4xl">
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#0066cc]">
          SyncCut for video teams
        </p>
        <h1 className="mx-auto max-w-4xl text-[2.75rem] font-semibold leading-[1.04] tracking-[-0.045em] text-[#1d1d1f] sm:text-6xl lg:text-[4.75rem]">
          Video review, in context.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 tracking-[-0.01em] text-[#707070] sm:text-lg sm:leading-8">
          Keep the cut, approved script, and frame-specific feedback together in one project workspace.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/client/login" className="apple-primary inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#0071e3] px-5 text-sm font-medium text-white transition hover:bg-[#0066cc]">
            Open client portal <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/editor/login" className="inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-medium text-[#0066cc] transition hover:underline">
            Editor sign in
          </Link>
        </div>
        <div className="mx-auto mt-16 flex max-w-xl flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-[#d6d6d6] pt-5 text-sm text-[#707070]">
          <span>Video cut</span><span aria-hidden="true">·</span>
          <span>Approved script</span><span aria-hidden="true">·</span>
          <span>Timecoded feedback</span>
        </div>
      </ScrollReveal>
    </section>
  );
}
