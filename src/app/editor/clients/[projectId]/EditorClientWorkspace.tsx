'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProjectProvider, useProject } from '@/context/ProjectContext';
import { useAuth } from '@/context/AuthContext';
import { EditorDashboard } from '@/components/EditorDashboard';

function Workspace() {
  const router = useRouter();
  const { currentUser, isLoading } = useAuth();
  const {
    project, brief, deliverable, isProjectLoaded, isStatusSaving, updateProjectType, updateProjectTitle, updateDueDate, updateStatus, postNewCut,
    setActionAlert, updateScript, addNote, approveCut, uploadSuccess,
  } = useProject();

  useEffect(() => {
    if (!isLoading && (!currentUser || currentUser.role !== 'Editor')) router.replace('/editor/login');
  }, [currentUser, isLoading, router]);

  if (isLoading || !currentUser || currentUser.role !== 'Editor' || !isProjectLoaded) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950 p-6 text-white backdrop-blur-md" role="status" aria-live="polite">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative flex h-12 w-12 items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20" />
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold">Opening project workspace…</p>
            <p className="text-xs text-neutral-400">Loading timeline, cut versions, and team notes</p>
          </div>
        </div>
      </div>
    );
  }

  return <EditorDashboard project={project} brief={brief} deliverable={deliverable} isStatusSaving={isStatusSaving} onProjectTypeChange={updateProjectType} onProjectTitleChange={updateProjectTitle} onDueDateChange={updateDueDate} onStatusChange={updateStatus}
    onPostNewCut={postNewCut} onSetActionAlert={setActionAlert} onUpdateScript={updateScript}
    onAddNote={addNote} onApproveCut={approveCut} onUploadSuccess={uploadSuccess} />;
}

export default function EditorClientWorkspace({ projectId }: { projectId: string }) {
  return <ProjectProvider key={projectId} projectId={projectId}><Workspace /></ProjectProvider>;
}
