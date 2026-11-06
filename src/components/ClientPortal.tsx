'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Project, CreativeBrief, Deliverable, FeedbackNote } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { TopBar } from './TopBar';
import { ScriptBox } from './ScriptBox';
import { VisualReferences } from './VisualReferences';
import { ActionAlert } from './ActionAlert';
import { VideoPlayer } from './VideoPlayer';
import { FeedbackSection } from './FeedbackSection';
import { ArrowLeft, LogOut, UserCheck } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { ThemeToggle } from './ThemeToggle';
import { SceneTasks } from './SceneTasks';
import { FinalHandoff } from './FinalHandoff';

interface ClientPortalProps {
  project: Project;
  brief: CreativeBrief;
  deliverable: Deliverable;
  onAddNote: (note: Omit<FeedbackNote, 'id' | 'created_at'>) => void;
  onApproveCut: () => void;
}

export const ClientPortal: React.FC<ClientPortalProps> = ({
  project,
  brief,
  deliverable,
  onAddNote,
  onApproveCut,
}) => {
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const [currentTimecode, setCurrentTimecode] = useState('');
  const [reviewVersion, setReviewVersion] = useState(deliverable.version_number);
  const projectIds = currentUser?.project_ids ?? (currentUser?.project_id ? [currentUser.project_id] : []);

  useEffect(() => setReviewVersion(deliverable.version_number), [deliverable.version_number]);

  const handleLogout = () => {
    logout();
    router.replace('/client/login');
  };

  return (
    <div className="apple-shell client-portal workspace-dashboard min-h-screen bg-neutral-950 text-neutral-100 p-5 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Navigation Bar: Pure Client Identity */}
        <header className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div className="flex min-w-0 items-center gap-4">
            <Link href="/" aria-label="SyncCut home" className="flex shrink-0 items-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]">
              <BrandLogo variant="light" className="h-8 w-auto object-contain object-left" priority />
            </Link>
            <div className="flex min-h-10 flex-col justify-center border-l border-neutral-800 pl-4">
              <div className="text-[11px] font-semibold uppercase leading-4 tracking-[0.12em] text-neutral-500">
                Client Review Portal
              </div>
              <div className="mt-0.5 max-w-[48vw] truncate text-sm font-medium leading-5 text-neutral-700 sm:max-w-none">
                {currentUser?.company_name || currentUser?.name || 'Client workspace'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {projectIds.length > 1 && (
              <button
                type="button"
                onClick={() => router.push('/client')}
                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs font-medium text-neutral-300 transition-colors hover:border-[#b8d8f8] hover:text-[#0066cc]"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Choose project</span>
              </button>
            )}

            {/* Client User Info */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300">
              <UserCheck className="w-3.5 h-3.5 text-neutral-500" />
              <span className="font-semibold">{currentUser?.name}</span>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleLogout}
              className="dashboard-signout inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white transition-colors shadow-2xs"
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
        {/* On Phone (< lg): Action Items show first so clients can respond or approve immediately. On PC (lg+): 2 Columns side-by-side. */}
        <main className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Each column flows independently so feedback stays with the video while references follow the script. */}
          <section className="order-2 min-w-0 space-y-6 lg:order-none lg:col-span-6">
            <ScriptBox brief={brief} />
            <SceneTasks brief={brief} />
            <VisualReferences references={brief.references} />
          </section>

          <section className="order-1 min-w-0 space-y-6 lg:order-none lg:col-span-6">
            <ActionAlert
              deliverable={deliverable}
            />

            <VideoPlayer
              deliverable={deliverable}
              videoAspectRatio={project.video_aspect_ratio ?? '16:9'}
              previousCut={deliverable.cut_history?.[0]}
              onTimecodeSelected={(tc) => setCurrentTimecode(tc)}
              onCutChange={setReviewVersion}
              onApproveCut={onApproveCut}
            />
            <FeedbackSection
              notes={deliverable.feedback_notes}
              currentTimecode={currentTimecode}
              currentCutVersion={reviewVersion}
              onAddNote={onAddNote}
            />
            <FinalHandoff handoff={deliverable.final_handoff} currentVersion={deliverable.version_number} approvalStatus={deliverable.approval_status} />
          </section>

        </main>

        {/* Footer */}
        <footer className="pt-6 pb-2 text-center text-xs text-neutral-400">
          Shared project review
        </footer>

      </div>
    </div>
  );
};
