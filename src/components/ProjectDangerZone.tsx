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
    <section className="rounded-2xl border border-[#f1c7c5] bg-[#fff5f5] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 max-w-2xl">
          <h2 className="flex items-center gap-2 font-semibold text-[#b42318] text-sm">
            <Trash2 className="h-4 w-4" /> Danger Zone
          </h2>
          <p className="mt-1 text-xs text-[#5f5555] leading-relaxed">
            Deleting this project permanently removes its script, timeline progress, timestamped feedback, and every uploaded video, logo, and reference image.
            Client accounts are preserved so you can reassign them to other projects.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsConfirming(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-[#e2aaa7] bg-white px-4 py-2.5 text-xs font-semibold text-[#b42318] transition-colors hover:border-[#b42318] hover:bg-[#fff0f0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 shrink-0"
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
