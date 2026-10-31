'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, Lock, Mail, RefreshCw, ArrowLeft, Clapperboard } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { BrandLogo } from '@/components/BrandLogo';

export default function EditorLoginPage() {
  const router = useRouter();
  const { currentUser, isLoading: isRestoring, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isTakingLonger, setIsTakingLonger] = useState(false);
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);

  useEffect(() => {
    if (!isRestoring && !isSubmitting && !isNavigating) return;
    const warningTimeout = window.setTimeout(() => setIsTakingLonger(true), 4000);
    const failTimeout = window.setTimeout(() => {
      setLoadingTimedOut(true);
      setIsSubmitting(false);
      setIsNavigating(false);
      setError('The connection timed out. Refresh the page and try again.');
    }, 15000);
    return () => {
      window.clearTimeout(warningTimeout);
      window.clearTimeout(failTimeout);
    };
  }, [isRestoring, isSubmitting, isNavigating]);

  useEffect(() => {
    if (isRestoring || currentUser?.role !== 'Editor') return;
    queueMicrotask(() => setIsNavigating(true));
    router.replace('/editor');
  }, [currentUser, isRestoring, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting || isNavigating) return;
    setIsSubmitting(true);
    setLoadingTimedOut(false);
    setIsTakingLonger(false);
    setError(null);
    const result = await signIn(email, password, 'Editor');
    if (result.success) {
      // Keep loading overlay active and persistent until destination page mounts completely
      setIsNavigating(true);
      router.replace('/editor');
    } else {
      setIsSubmitting(false);
      setError(result.error || 'Could not sign in. Check the editor email and password.');
    }
  };

  const showLoading = !loadingTimedOut && (isRestoring || isSubmitting || isNavigating);

  return (
    <main className="apple-shell auth-shell relative flex min-h-screen items-center justify-center bg-white p-4 text-neutral-100">

      {showLoading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-neutral-950/95 text-white backdrop-blur-xl" role="status" aria-live="polite">
          <div className="flex flex-col items-center gap-4 text-center px-4 max-w-sm">
            <Clapperboard className="h-5 w-5 text-[#0071e3]" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                {isRestoring ? 'Checking studio session' : 'Opening editor dashboard'}
              </h3>
              <p className="text-xs text-neutral-400">
                {isRestoring ? 'Restoring editor credentials…' : 'Preparing workspaces and project states…'}
              </p>
            </div>
            <div className="mt-2 h-1 w-full max-w-xs overflow-hidden rounded-full bg-[#e6e6e8]">
              <div className="h-full w-1/3 animate-[loading-bar_1.8s_ease-in-out_infinite] rounded-full bg-[#0071e3]" />
            </div>
            {isTakingLonger && (
              <div className="mt-4 w-full rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4 text-left">
                <p className="text-sm font-semibold text-amber-200">Still connecting</p>
                <p className="mt-1 text-xs leading-5 text-neutral-400">
                  Supabase is taking longer than expected. If this reaches 15 seconds, the loading screen will close.
                </p>
                <button type="button" onClick={() => window.location.reload()} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#0071e3] px-3 py-2 text-xs font-medium text-white hover:bg-[#0066cc]">
                  <RefreshCw size={13} /> Refresh page
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="w-full max-w-md space-y-6 z-10">
        <header className="space-y-3 text-center">
          <Link href="/" aria-label="SyncCut home" className="inline-flex justify-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
            <BrandLogo variant="light" className="h-8 w-auto sm:h-9" priority />
          </Link>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Editor workspace</p>
            <h1 className="text-2xl font-bold tracking-tight text-white">Editor Cockpit</h1>
            <p className="text-xs text-neutral-400">Sign in with your master editor credentials to manage project cuts.</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5 border-t border-neutral-200 pt-6">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300" htmlFor="editor-email">
              Editor Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-500" aria-hidden="true" />
              <input
                id="editor-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="username"
                autoFocus
                placeholder="editor@studio.com"
                disabled={isSubmitting || isNavigating}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 py-3 pl-10 pr-3.5 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300" htmlFor="editor-password">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-500" aria-hidden="true" />
              <input
                id="editor-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                disabled={isSubmitting || isNavigating}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 py-3 pl-10 pr-3.5 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="flex items-start gap-2.5 rounded-xl border border-rose-900/40 bg-rose-950/40 p-3 text-xs text-rose-300 leading-relaxed">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-400" />
              <span>{error}</span>
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isNavigating}
            className="apple-primary flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#0071e3] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#0066cc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting || isNavigating ? (
              <>
                <RefreshCw size={16} className="animate-spin" /> Signing in…
              </>
            ) : (
              'Sign in to cockpit'
            )}
          </button>
        </form>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400 px-1">
          <Link href="/" className="inline-flex items-center gap-1.5 hover:text-white transition">
            <ArrowLeft size={13} /> Back to home
          </Link>
          <div className="flex items-center gap-1.5">
            <span>Client reviewer?</span>
            <Link href="/client/login" className="font-semibold text-[#0071e3] hover:text-[#0066cc] transition">
              Client portal
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
