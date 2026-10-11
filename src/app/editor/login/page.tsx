'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, Clapperboard, Lock, RefreshCw, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function EditorLoginPage() {
  const router = useRouter();
  const { currentUser, isLoading: isRestoring, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isRestoring || currentUser?.role !== 'Editor') return;
    router.replace('/editor');
  }, [currentUser, isRestoring, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    const result = await signIn(email, password, 'Editor');
    setIsSubmitting(false);
    if (result.success) router.replace('/editor');
    else setError(result.error || 'Could not sign in. Check the editor email and password.');
  };

  if (isRestoring) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950">
        <div className="flex flex-col items-center gap-3 text-neutral-400">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" aria-hidden="true" />
          <p className="text-sm">Checking your session…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 p-4 text-neutral-100">
      <div className="w-full max-w-md space-y-6">
        <header className="space-y-2 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white"><Clapperboard /></div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase text-indigo-300"><Shield size={14} /> Editor access only</div>
          <h1 className="text-2xl font-black">Editor dashboard</h1>
          <p className="text-sm text-neutral-400">Sign in with the editor account configured in Supabase.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold" htmlFor="editor-email">Editor email</label>
            <input
              id="editor-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="username"
              autoFocus
              disabled={isSubmitting}
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-3 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-60"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold" htmlFor="editor-password">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-4 w-4 text-neutral-500" aria-hidden="true" />
              <input
                id="editor-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
                disabled={isSubmitting}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 py-3 pl-10 pr-3.5 text-sm text-neutral-100 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-60"
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="flex gap-2 rounded-xl bg-rose-950/50 p-3 text-sm text-rose-300">
              <AlertCircle size={17} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting ? <><RefreshCw size={17} className="animate-spin" /> Signing in…</> : 'Sign in'}
          </button>

          <p className="pt-1 text-center text-sm text-neutral-400">
            Client?{' '}
            <Link href="/client/login" className="font-semibold text-emerald-400 hover:underline">
              Go to client sign in
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
