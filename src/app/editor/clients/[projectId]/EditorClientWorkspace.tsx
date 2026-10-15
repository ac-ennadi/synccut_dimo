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
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 ring-1 ring-indigo-400/20">
            <div className="h-5 w-5 rounded-md border-2 border-indigo-400/80" />
          </div>
          <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/3 animate-[loading-bar_1.8s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-indigo-400 to-blue-400" />
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
