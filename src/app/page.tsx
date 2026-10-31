'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingHero } from '@/components/landing/LandingHero';
import { ProductPreviewMock } from '@/components/landing/ProductPreviewMock';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { ComparisonSection } from '@/components/landing/ComparisonSection';
import { FeaturesGridSection } from '@/components/landing/FeaturesGridSection';
import { StatsAndCTASection } from '@/components/landing/StatsAndCTASection';

export default function HomePage() {
  const router = useRouter();
  const { currentUser, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && currentUser) {
      router.push(currentUser.role === 'Editor' ? '/editor' : '/client');
    }
  }, [currentUser, isLoading, router]);

  if (isLoading) {
    return (
      <main className="apple-shell flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-100">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-200 border-t-[#0071e3]" />
      </main>
    );
  }

  return (
    <main className="apple-shell min-h-screen w-full bg-neutral-950 text-neutral-100 selection:bg-blue-500/20 selection:text-neutral-950">
      {/* 1. Header Navigation */}
      <LandingHeader />

      {/* 2. Hero Section */}
      <LandingHero />

      {/* 3. Live Product Preview Mockup */}
      <ProductPreviewMock />

      {/* 4. How It Works - 3 Step Flow */}
      <HowItWorksSection />

      {/* 5. Before vs SyncCut Comparison */}
      <ComparisonSection />

      {/* 6. Core Features Grid */}
      <FeaturesGridSection />

      {/* 7. Stats, Editor Callout, Final CTA & Footer */}
      <StatsAndCTASection />
    </main>
  );
}
