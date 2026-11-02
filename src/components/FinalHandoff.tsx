'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Download, ExternalLink, PackageCheck, Plus, X } from 'lucide-react';
import type { ApprovalStatus, FinalDeliveryAsset, FinalHandoff as FinalHandoffData } from '@/types';

interface Props {
  handoff?: FinalHandoffData;
  currentVersion: string;
  approvalStatus: ApprovalStatus;
  editable?: boolean;
  onSave?: (handoff: FinalHandoffData) => void;
}

const emptyHandoff = (version: string): FinalHandoffData => ({ status: 'preparing', notes: '', assets: [], cut_version: version });
const normalizeHandoff = (handoff: FinalHandoffData | undefined, version: string): FinalHandoffData => ({
  ...emptyHandoff(version),
  ...(handoff ?? {}),
  notes: typeof handoff?.notes === 'string' ? handoff.notes : '',
  assets: Array.isArray(handoff?.assets) ? handoff.assets : [],
});

function isSafeLink(value: string): boolean {
  try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; }
}

export function FinalHandoff({ handoff, currentVersion, approvalStatus, editable = false, onSave }: Props) {
  const [draft, setDraft] = useState<FinalHandoffData>(() => normalizeHandoff(handoff, currentVersion));
  const [assetLabel, setAssetLabel] = useState('');
  const [assetUrl, setAssetUrl] = useState('');
  const [error, setError] = useState('');
  const canMarkReady = approvalStatus === 'Approved';

  useEffect(() => {
    setDraft(normalizeHandoff(handoff, currentVersion));
  }, [handoff, currentVersion]);

  if (!editable && handoff?.status !== 'ready') return null;

  const addAsset = () => {
    const label = assetLabel.trim();
    const url = assetUrl.trim();
    if (!label || !isSafeLink(url)) {
      setError('Add a name and a valid http or https link.');
      return;
    }
    const asset: FinalDeliveryAsset = { id: crypto.randomUUID(), label, url };
    setDraft((current) => ({ ...current, assets: [...current.assets, asset] }));
    setAssetLabel('');
    setAssetUrl('');
    setError('');
  };

  const save = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (draft.status === 'ready' && !canMarkReady) {
      setError('Approve the current cut before marking the handoff ready.');
      return;
    }
    setError('');
    onSave?.({ ...draft, cut_version: currentVersion });
  };

  if (!editable) {
    return (
      <section className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-xs dark:border-emerald-900/70 dark:bg-neutral-900" aria-labelledby="final-handoff-title">
        <div className="flex items-center gap-2 border-b border-neutral-200 pb-3 dark:border-neutral-800">
          <PackageCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <h2 id="final-handoff-title" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Final delivery</h2>
          <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400"><CheckCircle2 className="h-3.5 w-3.5" /> Ready</span>
        </div>
        <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">Approved cut · {handoff?.cut_version || currentVersion}</p>
        {handoff?.notes && <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-neutral-700 dark:text-neutral-300">{handoff.notes}</p>}
        {!!(handoff?.assets ?? []).length && <ul className="mt-4 divide-y divide-neutral-200 dark:divide-neutral-800">
          {(handoff?.assets ?? []).filter((asset) => isSafeLink(asset.url)).map((asset) => <li key={asset.id} className="py-2.5"><a href={asset.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-[#0066cc] hover:underline"><Download className="h-4 w-4" />{asset.label}<ExternalLink className="h-3.5 w-3.5" /></a></li>)}
        </ul>}
        {!handoff?.notes && !(handoff?.assets ?? []).length && <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">Your approved cut is ready for delivery.</p>}
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900" aria-labelledby="final-handoff-title">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-3 dark:border-neutral-800">
        <div>
          <h2 id="final-handoff-title" className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100"><PackageCheck className="h-4 w-4 text-[#0071e3]" /> Final delivery</h2>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Prepare handoff links and delivery notes for the client.</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${draft.status === 'ready' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'}`}>{draft.status === 'ready' ? 'Ready' : 'In progress'}</span>
      </div>

      <form onSubmit={save} className="mt-4 space-y-4">
        <p className="text-xs text-neutral-500 dark:text-neutral-400">This handoff is for cut <strong className="font-semibold text-neutral-700 dark:text-neutral-300">{currentVersion}</strong>.</p>
        <label className="block space-y-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300">
          Delivery notes
          <textarea rows={3} value={draft.notes} onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))} placeholder="Share export details, usage notes, or anything the client should know." className="w-full resize-y rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-sm font-normal text-neutral-900 outline-none focus:border-[#0071e3] dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100" />
        </label>

        <div className="space-y-2">
          <p className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Final files and links</p>
          {(draft.assets ?? []).map((asset) => <div key={asset.id} className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 px-3 py-2 dark:border-neutral-800"><span className="min-w-0 truncate text-xs text-neutral-700 dark:text-neutral-300">{asset.label}<span className="ml-2 text-neutral-400">{asset.url}</span></span><button type="button" onClick={() => setDraft((current) => ({ ...current, assets: (current.assets ?? []).filter((item) => item.id !== asset.id) }))} aria-label={`Remove ${asset.label}`} className="shrink-0 rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-rose-600 dark:hover:bg-neutral-800"><X className="h-3.5 w-3.5" /></button></div>)}
          <div className="grid gap-2 sm:grid-cols-[0.8fr_1.2fr_auto]">
            <input value={assetLabel} onChange={(event) => setAssetLabel(event.target.value)} placeholder="File name" aria-label="Delivery file name" className="min-w-0 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 outline-none focus:border-[#0071e3] dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100" />
            <input type="url" value={assetUrl} onChange={(event) => setAssetUrl(event.target.value)} placeholder="https://…" aria-label="Delivery file link" className="min-w-0 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 outline-none focus:border-[#0071e3] dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100" />
            <button type="button" onClick={addAsset} className="inline-flex items-center justify-center gap-1.5 rounded-full border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"><Plus className="h-3.5 w-3.5" /> Add link</button>
          </div>
        </div>

        <label className={`flex items-start gap-2.5 rounded-xl border p-3 text-xs ${canMarkReady ? 'cursor-pointer border-neutral-200 dark:border-neutral-800' : 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-300'}`}>
          <input type="checkbox" checked={draft.status === 'ready'} disabled={!canMarkReady} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.checked ? 'ready' : 'preparing' }))} className="mt-0.5 accent-emerald-600 disabled:opacity-50" />
          <span>{canMarkReady ? 'Mark this approved cut ready for the client.' : 'The client must approve the current cut before you can mark delivery ready.'}</span>
        </label>
        {error && <p role="alert" className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}
        <div className="flex justify-end">
          <button type="submit" className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#0071e3] px-4 text-xs font-semibold text-white transition hover:bg-[#0066cc]"><CheckCircle2 className="h-4 w-4" /> Save handoff</button>
        </div>
      </form>
    </section>
  );
}
