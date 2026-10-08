'use client';

import React, { useState } from 'react';
import { mockProject, mockBrief, mockDeliverable, mockUser } from '@/lib/mock-data';
import { ProjectStatus, FeedbackNote, UserRole, CreativeBrief, ActionRequiredBy } from '@/types';
import { TopBar } from './TopBar';
import { ScriptBox } from './ScriptBox';
import { VisualReferences } from './VisualReferences';
import { ActionAlert } from './ActionAlert';
import { VideoPlayer } from './VideoPlayer';
import { FeedbackSection } from './FeedbackSection';
import { EditorToolbar } from './EditorToolbar';
import { Clapperboard, Monitor, Smartphone, Radio, UserCheck, Shield } from 'lucide-react';

export const ClientDashboard: React.FC = () => {
  const [project, setProject] = useState(mockProject);
  const [brief, setBrief] = useState<CreativeBrief>(mockBrief);
  const [deliverable, setDeliverable] = useState(mockDeliverable);
  const [currentTimecode, setCurrentTimecode] = useState('00:18');
  const [viewportMode, setViewportMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activeRole, setActiveRole] = useState<UserRole>('Editor'); // Default to Editor for development

  // Handle live status toggle (allows testing Pizza Tracker transitions)
  const handleStatusChange = (newStatus: ProjectStatus) => {
    setProject((prev) => ({ ...prev, status: newStatus }));
  };

  // Editor Action: Publish a new cut
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
    if (project.status === 'Scripting' || project.status === 'Pre-Production' || project.status === 'Shooting') {
      setProject((prev) => ({ ...prev, status: 'Editing' }));
    }
  };

  // Editor Action: Set Action Alert banner
  const handleSetActionAlert = (actionBy: ActionRequiredBy, bannerText: string) => {
    setDeliverable((prev) => ({
      ...prev,
      action_required_by: actionBy,
      action_banner_text: bannerText,
    }));
  };

  // Editor Action: Update Script & Brief
  const handleUpdateScript = (updatedBrief: CreativeBrief) => {
    setBrief(updatedBrief);
  };

  // Client Action: Add feedback
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

  // Client Action: File upload unblock
  const handleUploadSuccess = (fileName: string) => {
    setDeliverable((prev) => ({
      ...prev,
      action_required_by: 'None',
      action_banner_text: `Asset received (${fileName}). Ball is in Editor's court.`,
    }));
  };

  // Client Action: Cut approval
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

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 p-4 md:p-8 transition-colors">
      <div className={`mx-auto transition-all duration-300 ${viewportMode === 'mobile' ? 'max-w-md' : 'max-w-7xl'}`}>
        
        {/* Navigation & Role Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/10 text-indigo-500 flex items-center justify-center font-bold">
              <Clapperboard className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                Commercial Client Portal
              </div>
              <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                Luminary Film Studio × {mockUser.company_name}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Role Switcher: Editor Mode vs Client View */}
            <div className="flex items-center bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-1 shadow-2xs">
              <button
                onClick={() => setActiveRole('Editor')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeRole === 'Editor'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
                title="Access editor controls to change status, cuts, and script"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Editor Cockpit</span>
              </button>
              <button
                onClick={() => setActiveRole('Client')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeRole === 'Client'
                    ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
                title="Preview clean view exactly as the client sees it"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Client View</span>
              </button>
            </div>

            {/* Viewport Switcher */}
            <div className="flex items-center bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-1 shadow-2xs">
              <button
                onClick={() => setViewportMode('desktop')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  viewportMode === 'desktop'
                    ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
                title="Preview Laptop / Desktop Layout"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Laptop</span>
              </button>
              <button
                onClick={() => setViewportMode('mobile')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  viewportMode === 'mobile'
                    ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
                title="Preview Mobile Stacked Layout"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/40">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>Live Sync</span>
            </div>
          </div>
        </div>

        {/* EDITOR ADMIN CONTROLS (Only visible to Editor role) */}
        {activeRole === 'Editor' && (
          <EditorToolbar
            currentStatus={project.status}
            deliverable={deliverable}
            brief={brief}
            onUpdateStatus={handleStatusChange}
            onPostNewCut={handlePostNewCut}
            onSetActionAlert={handleSetActionAlert}
            onUpdateScript={handleUpdateScript}
          />
        )}

        {/* 1. The Top Bar: Project Identity & Status */}
        <div className="mb-6">
          <TopBar project={project} onStatusChange={handleStatusChange} />
        </div>

        {/* Main Responsive Layout */}
        <div
          className={`grid gap-6 items-start ${
            viewportMode === 'mobile' ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12'
          }`}
        >
          {/* Left Column (Laptop) / Second on Mobile: The Script & Brief */}
          <section
            className={`space-y-6 ${
              viewportMode === 'mobile' ? 'order-2' : 'lg:col-span-6 order-1'
            }`}
          >
            <ScriptBox brief={brief} />
            <VisualReferences references={brief.references} />
          </section>

          {/* Right Column (Laptop) / First on Mobile: Action Items & Deliverables */}
          <section
            className={`space-y-6 ${
              viewportMode === 'mobile' ? 'order-1' : 'lg:col-span-6 order-2'
            }`}
          >
            <ActionAlert
              deliverable={deliverable}
              onUploadSuccess={handleUploadSuccess}
            />

            <VideoPlayer
              deliverable={deliverable}
              onTimecodeSelected={(tc) => setCurrentTimecode(tc)}
              onApproveCut={handleApproveCut}
            />

            <FeedbackSection
              notes={deliverable.feedback_notes}
              currentTimecode={currentTimecode}
              onAddNote={handleAddNote}
            />
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-8 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-neutral-500 dark:text-neutral-400 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <strong>Single-Screen Philosophy:</strong> The client never searches through menus or asks &ldquo;where does my project stand?&rdquo;
          </div>
          <div className="text-[11px] font-mono text-neutral-400">
            Current Session: <span className="font-bold text-indigo-500">{activeRole}</span>
          </div>
        </footer>

      </div>
    </div>
  );
};
