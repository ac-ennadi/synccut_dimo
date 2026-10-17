'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, FolderPlus, LogOut, ArrowUpRight, AlertCircle, CheckCircle2, Users, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { DeleteProjectModal } from '@/components/DeleteProjectModal';
import { BrandLogo } from '@/components/BrandLogo';

interface ProjectRow {
  project_id: string;
  title: string;
  company_name: string;
  members: { email: string; display_name: string; company_name: string }[];
  projectType: 'after_effects' | 'premiere_pro';
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
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 p-4 text-neutral-100">
      <section className="w-full max-w-md space-y-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-center shadow-2xl shadow-indigo-950/30 sm:p-8" role="status" aria-live="polite">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 ring-1 ring-indigo-400/20">
          <div className="h-6 w-6 rounded-lg border-2 border-indigo-400/80" />
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/3 animate-[loading-bar_1.8s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-indigo-400 to-blue-400" />
        </div>
        <div>
          <h1 className="text-base font-bold">Loading editor dashboard</h1>
          <p className="mt-1 text-xs text-neutral-400">Restoring your studio session and project workspaces</p>
        </div>
        {isTakingLonger && (
          <div className="space-y-3 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4 text-left">
            <p className="text-sm font-semibold text-amber-200">This is taking longer than expected</p>
            <p className="text-xs leading-5 text-neutral-400">Supabase may be waking up or your session may have expired. Retry safely or sign in again.</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => window.location.reload()} className="rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500">
                Retry connection
              </button>
              <a href="/editor/login" className="rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold text-neutral-200 hover:bg-white/10">
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
  const { currentUser, isLoading, logout } = useAuth();
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [openingProjectId, setOpeningProjectId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [details, setDetails] = useState({ projectName: '', companyName: '', projectType: 'premiere_pro' });
  const [message, setMessage] = useState<{ error: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<ProjectRow | null>(null);

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
      setDetails({ projectName: '', companyName: '', projectType: 'premiere_pro' });
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
    <main className="min-h-screen w-full min-w-0 overflow-x-hidden bg-neutral-950 p-4 text-neutral-100 sm:p-8">
      <div className="mx-auto w-full min-w-0 max-w-6xl space-y-7">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-5">
          <div className="flex min-w-0 items-center gap-4">
            <Link href="/" aria-label="SyncCut home" className="shrink-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
              <BrandLogo variant="dark" className="h-9 w-auto shrink-0 object-contain object-left" priority />
            </Link>
            <div className="flex min-h-10 flex-col justify-center border-l border-neutral-800 pl-4">
              <p className="text-[11px] font-semibold uppercase leading-4 tracking-[0.14em] text-indigo-400">Editor</p>
              <h1 className="text-2xl font-bold leading-7 text-white">Project Cockpit</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-neutral-400 sm:inline">Signed in as {currentUser.name}</span>
            <button
              type="button"
              onClick={() => { logout(); router.replace('/editor/login'); }}
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white transition shadow-sm"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </header>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Active Projects</h2>
            <p className="mt-1 text-sm text-neutral-400">Create client projects, manage versions, and control access permissions.</p>
          </div>
          <button
            type="button"
            onClick={() => { setShowForm((current) => !current); setMessage(null); }}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2.5 text-xs font-bold text-neutral-950 shadow-md shadow-emerald-500/20 transition hover:brightness-110 active:scale-98"
          >
            <FolderPlus size={15} /> Create project
          </button>
        </div>

        {showForm && (
          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 sm:p-6 shadow-xl backdrop-blur-md">
            <h3 className="font-semibold text-white">Create a New Project Workspace</h3>
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
              <button
                disabled={saving}
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2.5 text-xs font-bold text-neutral-950 shadow-md transition hover:brightness-110 disabled:opacity-60 sm:col-span-2"
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

        <label className="flex max-w-lg items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/80 px-3.5 py-1 text-neutral-100 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
          <Search size={16} className="text-neutral-500" />
          <input
            aria-label="Search projects and users"
            placeholder="Search projects by name, company, or team members..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full bg-transparent py-2.5 text-sm placeholder:text-neutral-500 outline-none"
          />
        </label>

        {loading ? (
          <div className="py-16 text-center text-sm text-neutral-500">Loading projects…</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-800 py-16 text-center">
            <h3 className="font-semibold text-white">{projects.length ? 'No matching projects found' : 'No projects created yet'}</h3>
            <p className="mt-1 text-xs text-neutral-400">{projects.length ? 'Try another search term.' : 'Click "Create project" above to set up your first workspace.'}</p>
          </div>
        ) : (
          <section className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((project) => (
              <article
                key={project.project_id}
                className="group relative min-w-0 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60 transition-all hover:border-indigo-500/50 hover:bg-neutral-900/90 hover:shadow-xl backdrop-blur-sm"
              >
                <button
                  type="button"
                  onClick={() => setPendingDelete(project)}
                  aria-label={`Delete project ${project.title}`}
                  title="Delete project"
                  className="absolute right-3 top-3 z-10 rounded-lg p-2 text-neutral-500 transition-colors hover:bg-rose-950/50 hover:text-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                >
                  <Trash2 size={15} />
                </button>
                <Link
                  href={`/editor/clients/${encodeURIComponent(project.project_id)}`}
                  onClick={() => setOpeningProjectId(project.project_id)}
                  className="block p-5 focus-visible:outline-none"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 pr-8">
                      <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">{project.company_name || 'Project'}</p>
                      <h3 className="mt-1 truncate text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">{project.title}</h3>
                      <p className="mt-1.5 text-xs font-semibold text-indigo-400">{project.projectType === 'after_effects' ? 'After Effects • Animation' : 'Premiere Pro • Live Action'}</p>
                    </div>
                    <ArrowUpRight size={17} className="shrink-0 text-neutral-500 group-hover:text-indigo-400 transition" />
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-neutral-400">
                    <Users size={14} className="text-neutral-500" />
                    <span>{project.members.length} {project.members.length === 1 ? 'member' : 'members'}</span>
                  </div>
                  <p className="mt-1 min-h-4 truncate text-[11px] text-neutral-500">
                    {project.members.map((member) => member.display_name).join(', ') || 'No client members assigned yet'}
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t border-neutral-800/80 pt-3.5 text-xs">
                    <span className="rounded-full bg-neutral-800 px-2.5 py-0.5 text-[11px] font-medium text-neutral-300 border border-neutral-700/50">
                      {project.status}
                    </span>
                    <span className="max-w-[55%] truncate font-mono text-[11px] text-neutral-400">
                      {project.latestCut}
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </section>
        )}
      </div>

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
    </main>
  );
}
