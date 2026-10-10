'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ActionRequiredBy, CreativeBrief, Deliverable, FeedbackNote, Project, ProjectStatus } from '@/types';
import { mockBrief, mockDeliverable, mockProject } from '@/lib/mock-data';
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
  postNewCut: (cut: { version: string; videoUrl: string; duration: number }) => void;
  setActionAlert: (actionBy: ActionRequiredBy, text: string) => void;
  updateScript: (brief: CreativeBrief) => void;
  addNote: (note: Omit<FeedbackNote, 'id' | 'created_at'>) => Promise<void>;
  approveCut: () => void;
  uploadSuccess: (fileName: string) => void;
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
      script_scenes: mockBrief.script_scenes.map((scene) => ({ ...scene })),
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

function withoutNotes(deliverable: Partial<Deliverable>): Partial<Omit<Deliverable, 'feedback_notes'>> {
  const { feedback_notes: _feedbackNotes, ...data } = deliverable;
  return data;
}

export const ProjectProvider: React.FC<{ children: React.ReactNode; projectId?: string }> = ({ children, projectId }) => {
  const { currentUser } = useAuth();
  const id = projectId ?? currentUser?.project_id ?? mockProject.project_id;
  const uid = currentUser?.user_id;
  const remote = isSupabaseConfigured && Boolean(uid) && Boolean(projectId ?? currentUser?.project_id) && !uid?.startsWith('usr_');
  const [project, setProject] = useState(() => makeInitialState(id, currentUser).project);
  const [brief, setBrief] = useState(() => makeInitialState(id, currentUser).brief);
  const [deliverable, setDeliverable] = useState(() => makeInitialState(id, currentUser).deliverable);
  const [ready, setReady] = useState<string | null>(null);
  const [pendingStatusSaves, setPendingStatusSaves] = useState(0);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let cancelled = false;
    const seed = makeInitialState(id, currentUser);
    setReady(null);

    const restore = async () => {
      if (!remote) {
        setProject(seed.project);
        setBrief(seed.brief);
        setDeliverable(seed.deliverable);
        setReady(id);
        return;
      }

      try {
        const [{ data: row, error }, { data: notes, error: notesError }] = await Promise.all([
          supabase.from('project_portal_state').select('state').eq('project_id', id).maybeSingle(),
          supabase.from('project_feedback_notes').select('id,author_name,timecode,content,created_at').eq('project_id', id).order('created_at', { ascending: false }),
        ]);
        if (error) throw error;
        if (notesError) throw notesError;
        if (cancelled) return;

        const state = row?.state as Partial<ProjectState> | null;
        const restoredDeliverable = state?.deliverable ?? seed.deliverable;
        setProject(state?.project ?? seed.project);
        setBrief(state?.brief ?? seed.brief);
        setDeliverable({
          ...restoredDeliverable,
          video_url: restoredDeliverable.video_url?.includes('sample-cut-guid') ? '' : restoredDeliverable.video_url,
          feedback_notes: (notes ?? []).filter((note) => note.id !== 'note_1') as FeedbackNote[],
        });

        // Newly created client workspaces already have a state row. This fallback
        // initializes older memberships without replacing an existing row.
        if (!row) {
          const { error: seedError } = await supabase.from('project_portal_state').upsert(
            { project_id: id, state: { ...seed, deliverable: withoutNotes(seed.deliverable) }, updated_by: uid },
            { onConflict: 'project_id', ignoreDuplicates: true },
          );
          if (seedError) throw seedError;
        }
        setReady(id);
      } catch (error) {
        console.error('Failed to restore project state from Supabase.', error);
      }
    };

    void restore();
    return () => { cancelled = true; };
  }, [id, uid, currentUser?.company_name, remote]);

  useEffect(() => {
    if (!remote || ready !== id) return;
    const channel = supabase
      .channel(`portal-${id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'project_portal_state', filter: `project_id=eq.${id}` }, (event) => {
        const state = (event.new as { state?: Partial<ProjectState> }).state;
        if (state?.project) setProject(state.project);
        if (state?.brief) setBrief(state.brief);
        if (state?.deliverable) {
          setDeliverable((current) => ({
            ...current,
            ...state.deliverable,
            feedback_notes: current.feedback_notes,
          } as Deliverable));
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'project_feedback_notes', filter: `project_id=eq.${id}` }, (event) => {
        const note = event.new as FeedbackNote;
        setDeliverable((current) => current.feedback_notes.some((existing) => existing.id === note.id)
          ? current
          : { ...current, feedback_notes: [note, ...current.feedback_notes] });
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [id, remote, ready]);

  const savePatch = (patch: ProjectStatePatch): Promise<void> => {
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
  };

  const saveStatus = (status: ProjectStatus) => {
    setPendingStatusSaves((count) => count + 1);
    void savePatch({ project: { status } }).finally(() => {
      setPendingStatusSaves((count) => Math.max(0, count - 1));
    });
  };

  const updateStatus = (status: ProjectStatus) => {
    setProject((current) => ({ ...current, status }));
    saveStatus(status);
  };

  const postNewCut = (cut: { version: string; videoUrl: string; duration: number }) => {
    const patch = {
      version_number: cut.version,
      video_url: cut.videoUrl,
      duration_seconds: cut.duration,
      uploaded_at: 'Just now by Editor',
      approval_status: 'Pending' as const,
      action_required_by: 'Client' as const,
      action_banner_text: `Review ${cut.version} and leave your notes below`,
    };
    setDeliverable((current) => ({ ...current, ...patch }));
    savePatch({ deliverable: patch });
    if (['Scripting', 'Pre-Production', 'Shooting'].includes(project.status)) {
      setProject((current) => ({ ...current, status: 'Editing' }));
      saveStatus('Editing');
    }
  };

  const setActionAlert = (actionBy: ActionRequiredBy, text: string) => {
    const patch = { action_required_by: actionBy, action_banner_text: text };
    setDeliverable((current) => ({ ...current, ...patch }));
    savePatch({ deliverable: patch });
  };

  const updateScript = (updated: CreativeBrief) => {
    setBrief(updated);
    savePatch({ brief: updated });
  };

  const addNote = async (note: Omit<FeedbackNote, 'id' | 'created_at'>) => {
    const newNote: FeedbackNote = { ...note, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    if (!remote) {
      setDeliverable((current) => ({ ...current, feedback_notes: [newNote, ...current.feedback_notes] }));
      return;
    }
    const { data, error } = await supabase.from('project_feedback_notes')
      .insert({ ...newNote, project_id: id })
      .select('id,author_name,timecode,content,created_at')
      .single();
    if (error) throw error;
    const savedNote = data as FeedbackNote;
    setDeliverable((current) => current.feedback_notes.some((existing) => existing.id === savedNote.id)
      ? current
      : { ...current, feedback_notes: [savedNote, ...current.feedback_notes] });
  };

  const uploadSuccess = (fileName: string) => {
    const patch = { action_required_by: 'None' as const, action_banner_text: `Logo file selected: ${fileName}. The editor has been notified.` };
    setDeliverable((current) => ({ ...current, ...patch }));
    savePatch({ deliverable: patch });
  };

  const approveCut = () => {
    const deliverablePatch = { approval_status: 'Approved' as const, action_required_by: 'None' as const, action_banner_text: 'The client approved this cut.' };
    setDeliverable((current) => ({ ...current, ...deliverablePatch }));
    setProject((current) => ({ ...current, status: 'Final Review' }));
    savePatch({ deliverable: deliverablePatch });
    saveStatus('Final Review');
  };

  return (
    <Context.Provider value={{ project, brief, deliverable, isProjectLoaded: ready === id, isStatusSaving: pendingStatusSaves > 0, updateStatus, postNewCut, setActionAlert, updateScript, addNote, approveCut, uploadSuccess }}>
      {children}
    </Context.Provider>
  );
};

export const useProject = () => {
  const context = useContext(Context);
  if (!context) throw new Error('useProject must be used within a ProjectProvider');
  return context;
};
