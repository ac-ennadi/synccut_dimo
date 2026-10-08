'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { mockEditorUser } from '@/lib/mock-data';
import { Clapperboard, Shield, ArrowRight, Lock, CheckCircle2, UserCheck } from 'lucide-react';
import Link from 'next/link';

export default function EditorLoginPage() {
  const router = useRouter();
  const { currentUser, loginAs, loginWithEmail } = useAuth();
  const [emailInput, setEmailInput] = useState('alex@luminaryfilms.com');
  const [sentNotice, setSentNotice] = useState<string | null>(null);

  // If already logged in as Editor, redirect to editor dashboard
  useEffect(() => {
    if (currentUser?.role === 'Editor') {
      router.push('/editor');
    }
  }, [currentUser, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    const result = loginWithEmail(emailInput);
    if (result.success) {
      setSentNotice(result.message);
      setTimeout(() => {
        router.push('/editor');
      }, 500);
    }
  };

  const handleQuickDemoLogin = () => {
    loginAs('Editor');
    router.push('/editor');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 mb-1">
            <Clapperboard className="w-6 h-6" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
            <Shield className="w-3 h-3" />
            <span>Authorized Studio Personnel Only</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Editor Studio Cockpit
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            Luminary Film Studio • Video Production & Delivery Bay
          </p>
        </div>

        {/* Editor Login Card */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 backdrop-blur-md p-6 shadow-2xl space-y-5">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-400" />
              <span>Studio Crew Authentication</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Enter your studio credentials to access the production management controls.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="editor-email" className="block text-xs font-semibold text-neutral-300 mb-1">
                Studio Email Address
              </label>
              <input
                id="editor-email"
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="alex@luminaryfilms.com"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-700 bg-neutral-950 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold transition-all shadow-md active:scale-98"
            >
              <span>Authenticate & Enter Cockpit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {sentNotice && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{sentNotice}</span>
            </div>
          )}

          {/* Quick Demo Login */}
          <div className="pt-3 border-t border-neutral-800">
            <button
              onClick={handleQuickDemoLogin}
              type="button"
              className="w-full p-3 rounded-xl border border-dashed border-indigo-700/60 bg-indigo-950/30 hover:bg-indigo-950/60 transition-colors text-left flex items-center justify-between group"
            >
              <div>
                <div className="text-xs font-bold text-indigo-300 group-hover:underline">
                  Quick Access: {mockEditorUser.name} (Lead Editor)
                </div>
                <div className="text-[11px] text-neutral-400">
                  {mockEditorUser.company_name} ({mockEditorUser.email})
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-indigo-400 shrink-0" />
            </button>
          </div>
        </div>

        {/* Link to Client Login */}
        <div className="text-center pt-2">
          <Link
            href="/client/login"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-emerald-400 transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Are you a client? <strong>Go to Client Review Portal Login</strong></span>
          </Link>
        </div>

      </div>
    </div>
  );
}
