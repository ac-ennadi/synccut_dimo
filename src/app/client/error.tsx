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
    <main className="flex min-h-screen items-center justify-center bg-neutral-100 p-6 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <section className="w-full max-w-md space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
          !
        </div>
        <div className="space-y-1">
          <h1 className="text-lg font-bold">The client portal could not load</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Your project data could not be opened. Try again, or sign in again if your session expired.
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            Try again
          </button>
          <a
            href="/client/login"
            className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-semibold dark:border-neutral-700"
          >
            Sign in again
          </a>
        </div>
      </section>
    </main>
  );
}
