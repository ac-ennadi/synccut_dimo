'use client';

import { useCallback, useEffect, useState } from 'react';
import { Trash2, UserPlus } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Member { email: string; display_name: string; company_name: string }

export function ProjectMembersManager({ projectId }: { projectId: string }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [form, setForm] = useState({ name: '', email: '', companyName: '', password: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ error: boolean; text: string } | null>(null);

  const request = useCallback(async (path: string, init?: RequestInit) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error('Your session expired. Sign in again.');
    const response = await fetch(path, {
      ...init,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...init?.headers },
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Could not update project users.');
    return result;
  }, []);

  const loadMembers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await request(`/api/editor/project-members?projectId=${encodeURIComponent(projectId)}`);
      setMembers(result.members ?? []);
    } catch (error) {
      setMessage({ error: true, text: error instanceof Error ? error.message : 'Could not load project users.' });
    } finally { setLoading(false); }
  }, [projectId, request]);

  // Defined inside the effect so the fetch is not triggered by a state update
  // during render, and so Vite/React can cancel it cleanly on unmount.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const result = await request(`/api/editor/project-members?projectId=${encodeURIComponent(projectId)}`);
        if (!cancelled) setMembers(result.members ?? []);
      } catch (error) {
        if (!cancelled) setMessage({ error: true, text: error instanceof Error ? error.message : 'Could not load project users.' });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [projectId, request]);

  const addMember = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await request('/api/editor/project-members', {
        method: 'POST',
        body: JSON.stringify({ projectId, ...form }),
      });
      setForm({ name: '', email: '', companyName: '', password: '' });
      setMessage({ error: false, text: 'User added to this project.' });
      await loadMembers();
    } catch (error) {
      setMessage({ error: true, text: error instanceof Error ? error.message : 'Could not add this user.' });
    } finally { setSaving(false); }
  };

  const removeMember = async (member: Member) => {
    if (!window.confirm(`Remove ${member.display_name} (${member.email}) from this project? If they have no other project access, their sign-in account will also be deleted. Shared project files and notes will remain.`)) return;
    setMessage(null);
    try {
      const result = await request('/api/editor/project-members', {
        method: 'DELETE',
        body: JSON.stringify({ projectId, email: member.email }),
      });
      setMembers((current) => current.filter((entry) => entry.email !== member.email));
      setMessage({ error: false, text: result.accountDeleted ? 'User removed and sign-in account deleted.' : 'User removed from this project.' });
    } catch (error) {
      setMessage({ error: true, text: error instanceof Error ? error.message : 'Could not remove this user.' });
    }
  };

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-4">
        <h2 className="font-semibold">Project users</h2>
        <p className="mt-1 text-sm text-neutral-500">Add multiple client users to this shared workspace.</p>
      </div>
      {loading ? <p className="py-3 text-sm text-neutral-500">Loading users…</p> : members.length ? (
        <ul className="mb-5 divide-y divide-neutral-100 dark:divide-neutral-800">
          {members.map((member) => (
            <li key={member.email} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="font-medium">{member.display_name}</p>
                <p className="break-all text-sm text-neutral-500">{member.email} · {member.company_name}</p>
              </div>
              <button type="button" onClick={() => void removeMember(member)} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950/30">
                <Trash2 size={14} /> Remove
              </button>
            </li>
          ))}
        </ul>
      ) : <p className="mb-5 rounded-xl bg-neutral-50 p-3 text-sm text-neutral-500 dark:bg-neutral-950">No client users are assigned yet.</p>}

      <form onSubmit={addMember} className="grid gap-3 sm:grid-cols-2">
        <input aria-label="User name" placeholder="User name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required minLength={2} className="rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-950" />
        <input aria-label="User email" type="email" placeholder="User email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required className="rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-950" />
        <input aria-label="Company" placeholder="Company" value={form.companyName} onChange={(event) => setForm({ ...form, companyName: event.target.value })} required minLength={2} className="rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-950" />
        <input aria-label="Password for a new user" type="password" placeholder="New account password (12+ characters)" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} minLength={form.password ? 12 : undefined} autoComplete="new-password" className="rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-950" />
        <p className="text-xs text-neutral-500 sm:col-span-2">Leave password blank to add an existing account. New accounts need a password of at least 12 characters.</p>
        <button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60 sm:col-span-2">
          <UserPlus size={16} /> {saving ? 'Adding…' : 'Add user to project'}
        </button>
      </form>
      {message && <p role={message.error ? 'alert' : 'status'} className={`mt-3 text-sm ${message.error ? 'text-rose-600' : 'text-emerald-600'}`}>{message.text}</p>}
    </section>
  );
}
