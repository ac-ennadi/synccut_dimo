'use client';

import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { mockProject, mockBrief, mockDeliverable } from '@/lib/mock-data';
import { ProjectStatus, FeedbackNote, CreativeBrief, ActionRequiredBy } from '@/types';
import { LoginPage } from './LoginPage';
import { ClientPortal } from './ClientPortal';
import { EditorDashboard } from './EditorDashboard';

const DashboardContent: React.FC = () => {
  const { currentUser, isLoading } = useAuth();

  // Central project state (shared in-memory for live interactions)
  const [project, setProject] = useState(mockProject);
  const [brief, setBrief] = useState<CreativeBrief>(mockBrief);
  const [deliverable, setDeliverable] = useState(mockDeliverable);

  // Editor Actions
  const handleStatusChange = (newStatus: ProjectStatus) => {
    setProject((prev) => ({ ...prev, status: newStatus }));
  };

  const handlePostNewCut = (newCut: { version: string; videoUrl: string; duration: number }) => {
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
    // Advance progress tracker to Editing or Final Review if earlier
    if (project.status === 'Scripting' || project.status === 'Pre-Production' || project.status === 'Production') {
      setProject((prev) => ({ ...prev, status: 'Editing' }));
    }
  };

  const handleSetActionAlert = (actionBy: ActionRequiredBy, bannerText: string) => {
    setDeliverable((prev) => ({
      ...prev,
      action_required_by: actionBy,
      action_banner_text: bannerText,
    }));
  };

  const handleUpdateScript = (updatedBrief: CreativeBrief) => {
    setBrief(updatedBrief);
  };

  // Client Actions
  const handleAddNote = (newNote: Omit<FeedbackNote, 'id' | 'created_at'>) => {
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

  const handleUploadSuccess = (fileName: string) => {
    setDeliverable((prev) => ({
      ...prev,
      action_required_by: 'None',
      action_banner_text: `Asset received (${fileName}). Ball is in Editor's court.`,
    }));
  };

  const handleApproveCut = () => {
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-950">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in -> Show Login Page
  if (!currentUser) {
    return <LoginPage />;
  }

  // Logged in as Editor -> Show Editor Cockpit
  if (currentUser.role === 'Editor') {
    return (
      <EditorDashboard
        project={project}
        brief={brief}
        deliverable={deliverable}
        onStatusChange={handleStatusChange}
        onPostNewCut={handlePostNewCut}
        onSetActionAlert={handleSetActionAlert}
        onUpdateScript={handleUpdateScript}
        onAddNote={handleAddNote}
        onApproveCut={handleApproveCut}
        onUploadSuccess={handleUploadSuccess}
      />
    );
  }

  // Logged in as Client -> Show Pristine Client Portal
  return (
    <ClientPortal
      project={project}
      brief={brief}
      deliverable={deliverable}
      onAddNote={handleAddNote}
      onApproveCut={handleApproveCut}
      onUploadSuccess={handleUploadSuccess}
    />
  );
};

export const ClientDashboard: React.FC = () => {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
};
