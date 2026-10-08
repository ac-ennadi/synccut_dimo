'use client';

import React, { useState } from 'react';
import { Deliverable } from '@/types';
import { AlertTriangle, Upload, CheckCircle2 } from 'lucide-react';

interface ActionAlertProps {
  deliverable: Deliverable;
  onUploadSuccess?: (fileName: string) => void;
}

export const ActionAlert: React.FC<ActionAlertProps> = ({
  deliverable,
  onUploadSuccess,
}) => {
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  if (deliverable.action_required_by !== 'Client') {
    return (
      <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            No action required right now. The editor is actively working on the cut.
          </span>
        </div>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const name = e.target.files[0].name;
      setUploadedFile(name);
      if (onUploadSuccess) onUploadSuccess(name);
    }
  };

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
            {deliverable.action_banner_text || 'Waiting on Client: Please upload your vector logo'}
          </h3>

          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Our editing bay needs your brand asset (preferably <strong className="text-neutral-900 dark:text-neutral-200">.SVG</strong> or <strong className="text-neutral-900 dark:text-neutral-200">.AI</strong> with transparent background) for the lower-thirds and final end-card title.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {uploadedFile ? (
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Uploaded: {uploadedFile}</span>
              </div>
            ) : (
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-xs transition-all active:scale-98">
                <Upload className="w-4 h-4" />
                <span>Upload Vector Logo</span>
                <input
                  type="file"
                  accept=".svg,.ai,.eps,.png"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            )}

            <span className="text-[11px] text-neutral-500">
              Max file size: 50MB (.SVG, .AI, .EPS, .PNG)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
