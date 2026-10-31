'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ProjectProvider, useProject } from '@/context/ProjectContext';
import { ClientPortal } from '@/components/ClientPortal';
import { ArrowRight, BriefcaseBusiness, LogOut, Search } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';

function ProjectLoadingScreen({ label = 'Loading project' }: { label?: string }) {
  const [isTakingLonger, setIsTakingLonger] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsTakingLonger(true), 9000);
    return () => window.clearTimeout(timeout);
  }, []);

  const isProject = /project|workspace/i.test(label);
  const loadingLabel = isProject ? 'Verifying project access' : 'Loading assigned projects';

  return (
    <div className="apple-shell fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950/95 p-4 text-white" role="status" aria-live="polite">
      <div className="w-full max-w-md p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <div className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-[#d2d2d7] border-t-[#0071e3]" />
          <div className="min-w-0">
            <p className="text-base font-semibold">{label}</p>
            <p className="mt-1 text-sm text-neutral-500">{loadingLabel}</p>
          </div>
        </div>

        {isTakingLonger && (
          <div className="mt-6 space-y-3 border-t border-neutral-200 pt-4">
            <p className="text-sm font-semibold">Still loading</p>
            <p className="text-xs leading-5 text-neutral-400">
              Check your connection, then retry or sign in again.
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={() => window.location.reload()} className="rounded-full bg-[#0071e3] px-3 py-2 text-xs font-medium text-white hover:bg-[#0066cc]">
                Retry connection
              </button>
              <a href="/client/login" className="rounded-full border border-neutral-300 px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100">
                Sign in again
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectChooser({
  projectIds,
  projectTitles,
  clientName,
  onLogout,
  onOpenProject,
  isOpening,
}: {
  projectIds: string[];
  projectTitles: Record<string, string>;
  clientName: string;
  onLogout: () => void;
  onOpenProject: (id: string) => void;
  isOpening: boolean;
}) {
  const [query, setQuery] = useState('');
  const visibleProjects = projectIds.filter((projectId) => {
    const label = projectTitles[projectId] || `Project ${projectIds.indexOf(projectId) + 1}`;
    return label.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <main className="apple-shell min-h-screen w-full min-w-0 overflow-x-hidden bg-neutral-950 p-4 text-neutral-100 sm:p-8">
      <div className="mx-auto w-full min-w-0 max-w-6xl space-y-7">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-5">
          <div className="flex min-w-0 items-center gap-4">
            <Link href="/" aria-label="SyncCut home" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm">
              <BrandLogo variant="light" className="h-9 w-auto shrink-0 object-contain object-left" priority />
            </Link>
            <div className="flex min-h-10 flex-col justify-center border-l border-neutral-800 pl-4">
              <p className="text-[11px] font-semibold uppercase leading-4 tracking-[0.14em] text-emerald-400">Client</p>
              <h1 className="text-2xl font-bold leading-7 text-white">Project Workspaces</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-neutral-400 sm:inline">Signed in as {clientName}</span>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white transition shadow-sm"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </header>
        <section className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Your Projects</h2>
              <p className="mt-1 text-sm text-neutral-400">Choose the project you want to review and collaborate on.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/40 px-3 py-1.5 text-xs font-semibold text-emerald-400">
              <BriefcaseBusiness size={14} /> {projectIds.length} {projectIds.length === 1 ? 'project' : 'projects'}
            </div>
          </div>
          <label className="flex w-full max-w-lg items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/80 px-3.5 py-1 text-neutral-100 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
            <Search size={15} className="shrink-0 text-neutral-500" aria-hidden="true" />
            <input
              aria-label="Search projects"
              placeholder="Search projects by name..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full bg-transparent py-2.5 text-sm placeholder:text-neutral-500 outline-none"
            />
          </label>
          <div className="min-w-0 space-y-3">
            {visibleProjects.map((projectId) => {
              const index = projectIds.indexOf(projectId);
              const label = projectTitles[projectId] || `Project ${index + 1}`;
              return (
                <button
                  key={projectId}
                  type="button"
                  disabled={isOpening}
                  onClick={() => onOpenProject(projectId)}
                  className="group relative flex min-h-0 min-w-0 w-full max-w-full items-center justify-between gap-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 text-left transition-colors hover:border-[#9bc8f3] disabled:cursor-wait disabled:opacity-60"
                >
                  <span className="min-w-0">
                    <span className="mb-2 block text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                      Project {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="block min-w-0 break-words text-lg font-bold leading-6 text-white group-hover:text-emerald-300 transition-colors">
                      {label}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2 text-xs font-medium text-neutral-500 group-hover:text-[#0071e3]">
                    <span>Open</span>
                    <ArrowRight className="shrink-0 text-neutral-500 transition group-hover:translate-x-1 group-hover:text-emerald-400" size={17} />
                  </span>
                </button>
              );
            })}
          </div>
          {!visibleProjects.length && (
            <p className="rounded-2xl border border-dashed border-neutral-800 py-12 text-center text-sm text-neutral-500">
              No projects match your search.
            </p>
          )}
        </section>
      </div>
      {isOpening && <ProjectLoadingScreen label="Opening project workspace…" />}
    </main>
  );
}

function ClientWorkspace({ projectId }: { projectId: string }) {
  const {
    project,
    brief,
    deliverable,
    isProjectLoaded,
    projectLoadError,
    addNote,
    approveCut,
  } = useProject();

  if (!isProjectLoaded) {
    if (projectLoadError) {
      return (
        <main className="apple-shell flex min-h-screen items-center justify-center bg-neutral-950 p-6 text-neutral-100">
          <section className="w-full max-w-lg space-y-4 rounded-2xl border border-rose-900/50 bg-neutral-900/90 p-6 text-center shadow-xl backdrop-blur-md">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-950/60 border border-rose-800/40 text-rose-400 font-bold">
              !
            </div>
            <h1 className="text-lg font-bold text-white">Could not load the client project</h1>
            <p className="text-xs text-neutral-400 leading-relaxed">{projectLoadError}</p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-full bg-[#0071e3] px-4 py-2 text-xs font-medium text-white hover:bg-[#0066cc]"
              >
                Try again
              </button>
              <a href="/client/login" className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-800">
                Sign in again
              </a>
            </div>
          </section>
        </main>
      );
    }
    return <ProjectLoadingScreen label="Opening project workspace…" />;
  }

  return (
    <ClientPortal
      key={projectId}
      project={project}
      brief={brief}
      deliverable={deliverable}
      onAddNote={addNote}
      onApproveCut={approveCut}
    />
  );
}

function ClientPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, isLoading, logout } = useAuth();
  const [isOpeningProject, setIsOpeningProject] = useState(false);

  const projectIds = currentUser?.project_ids ?? (currentUser?.project_id ? [currentUser.project_id] : []);
  const projectTitles = currentUser?.project_titles ?? {};
  const selectedProjectId = searchParams.get('project');

  useEffect(() => {
    if (!isLoading && (!currentUser || currentUser.role !== 'Client')) {
      router.replace('/client/login');
    }
  }, [currentUser, isLoading, router]);

  // Reset opening flag when the selectedProjectId changes
  useEffect(() => {
    if (selectedProjectId) {
      setIsOpeningProject(false);
    }
  }, [selectedProjectId]);

  if (isLoading || !currentUser || currentUser.role !== 'Client') {
    return <ProjectLoadingScreen label="Loading your projects…" />;
  }

  if (!selectedProjectId || !projectIds.includes(selectedProjectId)) {
    return (
      <ProjectChooser
        projectIds={projectIds}
        projectTitles={projectTitles}
        clientName={currentUser.name}
        isOpening={isOpeningProject}
        onOpenProject={(projectId) => {
          setIsOpeningProject(true);
          router.push(`/client?project=${encodeURIComponent(projectId)}`);
        }}
        onLogout={() => {
          logout();
          router.replace('/client/login');
        }}
      />
    );
  }

  return (
    <ProjectProvider key={selectedProjectId} projectId={selectedProjectId}>
      <ClientWorkspace projectId={selectedProjectId} />
    </ProjectProvider>
  );
}

export default function ClientPage() {
  return (
    <Suspense fallback={<ProjectLoadingScreen label="Loading your projects…" />}>
      <ClientPageContent />
    </Suspense>
  );
}
