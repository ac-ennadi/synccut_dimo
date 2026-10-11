'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Trash2, X } from 'lucide-react';
import { deleteProject } from '@/lib/project-admin';

interface DeleteProjectModalProps {
  projectId: string;
  projectTitle: string;
  onClose: () => void;
  onDeleted: (projectId: string) => void;
}

/**
 * Typing the project name is required before the confirm button unlocks, because
 * deletion cannot be undone and it also clears every uploaded file in storage.
 */
export function DeleteProjectModal({ projectId, projectTitle, onClose, onDeleted }: DeleteProjectModalProps) {
  const [typedName, setTypedName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape' && !isDeleting) onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isDeleting, onClose]);

  const confirmed = typedName.trim() === projectTitle.trim() && projectTitle.trim().length > 0;

  const handleDelete = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!confirmed || isDeleting) return;
    setIsDeleting(true);
    setError('');
    try {
      await deleteProject(projectId);
      onDeleted(projectId);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not delete this project.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="delete-project-title">
      <form onSubmit={handleDelete} className="my-auto w-full max-w-lg space-y-4 rounded-2xl border border-rose-900/60 bg-neutral-900 p-5 text-sm shadow-2xl sm:p-6">
        <header className="flex items-start justify-between gap-3 border-b border-neutral-800 pb-3">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-rose-600/15 text-rose-400"><AlertCircle className="h-5 w-5" /></span>
            <div>
              <h2 id="delete-project-title" className="font-semibold text-white">Delete this project?</h2>
              <p className="mt-1 text-xs text-neutral-400">This cannot be undone.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={isDeleting} className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white disabled:opacity-50" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="space-y-2 rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-xs text-neutral-300">
          <p className="font-semibold text-neutral-200">Deleted permanently</p>
          <ul className="ml-4 list-disc space-y-1 text-neutral-400">
            <li>The project and its script, progress, and mood board</li>
            <li>All feedback notes on this project</li>
            <li>Every uploaded video, logo, and reference image</li>
          </ul>
          <p className="pt-1 font-semibold text-emerald-400">Kept safe</p>
          <ul className="ml-4 list-disc space-y-1 text-neutral-400">
            <li>Your client sign-in accounts — you can add those people to another project later</li>
            <li>Projects that belong to other clients</li>
          </ul>
        </div>

        <label className="block text-xs font-medium text-neutral-300">
          Type <strong className="font-mono text-rose-300">{projectTitle}</strong> to confirm
          <input
            value={typedName}
            onChange={(event) => setTypedName(event.target.value)}
            autoFocus
            autoComplete="off"
            aria-label="Type the project name to confirm deletion"
            className="mt-1.5 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2.5 text-sm text-white focus:border-rose-500 focus:outline-none"
          />
        </label>

        {error && <p role="alert" className="rounded-lg border border-rose-900 bg-rose-950/40 p-3 text-xs text-rose-300">{error}</p>}

        <footer className="flex justify-end gap-2 border-t border-neutral-800 pt-3">
          <button type="button" onClick={onClose} disabled={isDeleting} className="rounded-xl border border-neutral-700 px-4 py-2 text-xs font-medium text-neutral-300 hover:bg-neutral-800 disabled:opacity-50">Cancel</button>
          <button type="submit" disabled={!confirmed || isDeleting} className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-40">
            <Trash2 className="h-3.5 w-3.5" />
            {isDeleting ? 'Deleting…' : 'Delete project'}
          </button>
        </footer>
      </form>
    </div>
  );
}
