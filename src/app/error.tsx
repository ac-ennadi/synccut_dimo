'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 p-6 text-neutral-100">
      <section className="w-full max-w-md space-y-5 rounded-2xl border border-neutral-800 bg-neutral-900/90 p-6 text-center shadow-2xl backdrop-blur-md">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-950/60 border border-rose-800/50 text-rose-400 font-bold text-lg">
          !
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold tracking-tight text-white">Something went wrong</h1>
          <p className="text-sm text-neutral-400">
            We ran into an unexpected issue while loading this page. You can reload to retry or return to your dashboard.
          </p>
          {error?.message && (
            <p className="rounded-xl border border-neutral-800 bg-neutral-950 p-3 text-left font-mono text-xs text-neutral-400 break-words">
              {error.message}
            </p>
          )}
        </div>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 shadow-sm"
          >
            Try again
          </button>
          <Link
            href="/client"
            className="rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm font-semibold text-neutral-200 transition hover:bg-neutral-700"
          >
            Client portal
          </Link>
          <Link
            href="/editor"
            className="rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm font-semibold text-neutral-200 transition hover:bg-neutral-700"
          >
            Editor cockpit
          </Link>
        </div>
      </section>
    </main>
  );
}
