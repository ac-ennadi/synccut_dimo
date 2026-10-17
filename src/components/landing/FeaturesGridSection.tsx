'use client';

import React from 'react';
import {
  Monitor,
  KeyRound,
  Clock,
  UploadCloud,
  Clapperboard,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export function FeaturesGridSection() {
  const features = [
    {
      icon: Monitor,
      title: 'Single-Screen Clarity',
      description:
        'Script, scene notes, visual references, and the latest cut live together. Zero tab-switching or searching for PDFs.',
      tag: 'Interface',
      color: 'text-indigo-400',
    },
    {
      icon: KeyRound,
      title: 'Passwordless Access',
      description:
        'Clients sign in instantly using secure magic links or a 6-digit access PIN. Zero account creation friction.',
      tag: 'Authentication',
      color: 'text-emerald-400',
    },
    {
      icon: Clock,
      title: 'Frame-Accurate Timecodes',
      description:
        'Click to stamp the active video timestamp into any feedback note. Say goodbye to manual timestamp typing.',
      tag: 'Precision',
      color: 'text-teal-400',
    },
    {
      icon: UploadCloud,
      title: 'Brand Asset Dropzone',
      description:
        'Clients drag and drop high-resolution logos (SVG, AI, PNG) directly into the project vault for the editor.',
      tag: 'Assets',
      color: 'text-amber-400',
    },
    {
      icon: Clapperboard,
      title: 'Editor Cockpit',
      description:
        'Post new cuts, lock script revisions, advance project stages, and track client approvals from a dedicated workstation.',
      tag: 'Control',
      color: 'text-indigo-400',
    },
    {
      icon: ShieldCheck,
      title: 'Private & Secure Vaults',
      description:
        'Protected by Supabase row-level security and signed video playback URLs that expire automatically after sessions.',
      tag: 'Security',
      color: 'text-emerald-400',
    },
  ];

  return (
    <section id="features" className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center space-y-3">
        <span className="text-xs font-mono font-semibold uppercase tracking-widest text-emerald-400">
          Core Capabilities
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
          Everything needed to deliver professional video
        </h2>
        <p className="text-neutral-400 text-base sm:text-lg">
          Built from the ground up to solve the real everyday bottlenecks of video post-production.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="group relative rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm backdrop-blur-sm transition-all hover:border-neutral-700 hover:bg-neutral-900/90 hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 ${feature.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-neutral-500">
                  {feature.tag}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-emerald-300 transition-colors">
                {feature.title}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-neutral-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
