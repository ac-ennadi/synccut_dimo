'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Clapperboard, UserCheck, Shield, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { currentUser, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && currentUser) {
      if (currentUser.role === 'Client') {
        router.push('/client');
      } else if (currentUser.role === 'Editor') {
        router.push('/editor');
      }
    }
  }, [currentUser, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-950">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl space-y-8">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 mb-1">
            <Clapperboard className="w-7 h-7" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/50 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dedicated Multi-Persona Access</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-900 dark:text-neutral-50">
            SyncCut Video Review Portals
          </h1>
          <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 max-w-lg mx-auto">
            Select your portal to access your personalized workspace. Each portal features separate authentication, permissions, and tools.
          </p>
        </div>

        {/* Two Separate Gateway Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Card 1: Client Portal */}
          <div className="rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm hover:border-emerald-500 dark:hover:border-emerald-500 transition-all flex flex-col justify-between space-y-5 group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
                <UserCheck className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/40">
                  Client Access
                </span>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mt-2">
                  Client Review Portal
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                  Dedicated interface for commercial clients. Watch cuts with zero buffering, track pizza-delivery style milestones, and leave frame-accurate notes.
                </p>
              </div>

              <ul className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1.5 pt-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Real-time Pizza Tracker milestones</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Timecoded video feedback</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Zero confusing editor toolbars</span>
                </li>
              </ul>
            </div>

            <Link
              href="/client/login"
              className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-98"
            >
              <span>Client Login Portal</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Card 2: Editor Cockpit */}
          <div className="rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm hover:border-indigo-500 dark:hover:border-indigo-500 transition-all flex flex-col justify-between space-y-5 group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold">
                <Shield className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800/40">
                  Studio Crew
                </span>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mt-2">
                  Editor Studio Cockpit
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                  Command center for the production bay. Publish new cuts, move stages live, manage action banners, and edit creative briefs.
                </p>
              </div>

              <ul className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1.5 pt-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                  <span>One-click stage advancement</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Bunny Stream video publishing</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Instant Client Portal simulator</span>
                </li>
              </ul>
            </div>

            <Link
              href="/editor/login"
              className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-98"
            >
              <span>Editor Studio Login</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-neutral-400 pt-4">
          Direct route URLs: <code className="text-neutral-500 font-mono">/client/login</code> and <code className="text-neutral-500 font-mono">/editor/login</code>
        </div>

      </div>
    </div>
  );
}
