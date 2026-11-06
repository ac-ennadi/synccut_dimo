'use client';

import type { ReactNode } from 'react';
import { LogOut } from 'lucide-react';
import Link from 'next/link';
import { BrandLogo } from '@/components/BrandLogo';
import { ThemeToggle } from '@/components/ThemeToggle';

interface DashboardShellProps {
  role: 'Editor' | 'Client';
  name: string;
  onSignOut: () => void;
  children: ReactNode;
}

export function DashboardShell({ role, name, onSignOut, children }: DashboardShellProps) {
  return (
    <main className="apple-shell dashboard-shell min-h-screen w-full min-w-0 overflow-x-hidden bg-[#f5f5f7] px-5 py-5 text-[#1d1d1f] sm:px-8 sm:py-8">
      <div className="mx-auto w-full min-w-0 max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d6d6d6] pb-5">
          <div className="flex min-w-0 items-center gap-4">
            <Link href="/" aria-label="SyncCut home" className="shrink-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]">
              <BrandLogo variant="light" className="h-9 w-auto shrink-0 object-contain object-left" priority />
            </Link>
            <div className="flex min-h-9 flex-col justify-center border-l border-[#d6d6d6] pl-4">
              <p className="text-[11px] font-semibold uppercase leading-4 tracking-[0.12em] text-[#707070]">{role} workspace</p>
              <p className="max-w-[52vw] truncate text-sm font-medium text-[#1d1d1f] sm:max-w-none">{name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <button
              type="button"
              onClick={onSignOut}
              className="dashboard-signout inline-flex min-h-10 items-center gap-2 rounded-full border border-[#d6d6d6] bg-white px-3.5 py-2 text-xs font-medium text-[#424245] transition-colors hover:bg-[#f5f5f7]"
            >
              <LogOut size={14} aria-hidden="true" />
              <span>Sign out</span>
            </button>
          </div>
        </header>

        <div className="space-y-10 py-10 sm:py-14">{children}</div>
      </div>
    </main>
  );
}

export function DashboardSearch({
  value,
  onChange,
  label,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
}) {
  return (
    <label className="dashboard-search flex min-h-11 w-full items-center gap-2.5 rounded-full border border-[#d6d6d6] bg-white px-4 text-[#707070] transition-colors focus-within:border-[#86868b] sm:max-w-md">
      <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 shrink-0 fill-none stroke-current" strokeWidth="1.7">
        <circle cx="8.8" cy="8.8" r="5.6" />
        <path d="m13 13 4 4" />
      </svg>
      <input
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 flex-1 bg-transparent py-2 text-sm text-[#1d1d1f] outline-none placeholder:text-[#86868b]"
      />
    </label>
  );
}
