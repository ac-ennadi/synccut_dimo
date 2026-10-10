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
    project, brief, deliverable, isProjectLoaded, isStatusSaving, updateStatus, postNewCut,
    setActionAlert, updateScript, addNote, approveCut, uploadSuccess,
  } = useProject();

  useEffect(() => {
    if (!isLoading && (!currentUser || currentUser.role !== 'Editor')) router.replace('/editor/login');
  }, [currentUser, isLoading, router]);

  if (isLoading || !currentUser || currentUser.role !== 'Editor' || !isProjectLoaded) {
    return <div className="min-h-screen flex items-center justify-center bg-neutral-950"><div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" /></div>;
  }

  return <EditorDashboard project={project} brief={brief} deliverable={deliverable} isStatusSaving={isStatusSaving} onStatusChange={updateStatus}
    onPostNewCut={postNewCut} onSetActionAlert={setActionAlert} onUpdateScript={updateScript}
    onAddNote={addNote} onApproveCut={approveCut} onUploadSuccess={uploadSuccess} />;
}

export default function EditorClientWorkspace({ projectId }: { projectId: string }) {
  return <ProjectProvider key={projectId} projectId={projectId}><Workspace /></ProjectProvider>;
}
