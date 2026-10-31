'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { ThemeToggle } from '@/components/ThemeToggle';

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="landing-header z-50 w-full bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg">
          <BrandLogo variant="light" className="h-7 w-auto sm:h-8" priority />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-8 text-xs font-medium text-neutral-600 md:flex" aria-label="Main navigation">
          <a href="#how-it-works" className="transition hover:text-neutral-950">
            How it works
          </a>
          <a href="#features" className="transition hover:text-neutral-950">
            What’s included
          </a>
          <a href="#for-editors" className="transition hover:text-neutral-950">
            For editors
          </a>
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden items-center gap-4 md:flex">
          <ThemeToggle />
          <Link
            href="/client/login"
            className="text-xs font-medium text-neutral-600 transition hover:text-neutral-950"
          >
            Client sign in
          </Link>
          <Link
            href="/client/login"
            className="apple-primary group inline-flex items-center gap-2 rounded-full bg-[#0071e3] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#0077ed] active:scale-98"
          >
            <span>Open workspace</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="border-t border-neutral-200 bg-white px-4 pt-2 pb-6 md:hidden">
          <nav className="flex flex-col space-y-1 text-sm font-medium text-neutral-700">
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 transition hover:bg-neutral-100 hover:text-neutral-950"
            >
              How it works
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 transition hover:bg-neutral-100 hover:text-neutral-950"
            >
              What’s included
            </a>
            <a
              href="#for-editors"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 transition hover:bg-neutral-100 hover:text-neutral-950"
            >
              For editors
            </a>

            <div className="pt-3 border-t border-neutral-200 flex flex-col gap-2.5">
              <Link
                href="/client/login"
                className="apple-primary flex items-center justify-center gap-2 rounded-full bg-[#0071e3] px-4 py-2.5 text-xs font-semibold text-white shadow-sm"
              >
                <span>Open client workspace</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
