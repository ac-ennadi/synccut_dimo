import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { ScrollReveal } from './ScrollReveal';

export function EditorCTASection() {
  return (
    <>
      <section id="for-editors" className="bg-[#f5f5f7] px-5 py-16 sm:px-8 sm:py-20">
        <ScrollReveal className="mx-auto flex max-w-6xl flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#707070]">For editors</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.035em] text-[#1d1d1f] sm:text-4xl">
              Keep each review with its cut.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-[#707070] sm:text-base">
              Publish versions, update the project stage, and review client notes from the editor workspace.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link href="/editor/login" className="apple-primary inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#0071e3] px-5 text-sm font-medium text-white transition hover:bg-[#0066cc]">
              Editor sign in <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/client/login" className="text-sm font-medium text-[#0066cc] hover:underline">
              Client portal
            </Link>
          </div>
        </ScrollReveal>
      </section>

      <footer className="bg-white px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-[#d6d6d6] pt-6 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-4">
            <Link href="/" aria-label="SyncCut home">
              <BrandLogo variant="light" className="h-6 w-auto" />
            </Link>
            <span className="text-xs text-[#707070]">Video reviews, in context.</span>
          </div>
          <span className="text-xs text-[#86868b]">© {new Date().getFullYear()} SyncCut</span>
        </div>
      </footer>
    </>
  );
}
