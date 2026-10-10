'use client';

import React from 'react';
import { CreativeBrief } from '@/types';
import { FileText, Lock } from 'lucide-react';

interface ScriptBoxProps {
  brief: CreativeBrief;
}

export const ScriptBox: React.FC<ScriptBoxProps> = ({ brief }) => {
  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 md:p-6 shadow-xs flex flex-col">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800 mb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-500" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
            Creative brief
          </h2>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
          <Lock className="w-3 h-3" />
          {brief.version_label}
        </span>
      </div>

      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
        The current script, scene notes, and voiceover.
      </p>

      {/* Scrollable Text Area */}
      <div className="max-h-[380px] overflow-y-auto space-y-3.5 pr-2 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3.5 bg-neutral-50 dark:bg-neutral-950/50">
        {brief.script_scenes.map((scene) => (
          <div
            key={scene.scene_number}
            className="p-3.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2 shadow-2xs"
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
              <span>
                SCENE {scene.scene_number}: {scene.title}
              </span>
              <span className="font-mono text-neutral-500">{scene.timecode}</span>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-400 italic">
              <strong>Visual:</strong> {scene.visual_description}
            </p>

            <div className="p-2.5 rounded-md bg-neutral-100 dark:bg-neutral-800/80 border-l-2 border-indigo-500 font-mono text-xs text-neutral-900 dark:text-neutral-100">
              <span className="text-neutral-500 font-sans font-bold text-[10px] block mb-0.5">VOICEOVER:</span>
              &ldquo;{scene.voiceover}&rdquo;
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

