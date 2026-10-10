'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useProject } from '@/context/ProjectContext';
import { ClientPortal } from '@/components/ClientPortal';

export default function ClientPage() {
  const router = useRouter();
  const { currentUser, isLoading } = useAuth();
  const {
    project,
    brief,
    deliverable,
    isProjectLoaded,
    addNote,
    approveCut,
    uploadSuccess,
  } = useProject();

  useEffect(() => {
    if (!isLoading && (!currentUser || currentUser.role !== 'Client')) {
      router.push('/client/login');
    }
  }, [currentUser, isLoading, router]);

  if (isLoading || !currentUser || currentUser.role !== 'Client' || !isProjectLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-950">
        <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <ClientPortal
      project={project}
      brief={brief}
      deliverable={deliverable}
      onAddNote={addNote}
      onApproveCut={approveCut}
      onUploadSuccess={uploadSuccess}
    />
  );
}
