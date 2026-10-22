'use client';

import React, { useEffect, useState } from 'react';
import type { MoodboardReference } from '@/types';
import { supabase } from '@/lib/supabase';
import { ImagePlus, Pencil, Plus, Trash2, X } from 'lucide-react';

interface VisualReferencesProps {
  references: MoodboardReference[];
  projectId?: string;
  onChange?: (references: MoodboardReference[]) => void;
}

const emptyReference = (): MoodboardReference => ({
  id: crypto.randomUUID(), title: '', category: 'Style', description: '',
  color_gradient: 'from-slate-800 via-neutral-700 to-slate-900', icon: '🎨',
});

function ReferenceCard({ reference, projectId, onEdit, onRemove }: {
  reference: MoodboardReference; projectId?: string; onEdit?: () => void; onRemove?: () => void;
}) {
  const [privateImageUrl, setPrivateImageUrl] = useState('');
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadImage = async () => {
      if (!reference.image_storage_path || !projectId) { setPrivateImageUrl(''); return; }
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;
        const response = await fetch('/api/video/playback-ticket', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({ projectId, path: reference.image_storage_path }),
        });
        const result = await response.json();
        if (response.ok && !cancelled) setPrivateImageUrl(result.url);
      } catch { /* The card keeps its fallback swatch if the private image cannot load. */ }
    };
    void loadImage();
    return () => { cancelled = true; };
  }, [projectId, reference.image_storage_path]);

  const imageUrl = privateImageUrl || reference.image_url || '';
  return (
    <article className="group relative inline-flex max-w-full items-center gap-1.5 rounded-md border border-neutral-800/90 bg-neutral-900/80 px-2 py-1 text-[10px] text-neutral-300 transition hover:border-neutral-700 hover:bg-neutral-900" title={[reference.category, reference.description].filter(Boolean).join(' · ')}>
      {imageUrl && !imageFailed ? <img src={imageUrl} alt="" onError={() => setImageFailed(true)} className="h-3 w-3 shrink-0 rounded-sm object-cover" /> : <span className="shrink-0 text-[11px] leading-none" aria-hidden="true">{reference.icon || '🎨'}</span>}
      <span className="truncate">{reference.title || 'Untitled reference'}</span>
      {onEdit && <span className="ml-1 flex items-center gap-0.5 border-l border-neutral-700 pl-1 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:focus-within:opacity-100"><button type="button" aria-label={`Edit ${reference.title}`} onClick={onEdit} className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white"><Pencil className="h-3 w-3" /></button><button type="button" aria-label={`Remove ${reference.title}`} onClick={onRemove} className="rounded p-1 text-neutral-500 hover:bg-red-950 hover:text-red-300"><Trash2 className="h-3 w-3" /></button></span>}
    </article>
  );
}

export const VisualReferences: React.FC<VisualReferencesProps> = ({ references = [], projectId, onChange }) => {
  const safeReferences = references ?? [];
  const [draft, setDraft] = useState<MoodboardReference | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const isEditing = Boolean(onChange && projectId);

  const beginNew = () => { setDraft(emptyReference()); setImageFile(null); setError(''); };
  const beginEdit = (reference: MoodboardReference) => { setDraft({ ...reference }); setImageFile(null); setError(''); };
  const closeEditor = () => { setDraft(null); setImageFile(null); setError(''); };

  const saveReference = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft || !onChange) return;
    setIsSaving(true);
    setError('');
    try {
      let saved = { ...draft, title: draft.title.trim(), category: draft.category.trim() || 'Reference', description: draft.description.trim() };
      if (imageFile) {
        if (imageFile.size > 10 * 1024 * 1024) throw new Error('Choose an image smaller than 10 MB.');
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) throw new Error('Your editor session expired. Sign in again and retry.');
        const ticketResponse = await fetch('/api/video/upload-ticket', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({ projectId, fileName: imageFile.name, contentType: imageFile.type }),
        });
        const ticket = await ticketResponse.json();
        if (!ticketResponse.ok) throw new Error(ticket.error || 'Could not prepare the image upload.');
        const { error: uploadError } = await supabase.storage.from('project-videos').uploadToSignedUrl(ticket.path, ticket.token, imageFile, { contentType: imageFile.type, upsert: false });
        if (uploadError) throw uploadError;
        saved = { ...saved, image_storage_path: ticket.path, image_url: '' };
      }
      onChange(references.some((reference) => reference.id === saved.id)
        ? references.map((reference) => reference.id === saved.id ? saved : reference)
        : [...references, saved]);
      closeEditor();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save this reference.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateDraft = (field: keyof MoodboardReference, value: string) => {
    setDraft((current) => current ? { ...current, [field]: value } : current);
  };

  return (
    <section className="border-t border-neutral-800 pt-4" aria-labelledby="mood-board-title">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h2 id="mood-board-title" className="text-[9px] font-bold uppercase tracking-[0.12em] text-neutral-500">Visual references</h2>
        {isEditing && <button type="button" onClick={beginNew} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-neutral-400 transition hover:bg-neutral-900 hover:text-white"><Plus className="h-3 w-3"/>Add reference</button>}
      </div>
      {safeReferences.length ? <div className="flex flex-wrap gap-2">{safeReferences.map((reference) => <ReferenceCard key={reference.id} reference={reference} projectId={projectId} onEdit={isEditing ? () => beginEdit(reference) : undefined} onRemove={isEditing ? () => onChange?.(safeReferences.filter((item) => item.id !== reference.id)) : undefined}/>)}</div> : <div className="flex items-center gap-2 text-xs text-neutral-500"><ImagePlus className="h-3.5 w-3.5"/><span>{isEditing ? 'Add a visual reference to capture the style, lighting, color, or motion.' : 'No visual references have been added yet.'}</span></div>}

      {draft && <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"><form onSubmit={saveReference} className="my-auto w-full max-w-xl space-y-4 rounded-2xl border border-neutral-700 bg-neutral-900 p-5 text-sm shadow-2xl sm:p-6"><header className="flex items-center justify-between border-b border-neutral-800 pb-3"><div><h3 className="font-semibold text-white">{safeReferences.some((reference) => reference.id === draft.id) ? 'Edit reference' : 'Add a mood board reference'}</h3><p className="mt-1 text-xs text-neutral-400">Add an image and explain what the team should take from it.</p></div><button type="button" onClick={closeEditor} className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white" aria-label="Close"><X className="h-4 w-4"/></button></header>
        <div className="grid gap-3 sm:grid-cols-2"><label className="text-xs text-neutral-300">Title<input required value={draft.title} onChange={(event) => updateDraft('title', event.target.value)} placeholder="Warm sunset lighting" className="mt-1.5 w-full rounded-lg border border-neutral-700 bg-neutral-950 p-2.5 text-sm text-white"/></label><label className="text-xs text-neutral-300">Category<input value={draft.category} onChange={(event) => updateDraft('category', event.target.value)} placeholder="Lighting, Motion, Color…" className="mt-1.5 w-full rounded-lg border border-neutral-700 bg-neutral-950 p-2.5 text-sm text-white"/></label></div>
        <label className="block text-xs text-neutral-300">Creative note<textarea rows={3} value={draft.description} onChange={(event) => updateDraft('description', event.target.value)} placeholder="What should the editor notice or borrow from this reference?" className="mt-1.5 w-full rounded-lg border border-neutral-700 bg-neutral-950 p-2.5 text-sm text-white"/></label>
        <label className="block text-xs text-neutral-300">Upload an image<input type="file" accept="image/*" onChange={(event) => { setImageFile(event.target.files?.[0] ?? null); if (event.target.files?.[0]) updateDraft('image_url', ''); }} className="mt-1.5 w-full rounded-lg border border-neutral-700 bg-neutral-950 p-2 text-xs text-neutral-300 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-800 file:px-3 file:py-2 file:text-neutral-100"/></label>
        <label className="block text-xs text-neutral-300">Or use an image link<input type="url" value={draft.image_url ?? ''} onChange={(event) => { updateDraft('image_url', event.target.value); updateDraft('image_storage_path', ''); setImageFile(null); }} placeholder="https://example.com/reference.jpg" className="mt-1.5 w-full rounded-lg border border-neutral-700 bg-neutral-950 p-2.5 text-sm text-white"/></label>
        {error && <p role="alert" className="rounded-lg border border-red-900 bg-red-950/40 p-2.5 text-xs text-red-300">{error}</p>}
        <footer className="flex justify-end gap-2 border-t border-neutral-800 pt-3"><button type="button" onClick={closeEditor} className="rounded-lg border border-neutral-700 px-4 py-2 text-xs text-neutral-300 hover:bg-neutral-800">Cancel</button><button type="submit" disabled={isSaving} className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-60">{isSaving ? 'Saving…' : imageFile ? 'Upload & save' : 'Save reference'}</button></footer>
      </form></div>}
    </section>
  );
};
