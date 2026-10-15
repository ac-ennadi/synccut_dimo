'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ActionRequiredBy, CreativeBrief, Deliverable, FeedbackNote, Project, ProjectStatus, ProjectType } from '@/types';
import { mockBrief, mockDeliverable, mockProject } from '@/lib/mock-data';
import { normalizeProjectStatus } from '@/lib/project-status';
import { normalizeProjectType } from '@/lib/project-type';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface ProjectState { project: Project; brief: CreativeBrief; deliverable: Deliverable }
interface ProjectStatePatch {
  project?: Partial<Project>;
  brief?: Partial<CreativeBrief>;
  deliverable?: Partial<Omit<Deliverable, 'feedback_notes'>>;
}
interface ContextValue extends ProjectState {
  isProjectLoaded: boolean;
  isStatusSaving: boolean;
  updateStatus: (status: ProjectStatus) => void;
  updateProjectType: (projectType: ProjectType) => void;
  updateProjectTitle: (title: string) => void;
  updateDueDate: (dueDate: string) => void;
  postNewCut: (cut: { version: string; videoUrl: string; videoStoragePath?: string; duration: number }) => void;
  setActionAlert: (actionBy: ActionRequiredBy, text: string) => void;
  updateScript: (brief: CreativeBrief) => void;
  addNote: (note: Omit<FeedbackNote, 'id' | 'created_at'>) => Promise<void>;
  approveCut: () => void;
  uploadSuccess: (fileName: string, storagePath: string) => void;
}

const Context = createContext<ContextValue | undefined>(undefined);

function makeInitialState(id: string, user: ReturnType<typeof useAuth>['currentUser']): ProjectState {
  return {
    project: {
      ...mockProject,
      project_id: id,
      client_id: user?.user_id ?? mockProject.client_id,
      title: user?.company_name ? `Project: ${user.company_name}` : mockProject.title,
    },
    brief: {
      ...mockBrief,
      brief_id: `brief_${id}`,
      project_id: id,
      version_label: 'Script draft',
      is_locked: false,
      target_audience: '',
      script_scenes: [],
      script_sections: [],
      references: mockBrief.references.map((reference) => ({ ...reference })),
    },
    deliverable: {
      ...mockDeliverable,
      deliverable_id: `deliverable_${id}`,
      project_id: id,
      video_url: '',
      feedback_notes: [],
      uploaded_at: 'No video uploaded yet',
    },
  };
}

// Feedback never lives inside the shared blob, so every write strips it out.
function withoutNotes(deliverable: Partial<Deliverable>): Partial<Omit<Deliverable, 'feedback_notes'>> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- named only to drop it
  const { feedback_notes: _feedbackNotes, ...data } = deliverable;
  return data;
}

/** Translates a failed feedback insert into an actionable, user-facing message. */
function describeFeedbackError(error: { message?: string; code?: string; details?: string | null }, email?: string, projectId?: string): string {
  const code = error.code ?? '';
  const message = error.message ?? '';
  if (/jwt|expired|token|sign in|401/i.test(message) || code === 'PGRST301') return 'Your session expired. Sign in again and retry your note.';
  if (/row-level security|policy|permission denied/i.test(message) || code === '42501') {
    return `You are signed in as ${email ?? 'this account'}, but the database is not letting this account add notes to project ${projectId ?? 'this project'}. This is usually a missing row-level-security policy — see the steps below.`;
  }
  if (/column .* does not exist|does not exist|PGRST204/i.test(message)) return 'The feedback table is missing a column from the latest migration. Ask the developer to run the feedback migrations.';
  if (/foreign key|violates|not present/i.test(message) || code === '23503') return 'This project is missing its state record, so notes cannot be attached to it. The editor should re-create the project.';
  return `Could not save your feedback: ${message || 'the server rejected it.'}`;
}

export const ProjectProvider: React.FC<{ children: React.ReactNode; projectId?: string }> = ({ children, projectId }) => {
  const { currentUser } = useAuth();
  const requestedProjectId = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('project')
    : null;
  const rawId = projectId ?? requestedProjectId ?? currentUser?.project_id ?? mockProject.project_id;
  // Strict sanitization: Project IDs must strictly contain only alphanumeric characters, underscores, or hyphens
  const id = /^[a-zA-Z0-9_-]{1,128}$/.test(rawId) ? rawId : mockProject.project_id;
  const uid = currentUser?.user_id;
  const companyName = currentUser?.company_name ?? '';
  const userProjectId = currentUser?.project_id;
  const stableUser = useMemo(() => currentUser, [
    uid,
    companyName,
    userProjectId,
    currentUser?.email,
    currentUser?.name,
    currentUser?.role,
  ]);
  const remote = isSupabaseConfigured && Boolean(uid) && Boolean(projectId ?? requestedProjectId ?? currentUser?.project_id) && !uid?.startsWith('usr_');
  const seedKey = `${id}|${companyName}|${uid ?? ''}`;
  const [state, setState] = useState<ProjectState>(() => makeInitialState(id, currentUser));
  const [ready, setReady] = useState<string | null>(null);
  const [pendingStatusSaves, setPendingStatusSaves] = useState(0);
  // Saves are chained so two quick edits can never be written out of order.
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const seededKey = useRef(seedKey);
  // Mirrors the live stage so action callbacks never read a stale closure value.
  const projectStatusRef = useRef(state.project.status);

  useEffect(() => {
    projectStatusRef.current = state.project.status;
  }, [state.project.status]);

  useEffect(() => {
    let cancelled = false;
    // The initial render already seeded this project for this user, so the seed
    // is only rebuilt when the project or the signed-in user actually changes.
    const needsSeed = seededKey.current !== seedKey;
    seededKey.current = seedKey;
    const seed = needsSeed ? makeInitialState(id, stableUser) : null;
    if (seed) setState(seed);
    setReady(null);

    const restore = async () => {
      // Do not expose seeded/mock data as loaded while a configured auth
      // session is still being resolved. Consumers will remain on their
      // loading screen until the real project data is available.
      if (isSupabaseConfigured && !stableUser) return;
      if (!remote) {
        if (seed) setState(seed);
        if (!cancelled) setReady(id);
        return;
      }
      const base = seed ?? makeInitialState(id, stableUser);
      try {
        const { data: row, error } = await supabase.from('project_portal_state').select('state').eq('project_id', id).maybeSingle();
        if (error) throw error;
        if (cancelled) return;

        const saved = row?.state as Partial<ProjectState> | null;
        const projectType = normalizeProjectType(saved?.project?.project_type);
        const restoredProject = { ...(saved?.project ?? base.project) };
        setState({
          project: { ...restoredProject, project_type: projectType, status: normalizeProjectStatus(restoredProject.status, projectType) },
          brief: saved?.brief ?? base.brief,
          deliverable: {
            ...(saved?.deliverable ?? base.deliverable),
            // A demo placeholder from an early version is not a real cut.
            video_url: saved?.deliverable?.video_url?.includes('sample-cut-guid') ? '' : saved?.deliverable?.video_url ?? '',
            feedback_notes: [],
          },
        });
        setReady(id);

        // Notes are non-blocking. The project workspace can render immediately
        // and the feedback list is filled in as soon as this lighter query ends.
        const { data: notes, error: notesError } = await supabase
          .from('project_feedback_notes')
          .select('id,author_name,timecode,content,created_at')
          .eq('project_id', id)
          .order('created_at', { ascending: false });
        if (notesError) {
          console.error('Failed to restore project feedback notes.', notesError);
        } else if (!cancelled) {
          setState((current) => ({
            ...current,
            deliverable: {
              ...current.deliverable,
              feedback_notes: (notes ?? []).filter((note) => note.id !== 'note_1') as FeedbackNote[],
            },
          }));
        }

        // Newly created client workspaces already have a state row. This fallback
        // initializes older memberships without replacing an existing row.
        if (!row) {
          const { error: seedError } = await supabase.from('project_portal_state').upsert(
            { project_id: id, state: { ...base, deliverable: withoutNotes(base.deliverable) }, updated_by: uid },
            { onConflict: 'project_id', ignoreDuplicates: true },
          );
          if (seedError) throw seedError;
        }
      } catch (error) {
        console.error('Failed to restore project state from Supabase.', error);
      }
    };

    void restore();
    return () => { cancelled = true; };
  }, [id, uid, companyName, userProjectId, stableUser, remote, seedKey]);

  useEffect(() => {
    if (!remote || ready !== id) return;
    const channel = supabase
      .channel(`portal-${id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'project_portal_state', filter: `project_id=eq.${id}` }, (event) => {
        const incoming = (event.new as { state?: Partial<ProjectState> }).state;
        if (!incoming) return;
        setState((current) => {
          const projectType = normalizeProjectType(incoming.project?.project_type ?? current.project.project_type);
          return {
            project: incoming.project
              ? { ...incoming.project, project_type: projectType, status: normalizeProjectStatus(incoming.project.status, projectType) }
              : current.project,
            brief: incoming.brief ?? current.brief,
            // Realtime rows never carry notes, so the local list stays authoritative.
            deliverable: incoming.deliverable ? { ...current.deliverable, ...incoming.deliverable } : current.deliverable,
          };
        });
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'project_feedback_notes', filter: `project_id=eq.${id}` }, (event) => {
        const note = event.new as FeedbackNote;
        setState((current) => current.deliverable.feedback_notes.some((existing) => existing.id === note.id)
          ? current
          : { ...current, deliverable: { ...current.deliverable, feedback_notes: [note, ...current.deliverable.feedback_notes] } });
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [id, remote, ready]);

  const savePatch = useCallback((patch: ProjectStatePatch): Promise<void> => {
    if (!remote || !uid || ready !== id) return Promise.resolve();
    const databasePatch = patch.deliverable
      ? { ...patch, deliverable: withoutNotes(patch.deliverable) }
      : patch;
    const request = saveQueue.current.then(async () => {
      const { error } = await supabase.rpc('merge_project_portal_state', { p_project_id: id, p_patch: databasePatch });
      if (error) console.error('Failed to save project changes to Supabase.', error);
    });
    saveQueue.current = request.catch((error) => {
      console.error('Failed to save project changes to Supabase.', error);
    });
    return request;
  }, [id, remote, ready, uid]);

  const saveProjectFields = useCallback((patch: Partial<Project>) => {
    setPendingStatusSaves((count) => count + 1);
    void savePatch({ project: patch }).finally(() => {
      setPendingStatusSaves((count) => Math.max(0, count - 1));
    });
  }, [savePatch]);

  const updateStatus = useCallback((status: ProjectStatus) => {
    setState((current) => ({ ...current, project: { ...current.project, status } }));
    saveProjectFields({ status });
  }, [saveProjectFields]);

  const updateProjectType = useCallback((projectType: ProjectType) => {
    const status = projectType === 'after_effects' && projectStatusRef.current === 'Shooting' ? 'Editing' : projectStatusRef.current;
    setState((current) => ({ ...current, project: { ...current.project, project_type: projectType, status } }));
    saveProjectFields({ project_type: projectType, status });
  }, [saveProjectFields]);

  const updateDueDate = useCallback((dueDate: string) => {
    setState((current) => ({ ...current, project: { ...current.project, due_date: dueDate } }));
    saveProjectFields({ due_date: dueDate });
  }, [saveProjectFields]);

  const updateProjectTitle = useCallback((title: string) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    setState((current) => ({ ...current, project: { ...current.project, title: trimmedTitle } }));
    saveProjectFields({ title: trimmedTitle });
  }, [saveProjectFields]);

  const postNewCut = useCallback((cut: { version: string; videoUrl: string; videoStoragePath?: string; duration: number }) => {
    const deliverablePatch = {
      version_number: cut.version,
      video_url: cut.videoUrl,
      video_storage_path: cut.videoStoragePath,
      duration_seconds: cut.duration,
      uploaded_at: 'Just now by Editor',
      approval_status: 'Pending' as const,
      action_required_by: 'Client' as const,
      action_banner_text: `Review ${cut.version} and leave your notes below`,
    };
    const advances = ['Scripting', 'Pre-Production', 'Shooting'].includes(projectStatusRef.current);
    const status = advances ? 'Editing' : projectStatusRef.current;
    // The cut and the stage advance are written as one merged patch instead of
    // one round trip per field.
    setState((current) => ({
      project: { ...current.project, status },
      brief: current.brief,
      deliverable: { ...current.deliverable, ...deliverablePatch },
    }));
    void savePatch({ deliverable: deliverablePatch, ...(advances ? { project: { status } } : {}) });
  }, [savePatch]);

  const setActionAlert = useCallback((actionBy: ActionRequiredBy, text: string) => {
    const patch = { action_required_by: actionBy, action_banner_text: text };
    setState((current) => ({ ...current, deliverable: { ...current.deliverable, ...patch } }));
    void savePatch({ deliverable: patch });
  }, [savePatch]);

  const updateScript = useCallback((brief: CreativeBrief) => {
    setState((current) => ({ ...current, brief }));
    void savePatch({ brief });
  }, [savePatch]);

  const addNote = useCallback(async (note: Omit<FeedbackNote, 'id' | 'created_at'>) => {
    const newNote: FeedbackNote = { ...note, author_email: currentUser?.email, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    if (!remote) {
      setState((current) => ({ ...current, deliverable: { ...current.deliverable, feedback_notes: [newNote, ...current.deliverable.feedback_notes] } }));
      return;
    }
    const { data, error } = await supabase.from('project_feedback_notes')
      .insert({ ...newNote, project_id: id })
      .select('id,author_name,timecode,content,created_at')
      .single();
    if (error) {
      // This is the one write that runs straight from the browser under row
      // level security, so the database message is the only way to tell a
      // missing policy apart from a missing column or an expired session.
      console.error('Failed to save feedback to Supabase.', {
        message: error.message, code: error.code, details: error.details, hint: error.hint,
        signedInAs: currentUser?.email, projectId: id,
      });
      throw new Error(describeFeedbackError(error, currentUser?.email, id));
    }
    const savedNote = data as FeedbackNote;
    setState((current) => current.deliverable.feedback_notes.some((existing) => existing.id === savedNote.id)
      ? current
      : { ...current, deliverable: { ...current.deliverable, feedback_notes: [savedNote, ...current.deliverable.feedback_notes] } });
  }, [currentUser?.email, id, remote]);

  const uploadSuccess = useCallback((fileName: string, storagePath: string) => {
    const patch = { logo_file_name: fileName, logo_storage_path: storagePath, action_required_by: 'None' as const, action_banner_text: `Logo received: ${fileName}. The editor can download it from this project.` };
    setState((current) => ({ ...current, deliverable: { ...current.deliverable, ...patch } }));
    void savePatch({ deliverable: patch });
  }, [savePatch]);

  const approveCut = useCallback(() => {
    const deliverablePatch = { approval_status: 'Approved' as const, action_required_by: 'None' as const, action_banner_text: 'The client approved this cut.' };
    setState((current) => ({
      project: { ...current.project, status: 'Final Review' },
      brief: current.brief,
      deliverable: { ...current.deliverable, ...deliverablePatch },
    }));
    void savePatch({ deliverable: deliverablePatch, project: { status: 'Final Review' } });
  }, [savePatch]);

  const value = useMemo<ContextValue>(() => ({
    ...state,
    isProjectLoaded: ready === id,
    isStatusSaving: pendingStatusSaves > 0,
    updateStatus,
    updateProjectTitle,
    updateDueDate,
    updateProjectType,
    postNewCut,
    setActionAlert,
    updateScript,
    addNote,
    approveCut,
    uploadSuccess,
  }), [state, ready, id, pendingStatusSaves, updateStatus, updateProjectType, updateProjectTitle, updateDueDate, postNewCut, setActionAlert, updateScript, addNote, approveCut, uploadSuccess]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const useProject = () => {
  const context = useContext(Context);
  if (!context) throw new Error('useProject must be used within a ProjectProvider');
  return context;
};
