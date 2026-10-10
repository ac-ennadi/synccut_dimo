'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle, Clapperboard, Lock, RefreshCw, Shield } from 'lucide-react';

export default function EditorLoginPage() {
  const router = useRouter();
  const { currentUser, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser?.role === 'Editor') router.replace('/editor');
  }, [currentUser, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    const result = await signIn(email, password, 'Editor');
    setIsLoading(false);
    if (result.success) router.replace('/editor');
    else setError(result.error || 'Could not sign in. Check the editor email and password.');
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <header className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white"><Clapperboard /></div>
          <div className="inline-flex items-center gap-1.5 text-indigo-300 text-xs font-bold uppercase"><Shield size={14} /> Editor access only</div>
          <h1 className="text-2xl font-black">Editor dashboard</h1>
          <p className="text-sm text-neutral-400">Sign in with the editor account configured in Supabase.</p>
        </header>
        <form onSubmit={handleSubmit} className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 space-y-4">
          <label className="block text-sm font-semibold" htmlFor="editor-email">Editor email</label>
          <input id="editor-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-3 text-sm" />
          <label className="block text-sm font-semibold" htmlFor="editor-password">Password</label>
          <div className="relative"><Lock className="absolute left-3 top-3.5 h-4 w-4 text-neutral-500" /><input id="editor-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" className="w-full rounded-xl border border-neutral-700 bg-neutral-950 py-3 pl-10 pr-3.5 text-sm" /></div>
          {error && <p role="alert" className="flex gap-2 rounded-xl bg-rose-950/50 p-3 text-sm text-rose-300"><AlertCircle size={17} className="shrink-0" />{error}</p>}
          <button disabled={isLoading} className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-bold disabled:opacity-60">{isLoading ? <RefreshCw className="mx-auto animate-spin" /> : 'Sign in'}</button>
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
