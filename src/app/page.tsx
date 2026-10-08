'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Clapperboard,
  LockKeyhole,
  Shield,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

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
      <main className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-950">
        <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-4xl">
        <section className="overflow-hidden rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
            <div className="p-7 sm:p-10 lg:p-14">
              <div className="flex items-center gap-2 text-sm font-bold text-neutral-500 dark:text-neutral-400">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
                  <Clapperboard className="h-5 w-5" />
                </span>
                SyncCut
              </div>

              <div className="mt-12 max-w-xl">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                  Your project, in one place
                </p>
                <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                  Review your video with confidence.
                </h1>
                <p className="mt-5 text-sm leading-6 text-neutral-500 dark:text-neutral-400 sm:text-base">
                  Sign in to watch the latest cut, leave timecoded feedback, and
                  approve your production from one simple client workspace.
                </p>

                <Link
                  href="/client/login"
                  className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500 sm:w-auto"
                >
                  <UserCheck className="h-4 w-4" />
                  Log in as client
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">
                  New to SyncCut?{' '}
                  <Link href="/signup" className="font-bold text-emerald-600 hover:underline">
                    Create a client account
                  </Link>
                </p>
              </div>

              <div className="mt-12 grid gap-3 border-t border-neutral-200 pt-6 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400 sm:grid-cols-3">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Review cuts
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Add feedback
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Approve delivery
                </span>
              </div>
            </div>

            <aside className="flex flex-col justify-between bg-neutral-950 p-7 text-white sm:p-10">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
                  <Shield className="h-5 w-5" />
                </div>
                <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">
                  Studio access
                </p>
                <h2 className="mt-3 text-2xl font-bold">Are you an editor?</h2>
                <p className="mt-3 text-sm leading-6 text-neutral-400">
                  Open the private cockpit to publish cuts, update stages, and
                  manage client requests.
                </p>
              </div>

              <div className="mt-10">
                <Link
                  href="/editor/login"
                  className="inline-flex items-center gap-2 text-sm font-bold text-indigo-300 transition hover:text-white"
                >
                  Editor login
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <div className="mt-8 flex items-center gap-2 text-[11px] text-neutral-500">
                  <LockKeyhole className="h-3.5 w-3.5" />
                  Supabase-secured access
                </div>
              </div>
            </aside>
          </div>
        </section>

        <p className="mt-5 text-center text-xs text-neutral-400">
          Secure video review for modern production teams.
        </p>
      </div>
    </main>
  );
}
