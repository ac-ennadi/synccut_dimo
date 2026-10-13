'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useProject } from '@/context/ProjectContext';
import { ClientPortal } from '@/components/ClientPortal';
import { ArrowRight, BriefcaseBusiness, LogOut } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';

function ProjectChooser({ projectIds, projectTitles, currentProjectId, currentProjectTitle, clientName, onLogout }: { projectIds: string[]; projectTitles: Record<string, string>; currentProjectId: string; currentProjectTitle: string; clientName: string; onLogout: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpening, setIsOpening] = useState(false);
  const visibleProjects = projectIds.filter((projectId) => {
    const label = projectTitles[projectId] || (projectId === currentProjectId ? currentProjectTitle : `Project ${projectIds.indexOf(projectId) + 1}`);
    return label.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <main className="min-h-screen bg-neutral-100 p-4 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 sm:p-8">
      <div className="mx-auto w-full max-w-6xl space-y-7">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-5 dark:border-neutral-800">
          <div className="flex min-w-0 items-center gap-4">
            <BrandLogo variant="dark" className="h-10 w-[170px] shrink-0 object-contain object-left" />
            <div className="flex min-h-10 flex-col justify-center border-l border-neutral-200 pl-4 dark:border-neutral-800">
              <p className="text-[11px] font-semibold uppercase leading-4 tracking-[0.14em] text-indigo-500">Client</p>
              <h1 className="text-2xl font-bold leading-7">Projects</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-neutral-500 sm:inline">Signed in as {clientName}</span>
            <button type="button" onClick={onLogout} className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-900">
            <LogOut size={14} /> Sign out
            </button>
          </div>
        </header>
        <section className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Project workspaces</h2>
              <p className="mt-1 text-sm text-neutral-500">Choose the project you want to review and collaborate on.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-600 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-300">
              <BriefcaseBusiness size={14} /> {projectIds.length} {projectIds.length === 1 ? 'project' : 'projects'}
            </div>
          </div>
          <label className="flex w-full max-w-lg items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 dark:border-neutral-800 dark:bg-neutral-900">
            <span className="text-neutral-400">⌕</span>
            <input aria-label="Search projects" placeholder="Search projects" value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent py-3 text-sm outline-none" />
          </label>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleProjects.map((projectId) => {
              const index = projectIds.indexOf(projectId);
              const isCurrent = projectId === currentProjectId;
              const label = projectTitles[projectId] || (isCurrent ? currentProjectTitle : `Project ${index + 1}`);
              return (
                <button key={projectId} type="button" disabled={isOpening} onClick={() => { setIsOpening(true); router.push(`/client?project=${encodeURIComponent(projectId)}`); }} className="group relative flex min-h-48 w-full flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-400 hover:shadow-lg disabled:cursor-wait disabled:opacity-60 dark:border-neutral-800 dark:bg-neutral-900">
                  <span className="min-w-0">
                    <span className="mb-3 block text-[10px] font-bold uppercase tracking-wider text-neutral-500">Project {String(index + 1).padStart(2, '0')}</span>
                    <span className="block truncate text-lg font-bold text-neutral-900 dark:text-neutral-100">{label}</span>
                    {isCurrent && <span className="mt-1 block text-xs font-medium text-emerald-600 dark:text-emerald-400">Currently open</span>}
                  </span>
                  <span className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-4 text-xs text-neutral-500 dark:border-neutral-800">
                    <span>{isCurrent ? 'Continue review' : 'Open workspace'}</span>
                    <ArrowRight className="shrink-0 text-neutral-400 transition group-hover:translate-x-1 group-hover:text-indigo-500" size={18} />
                  </span>
                </button>
              );
            })}
          </div>
          {!visibleProjects.length && <p className="rounded-2xl border border-dashed border-neutral-300 py-12 text-center text-sm text-neutral-500 dark:border-neutral-700">No projects match your search.</p>}
        </section>
      </div>
      {isOpening && <ProjectLoadingScreen label="Opening project" />}
    </main>
  );
}

function ProjectLoadingScreen({ label = 'Loading project' }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-neutral-950/90 p-6 text-white backdrop-blur-sm" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-emerald-400/30 border-t-emerald-400" />
        <p className="text-sm font-semibold">{label}</p>
      </div>
    </div>
  );
}

export default function ClientPage() {
  const router = useRouter();
  const { currentUser, isLoading, logout } = useAuth();
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
  const projectTitles = currentUser?.project_titles ?? {};
  const selectedProjectId = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('project') : null;

  useEffect(() => {
    if (!isLoading && (!currentUser || currentUser.role !== 'Client')) {
      router.push('/client/login');
    }
  }, [currentUser, isLoading, router]);

  if (isLoading || !currentUser || currentUser.role !== 'Client' || !isProjectLoaded) {
    return (
      <ProjectLoadingScreen label={isLoading ? 'Loading your projects' : 'Loading project'} />
    );
  }

  if (!selectedProjectId || !projectIds.includes(selectedProjectId)) {
    return <ProjectChooser projectIds={projectIds} projectTitles={projectTitles} currentProjectId={project.project_id} currentProjectTitle={project.title} clientName={currentUser.name} onLogout={() => { logout(); router.push('/client/login'); }} />;
  }

  return (
    <ClientPortal
      key={selectedProjectId}
      project={project}
      brief={brief}
      deliverable={deliverable}
      onAddNote={addNote}
      onApproveCut={approveCut}
      onUploadSuccess={uploadSuccess}
    />
  );
}
