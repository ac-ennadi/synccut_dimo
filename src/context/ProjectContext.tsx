'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Project, CreativeBrief, Deliverable, ProjectStatus, ActionRequiredBy, FeedbackNote } from '@/types';
import { mockProject, mockBrief, mockDeliverable } from '@/lib/mock-data';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface ProjectContextType {
  project: Project;
  brief: CreativeBrief;
  deliverable: Deliverable;
  updateStatus: (newStatus: ProjectStatus) => void;
  postNewCut: (newCut: { version: string; videoUrl: string; duration: number }) => void;
  setActionAlert: (actionBy: ActionRequiredBy, bannerText: string) => void;
  updateScript: (updatedBrief: CreativeBrief) => void;
  addNote: (newNote: Omit<FeedbackNote, 'id' | 'created_at'>) => void;
  approveCut: () => void;
  uploadSuccess: (fileName: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

interface PortalState {
  project: Project;
  brief: CreativeBrief;
  deliverable: Deliverable;
}

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [project, setProject] = useState<Project>(mockProject);
  const [brief, setBrief] = useState<CreativeBrief>(mockBrief);
  const [deliverable, setDeliverable] = useState<Deliverable>(mockDeliverable);
  const [isLoaded, setIsLoaded] = useState(false);
  const applyingRemoteState = useRef(false);
  const currentUserId = currentUser?.user_id;
  const canUseRemotePersistence =
    isSupabaseConfigured &&
    Boolean(currentUserId) &&
    !currentUserId?.startsWith('usr_');

  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      setIsLoaded(false);
      try {
        if (canUseRemotePersistence) {
          const { data, error } = await supabase
            .from('project_portal_state')
            .select('state')
            .eq('project_id', mockProject.project_id)
            .maybeSingle();

          if (error) throw error;
          const state = data?.state as Partial<PortalState> | null;
          if (!cancelled && state) {
            if (state.project) setProject(state.project);
            if (state.brief) setBrief(state.brief);
            if (state.deliverable) setDeliverable(state.deliverable);
          }
        }
      } catch (error) {
        console.error('Failed to restore project state from Supabase.', error);
      } finally {
        if (!cancelled) setIsLoaded(true);
      }
    };

    void restore();
    return () => {
      cancelled = true;
    };
  }, [canUseRemotePersistence]);

  useEffect(() => {
    if (!isLoaded) return;

    const state: PortalState = { project, brief, deliverable };
    if (canUseRemotePersistence) {
      if (applyingRemoteState.current) {
        applyingRemoteState.current = false;
        return;
      }
      void supabase
        .from('project_portal_state')
        .upsert(
          {
            project_id: project.project_id,
            state,
            updated_by: currentUserId,
          },
          { onConflict: 'project_id' },
        )
        .then(({ error }) => {
          if (error) console.error('Failed to save project state to Supabase.', error);
        });
      return;
    }

  }, [project, brief, deliverable, isLoaded, canUseRemotePersistence, currentUserId]);

  useEffect(() => {
    if (!canUseRemotePersistence) return;

    const channel = supabase
      .channel(`project-portal-${mockProject.project_id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'project_portal_state',
          filter: `project_id=eq.${mockProject.project_id}`,
        },
        (payload) => {
          const state = (payload.new as { state?: Partial<PortalState> }).state;
          applyingRemoteState.current = true;
          if (state?.project) setProject(state.project);
          if (state?.brief) setBrief(state.brief);
          if (state?.deliverable) setDeliverable(state.deliverable);
        },
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          console.error('Supabase realtime subscription failed for project state.');
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [canUseRemotePersistence]);

  const updateStatus = (newStatus: ProjectStatus) => {
    setProject((prev) => ({ ...prev, status: newStatus }));
  };

  const postNewCut = (newCut: { version: string; videoUrl: string; duration: number }) => {
    setDeliverable((prev) => ({
      ...prev,
      version_number: newCut.version,
      video_url: newCut.videoUrl,
      duration_seconds: newCut.duration,
      uploaded_at: 'Just now by Editor',
      approval_status: 'Pending',
      action_required_by: 'Client',
      action_banner_text: `Review ${newCut.version} and leave your notes below`,
    }));
    if (project.status === 'Scripting' || project.status === 'Pre-Production' || project.status === 'Shooting') {
      setProject((prev) => ({ ...prev, status: 'Editing' }));
    }
  };

  const setActionAlert = (actionBy: ActionRequiredBy, bannerText: string) => {
    setDeliverable((prev) => ({
      ...prev,
      action_required_by: actionBy,
      action_banner_text: bannerText,
    }));
  };

  const updateScript = (updatedBrief: CreativeBrief) => {
    setBrief(updatedBrief);
  };

  const addNote = (newNote: Omit<FeedbackNote, 'id' | 'created_at'>) => {
    const note: FeedbackNote = {
      ...newNote,
      id: `note_${Date.now()}`,
      created_at: 'Just now',
    };
    setDeliverable((prev) => ({
      ...prev,
      feedback_notes: [note, ...prev.feedback_notes],
    }));
  };

  const uploadSuccess = (fileName: string) => {
    setDeliverable((prev) => ({
      ...prev,
      action_required_by: 'None',
      action_banner_text: `Asset received (${fileName}). Ball is in Editor's court.`,
    }));
  };

  const approveCut = () => {
    setDeliverable((prev) => ({
      ...prev,
      approval_status: 'Approved',
      action_required_by: 'None',
    }));
    setProject((prev) => ({
      ...prev,
      status: 'Final Review',
    }));
  };

  return (
    <ProjectContext.Provider
      value={{
        project,
        brief,
        deliverable,
        updateStatus,
        postNewCut,
        setActionAlert,
        updateScript,
        addNote,
        approveCut,
        uploadSuccess,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
