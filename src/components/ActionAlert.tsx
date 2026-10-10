'use client';

import React from 'react';
import { Deliverable } from '@/types';
import { AlertTriangle, Upload, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface ActionAlertProps {
  deliverable: Deliverable;
  projectId: string;
  canUpload?: boolean;
  onUploadSuccess?: (fileName: string, storagePath: string) => void;
}

export const ActionAlert: React.FC<ActionAlertProps> = ({
  deliverable,
  projectId,
  canUpload = true,
  onUploadSuccess,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadError, setUploadError] = useState('');
  if (deliverable.action_required_by !== 'Client') {
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadError(''); setUploadMessage('');
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!['svg', 'ai', 'eps', 'png'].includes(extension ?? '')) { setUploadError('Choose an SVG, AI, EPS, or PNG logo.'); return; }
    if (file.size > 20 * 1024 * 1024) { setUploadError('Choose a logo smaller than 20 MB.'); return; }
    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Your session expired. Sign in again and retry.');
      const contentType = file.type || (extension === 'svg' ? 'image/svg+xml' : extension === 'png' ? 'image/png' : 'application/octet-stream');
      const ticketResponse = await fetch('/api/video/upload-ticket', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ projectId, fileName: file.name, contentType, assetType: 'logo' }) });
      const ticket = await ticketResponse.json();
      if (!ticketResponse.ok) throw new Error(ticket.error || 'Could not prepare the logo upload.');
      const { error } = await supabase.storage.from('project-videos').uploadToSignedUrl(ticket.path, ticket.token, file, { contentType, upsert: false });
      if (error) throw error;
      onUploadSuccess?.(file.name, ticket.path);
      setUploadMessage(`${file.name} uploaded. The editor can download it now.`);
    } catch (error) { setUploadError(error instanceof Error ? error.message : 'Logo upload failed. Please try again.'); }
    finally { setUploading(false); }
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

          {!canUpload && <p className="text-xs font-medium text-amber-800 dark:text-amber-300">Waiting for the client to upload the logo.</p>}
          {canUpload && <>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-xs transition-all active:scale-98">
              <Upload className="w-4 h-4" />
              <span>{uploading ? 'Uploading…' : 'Choose Logo File'}</span>
              <input
                type="file"
                accept=".svg,.ai,.eps,.png"
                className="hidden"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </label>

            <span className="text-[11px] text-neutral-500">
              Supported formats: .SVG, .AI, .EPS, .PNG
            </span>
          </div>
          {uploadMessage && <p role="status" className="text-xs text-emerald-700 dark:text-emerald-300">{uploadMessage}</p>}
          {uploadError && <p role="alert" className="text-xs text-red-700 dark:text-red-300">{uploadError}</p>}
          </>}
        </div>
      </div>
    </div>
  );
};
