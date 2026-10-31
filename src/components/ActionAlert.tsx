'use client';

import React from 'react';
import { Deliverable } from '@/types';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ActionAlertProps {
  deliverable: Deliverable;
  isEditorView?: boolean;
}

export const ActionAlert: React.FC<ActionAlertProps> = ({
  deliverable,
  isEditorView = false,
}) => {
  if (deliverable?.action_required_by !== 'Client') {
    return (
      <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            {deliverable.action_banner_text || 'No action required right now. The editor is actively working on the cut.'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-amber-400 dark:border-amber-600/70 bg-amber-50/70 dark:bg-amber-950/25 p-5 md:p-6 shadow-sm">
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center font-bold shrink-0 shadow-xs">
          <AlertTriangle className="w-5 h-5" />
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Immediate Action Required
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              Blocks Next Cut
            </span>
          </div>

          <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
            {deliverable.action_banner_text || 'Waiting on Client: Please provide your brand asset'}
          </h3>

          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Please share your brand asset (preferably <strong className="text-neutral-900 dark:text-neutral-200">.SVG</strong> or <strong className="text-neutral-900 dark:text-neutral-200">.AI</strong> with a transparent background) with your editor for the lower-thirds and final end-card title.
          </p>

          {isEditorView && <p className="text-xs font-medium text-amber-800 dark:text-amber-300">The client has been asked to provide the brand asset.</p>}
        </div>
      </div>
    </div>
  );
};
