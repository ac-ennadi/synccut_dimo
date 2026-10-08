'use client';

import React, { useState } from 'react';
import { Project, CreativeBrief, Deliverable, FeedbackNote } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { TopBar } from './TopBar';
import { ScriptBox } from './ScriptBox';
import { VisualReferences } from './VisualReferences';
import { ActionAlert } from './ActionAlert';
import { VideoPlayer } from './VideoPlayer';
import { FeedbackSection } from './FeedbackSection';
import { Clapperboard, Radio, LogOut, UserCheck } from 'lucide-react';

interface ClientPortalProps {
  project: Project;
  brief: CreativeBrief;
  deliverable: Deliverable;
  onAddNote: (note: Omit<FeedbackNote, 'id' | 'created_at'>) => void;
  onApproveCut: () => void;
  onUploadSuccess: (fileName: string) => void;
}

export const ClientPortal: React.FC<ClientPortalProps> = ({
  project,
  brief,
  deliverable,
  onAddNote,
  onApproveCut,
  onUploadSuccess,
}) => {
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const [currentTimecode, setCurrentTimecode] = useState('00:18');

  const handleLogout = () => {
    logout();
    router.push('/client/login');
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 p-4 sm:p-6 lg:p-8 transition-colors">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation Bar: Pure Client Identity */}
        <header className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-500 flex items-center justify-center font-bold">
              <Clapperboard className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                Client Review Portal
              </div>
              <div className="text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                Luminary Film Studio × {currentUser?.company_name || 'Client Project'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Sync Badge */}
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/40">
              <Radio className="w-3 h-3 animate-pulse" />
              <span className="font-medium">Live Sync Active</span>
            </div>

            {/* Client User Info */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-300">
              <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-semibold">{currentUser?.name}</span>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-600 dark:text-neutral-300 transition-colors shadow-2xs"
              title="Sign out of client session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* 1. Top Bar: Project Identity & Progress Tracker (Read-Only for Client) */}
        <TopBar project={project} />

        {/* 2 & 3. Main Responsive Workspace */}
        {/* On Phone (< lg): Action Items show first so clients can approve or upload instantly. On PC (lg+): 2 Columns side-by-side. */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Creative Backbone: The Script & Brief */}
          {/* order-2 on mobile (below action items), order-1 on laptop (left column) */}
          <section className="space-y-6 order-2 lg:order-1 lg:col-span-6">
            <ScriptBox brief={brief} />
            <VisualReferences references={brief.references} />
          </section>

          {/* Action Items & Deliverables */}
          {/* order-1 on mobile (top priority), order-2 on laptop (right column) */}
          <section className="space-y-6 order-1 lg:order-2 lg:col-span-6">
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

        {/* Footer */}
        <footer className="pt-6 pb-2 text-center text-xs text-neutral-400">
          Main Street Co-Working Promo • Direct Studio Review Channel
        </footer>

      </div>
    </div>
  );
};
