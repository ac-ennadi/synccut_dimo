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
    <section className="rounded-2xl border border-rose-200 bg-rose-50/50 p-5 dark:border-rose-900/60 dark:bg-rose-950/20">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 font-semibold text-rose-800 dark:text-rose-300">
            <Trash2 className="h-4 w-4" /> Danger zone
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-rose-700/80 dark:text-rose-300/80">
            Deleting this project removes its script, progress, feedback, and every uploaded video, logo, and reference image.
            Client sign-in accounts are kept so you can add those people to another project.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsConfirming(true)}
          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-rose-300 bg-white px-4 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:border-rose-800 dark:bg-neutral-900 dark:text-rose-300 dark:hover:bg-rose-700 dark:hover:text-white"
        >
          <Trash2 className="h-4 w-4" /> Delete project
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
