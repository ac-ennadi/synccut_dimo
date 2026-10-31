'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingHero } from '@/components/landing/LandingHero';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { ProjectFeaturesSection } from '@/components/landing/ProjectFeaturesSection';
import { EditorCTASection } from '@/components/landing/EditorCTASection';

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
    <main className="apple-shell landing-home min-h-screen w-full bg-white text-neutral-100 selection:bg-blue-500/20 selection:text-neutral-950">
      <LandingHeader />
      <LandingHero />
      <HowItWorksSection />
      <ProjectFeaturesSection />
      <EditorCTASection />
    </main>
  );
}
