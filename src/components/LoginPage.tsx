'use client';

import React from 'react';
import Link from 'next/link';

export const LoginPage: React.FC = () => (
  <main className="min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex items-center justify-center p-6">
    <div className="w-full max-w-md rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 text-center shadow-sm">
      <h1 className="text-xl font-bold">Sign in to SyncCut</h1>
      <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
        Use a real Supabase account to access a portal.
      </p>
      <div className="mt-5 grid gap-3">
        <Link href="/client/login" className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-500">
          Client login
        </Link>
        <Link href="/editor/login" className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-500">
          Editor login
        </Link>
        <Link href="/signup" className="text-sm font-semibold text-emerald-600 hover:underline">
          Create a client account
        </Link>
      </div>
    </div>
  </main>
);
