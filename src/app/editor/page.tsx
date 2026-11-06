'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FolderPlus, ArrowUpRight, AlertCircle, CheckCircle2, Users, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { DeleteProjectModal } from '@/components/DeleteProjectModal';
import { DashboardSearch, DashboardShell } from '@/components/dashboard/DashboardShell';
import type { ProjectTemplateId, VideoAspectRatio } from '@/types';
import { getProjectTemplate, PROJECT_TEMPLATES } from '@/lib/project-templates';

interface ProjectRow {
  project_id: string;
  title: string;
  company_name: string;
  members: { email: string; display_name: string; company_name: string }[];
  projectType: 'after_effects' | 'premiere_pro';
  templateId: ProjectTemplateId;
  videoAspectRatio: VideoAspectRatio;
  status: string;
  latestCut: string;
}

function EditorLoadingScreen() {
  const [isTakingLonger, setIsTakingLonger] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsTakingLonger(true), 9000);
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <main className="apple-shell flex min-h-screen items-center justify-center bg-neutral-950 p-4 text-neutral-100">
      <section className="w-full max-w-md space-y-4 p-6 text-center sm:p-8" role="status" aria-live="polite">
        <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[#e6e6e8] border-t-[#0071e3]" />
        <div className="h-1 overflow-hidden rounded-full bg-[#e6e6e8]">
          <div className="h-full w-1/3 animate-[loading-bar_1.8s_ease-in-out_infinite] rounded-full bg-[#0071e3]" />
        </div>
        <div>
          <h1 className="text-base font-bold">Loading editor dashboard</h1>
          <p className="mt-1 text-xs text-neutral-400">Restoring your studio session and project workspaces</p>
        </div>
        {isTakingLonger && (
          <div className="space-y-3 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4 text-left">
            <p className="text-sm font-semibold">Still loading</p>
            <p className="text-xs leading-5 text-neutral-400">Check your connection, then retry or sign in again.</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => window.location.reload()} className="rounded-full bg-[#0071e3] px-3 py-2 text-xs font-medium text-white hover:bg-[#0066cc]">
                Retry connection
              </button>
              <a href="/editor/login" className="rounded-full border border-neutral-300 px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100">
                Sign in again
              </a>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default function EditorPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, isLoading, logout } = useAuth();
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [openingProjectId, setOpeningProjectId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [details, setDetails] = useState({ projectName: '', companyName: '', projectType: 'premiere_pro', templateId: 'brand_film' as ProjectTemplateId, videoAspectRatio: '16:9' as VideoAspectRatio });
  const [message, setMessage] = useState<{ error: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<ProjectRow | null>(null);

  useEffect(() => {
    if (pathname === '/editor') setOpeningProjectId(null);
  }, [pathname]);

  const loadProjects = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) { setLoading(false); return; }
    try {
      const response = await fetch('/api/editor/clients', { headers: { Authorization: `Bearer ${token}` } });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not load projects.');
      const loaded = result.projects ?? [];
      setProjects(loaded);
    } catch (error) {
      setMessage({ error: true, text: error instanceof Error ? error.message : 'Could not load projects.' });
    } finally { setLoading(false); }
  }, []);

  // Guards the initial load so a token refresh cannot trigger a second fetch.
  const loadedFor = useRef<string | null>(null);
  useEffect(() => {
    if (isLoading) return;
    if (!currentUser || currentUser.role !== 'Editor') { router.replace('/editor/login'); return; }
    if (loadedFor.current === currentUser.user_id) return;
    loadedFor.current = currentUser.user_id;
    void loadProjects();
  }, [currentUser, isLoading, router, loadProjects]);

  const createProject = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error('Your session expired. Sign in again.');
      const response = await fetch('/api/editor/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'create-project', ...details }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not create project.');
      setDetails({ projectName: '', companyName: '', projectType: 'premiere_pro', templateId: 'brand_film', videoAspectRatio: '16:9' });
      setMessage({ error: false, text: 'Project created. Add client users from the project workspace.' });
      setShowForm(false);
      await loadProjects();
    } catch (error) {
      setMessage({ error: true, text: error instanceof Error ? error.message : 'Could not create project.' });
    } finally { setSaving(false); }
  };

  if (isLoading || !currentUser || currentUser.role !== 'Editor') return <EditorLoadingScreen />;
  const normalizedQuery = query.toLowerCase();
  const filtered = projects.filter((project) => [project.title, project.company_name, ...project.members.flatMap((member) => [member.display_name, member.email])]
    .some((value) => value.toLowerCase().includes(normalizedQuery)));

  return (
    <DashboardShell role="Editor" name={currentUser.name} onSignOut={() => { logout(); router.replace('/editor/login'); }}>
      <section className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between" aria-labelledby="editor-projects-heading">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#707070]">Your workspace</p>
          <h1 id="editor-projects-heading" className="mt-3 text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-[#1d1d1f] sm:text-5xl">Projects</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#707070] sm:text-base">Keep client reviews, edit versions, and delivery details together.</p>
        </div>
          <button
            type="button"
            onClick={() => { setShowForm((current) => !current); setMessage(null); }}
            className="apple-primary inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-full bg-[#0071e3] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#0066cc] sm:self-auto"
          >
            <FolderPlus size={15} /> Create project
          </button>
      </section>

        {showForm && (
          <section className="rounded-[28px] border border-[#d6d6d6] bg-white p-5 sm:p-7" aria-labelledby="create-project-heading">
            <h2 id="create-project-heading" className="text-xl font-semibold text-[#1d1d1f]">Create a project</h2>
            <form onSubmit={createProject} className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                aria-label="Project name"
                placeholder="Project title (e.g. Nike Summer Anthem)"
                value={details.projectName}
                onChange={(event) => setDetails({ ...details, projectName: event.target.value })}
                required
                minLength={2}
                className="rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <input
                aria-label="Company name"
                placeholder="Client company (e.g. Nike Global)"
                value={details.companyName}
                onChange={(event) => setDetails({ ...details, companyName: event.target.value })}
                required
                minLength={2}
                className="rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <label className="grid gap-1.5 text-xs font-medium text-neutral-300 sm:col-span-2">
                Project template
                <select
                  aria-label="Project template"
                  value={details.templateId}
                  onChange={(event) => {
                    const template = getProjectTemplate(event.target.value);
                    setDetails({ ...details, templateId: template.id, projectType: template.projectType, videoAspectRatio: template.videoAspectRatio });
                  }}
                  className="rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 text-sm text-neutral-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {PROJECT_TEMPLATES.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
                </select>
                <span className="text-[11px] font-normal text-neutral-500">{getProjectTemplate(details.templateId).description} You can adjust the workflow and video format below.</span>
              </label>
              <label className="grid gap-1.5 text-xs font-medium text-neutral-300 sm:col-span-2">
                Project workflow type
                <select
                  aria-label="Project type"
                  value={details.projectType}
                  onChange={(event) => setDetails({ ...details, projectType: event.target.value as 'after_effects' | 'premiere_pro' })}
                  className="rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 text-sm text-neutral-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="premiere_pro">Premiere Pro — includes a shooting / production stage</option>
                  <option value="after_effects">After Effects — animation / motion graphics workflow</option>
                </select>
              </label>
              <fieldset className="grid gap-2 sm:col-span-2">
                <legend className="text-xs font-medium text-neutral-300">Video format</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {([
                    { value: '16:9', title: 'Landscape · 16:9', description: 'YouTube, websites, and widescreen video' },
                    { value: '9:16', title: 'Vertical · 9:16', description: 'Reels, TikTok, and Shorts' },
                  ] as const).map((option) => (
                    <label key={option.value} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors focus-within:ring-2 focus-within:ring-[#0071e3] ${details.videoAspectRatio === option.value ? 'border-[#0071e3] bg-[#0071e3]/10' : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700'}`}>
                      <input
                        type="radio"
                        name="videoAspectRatio"
                        value={option.value}
                        checked={details.videoAspectRatio === option.value}
                        onChange={() => setDetails({ ...details, videoAspectRatio: option.value })}
                        className="sr-only"
                      />
                      <span aria-hidden="true" className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${details.videoAspectRatio === option.value ? 'border-[#0071e3]/50' : 'border-neutral-800'}`}>
                        <span className={`rounded-[2px] border-2 ${details.videoAspectRatio === option.value ? 'border-[#0071e3]' : 'border-neutral-500'} ${option.value === '16:9' ? 'aspect-video w-7' : 'aspect-[9/16] h-7'}`} />
                      </span>
                      <span>
                        <span className="block text-sm font-medium text-neutral-100">{option.title}</span>
                        <span className="mt-0.5 block text-xs text-neutral-400">{option.description}</span>
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-[11px] text-neutral-500">This format is set for the project and can’t be changed after creation.</p>
              </fieldset>
              <button
                disabled={saving}
                className="apple-primary rounded-full bg-[#0071e3] px-4 py-2.5 text-xs font-medium text-white transition hover:bg-[#0066cc] disabled:opacity-60 sm:col-span-2"
              >
                {saving ? 'Creating project workspace…' : 'Create Project'}
              </button>
            </form>
          </section>
        )}

        {message && (
          <p role={message.error ? 'alert' : 'status'} className={`flex items-center gap-2 rounded-xl p-3 text-xs ${message.error ? 'border border-rose-900/50 bg-rose-950/40 text-rose-300' : 'border border-emerald-900/50 bg-emerald-950/40 text-emerald-300'}`}>
            {message.error ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
            <span>{message.text}</span>
          </p>
        )}

        <section aria-label="Project list" className="space-y-5">
          <div className="flex flex-col gap-4 border-b border-[#d6d6d6] pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#1d1d1f]">All projects</h2>
              <p className="mt-1 text-sm text-[#707070]">{loading ? 'Loading projects…' : `${filtered.length} ${filtered.length === 1 ? 'project' : 'projects'}`}</p>
            </div>
            <DashboardSearch
              label="Search projects and users"
              placeholder="Search by project, client, or member"
              value={query}
              onChange={setQuery}
            />
          </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-neutral-500">Loading projects…</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-[28px] border border-[#d6d6d6] bg-white px-6 py-14 text-center sm:py-16">
            <h3 className="text-lg font-semibold text-[#1d1d1f]">{projects.length ? 'No matching projects' : 'Your workspace is ready'}</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#707070]">{projects.length ? 'Try a different project, client, or member name.' : 'Create your first project to start sharing scripts, cuts, and review notes with a client.'}</p>
          </div>
        ) : (
          <div className="min-w-0 overflow-hidden rounded-[28px] border border-[#d6d6d6] bg-white">
            {filtered.map((project) => (
              <article
                key={project.project_id}
                className="group relative flex min-w-0 flex-col gap-4 border-b border-[#d6d6d6] px-5 py-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-6"
              >
                <Link
                  href={`/editor/clients/${encodeURIComponent(project.project_id)}`}
                  onClick={() => setOpeningProjectId(project.project_id)}
                  className="min-w-0 flex-1 rounded-md focus-visible:outline-none"
                >
                  <div className="flex min-w-0 items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[#707070]">{project.company_name || 'Project'}</p>
                      <h3 className="mt-1 truncate text-xl font-semibold tracking-[-0.025em] text-[#1d1d1f] transition-colors group-hover:text-[#0066cc]">{project.title}</h3>
                      <p className="mt-2 text-sm leading-5 text-[#707070]">{getProjectTemplate(project.templateId).name} <span aria-hidden="true">·</span> {project.projectType === 'after_effects' ? 'After Effects · Animation' : 'Premiere Pro · Live Action'} <span aria-hidden="true">·</span> {project.videoAspectRatio}</p>
                    </div>
                    <ArrowUpRight size={18} aria-hidden="true" className="mt-1 shrink-0 text-[#86868b] transition-colors group-hover:text-[#0066cc]" />
                  </div>
                </Link>
                <div className="flex min-w-0 flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#d6d6d6] pt-3 text-xs sm:max-w-[280px] sm:justify-end sm:border-0 sm:pt-0">
                  <span className="inline-flex items-center gap-1.5 text-[#707070]">
                    <Users size={14} aria-hidden="true" />
                    {project.members.length} {project.members.length === 1 ? 'member' : 'members'}
                  </span>
                  <span className="max-w-[180px] truncate text-[#86868b]" title={project.members.map((member) => member.display_name).join(', ') || 'No client members assigned'}>
                    {project.members.map((member) => member.display_name).join(', ') || 'No clients assigned'}
                  </span>
                  <span className="max-w-[160px] truncate text-[#86868b]">{project.latestCut}</span>
                  <span className="rounded-full bg-[#f5f5f7] px-2.5 py-1 font-medium text-[#424245]">{project.status}</span>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(project)}
                    aria-label={`Delete project ${project.title}`}
                    title="Delete project"
                    className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full text-[#86868b] transition-colors hover:bg-[#fff0f0] hover:text-[#b42318] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] sm:ml-0"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
        </section>

      {openingProjectId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950/90 p-6 text-white backdrop-blur-md" role="status" aria-live="polite">
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
      )}

      {pendingDelete && <DeleteProjectModal projectId={pendingDelete.project_id} projectTitle={pendingDelete.title} onClose={() => setPendingDelete(null)} onDeleted={(projectId) => { setProjects((current) => current.filter((project) => project.project_id !== projectId)); setPendingDelete(null); setMessage({ error: false, text: 'Project deleted. Client sign-in accounts were kept.' }); }} />}
    </DashboardShell>
  );
}
