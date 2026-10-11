'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, LockKeyhole, RefreshCw, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ClientLoginPage() {
  const router = useRouter();
  const { currentUser, isLoading: isRestoring, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Only redirect once the stored session has been resolved, otherwise a valid
    // client is bounced back here while their membership is still loading.
    if (isRestoring || !currentUser) return;
    router.replace(currentUser.role === 'Editor' ? '/editor' : '/client');
  }, [currentUser, isRestoring, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    const result = await signIn(email, password, 'Client');
    setIsSubmitting(false);
    if (result.success) router.replace('/client');
    else setError(result.error || 'Could not sign in. Check your email and password.');
  };

  if (isRestoring) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-100 dark:bg-neutral-950">
        <div className="flex flex-col items-center gap-3 text-neutral-500">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" aria-hidden="true" />
          <p className="text-sm">Checking your session…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-100 p-4 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <div className="w-full max-w-md space-y-6">
        <header className="space-y-2 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white"><LockKeyhole /></div>
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Private client access</div>
          <h1 className="text-2xl font-black">Client review portal</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Use the email and password given to you by your editor.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white transition-colors hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting ? <><RefreshCw size={17} className="animate-spin" /> Signing in…</> : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">New client? Ask your editor to create your account.</p>
        <div className="text-center">
          <Link href="/editor/login" className="inline-flex items-center gap-1.5 text-xs text-indigo-500 hover:underline dark:text-indigo-400">
            <Shield size={14} /> Editor sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
