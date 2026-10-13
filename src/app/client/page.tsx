'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useProject } from '@/context/ProjectContext';
import { ClientPortal } from '@/components/ClientPortal';
import { ArrowRight, BriefcaseBusiness, LogOut } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';

function ProjectChooser({ projectIds, currentProjectId, currentProjectTitle }: { projectIds: string[]; currentProjectId: string; currentProjectTitle: string }) {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-neutral-100 p-4 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 sm:p-8">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <header className="flex items-center justify-between border-b border-neutral-200 pb-5 dark:border-neutral-800">
          <BrandLogo variant="dark" className="h-9 w-[170px] object-contain object-left" />
          <button type="button" onClick={() => router.push('/client/login')} className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold dark:border-neutral-800 dark:bg-neutral-900">
            <LogOut size={14} /> Sign out
          </button>
        </header>
        <section className="mx-auto max-w-2xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"><BriefcaseBusiness size={22} /></div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-500">Client workspace</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Choose a project to review</h1>
            <p className="mt-3 text-sm leading-6 text-neutral-500">Select the project you are working on. You can return here anytime to switch projects.</p>
          </div>
          <div className="grid gap-3">
            {projectIds.map((projectId, index) => {
              const isCurrent = projectId === currentProjectId;
              const label = isCurrent ? currentProjectTitle : `Project ${index + 1}`;
              return (
                <button key={projectId} type="button" onClick={() => router.push(`/client?project=${encodeURIComponent(projectId)}`)} className="group flex w-full items-center justify-between rounded-2xl border border-neutral-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-400 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
                  <span className="min-w-0">
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-indigo-500">Project {String(index + 1).padStart(2, '0')}</span>
                    <span className="block truncate text-base font-bold text-neutral-900 dark:text-neutral-100">{label}</span>
                    {isCurrent && <span className="mt-1 block text-xs font-medium text-emerald-600 dark:text-emerald-400">Currently open</span>}
                  </span>
                  <ArrowRight className="shrink-0 text-neutral-400 transition group-hover:translate-x-1 group-hover:text-indigo-500" size={18} />
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

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
  const projectIds = currentUser?.project_ids ?? (currentUser?.project_id ? [currentUser.project_id] : []);
  const selectedProjectId = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('project') : null;

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

  if (projectIds.length > 1 && !selectedProjectId) {
    return <ProjectChooser projectIds={projectIds} currentProjectId={project.project_id} currentProjectTitle={project.title} />;
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
