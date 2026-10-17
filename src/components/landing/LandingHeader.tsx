'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X, Shield, Clapperboard } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-800/80 bg-neutral-950/85 backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg">
          <BrandLogo variant="dark" className="h-7 w-auto sm:h-8" priority />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-8 text-sm font-medium text-neutral-300 md:flex" aria-label="Main navigation">
          <a href="#how-it-works" className="transition hover:text-white">
            How it works
          </a>
          <a href="#preview" className="transition hover:text-white">
            Workspace
          </a>
          <a href="#features" className="transition hover:text-white">
            Features
          </a>
          <a href="#comparison" className="transition hover:text-white">
            Comparison
          </a>
          <a href="#for-editors" className="transition hover:text-white">
            For editors
          </a>
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/client/login"
            className="text-sm font-medium text-neutral-300 transition hover:text-white"
          >
            Client sign in
          </Link>
          <Link
            href="/client/login"
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-xs font-semibold text-neutral-950 shadow-md shadow-emerald-500/20 transition-all hover:brightness-110 active:scale-98"
          >
            <span>Open workspace</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white md:hidden"
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-neutral-800 bg-neutral-950/95 px-4 pt-2 pb-6 md:hidden">
          <nav className="flex flex-col space-y-3 text-sm font-medium text-neutral-300">
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 transition hover:bg-neutral-900 hover:text-white"
            >
              How it works
            </a>
            <a
              href="#preview"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 transition hover:bg-neutral-900 hover:text-white"
            >
              Workspace preview
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 transition hover:bg-neutral-900 hover:text-white"
            >
              Features
            </a>
            <a
              href="#comparison"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 transition hover:bg-neutral-900 hover:text-white"
            >
              Comparison
            </a>
            <a
              href="#for-editors"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 transition hover:bg-neutral-900 hover:text-white"
            >
              For editors
            </a>

            <div className="pt-3 border-t border-neutral-800 flex flex-col gap-2.5">
              <Link
                href="/client/login"
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2.5 text-xs font-semibold text-neutral-950 shadow-md"
              >
                <span>Open client workspace</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/editor/login"
                className="flex items-center justify-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-neutral-200"
              >
                <Clapperboard className="h-3.5 w-3.5 text-indigo-400" />
                <span>Editor sign in</span>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
