'use client';

import React, { useEffect, useState } from 'react';
import type { MoodboardReference } from '@/types';
import { supabase } from '@/lib/supabase';
import { ImagePlus, Palette, Pencil, Plus, Trash2, X } from 'lucide-react';

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
    <article className="group overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xs transition hover:border-indigo-300 dark:border-neutral-800 dark:bg-neutral-950/40 dark:hover:border-indigo-700">
      <div className={`relative h-36 bg-gradient-to-br ${reference.color_gradient || 'from-slate-800 via-neutral-700 to-slate-900'}`}>
        {imageUrl && !imageFailed ? <img src={imageUrl} alt={reference.title || 'Mood board reference'} onError={() => setImageFailed(true)} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-5xl" aria-hidden="true">{reference.icon || '🎨'}</div>}
        <span className="absolute left-2.5 top-2.5 rounded-md bg-black/65 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur">{reference.category || 'Reference'}</span>
        {onEdit && <div className="absolute right-2 top-2 flex gap-1 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100"><button type="button" aria-label={`Edit ${reference.title}`} onClick={onEdit} className="rounded-lg bg-black/70 p-2 text-white hover:bg-indigo-600"><Pencil className="h-3.5 w-3.5"/></button><button type="button" aria-label={`Remove ${reference.title}`} onClick={onRemove} className="rounded-lg bg-black/70 p-2 text-white hover:bg-red-600"><Trash2 className="h-3.5 w-3.5"/></button></div>}
      </div>
      <div className="space-y-1.5 p-3"><h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{reference.title || 'Untitled reference'}</h3><p className="whitespace-pre-wrap text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">{reference.description || 'No notes added.'}</p></div>
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
    <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 md:p-6" aria-labelledby="mood-board-title">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-3 dark:border-neutral-800">
        <div className="flex items-center gap-2"><Palette className="h-4 w-4 text-amber-500"/><h2 id="mood-board-title" className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">Visual references & mood board</h2></div>
        <div className="flex items-center gap-3"><span className="text-[11px] font-medium text-neutral-500">{safeReferences.length} {safeReferences.length === 1 ? 'reference' : 'references'}</span>{isEditing && <button type="button" onClick={beginNew} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 text-xs font-semibold text-white hover:bg-indigo-500"><Plus className="h-3.5 w-3.5"/>Add reference</button>}</div>
      </div>
      <p className="text-xs text-neutral-500 dark:text-neutral-400">Collect visual examples and notes to keep the team aligned on style, lighting, color, and motion.</p>
      {safeReferences.length ? <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">{safeReferences.map((reference) => <ReferenceCard key={reference.id} reference={reference} projectId={projectId} onEdit={isEditing ? () => beginEdit(reference) : undefined} onRemove={isEditing ? () => onChange?.(safeReferences.filter((item) => item.id !== reference.id)) : undefined}/>)}</div> : <div className="rounded-xl border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-700"><ImagePlus className="mx-auto h-6 w-6 text-neutral-400"/><p className="mt-2 text-sm font-medium">No references added yet</p><p className="mt-1 text-xs text-neutral-500">Add an image and creative note to build this project’s visual direction.</p></div>}

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
