'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ActionRequiredBy, CreativeBrief, Deliverable, FeedbackNote, FeedbackStatus, FinalHandoff, Project, ProjectStatus, ProjectType, PublishChecklistItem, ScriptBlockType } from '@/types';
import { mockBrief, mockDeliverable, mockProject } from '@/lib/mock-data';
import { createPublishChecklist, PROJECT_TEMPLATES } from '@/lib/project-templates';
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
  projectLoadError: string | null;
  isStatusSaving: boolean;
  updateStatus: (status: ProjectStatus) => void;
  updateProjectType: (projectType: ProjectType) => void;
  updateProjectTitle: (title: string) => void;
  updateDueDate: (dueDate: string) => void;
  updatePublishChecklist: (items: PublishChecklistItem[]) => void;
  updateFinalHandoff: (handoff: FinalHandoff) => void;
  postNewCut: (cut: { version: string; videoUrl: string; videoStoragePath?: string; duration: number }) => void;
  setActionAlert: (actionBy: ActionRequiredBy, text: string) => void;
  updateScript: (brief: CreativeBrief) => void;
  addNote: (note: Omit<FeedbackNote, 'id' | 'created_at'>) => Promise<void>;
  updateFeedbackStatus: (noteId: string, status: FeedbackStatus) => Promise<void>;
  approveCut: () => void;
}

const Context = createContext<ContextValue | undefined>(undefined);

// High-speed in-memory project cache for instant switching and navigation
const projectStateCache = new Map<string, ProjectState>();

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

  if (/column .* does not exist|does not exist|PGRST204/i.test(message)) return 'The feedback table is missing a column. Apply supabase/migrations/20261102_editor_workflows.sql in the Supabase SQL Editor, then reload this project.';
  if (/foreign key|violates|not present/i.test(message) || code === '23503') return 'This project is missing its state record, so notes cannot be attached to it. The editor should re-create the project.';
  return `Could not save your feedback: ${message || 'the server rejected it.'}`;
}

function describeProjectLoadError(error: { message?: string; code?: string }): string {
  const message = error.message ?? '';
  const code = error.code ?? '';
  if (/jwt|expired|token|unauthorized|authentication/i.test(message) || code === 'PGRST301') {
    return 'Your Supabase session expired. Sign in again to open this project.';
  }
  if (/row-level security|permission denied|not allowed/i.test(message) || code === '42501') {
    return 'Your account does not have access to this project. Ask the editor to verify the project membership.';
  }
  if (/relation .* does not exist|schema cache|column .* does not exist/i.test(message) || code === '42P01' || code === 'PGRST204') {
    return 'The Supabase database is missing a required project table or column. Apply the latest database migrations.';
  }
  if (/failed to fetch|network|load failed/i.test(message)) {
    return 'Could not reach Supabase. Check the Supabase URL, network connection, and project status.';
  }
  return 'Supabase could not load this project. Check the database configuration and project membership, then try again.';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
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
  const [projectLoadError, setProjectLoadError] = useState<string | null>(null);
  const [pendingStatusSaves, setPendingStatusSaves] = useState(0);
  // Saves are chained so two quick edits can never be written out of order.
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const seededKey = useRef(seedKey);
  // Mirrors the live stage so action callbacks never read a stale closure value.
  const projectStatusRef = useRef(state.project.status);

  useEffect(() => {
    projectStatusRef.current = state.project.status;
  }, [state.project.status]);

  // High-speed memory cache so revisiting projects or switching views is instant
  useEffect(() => {
    let cancelled = false;
    const needsSeed = seededKey.current !== seedKey;
    seededKey.current = seedKey;
    const seed = needsSeed ? makeInitialState(id, stableUser) : null;
    
    // Check if we already have this project cached in memory
    const cachedState = projectStateCache.get(id);
    if (cachedState) {
      setState(cachedState);
      setReady(id);
    } else {
      if (seed) setState(seed);
      setReady(null);
    }

    const restore = async () => {
      if (isSupabaseConfigured && !stableUser) return;
      if (!cancelled) setProjectLoadError(null);
      if (!remote) {
        if (seed) setState(seed);
        if (!cancelled) setReady(id);
        return;
      }
      const base = cachedState ?? seed ?? makeInitialState(id, stableUser);
      try {
        // Parallel fetch of project state and feedback notes
        const [stateRes, initialNotesRes] = await Promise.all([
          supabase.from('project_portal_state').select('state').eq('project_id', id).maybeSingle(),
          supabase
            .from('project_feedback_notes')
            .select('id,author_name,timecode,content,created_at,status,cut_version')
            .eq('project_id', id)
            .order('created_at', { ascending: false }),
        ]);
        type FeedbackQueryRow = { id: string; author_name: string | null; timecode: string | null; content: string; created_at: string; status?: string | null; cut_version?: string | null };
        let noteRows: FeedbackQueryRow[] = initialNotesRes.data ?? [];
        let notesError = initialNotesRes.error;
        if (notesError && /column .* does not exist|schema cache|PGRST204/i.test(notesError.message)) {
          // Keep existing feedback visible while the new status migration is pending.
          const legacyNotesRes = await supabase.from('project_feedback_notes')
            .select('id,author_name,timecode,content,created_at')
            .eq('project_id', id)
            .order('created_at', { ascending: false });
          noteRows = legacyNotesRes.data ?? [];
          notesError = legacyNotesRes.error;
        }

        if (stateRes.error) throw stateRes.error;
        if (notesError) {
          // Feedback is optional for opening a project. A missing feedback
          // migration or policy must not prevent clients from reviewing a cut.
          console.warn('Could not load project feedback notes.', notesError);
        }
        if (cancelled) return;

        const row = stateRes.data;
        const notes = notesError ? [] : noteRows;
        const saved = row?.state as Partial<ProjectState> | null;
        const projectType = normalizeProjectType(saved?.project?.project_type);
        const restoredProject = { ...(saved?.project ?? base.project) };
        const cleanNotes = notes
          .filter((note) => isRecord(note) && typeof note.id === 'string' && note.id !== 'note_1')
          .map((note) => ({
            id: String(note.id),
            author_name: typeof note.author_name === 'string' ? note.author_name : 'Team member',
            timecode: typeof note.timecode === 'string' ? note.timecode : undefined,
            content: typeof note.content === 'string' ? note.content : '',
            created_at: typeof note.created_at === 'string' ? note.created_at : new Date().toISOString(),
            status: note.status === 'resolved' || note.status === 'in_progress' ? note.status : 'open',
            cut_version: typeof note.cut_version === 'string' ? note.cut_version : undefined,
          })) as FeedbackNote[];

        const savedBrief = (saved?.brief ?? {}) as Partial<CreativeBrief>;
        const savedDeliverable = (saved?.deliverable ?? {}) as Partial<Deliverable>;
        const templateId = PROJECT_TEMPLATES.some((template) => template.id === restoredProject.template_id)
          ? restoredProject.template_id!
          : 'brand_film';
        const savedChecklist = Array.isArray(restoredProject.publish_checklist)
          ? restoredProject.publish_checklist.filter(isRecord).map((item, index) => ({
            id: typeof item.id === 'string' ? item.id : `review_${index + 1}`,
            label: typeof item.label === 'string' ? item.label : 'Review item',
            checked: item.checked === true,
          }))
          : createPublishChecklist(templateId);
        const cleanCutHistory = Array.isArray(savedDeliverable.cut_history)
          ? savedDeliverable.cut_history.filter(isRecord).flatMap((cut, index) => typeof cut.version_number === 'string' ? [{
            id: typeof cut.id === 'string' ? cut.id : `cut_${index + 1}`,
            version_number: cut.version_number,
            video_url: typeof cut.video_url === 'string' ? cut.video_url : '',
            video_storage_path: typeof cut.video_storage_path === 'string' ? cut.video_storage_path : undefined,
            duration_seconds: typeof cut.duration_seconds === 'number' ? cut.duration_seconds : 0,
            uploaded_at: typeof cut.uploaded_at === 'string' ? cut.uploaded_at : '',
          }] : [])
          : [];
        const fullProjectState: ProjectState = {
          project: {
            ...base.project,
            ...restoredProject,
            project_type: projectType,
            video_aspect_ratio: restoredProject.video_aspect_ratio === '9:16' ? '9:16' : '16:9',
            template_id: templateId,
            publish_checklist: savedChecklist,
            status: normalizeProjectStatus(restoredProject.status, projectType),
          },
          brief: {
            ...base.brief,
            ...savedBrief,
            script_scenes: Array.isArray(savedBrief.script_scenes)
              ? savedBrief.script_scenes.filter(isRecord).map((scene, index) => ({
                ...base.brief.script_scenes[0],
                ...scene,
                scene_number: typeof scene.scene_number === 'number' ? scene.scene_number : index + 1,
                title: typeof scene.title === 'string' ? scene.title : '',
                timecode: typeof scene.timecode === 'string' ? scene.timecode : '',
                visual_description: typeof scene.visual_description === 'string' ? scene.visual_description : '',
                voiceover: typeof scene.voiceover === 'string' ? scene.voiceover : '',
              }))
              : base.brief.script_scenes,
            script_sections: Array.isArray(savedBrief.script_sections)
              ? savedBrief.script_sections.filter(isRecord).map((section, index) => ({
                id: typeof section.id === 'string' ? section.id : `section_${index + 1}`,
                title: typeof section.title === 'string' ? section.title : '',
                content: typeof section.content === 'string' ? section.content : '',
                ...(typeof section.type === 'string' && ['paragraph', 'heading1', 'heading2', 'heading3', 'bullet', 'numbered', 'todo', 'voiceover', 'document'].includes(section.type) ? { type: section.type as ScriptBlockType } : {}),
                ...(typeof section.checked === 'boolean' ? { checked: section.checked } : {}),
              }))
              : base.brief.script_sections,
            references: Array.isArray(savedBrief.references)
              ? savedBrief.references.filter(isRecord).map((reference, index) => ({
                id: typeof reference.id === 'string' ? reference.id : `reference_${index + 1}`,
                title: typeof reference.title === 'string' ? reference.title : '',
                category: typeof reference.category === 'string' ? reference.category : 'Reference',
                description: typeof reference.description === 'string' ? reference.description : '',
                color_gradient: typeof reference.color_gradient === 'string' ? reference.color_gradient : '#f5f5f7',
                icon: typeof reference.icon === 'string' ? reference.icon : '',
                image_url: typeof reference.image_url === 'string' ? reference.image_url : undefined,
                image_storage_path: typeof reference.image_storage_path === 'string' ? reference.image_storage_path : undefined,
              }))
              : base.brief.references,
            editing_tasks: Array.isArray(savedBrief.editing_tasks)
              ? savedBrief.editing_tasks.filter(isRecord).map((task, index) => ({
                id: typeof task.id === 'string' ? task.id : `task_${index + 1}`,
                title: typeof task.title === 'string' ? task.title : 'Untitled scene',
                timecode: typeof task.timecode === 'string' ? task.timecode : undefined,
                status: task.status === 'in_edit' || task.status === 'ready_for_review' || task.status === 'done' ? task.status : 'not_started',
              }))
              : [],
          },
          deliverable: {
            ...base.deliverable,
            ...savedDeliverable,
            video_url: savedDeliverable.video_url?.includes('sample-cut-guid') ? '' : savedDeliverable.video_url ?? '',
            cut_history: cleanCutHistory,
            feedback_notes: cleanNotes,
          },
        };

        projectStateCache.set(id, fullProjectState);
        setState(fullProjectState);
        setReady(id);

        if (!row) {
          const { error: seedError } = await supabase.from('project_portal_state').upsert(
            { project_id: id, state: { ...base, deliverable: withoutNotes(base.deliverable) }, updated_by: uid },
            { onConflict: 'project_id', ignoreDuplicates: true },
          );
          if (seedError) console.warn('Auto-seed state warning:', seedError);
        }
      } catch (error) {
        console.error('Failed to restore project state from Supabase.', error);
        if (!cancelled) {
          setProjectLoadError(describeProjectLoadError(error as { message?: string; code?: string }));
          setReady(null);
        }
      }
    };

    void restore();
    return () => { cancelled = true; };
  }, [id, uid, companyName, userProjectId, stableUser, remote, seedKey]);

  useEffect(() => {
    if (!remote || ready !== id) return;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    try {
      channel = supabase
        .channel(`portal-${id}-${uid ?? 'session'}-${crypto.randomUUID()}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'project_portal_state', filter: `project_id=eq.${id}` }, (event) => {
          const incoming = (event.new as { state?: Partial<ProjectState> }).state;
          if (!incoming) return;
          setState((current) => {
            const projectType = normalizeProjectType(incoming.project?.project_type ?? current.project.project_type);
            return {
              project: incoming.project
                ? {
                  ...incoming.project,
                  project_type: projectType,
                  video_aspect_ratio: incoming.project.video_aspect_ratio === '9:16' ? '9:16' : incoming.project.video_aspect_ratio === '16:9' ? '16:9' : current.project.video_aspect_ratio,
                  status: normalizeProjectStatus(incoming.project.status, projectType),
                }
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
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'project_feedback_notes', filter: `project_id=eq.${id}` }, (event) => {
          const updated = event.new as FeedbackNote;
          setState((current) => ({
            ...current,
            deliverable: {
              ...current.deliverable,
              feedback_notes: current.deliverable.feedback_notes.map((note) => note.id === updated.id ? { ...note, status: updated.status ?? 'open' } : note),
            },
          }));
        });
      channel.subscribe((status, error) => {
        if (status === 'CHANNEL_ERROR') {
          console.warn('Realtime updates are unavailable for this project.', error);
        }
      });
    } catch (error) {
      console.warn('Could not start realtime updates for this project.', error);
    }
    return () => {
      if (channel) void supabase.removeChannel(channel);
    };
  }, [id, uid, remote, ready]);

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

  const updatePublishChecklist = useCallback((items: PublishChecklistItem[]) => {
    setState((current) => ({ ...current, project: { ...current.project, publish_checklist: items } }));
    saveProjectFields({ publish_checklist: items });
  }, [saveProjectFields]);

  const updateFinalHandoff = useCallback((handoff: FinalHandoff) => {
    setState((current) => ({ ...current, deliverable: { ...current.deliverable, final_handoff: handoff } }));
    void savePatch({ deliverable: { final_handoff: handoff } });
  }, [savePatch]);

  const updateProjectTitle = useCallback((title: string) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    setState((current) => ({ ...current, project: { ...current.project, title: trimmedTitle } }));
    saveProjectFields({ title: trimmedTitle });
  }, [saveProjectFields]);

  const postNewCut = useCallback((cut: { version: string; videoUrl: string; videoStoragePath?: string; duration: number }) => {
    const previous = state.deliverable;
    const savedCut = previous.video_url || previous.video_storage_path
      ? {
        id: crypto.randomUUID(),
        version_number: previous.version_number,
        video_url: previous.video_url,
        video_storage_path: previous.video_storage_path,
        duration_seconds: previous.duration_seconds,
        uploaded_at: previous.uploaded_at,
      }
      : null;
    const cutHistory = savedCut
      ? [savedCut, ...(previous.cut_history ?? [])].slice(0, 10)
      : previous.cut_history ?? [];
    const resetChecklist = (state.project.publish_checklist ?? createPublishChecklist(state.project.template_id ?? 'brand_film'))
      .map((item) => ({ ...item, checked: false }));
    const deliverablePatch = {
      version_number: cut.version,
      video_url: cut.videoUrl,
      video_storage_path: cut.videoStoragePath ?? '',
      duration_seconds: cut.duration,
      cut_history: cutHistory,
      uploaded_at: 'Just now by Editor',
      approval_status: 'Pending' as const,
      action_required_by: 'Client' as const,
      action_banner_text: `Review ${cut.version} and leave your notes below`,
      ...(previous.final_handoff ? { final_handoff: { ...previous.final_handoff, status: 'preparing' as const, cut_version: cut.version } } : {}),
    };
    const advances = ['Scripting', 'Pre-Production', 'Shooting'].includes(projectStatusRef.current);
    const status = advances ? 'Editing' : projectStatusRef.current;
    const projectPatch = { ...(advances ? { status } : {}), publish_checklist: resetChecklist };
    setState((current) => ({
      ...current,
      project: { ...current.project, ...projectPatch },
      deliverable: { ...current.deliverable, ...deliverablePatch },
    }));
    void savePatch({ deliverable: deliverablePatch, project: projectPatch });
  }, [savePatch, state]);

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
    const newNote: FeedbackNote = {
      ...note,
      status: note.status ?? 'open',
      cut_version: note.cut_version ?? state.deliverable.version_number,
      author_email: currentUser?.email,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    if (!remote) {
      setState((current) => ({ ...current, deliverable: { ...current.deliverable, feedback_notes: [newNote, ...current.deliverable.feedback_notes] } }));
      return;
    }
    const { data, error } = await supabase.from('project_feedback_notes')
      .insert({ ...newNote, project_id: id })
      .select('id,author_name,timecode,content,created_at,status,cut_version')
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
  }, [currentUser?.email, id, remote, state.deliverable.version_number]);

  const updateFeedbackStatus = useCallback(async (noteId: string, status: FeedbackStatus) => {
    if (!remote) {
      setState((current) => ({
        ...current,
        deliverable: {
          ...current.deliverable,
          feedback_notes: current.deliverable.feedback_notes.map((note) => note.id === noteId ? { ...note, status } : note),
        },
      }));
      return;
    }
    const { data, error } = await supabase.from('project_feedback_notes')
      .update({ status })
      .eq('project_id', id)
      .eq('id', noteId)
      .select('id,status')
      .single();
    if (error) throw new Error(error.message || 'Could not update feedback status.');
    const saved = data as { id: string; status: FeedbackStatus };
    setState((current) => ({
      ...current,
      deliverable: {
        ...current.deliverable,
        feedback_notes: current.deliverable.feedback_notes.map((note) => note.id === saved.id ? { ...note, status: saved.status } : note),
      },
    }));
  }, [id, remote]);

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
    projectLoadError,
    isStatusSaving: pendingStatusSaves > 0,
    updateStatus,
    updateProjectTitle,
    updateDueDate,
    updatePublishChecklist,
    updateFinalHandoff,
    updateProjectType,
    postNewCut,
    setActionAlert,
    updateScript,
    addNote,
    updateFeedbackStatus,
    approveCut,
  }), [state, ready, id, projectLoadError, pendingStatusSaves, updateStatus, updateProjectType, updateProjectTitle, updateDueDate, updatePublishChecklist, updateFinalHandoff, postNewCut, setActionAlert, updateScript, addNote, updateFeedbackStatus, approveCut]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const useProject = () => {
  const context = useContext(Context);
  if (!context) throw new Error('useProject must be used within a ProjectProvider');
  return context;
};
