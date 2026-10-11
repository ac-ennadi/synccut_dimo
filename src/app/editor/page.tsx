'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, FolderPlus, LogOut, ArrowUpRight, AlertCircle, CheckCircle2, Clapperboard, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface ProjectRow {
  project_id: string;
  title: string;
  company_name: string;
  members: { email: string; display_name: string; company_name: string }[];
  projectType: 'after_effects' | 'premiere_pro';
  status: string;
  latestCut: string;
}

export default function EditorPage() {
  const router = useRouter();
  const { currentUser, isLoading, logout } = useAuth();
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [details, setDetails] = useState({ projectName: '', companyName: '', projectType: 'premiere_pro' });
  const [message, setMessage] = useState<{ error: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const loadProjects = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) { setLoading(false); return; }
    try {
      const response = await fetch('/api/editor/clients', { headers: { Authorization: `Bearer ${token}` } });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not load projects.');
      setProjects(result.projects ?? []);
    } catch (error) {
      setMessage({ error: true, text: error instanceof Error ? error.message : 'Could not load projects.' });
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!isLoading && (!currentUser || currentUser.role !== 'Editor')) router.replace('/editor/login');
    if (currentUser?.role === 'Editor') void loadProjects();
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

  if (isLoading || !currentUser || currentUser.role !== 'Editor') return <div className="flex min-h-screen items-center justify-center bg-neutral-950"><div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" /></div>;
  const normalizedQuery = query.toLowerCase();
  const filtered = projects.filter((project) => [project.title, project.company_name, ...project.members.flatMap((member) => [member.display_name, member.email])]
    .some((value) => value.toLowerCase().includes(normalizedQuery)));

  return (
    <main className="min-h-screen bg-neutral-100 p-4 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 sm:p-8">
      <div className="mx-auto max-w-6xl space-y-7">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-5 dark:border-neutral-800">
          <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white"><Clapperboard size={21} /></div><div><p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">SyncCut · Editor</p><h1 className="text-2xl font-bold">Projects</h1></div></div>
          <div className="flex items-center gap-2"><span className="hidden text-sm text-neutral-500 sm:inline">Signed in as {currentUser.name}</span><button onClick={() => { logout(); router.push('/editor/login'); }} className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-900"><LogOut size={15} />Sign out</button></div>
        </header>

        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">Project workspaces</h2><p className="mt-1 text-sm text-neutral-500">Create a project, then add everyone who needs access to its shared workspace.</p></div><button onClick={() => { setShowForm((current) => !current); setMessage(null); }} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"><FolderPlus size={16} />Create project</button></div>

        {showForm && <section className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"><h3 className="font-semibold">Create a project</h3><form onSubmit={createProject} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input aria-label="Project name" placeholder="Project name" value={details.projectName} onChange={(event) => setDetails({ ...details, projectName: event.target.value })} required minLength={2} className="rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-950" />
          <input aria-label="Company name" placeholder="Company name" value={details.companyName} onChange={(event) => setDetails({ ...details, companyName: event.target.value })} required minLength={2} className="rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-950" />
          <label className="grid gap-1 text-xs font-medium text-neutral-600 dark:text-neutral-300 sm:col-span-2">Project type<select aria-label="Project type" value={details.projectType} onChange={(event) => setDetails({ ...details, projectType: event.target.value })} className="rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"><option value="premiere_pro">Premiere Pro — includes a shooting stage</option><option value="after_effects">After Effects — skips the shooting stage</option></select></label>
          <button disabled={saving} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60 sm:col-span-2">{saving ? 'Creating…' : 'Create project'}</button>
        </form></section>}
        {message && <p role={message.error ? 'alert' : 'status'} className={`flex items-center gap-2 text-sm ${message.error ? 'text-rose-600' : 'text-emerald-600'}`}>{message.error ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}{message.text}</p>}

        <label className="flex max-w-lg items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 dark:border-neutral-800 dark:bg-neutral-900"><Search size={17} className="text-neutral-400" /><input aria-label="Search projects and users" placeholder="Search projects or users" value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent py-3 text-sm outline-none" /></label>

        {loading ? <div className="py-16 text-center text-sm text-neutral-500">Loading projects…</div> : filtered.length === 0 ? <div className="rounded-2xl border border-dashed border-neutral-300 py-16 text-center dark:border-neutral-700"><h3 className="font-semibold">{projects.length ? 'No matching projects' : 'No projects yet'}</h3><p className="mt-1 text-sm text-neutral-500">{projects.length ? 'Try another search.' : 'Create a project, then add its users.'}</p></div> : (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map((project) => <Link key={project.project_id} href={`/editor/clients/${encodeURIComponent(project.project_id)}`} className="group rounded-2xl border border-neutral-200 bg-white p-5 transition hover:border-indigo-400 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{project.company_name || 'Project'}</p><h3 className="mt-1 truncate text-lg font-semibold">{project.title}</h3><p className="mt-2 text-xs font-semibold text-indigo-500">{project.projectType === 'after_effects' ? 'After Effects' : 'Premiere Pro'}</p></div><ArrowUpRight size={18} className="shrink-0 text-neutral-400 group-hover:text-indigo-500" /></div>
            <div className="mt-4 flex items-center gap-2 text-sm text-neutral-500"><Users size={15} /><span>{project.members.length} {project.members.length === 1 ? 'user' : 'users'}</span></div>
            <p className="mt-1 min-h-5 truncate text-xs text-neutral-500">{project.members.map((member) => member.display_name).join(', ') || 'No users added yet'}</p>
            <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-4 text-sm dark:border-neutral-800"><span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs dark:bg-neutral-800">{project.status}</span><span className="max-w-[55%] truncate text-neutral-500">{project.latestCut}</span></div>
          </Link>)}</section>
        )}
      </div>
    </main>
  );
}
