'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Clapperboard, Sparkles, Shield, UserCheck, ArrowRight, Mail, CheckCircle2 } from 'lucide-react';
import { mockClientUser, mockEditorUser } from '@/lib/mock-data';

export const LoginPage: React.FC = () => {
  const { loginAs, loginWithEmail } = useAuth();
  const [emailInput, setEmailInput] = useState('');
  const [sentNotice, setSentNotice] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    const result = loginWithEmail(emailInput);
    if (result.success) {
      setSentNotice(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white shadow-lg mb-2">
            <Clapperboard className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 dark:text-neutral-50">
            Luminary Film Studio
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            Commercial Video Production & Client Review Portal
          </p>
        </div>

        {/* Magic Link Email Form */}
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 sm:p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-500" />
              <span>Passwordless Magic Link</span>
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Enter your email to receive an instant access token.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="email" className="sr-only">Email Address</label>
              <input
                id="email"
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="name@company.com"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-98"
            >
              <span>Send Magic Link & Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {sentNotice && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{sentNotice}</span>
            </div>
          )}
        </div>

        {/* Dedicated Role Selection Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
            <span className="h-px bg-neutral-200 dark:bg-neutral-800 flex-1" />
            <span>Select Account Persona</span>
            <span className="h-px bg-neutral-200 dark:bg-neutral-800 flex-1" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Persona 1: Client */}
            <button
              onClick={() => loginAs('Client')}
              className="group text-left p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  Client View
                </span>
              </div>
              <div>
                <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {mockClientUser.name}
                </div>
                <div className="text-[11px] text-neutral-500 truncate">
                  {mockClientUser.company_name}
                </div>
              </div>
              <div className="text-[11px] text-neutral-400 leading-tight">
                Review cuts, approve milestones & leave notes.
              </div>
            </button>

            {/* Persona 2: Editor */}
            <button
              onClick={() => loginAs('Editor')}
              className="group text-left p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  Editor Cockpit
                </span>
              </div>
              <div>
                <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {mockEditorUser.name}
                </div>
                <div className="text-[11px] text-neutral-500 truncate">
                  {mockEditorUser.company_name}
                </div>
              </div>
              <div className="text-[11px] text-neutral-400 leading-tight">
                Publish cuts, advance tracker & set client alerts.
              </div>
            </button>

          </div>
        </div>

        {/* Security / System Footer */}
        <p className="text-[11px] text-center text-neutral-400">
          Powered by Supabase Magic Link Auth & Bunny Stream Video Delivery.
        </p>

      </div>
    </div>
  );
};
