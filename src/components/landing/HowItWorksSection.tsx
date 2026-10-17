'use client';

import React from 'react';
import { FileText, Clock, CheckCircle2, ArrowRight } from 'lucide-react';

export function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      title: 'Contextual Script & Brief',
      subtitle: 'Never lose the creative vision',
      description:
        'Clients review the video draft directly next to the approved script, scene breakdown, and voiceover text. No more guessing why a cut was made.',
      icon: FileText,
      badge: 'Step 01 • Alignment',
      color: 'from-indigo-500/20 to-indigo-600/5',
      borderColor: 'border-indigo-500/30',
      iconColor: 'text-indigo-400',
    },
    {
      number: '02',
      title: 'Frame-Accurate Stamped Notes',
      subtitle: 'Eliminate vague feedback emails',
      description:
        'Clients stamp exact timecodes with a single click. Every note is pinned to the exact second so editors know precisely what to tweak.',
      icon: Clock,
      badge: 'Step 02 • Precision',
      color: 'from-emerald-500/20 to-emerald-600/5',
      borderColor: 'border-emerald-500/30',
      iconColor: 'text-emerald-400',
    },
    {
      number: '03',
      title: 'Live Stage Pipeline & Approval',
      subtitle: 'Zero status check-in emails',
      description:
        'Both editor and client see the live project stage—Scripting, Shoot, Edit, or Final Review. When the cut is ready, approval takes one click.',
      icon: CheckCircle2,
      badge: 'Step 03 • Delivery',
      color: 'from-teal-500/20 to-teal-600/5',
      borderColor: 'border-teal-500/30',
      iconColor: 'text-teal-400',
    },
  ];

  return (
    <section id="how-it-works" className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="mx-auto max-w-3xl text-center space-y-3">
        <span className="text-xs font-mono font-semibold uppercase tracking-widest text-emerald-400">
          How It Works
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
          Three steps to frictionless video delivery
        </h2>
        <p className="text-neutral-400 text-base sm:text-lg">
          Designed specifically for commercial editors, video agencies, and client marketing teams.
        </p>
      </div>

      {/* 3 Step Cards Grid */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.number}
              className={`relative flex flex-col justify-between rounded-2xl border ${step.borderColor} bg-gradient-to-b ${step.color} p-6 sm:p-7 shadow-lg backdrop-blur-sm transition-all hover:-translate-y-1`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-neutral-900/80 px-3 py-1 text-xs font-mono font-semibold text-neutral-300 border border-neutral-800">
                    {step.badge}
                  </span>
                  <div className={`p-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800 ${step.iconColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-xs font-medium text-neutral-400 mt-1">
                    {step.subtitle}
                  </p>
                </div>

                <p className="text-sm text-neutral-300 leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs font-mono text-neutral-500">
                <span>STAGE {step.number}</span>
                <span className="text-emerald-400 font-semibold">SyncCut Flow</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
