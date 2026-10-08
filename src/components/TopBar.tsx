'use client';

import React from 'react';
import { Project, ProjectStatus } from '@/types';
import { Check, Mail, Sparkles } from 'lucide-react';

interface TopBarProps {
  project: Project;
  onStatusChange?: (newStatus: ProjectStatus) => void;
}

const STAGES: { key: ProjectStatus; label: string; subtext: string }[] = [
  { key: 'Scripting', label: '1. Scripting', subtext: 'Approved' },
  { key: 'Pre-Production', label: '2. Pre-Production', subtext: 'Locations Locked' },
  { key: 'Shooting', label: '3. Shooting', subtext: 'Day 2 of 2 On-Site' },
  { key: 'Editing', label: '4. Editing', subtext: 'Rough Cut' },
  { key: 'Final Review', label: '5. Final Review', subtext: 'Color & Delivery' },
];

export const TopBar: React.FC<TopBarProps> = ({ project, onStatusChange }) => {
  const currentStageIndex = STAGES.findIndex((s) => s.key === project.status);

  return (
    <header className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 md:p-6 shadow-xs space-y-6">
      {/* Project Identity Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Active Production
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mt-0.5">
            {project.title}
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Target Release: <strong className="text-neutral-900 dark:text-neutral-200">{project.due_date}</strong> • 60-Second Brand Reel & Social Cutdowns
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-medium text-neutral-600 dark:text-neutral-300 flex items-center gap-2">
            <span>Producer:</span>
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">{project.producer_name}</span>
          </div>
          <a
            href={`mailto:${project.producer_email}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Contact Team</span>
          </a>
        </div>
      </div>

      {/* Pizza Delivery Style Progress Tracker */}
      <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Live Milestone Tracker
            </span>
            <span className="text-[11px] text-neutral-400">
              (Pizza-delivery style status)
            </span>
          </div>
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/50 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Stage {currentStageIndex + 1} of 5 Active
          </span>
        </div>

        <div className="relative">
          {/* Connecting Bar on desktop */}
          <div className="hidden sm:block absolute top-1/2 left-8 right-8 -translate-y-1/2 h-1 bg-neutral-200 dark:bg-neutral-800 z-0">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-indigo-500 transition-all duration-500 rounded-full"
              style={{ width: `${(currentStageIndex / (STAGES.length - 1)) * 100}%` }}
            />
          </div>

          {/* Nodes Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 relative z-10">
            {STAGES.map((stage, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              const isFuture = idx > currentStageIndex;

              return (
                <div
                  key={stage.key}
                  onClick={() => onStatusChange && onStatusChange(stage.key)}
                  className={`transition-all rounded-xl p-2.5 sm:p-2 sm:text-center flex sm:flex-col items-center gap-3 sm:gap-2 ${
                    onStatusChange ? 'cursor-pointer hover:opacity-90' : 'cursor-default'
                  } ${
                    isCurrent
                      ? 'col-span-2 sm:col-span-1 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/60 shadow-xs'
                      : 'bg-neutral-50 dark:bg-neutral-800/40 sm:bg-transparent'
                  }`}
                  title={onStatusChange ? `Switch stage to ${stage.label}` : stage.label}
                >
                  {isPast && (
                    <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-xs ring-4 ring-emerald-500/10 shrink-0">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}

                  {isCurrent && (
                    <div className="relative flex items-center justify-center shrink-0">
                      <span className="absolute w-12 h-12 rounded-full bg-amber-500/25 animate-ping" />
                      <div className="w-9 h-9 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center font-black text-sm shadow-md ring-4 ring-amber-500/20">
                        ●
                      </div>
                    </div>
                  )}

                  {isFuture && (
                    <div className="w-9 h-9 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-400 flex items-center justify-center font-semibold text-xs shrink-0">
                      {idx + 1}
                    </div>
                  )}

                  <div>
                    <div
                      className={`text-xs font-bold flex items-center sm:justify-center gap-1 ${
                        isCurrent
                          ? 'text-amber-600 dark:text-amber-400'
                          : isPast
                          ? 'text-neutral-900 dark:text-neutral-200'
                          : 'text-neutral-400 dark:text-neutral-500'
                      }`}
                    >
                      <span>{stage.label}</span>
                      {isCurrent && (
                        <span className="text-[10px] font-black uppercase px-1 rounded bg-amber-500 text-neutral-950">
                          NOW
                        </span>
                      )}
                    </div>
                    <div
                      className={`text-[11px] font-medium ${
                        isPast
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : isCurrent
                          ? 'text-neutral-700 dark:text-neutral-300'
                          : 'text-neutral-400 dark:text-neutral-500'
                      }`}
                    >
                      {stage.subtext}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
