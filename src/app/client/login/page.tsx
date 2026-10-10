'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, LockKeyhole, RefreshCw, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ClientLoginPage() {
  const router = useRouter();
  const { currentUser, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser) router.replace(currentUser.role === 'Editor' ? '/editor' : '/client');
  }, [currentUser, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    const result = await signIn(email, password, 'Client');
    setIsLoading(false);
    if (result.success) router.replace('/client');
    else setError(result.error || 'Could not sign in. Check your email and password.');
  };

  return (
    <main className="min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <header className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-600 text-white"><LockKeyhole /></div>
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-600">Private client access</div>
          <h1 className="text-2xl font-black">Client review portal</h1>
          <p className="text-sm text-neutral-500">Use the email and password given to you by your editor.</p>
        </header>
        <form onSubmit={handleSubmit} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-4">
          <label className="block text-sm font-semibold" htmlFor="client-email">Email</label>
          <input id="client-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3.5 py-3 text-sm" />
          <label className="block text-sm font-semibold" htmlFor="client-password">Password</label>
          <input id="client-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3.5 py-3 text-sm" />
          {error && <p role="alert" className="flex gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 p-3 text-sm text-rose-700 dark:text-rose-300"><AlertCircle size={17} className="shrink-0" />{error}</p>}
          <button disabled={isLoading} className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white disabled:opacity-60">{isLoading ? <RefreshCw className="mx-auto animate-spin" /> : 'Sign in'}</button>
        </form>
        <p className="text-center text-xs text-neutral-500">New client? Ask your editor to create your account.</p>
        <div className="text-center"><Link href="/editor/login" className="inline-flex items-center gap-1.5 text-xs text-indigo-500 hover:underline"><Shield size={14} /> Editor sign in</Link></div>
      </div>
    </main>
  );
}
