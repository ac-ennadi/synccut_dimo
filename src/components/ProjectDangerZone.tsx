'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { DeleteProjectModal } from './DeleteProjectModal';

/**
 * Workspace-level delete affordance. Kept separate from the project list's icon
 * button so the destructive action always goes through the typed confirmation.
 */
export function ProjectDangerZone({ projectId, projectTitle }: { projectId: string; projectTitle: string }) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);

  return (
    <section className="rounded-2xl border border-rose-900/40 bg-rose-950/20 p-5 sm:p-6 backdrop-blur-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 max-w-2xl">
          <h2 className="flex items-center gap-2 font-semibold text-rose-400 text-sm">
            <Trash2 className="h-4 w-4" /> Danger Zone
          </h2>
          <p className="mt-1 text-xs text-rose-300/80 leading-relaxed">
            Deleting this project permanently removes its script, timeline progress, timestamped feedback, and every uploaded video, logo, and reference image.
            Client accounts are preserved so you can reassign them to other projects.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsConfirming(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-rose-900/70 bg-neutral-900/90 px-4 py-2.5 text-xs font-semibold text-rose-300 transition-colors hover:bg-rose-950 hover:border-rose-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 shadow-sm shrink-0"
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete project
        </button>
      </div>

      {isConfirming && (
        <DeleteProjectModal
          projectId={projectId}
          projectTitle={projectTitle}
          onClose={() => setIsConfirming(false)}
          onDeleted={() => { router.replace('/editor'); router.refresh(); }}
        />
      )}
    </section>
  );
}
