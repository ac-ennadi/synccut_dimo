'use client';

import { useEffect } from 'react';

export default function ClientError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Client portal failed to render.', error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 p-6 text-neutral-100">
      <section className="w-full max-w-md space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900/90 p-6 text-center shadow-xl backdrop-blur-md">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-950/60 border border-rose-800/40 text-rose-400 font-bold">
          !
        </div>
        <div className="space-y-1">
          <h1 className="text-lg font-bold text-white">The client portal could not load</h1>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Your project data could not be opened. Try again, or sign in again if your session expired.
          </p>
          {error.message && (
            <p className="rounded-xl border border-neutral-800 bg-neutral-950 p-3 text-left font-mono text-xs text-neutral-400 break-words">
              Diagnostic: {error.message}
            </p>
          )}
        </div>
        <div className="flex justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 shadow-sm"
          >
            Try again
          </button>
          <a
            href="/client/login"
            className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-800"
          >
            Sign in again
          </a>
        </div>
      </section>
    </main>
  );
}
