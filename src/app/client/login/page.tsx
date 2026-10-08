'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { mockClientUser } from '@/lib/mock-data';
import { Clapperboard, UserCheck, ArrowRight, Mail, CheckCircle2, Shield } from 'lucide-react';
import Link from 'next/link';

export default function ClientLoginPage() {
  const router = useRouter();
  const { currentUser, loginAs, loginWithEmail } = useAuth();
  const [emailInput, setEmailInput] = useState('sarah@mainstreetcowork.com');
  const [sentNotice, setSentNotice] = useState<string | null>(null);

  // If already logged in as Client, redirect to client portal
  useEffect(() => {
    if (currentUser?.role === 'Client') {
      router.push('/client');
    }
  }, [currentUser, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    const result = loginWithEmail(emailInput);
    if (result.success) {
      setSentNotice(result.message);
      setTimeout(() => {
        router.push('/client');
      }, 500);
    }
  };

  const handleQuickDemoLogin = () => {
    loginAs('Client');
    router.push('/client');
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm mb-1">
            <UserCheck className="w-6 h-6" />
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Luminary Film Studio
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 dark:text-neutral-50">
            Client Review Portal
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            Main Street Co-Working Promo • Active Commercial Production
          </p>
        </div>

        {/* Client Login Card */}
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm space-y-5">
          <div>
            <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-500" />
              <span>Passwordless Magic Link</span>
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Enter your registered client email to access your project review dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="client-email" className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Client Work Email
              </label>
              <input
                id="client-email"
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="name@mainstreetcowork.com"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-98"
            >
              <span>Send Magic Link & Access Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {sentNotice && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{sentNotice}</span>
            </div>
          )}

          {/* Quick Demo Login */}
          <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <button
              onClick={handleQuickDemoLogin}
              type="button"
              className="w-full p-3 rounded-xl border border-dashed border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors text-left flex items-center justify-between group"
            >
              <div>
                <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 group-hover:underline">
                  Quick Access: {mockClientUser.name}
                </div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  {mockClientUser.company_name} ({mockClientUser.email})
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            </button>
          </div>
        </div>

        {/* Link to Editor Login */}
        <div className="text-center pt-2">
          <Link
            href="/editor/login"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Studio Team Member? <strong>Go to Editor Cockpit Login</strong></span>
          </Link>
        </div>

      </div>
    </div>
  );
}
