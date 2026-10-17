'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronDown, Plus, Trash2, UserPlus, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Member { email: string; display_name: string; company_name: string }

export function ProjectMembersManager({ projectId }: { projectId: string }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [availableUsers, setAvailableUsers] = useState<Member[]>([]);
  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  const [selectedEmail, setSelectedEmail] = useState('');
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
      setAvailableUsers(result.availableUsers ?? []);
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
        if (!cancelled) {
          setMembers(result.members ?? []);
          setAvailableUsers(result.availableUsers ?? []);
        }
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
      setSelectedEmail('');
      setMessage({ error: false, text: 'User added to this project.' });
      await loadMembers();
    } catch (error) {
      setMessage({ error: true, text: error instanceof Error ? error.message : 'Could not add this user.' });
    } finally { setSaving(false); }
  };

  const selectExistingUser = (email: string) => {
    setSelectedEmail(email);
    const user = availableUsers.find((entry) => entry.email === email);
    if (user) setForm({ name: user.display_name, email: user.email, companyName: user.company_name, password: '' });
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
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5 sm:p-6 backdrop-blur-sm">
      <div className="mb-4">
        <h2 className="font-semibold text-white">Project Users & Access</h2>
        <p className="mt-1 text-xs text-neutral-400">Add multiple client users or collaborators to this shared workspace.</p>
      </div>
      {loading ? (
        <p className="py-3 text-xs text-neutral-500">Loading project users…</p>
      ) : members.length ? (
        <ul className="mb-5 divide-y divide-neutral-800">
          {members.map((member) => (
            <li key={member.email} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="font-medium text-white text-sm">{member.display_name}</p>
                <p className="break-all text-xs text-neutral-400 font-mono mt-0.5">{member.email} · {member.company_name}</p>
              </div>
              <button
                type="button"
                onClick={() => void removeMember(member)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:border-rose-900 transition"
              >
                <Trash2 size={13} /> Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-5 rounded-xl border border-neutral-800 bg-neutral-950/70 p-3.5 text-xs text-neutral-400">
          No client users are assigned yet. Use the form below to grant access.
        </p>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMode('existing')}
          className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
            mode === 'existing'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'border border-neutral-800 bg-neutral-950 text-neutral-300 hover:bg-neutral-800'
          }`}
        >
          <Users size={14} /> Add existing user
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('new');
            setSelectedEmail('');
            setForm({ name: '', email: '', companyName: '', password: '' });
          }}
          className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
            mode === 'new'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'border border-neutral-800 bg-neutral-950 text-neutral-300 hover:bg-neutral-800'
          }`}
        >
          <Plus size={14} /> Create new user
        </button>
      </div>

      <form onSubmit={addMember} className="grid gap-3 sm:grid-cols-2">
        {mode === 'existing' ? (
          <label className="relative sm:col-span-2">
            <Users className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-400" />
            <select
              aria-label="Existing user"
              value={selectedEmail}
              onChange={(event) => selectExistingUser(event.target.value)}
              required
              className="w-full cursor-pointer appearance-none rounded-xl border border-neutral-800 bg-neutral-950 py-2.5 pl-10 pr-10 text-xs font-medium text-white outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Choose an existing client account</option>
              {availableUsers
                .filter((user) => !members.some((member) => member.email === user.email))
                .map((user) => (
                  <option key={user.email} value={user.email}>
                    {user.display_name} — {user.email}
                  </option>
                ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          </label>
        ) : (
          <>
            <input
              aria-label="User name"
              placeholder="Client full name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
              minLength={2}
              className="rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <input
              aria-label="User email"
              type="email"
              placeholder="Client email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              required
              className="rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <input
              aria-label="Company"
              placeholder="Company name"
              value={form.companyName}
              onChange={(event) => setForm({ ...form, companyName: event.target.value })}
              required
              minLength={2}
              className="rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <input
              aria-label="Password for a new user"
              type="password"
              placeholder="Client password (12+ characters)"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
              minLength={12}
              autoComplete="new-password"
              className="rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </>
        )}
        {mode === 'existing' && (
          <p className="text-[11px] text-neutral-400 sm:col-span-2">
            The selected client will keep their existing sign-in and gain instant access to this project.
          </p>
        )}
        {mode === 'new' && (
          <p className="text-[11px] text-neutral-400 sm:col-span-2">
            New client accounts need a secure password of at least 12 characters.
          </p>
        )}
        <button
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2.5 text-xs font-bold text-neutral-950 shadow-md transition hover:brightness-110 disabled:opacity-60 sm:col-span-2"
        >
          <UserPlus size={15} /> {saving ? 'Adding user…' : 'Add User to Project'}
        </button>
      </form>
      {message && (
        <p
          role={message.error ? 'alert' : 'status'}
          className={`mt-3 rounded-xl p-3 text-xs ${
            message.error
              ? 'border border-rose-900/50 bg-rose-950/40 text-rose-300'
              : 'border border-emerald-900/50 bg-emerald-950/40 text-emerald-300'
          }`}
        >
          {message.text}
        </p>
      )}
    </section>
  );
}
