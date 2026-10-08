'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, CreativeBrief, Deliverable, ProjectStatus, ActionRequiredBy, FeedbackNote } from '@/types';
import { mockProject, mockBrief, mockDeliverable } from '@/lib/mock-data';

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

const STORAGE_KEY = 'synccut_project_state_v1';

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [project, setProject] = useState<Project>(mockProject);
  const [brief, setBrief] = useState<CreativeBrief>(mockBrief);
  const [deliverable, setDeliverable] = useState<Deliverable>(mockDeliverable);
  const [isLoaded, setIsLoaded] = useState(false);

  // Restore state from localStorage so changes made by editor persist when switching to client
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.project) setProject(parsed.project);
        if (parsed.brief) setBrief(parsed.brief);
        if (parsed.deliverable) setDeliverable(parsed.deliverable);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ project, brief, deliverable }));
    } catch (e) {
      console.error(e);
    }
  }, [project, brief, deliverable, isLoaded]);

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
