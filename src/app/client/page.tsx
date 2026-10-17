'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ProjectProvider, useProject } from '@/context/ProjectContext';
import { ClientPortal } from '@/components/ClientPortal';
import { ArrowRight, BriefcaseBusiness, Check, Circle, LogOut, RefreshCw, ShieldCheck } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';

function ProjectLoadingScreen({ label = 'Loading project' }: { label?: string }) {
  const [isTakingLonger, setIsTakingLonger] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsTakingLonger(true), 9000);
    return () => window.clearTimeout(timeout);
  }, []);

  const isProject = /project|workspace/i.test(label);
  const steps = isProject
    ? ['Verifying project access', 'Loading project brief and deliverables', 'Preparing your review workspace']
    : ['Verifying your session', 'Loading assigned projects', 'Preparing your client portal'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950/95 p-4 text-white backdrop-blur-xl" role="status" aria-live="polite">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-emerald-950/30 sm:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/20 to-teal-500/10 ring-1 ring-emerald-300/20">
            <ShieldCheck className="h-6 w-6 text-emerald-300" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300">Secure connection</p>
            <p className="mt-1 text-base font-bold">{label}</p>
            <p className="mt-1 text-xs text-neutral-400">Securely connecting to your Supabase workspace</p>
          </div>
        </div>

        <div className="mt-7 space-y-3">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center gap-3 text-sm">
              {index === 0 ? <Check className="h-4 w-4 text-emerald-400" /> : <Circle className="h-3.5 w-3.5 text-neutral-600" />}
              <span className={index === 0 ? 'text-neutral-200' : 'text-neutral-500'}>{step}</span>
              {index === 0 && <RefreshCw className="ml-auto h-3.5 w-3.5 animate-spin text-emerald-400" />}
            </div>
          ))}
        </div>

        <div className="mt-7 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/3 animate-[loading-bar_1.8s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-emerald-400 to-teal-300" />
        </div>

        {isTakingLonger && (
          <div className="mt-6 space-y-3 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4">
            <p className="text-sm font-semibold text-amber-200">This is taking longer than expected</p>
            <p className="text-xs leading-5 text-neutral-400">
              Supabase may be waking up or your session may have expired. You can retry safely or sign in again.
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={() => window.location.reload()} className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500">
                Retry connection
              </button>
              <a href="/client/login" className="rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold text-neutral-200 hover:bg-white/10">
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
    <main className="min-h-screen w-full min-w-0 overflow-x-hidden bg-neutral-950 p-4 text-neutral-100 sm:p-8">
      <div className="mx-auto w-full min-w-0 max-w-6xl space-y-7">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-5">
          <div className="flex min-w-0 items-center gap-4">
            <Link href="/" aria-label="SyncCut home" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm">
              <BrandLogo variant="dark" className="h-9 w-auto shrink-0 object-contain object-left" priority />
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
            <span className="text-neutral-500">⌕</span>
            <input
              aria-label="Search projects"
              placeholder="Search projects by name..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full bg-transparent py-2.5 text-sm placeholder:text-neutral-500 outline-none"
            />
          </label>
          <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleProjects.map((projectId) => {
              const index = projectIds.indexOf(projectId);
              const label = projectTitles[projectId] || `Project ${index + 1}`;
              return (
                <button
                  key={projectId}
                  type="button"
                  disabled={isOpening}
                  onClick={() => onOpenProject(projectId)}
                  className="group relative flex min-h-48 min-w-0 w-full max-w-full flex-col justify-between overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 text-left shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-emerald-500/40 hover:bg-neutral-900/90 hover:shadow-lg disabled:cursor-wait disabled:opacity-60"
                >
                  <span className="min-w-0">
                    <span className="mb-2 block text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                      Project {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="block min-w-0 break-words text-lg font-bold leading-6 text-white group-hover:text-emerald-300 transition-colors">
                      {label}
                    </span>
                  </span>
                  <span className="mt-6 flex items-center justify-between border-t border-neutral-800/80 pt-4 text-xs font-semibold text-neutral-400 group-hover:text-neutral-300">
                    <span>Open workspace</span>
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
    uploadSuccess,
  } = useProject();

  if (!isProjectLoaded) {
    if (projectLoadError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-neutral-950 p-6 text-neutral-100">
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
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 shadow-sm"
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
      onUploadSuccess={uploadSuccess}
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
