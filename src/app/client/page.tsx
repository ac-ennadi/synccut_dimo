'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ProjectProvider, useProject } from '@/context/ProjectContext';
import { ClientPortal } from '@/components/ClientPortal';
import { ArrowRight } from 'lucide-react';
import { DashboardSearch, DashboardShell } from '@/components/dashboard/DashboardShell';

function ProjectLoadingScreen({ label = 'Loading project' }: { label?: string }) {
  const [isTakingLonger, setIsTakingLonger] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsTakingLonger(true), 9000);
    return () => window.clearTimeout(timeout);
  }, []);

  const isProject = /opening project workspace/i.test(label);
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
    <DashboardShell role="Client" name={clientName} onSignOut={onLogout}>
      <section className="space-y-8" aria-labelledby="client-projects-heading">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#707070]">Client portal</p>
          <h1 id="client-projects-heading" className="mt-3 text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-[#1d1d1f] sm:text-5xl">Your projects</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#707070] sm:text-base">Choose a project to watch the latest cut, share feedback, and follow delivery.</p>
        </div>
        <div className="space-y-5">
          <div className="flex flex-col gap-4 border-b border-[#d6d6d6] pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#1d1d1f]">Shared with you</h2>
              <p className="mt-1 text-sm text-[#707070]">{projectIds.length} {projectIds.length === 1 ? 'project' : 'projects'}</p>
            </div>
            <DashboardSearch
              label="Search projects"
              placeholder="Search your projects"
              value={query}
              onChange={setQuery}
            />
          </div>
          {visibleProjects.length > 0 ? (
            <div className="min-w-0 overflow-hidden rounded-[28px] border border-[#d6d6d6] bg-white">
              {visibleProjects.map((projectId) => {
                const index = projectIds.indexOf(projectId);
                const label = projectTitles[projectId] || `Project ${index + 1}`;
                return (
                  <button
                    key={projectId}
                    type="button"
                    disabled={isOpening}
                    onClick={() => onOpenProject(projectId)}
                    className="group flex min-h-[84px] min-w-0 w-full max-w-full items-center justify-between gap-5 border-b border-[#d6d6d6] px-5 py-5 text-left transition-colors last:border-b-0 hover:bg-[#fafafc] disabled:cursor-wait disabled:opacity-60 sm:min-h-[96px] sm:px-7"
                  >
                    <span className="min-w-0">
                      <span className="block text-xs font-medium text-[#707070]">Project {String(index + 1).padStart(2, '0')}</span>
                      <span className="mt-1 block min-w-0 break-words text-lg font-semibold leading-6 tracking-[-0.02em] text-[#1d1d1f] transition-colors group-hover:text-[#0066cc] sm:text-xl">
                        {label}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2 text-sm font-medium text-[#707070] transition-colors group-hover:text-[#0066cc]">
                      <span className="hidden sm:inline">Open project</span>
                      <ArrowRight className="shrink-0" size={18} />
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[28px] border border-[#d6d6d6] bg-white px-6 py-14 text-center sm:py-16">
              <h3 className="text-lg font-semibold text-[#1d1d1f]">{projectIds.length ? 'No matching projects' : 'No projects shared yet'}</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#707070]">{projectIds.length ? 'Try a different project name.' : 'When your editor shares a project with you, it will appear here.'}</p>
            </div>
          )}
        </div>
      </section>
      {isOpening && <ProjectLoadingScreen label="Opening project workspace…" />}
    </DashboardShell>
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
