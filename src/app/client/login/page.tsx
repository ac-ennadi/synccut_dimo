'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, LockKeyhole, RefreshCw, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ClientLoginPage() {
  const router = useRouter();
  const { currentUser, isLoading: isRestoring, signIn, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isTakingLonger, setIsTakingLonger] = useState(false);

  useEffect(() => {
    if (!isRestoring && !isSubmitting && !isNavigating) return;
    const timeout = window.setTimeout(() => setIsTakingLonger(true), 9000);
    return () => window.clearTimeout(timeout);
  }, [isRestoring, isSubmitting, isNavigating]);

  useEffect(() => {
    // Only redirect once the stored session has been resolved, otherwise a valid
    // client is bounced back here while their membership is still loading.
    if (isRestoring || !currentUser) return;
    if (currentUser.role === 'Client') {
      queueMicrotask(() => setIsNavigating(true));
      router.replace('/client');
      return;
    }
    logout();
    queueMicrotask(() => setError('This is an editor account. Use the editor sign-in page.'));
  }, [currentUser, isRestoring, logout, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting || isNavigating) return;
    setIsSubmitting(true);
    setError(null);
    const result = await signIn(email, password, 'Client');
    if (result.success) {
      // Keep loading overlay active and persistent until destination page mounts completely
      setIsNavigating(true);
      router.replace('/client');
    } else {
      setIsSubmitting(false);
      setError(result.error || 'Could not sign in. Check your email and password.');
    }
  };

  const showLoading = isRestoring || isSubmitting || isNavigating;

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-neutral-100 p-4 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      {showLoading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-neutral-950/90 text-white backdrop-blur-md" role="status" aria-live="polite">
          <div className="flex flex-col items-center gap-4 text-center px-4">
            <div className="relative flex h-14 w-14 items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20" />
              <div className="h-14 w-14 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
              <LockKeyhole className="h-6 w-6 text-emerald-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                {isRestoring ? 'Checking session' : 'Opening client portal'}
              </h3>
              <p className="text-xs text-neutral-400">
                {isRestoring ? 'Restoring your authenticated session…' : 'Verifying credentials and loading your projects…'}
              </p>
            </div>
            {isTakingLonger && (
              <div className="mt-4 max-w-sm rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4 text-left">
                <p className="text-sm font-semibold text-amber-200">Still connecting</p>
                <p className="mt-1 text-xs leading-5 text-neutral-400">The Supabase project is taking longer than expected.</p>
                <button type="button" onClick={() => window.location.reload()} className="mt-3 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500">
                  Retry connection
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="w-full max-w-md space-y-6">
        <header className="space-y-2 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
            <LockKeyhole />
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Private client access</div>
          <h1 className="text-2xl font-black">Client review portal</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Use the email and password given to you by your editor.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 shadow-sm">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold" htmlFor="client-email">Email</label>
            <input
              id="client-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="username"
              autoFocus
              disabled={isSubmitting || isNavigating}
              className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold" htmlFor="client-password">Password</label>
            <input
              id="client-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
              disabled={isSubmitting || isNavigating}
              className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-3 text-sm text-neutral-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
            />
          </div>

          {error && (
            <p role="alert" className="flex gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
              <AlertCircle size={17} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isNavigating}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white transition-colors hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting || isNavigating ? (
              <>
                <RefreshCw size={17} className="animate-spin" /> Signing in…
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
          <Shield size={14} />
          <span>Editor or agency team member?</span>
          <Link href="/editor/login" className="font-semibold text-emerald-600 hover:underline dark:text-emerald-400">
            Editor sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
