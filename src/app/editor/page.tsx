'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useProject } from '@/context/ProjectContext';
import { EditorDashboard } from '@/components/EditorDashboard';

export default function EditorPage() {
  const router = useRouter();
  const { currentUser, isLoading } = useAuth();
  const {
    project,
    brief,
    deliverable,
    updateStatus,
    postNewCut,
    setActionAlert,
    updateScript,
    addNote,
    approveCut,
    uploadSuccess,
  } = useProject();

  useEffect(() => {
    if (!isLoading && (!currentUser || currentUser.role !== 'Editor')) {
      router.push('/editor/login');
    }
  }, [currentUser, isLoading, router]);

  if (isLoading || !currentUser || currentUser.role !== 'Editor') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <EditorDashboard
      project={project}
      brief={brief}
      deliverable={deliverable}
      onStatusChange={updateStatus}
      onPostNewCut={postNewCut}
      onSetActionAlert={setActionAlert}
      onUpdateScript={updateScript}
      onAddNote={addNote}
      onApproveCut={approveCut}
      onUploadSuccess={uploadSuccess}
    />
  );
}
