'use client';

import React from 'react';
import { MoodboardReference } from '@/types';
import { Palette } from 'lucide-react';

interface VisualReferencesProps {
  references: MoodboardReference[];
}

export const VisualReferences: React.FC<VisualReferencesProps> = ({ references }) => {
  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 md:p-6 shadow-xs space-y-3">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-amber-500" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
            Visual References & Mood Board
          </h2>
        </div>
        <span className="text-[11px] font-medium text-neutral-500">
          {references.length} Style Targets
        </span>
      </div>

      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        Key visual benchmarks to keep creative alignment on tone, grade, and motion:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        {references.map((ref) => (
          <div
            key={ref.id}
            className="group rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/40 overflow-hidden hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors shadow-2xs"
          >
            {/* Visual Tone Swatch */}
            <div
              className={`h-24 bg-gradient-to-tr ${ref.color_gradient} p-2.5 flex flex-col justify-between`}
            >
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-black/60 text-white w-max backdrop-blur-xs">
                {ref.category}
              </span>
              <span className="text-2xl filter drop-shadow">{ref.icon}</span>
            </div>

            <div className="p-2.5 space-y-1">
              <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                {ref.title}
              </div>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-normal">
                {ref.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
