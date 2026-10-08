'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Building2, CheckCircle2, Mail, RefreshCw, UserPlus, AlertCircle } from 'lucide-react';
import { OtpInput } from '@/components/OtpInput';
import { SignupProfile, useAuth } from '@/context/AuthContext';

export default function SignupPage() {
  const router = useRouter();
  const { currentUser, requestMagicLink, verifyCode } = useAuth();
  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [profile, setProfile] = useState<SignupProfile>({ name: '', companyName: '' });
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser) router.push(currentUser.role === 'Editor' ? '/editor' : '/client');
  }, [currentUser, router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);
    const result = await requestMagicLink(email.trim(), 'Client', profile);
    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Unable to create your account. Please try again.');
      return;
    }

    setStep('verify');
  };

  const handleVerify = async (value = code) => {
    if (value.length !== 6) {
      setErrorMessage('Please enter all 6 digits of the verification code.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);
    const result = await verifyCode(email.trim(), value, 'Client', profile);
    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Invalid or expired verification code.');
      return;
    }

    router.push('/client');
  };

  return (
    <main className="min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <header className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-600 text-white shadow-lg">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Create your client account</h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            Join the client review portal with passwordless email verification.
          </p>
        </header>

        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm space-y-4">
            <div>
              <label htmlFor="signup-name" className="block text-xs font-semibold mb-1">Full name</label>
              <input id="signup-name" value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} required minLength={2} autoComplete="name" className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label htmlFor="signup-company" className="block text-xs font-semibold mb-1">Company name</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                <input id="signup-company" value={profile.companyName} onChange={(event) => setProfile({ ...profile, companyName: event.target.value })} required minLength={2} autoComplete="organization" className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>
            <div>
              <label htmlFor="signup-email" className="block text-xs font-semibold mb-1">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                <input id="signup-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" placeholder="you@company.com" className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>
            {errorMessage && <p className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs flex gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{errorMessage}</p>}
            <button type="submit" disabled={isLoading} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-sm font-bold">
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><span>Create account</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        ) : (
          <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm space-y-5">
            <div className="text-center space-y-2">
              <Mail className="w-8 h-8 mx-auto text-emerald-500" />
              <h2 className="text-lg font-bold">Check your inbox</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Enter the 6-digit code sent to <strong>{email}</strong>.</p>
            </div>
            <OtpInput value={code} onChange={setCode} onComplete={handleVerify} accentColor="emerald" disabled={isLoading} />
            {errorMessage && <p className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs flex gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{errorMessage}</p>}
            <button onClick={() => handleVerify()} disabled={isLoading || code.length !== 6} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-sm font-bold disabled:opacity-40">
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><span>Verify and enter portal</span><CheckCircle2 className="w-4 h-4" /></>}
            </button>
            <button type="button" onClick={() => { setStep('form'); setErrorMessage(null); }} className="w-full text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">Change details</button>
          </section>
        )}

        <p className="text-center text-xs text-neutral-500">
          Already registered? <Link href="/client/login" className="font-semibold text-emerald-600 hover:underline">Log in</Link>
        </p>
      </div>
    </main>
  );
}
