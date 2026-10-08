'use client';

import React, { useState } from 'react';
import { Project, CreativeBrief, Deliverable, ProjectStatus, ActionRequiredBy, FeedbackNote } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { TopBar } from './TopBar';
import { ScriptBox } from './ScriptBox';
import { VisualReferences } from './VisualReferences';
import { ActionAlert } from './ActionAlert';
import { VideoPlayer } from './VideoPlayer';
import { FeedbackSection } from './FeedbackSection';
import { EditorToolbar } from './EditorToolbar';
import { ClientPortal } from './ClientPortal';
import { Clapperboard, LogOut, Shield, Eye, X } from 'lucide-react';

interface EditorDashboardProps {
  project: Project;
  brief: CreativeBrief;
  deliverable: Deliverable;
  onStatusChange: (newStatus: ProjectStatus) => void;
  onPostNewCut: (newCut: { version: string; videoUrl: string; duration: number }) => void;
  onSetActionAlert: (actionBy: ActionRequiredBy, bannerText: string) => void;
  onUpdateScript: (updatedBrief: CreativeBrief) => void;
  onAddNote: (newNote: Omit<FeedbackNote, 'id' | 'created_at'>) => void;
  onApproveCut: () => void;
  onUploadSuccess: (fileName: string) => void;
}

export const EditorDashboard: React.FC<EditorDashboardProps> = ({
  project,
  brief,
  deliverable,
  onStatusChange,
  onPostNewCut,
  onSetActionAlert,
  onUpdateScript,
  onAddNote,
  onApproveCut,
  onUploadSuccess,
}) => {
  const { currentUser, logout } = useAuth();
  const [currentTimecode, setCurrentTimecode] = useState('00:18');
  const [showClientPreviewModal, setShowClientPreviewModal] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 p-4 sm:p-6 lg:p-8 transition-colors">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation Bar: Editor Cockpit */}
        <header className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm">
              <Clapperboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black tracking-wider text-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800/50">
                  Studio Admin
                </span>
                <span className="text-xs text-neutral-400">Editor Cockpit</span>
              </div>
              <div className="text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5">
                {currentUser?.company_name || 'Luminary Film Studio'} • Production Manager
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Editor Identity Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-700 dark:text-neutral-300">
              <Shield className="w-3.5 h-3.5 text-indigo-500" />
              <span>Signed in as <strong>{currentUser?.name}</strong></span>
            </div>

            {/* Preview Client Experience Modal Trigger */}
            <button
              onClick={() => setShowClientPreviewModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors shadow-2xs"
              title="Preview clean view exactly as the client sees it"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Client Portal</span>
            </button>

            {/* Sign Out */}
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-600 dark:text-neutral-300 transition-colors shadow-2xs"
              title="Sign out of editor session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Editor Quick Command Toolbar */}
        <EditorToolbar
          currentStatus={project.status}
          deliverable={deliverable}
          brief={brief}
          onUpdateStatus={onStatusChange}
          onPostNewCut={onPostNewCut}
          onSetActionAlert={onSetActionAlert}
          onUpdateScript={onUpdateScript}
        />

        {/* Top Status Bar with Interactive Pizza Tracker */}
        <TopBar project={project} onStatusChange={onStatusChange} />

        {/* Responsive Dual Column Workspace (Works seamlessly on Phone and PC) */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (PC) / Section 1 (Mobile): Script, Creative Brief & Moodboard */}
          <section className="space-y-6 lg:col-span-6">
            <ScriptBox brief={brief} />
            <VisualReferences references={brief.references} />
          </section>

          {/* Right Column (PC) / Section 2 (Mobile): Deliverables, Alert & Feedback */}
          <section className="space-y-6 lg:col-span-6">
            <ActionAlert
              deliverable={deliverable}
              onUploadSuccess={onUploadSuccess}
            />

            <VideoPlayer
              deliverable={deliverable}
              onTimecodeSelected={(tc) => setCurrentTimecode(tc)}
              onApproveCut={onApproveCut}
            />

            <FeedbackSection
              notes={deliverable.feedback_notes}
              currentTimecode={currentTimecode}
              onAddNote={onAddNote}
            />
          </section>

        </main>

        {/* Modal: Live Client Preview Mode */}
        {showClientPreviewModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm p-4 sm:p-6 flex flex-col justify-start items-center">
            <div className="w-full max-w-6xl rounded-2xl bg-neutral-100 dark:bg-neutral-950 border border-neutral-700 shadow-2xl overflow-hidden my-auto">
              <div className="p-4 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                    Live Client View Simulator (Zero Editor Controls)
                  </span>
                </div>
                <button
                  onClick={() => setShowClientPreviewModal(false)}
                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 sm:p-6 max-h-[85vh] overflow-y-auto">
                <ClientPortal
                  project={project}
                  brief={brief}
                  deliverable={deliverable}
                  onAddNote={onAddNote}
                  onApproveCut={onApproveCut}
                  onUploadSuccess={onUploadSuccess}
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
