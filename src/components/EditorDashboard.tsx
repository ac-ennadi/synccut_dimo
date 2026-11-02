'use client';

import React, { useCallback, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Project,
  CreativeBrief,
  Deliverable,
  ProjectStatus,
  ProjectType,
  ActionRequiredBy,
  FeedbackNote,
  MoodboardReference,
} from '@/types';
import { useAuth } from '@/context/AuthContext';
import { TopBar } from './TopBar';
import { ScriptBox } from './ScriptBox';
import { VisualReferences } from './VisualReferences';
import { ActionAlert } from './ActionAlert';
import { VideoPlayer } from './VideoPlayer';
import { FeedbackSection } from './FeedbackSection';
import { EditorToolbar } from './EditorToolbar';
import { ClientPortal } from './ClientPortal';
import { ProjectMembersManager } from './ProjectMembersManager';
import { ProjectDangerZone } from './ProjectDangerZone';
import { ScriptEditorProvider } from '@/context/ScriptEditorContext';
import { BrandLogo } from './BrandLogo';
import { ThemeToggle } from './ThemeToggle';
import { Clapperboard, LogOut, Shield, Eye, X, ArrowLeft } from 'lucide-react';

interface Props {
  project: Project;
  brief: CreativeBrief;
  deliverable: Deliverable;
  isStatusSaving?: boolean;
  onProjectTypeChange?: (type: ProjectType) => void;
  onProjectTitleChange?: (title: string) => void;
  onDueDateChange?: (date: string) => void;
  onStatusChange: (s: ProjectStatus) => void;
  onPostNewCut: (c: { version: string; videoUrl: string; videoStoragePath?: string; duration: number }) => void;
  onSetActionAlert: (a: ActionRequiredBy, t: string) => void;
  onUpdateScript: (b: CreativeBrief) => void;
  onAddNote: (n: Omit<FeedbackNote, 'id' | 'created_at'>) => void | Promise<void>;
  onApproveCut: () => void;
}

export const EditorDashboard: React.FC<Props> = ({
  project,
  brief,
  deliverable,
  isStatusSaving = false,
  onProjectTypeChange,
  onProjectTitleChange,
  onDueDateChange,
  onStatusChange,
  onPostNewCut,
  onSetActionAlert,
  onUpdateScript,
  onAddNote,
  onApproveCut,
}) => {
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const [tc, setTc] = useState('');
  const [preview, setPreview] = useState(false);
  const [scriptEditorHandler, setScriptEditorHandler] = useState<() => void>(() => () => undefined);
  const registerScriptEditor = useCallback((handler: () => void) => {
    setScriptEditorHandler(() => handler);
    return () => setScriptEditorHandler(() => () => undefined);
  }, []);

  return (
    <ScriptEditorProvider value={{ requestEdit: scriptEditorHandler, registerEditor: registerScriptEditor }}>
    <div className="apple-shell editor-dashboard min-h-screen bg-neutral-950 p-4 text-neutral-100 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Editor Workspace Header */}
        <header className="space-y-4 border-b border-neutral-800 pb-4">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Link
              href="/editor"
              aria-label="Back to projects"
              className="flex shrink-0 items-center gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <BrandLogo variant="light" className="h-8 w-auto shrink-0 object-contain object-left" priority />
            </Link>
            <div className="min-w-0 flex-1 border-l border-neutral-800 pl-3 sm:pl-4">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="rounded-md border border-indigo-500/30 bg-indigo-950/60 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-300">
                  Editor Cockpit
                </span>
                <span className="text-xs text-neutral-400">
                  Producer · {project?.producer_name || 'Studio'}
                </span>
              </div>
              <h1 className="mt-1 break-words text-base font-semibold leading-snug text-white sm:text-lg">
                {project?.title || 'Project Workspace'}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ThemeToggle />
            <Link
              href="/editor"
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-900 px-3.5 text-xs font-medium text-neutral-300 transition hover:bg-neutral-800 hover:text-white"
            >
              <ArrowLeft size={14} />
              <span>All projects</span>
            </Link>

            <span className="hidden min-h-9 items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-900 px-3 text-xs text-neutral-400 sm:flex">
              <Shield className="h-3.5 w-3.5 text-indigo-400" />
              <span>Signed in as <strong className="text-neutral-200">{currentUser?.name}</strong></span>
            </span>

            <button
              type="button"
              onClick={() => setPreview(true)}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-indigo-500/40 bg-indigo-950/60 px-3.5 text-xs font-semibold text-indigo-300 transition hover:bg-indigo-900/60 hover:text-white"
            >
              <Eye size={14} />
              <span>Preview client view</span>
            </button>

            <button
              type="button"
              aria-label="Sign out"
              title="Sign out"
              onClick={() => {
                logout();
                router.replace('/editor/login');
              }}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900 text-neutral-400 transition hover:bg-neutral-800 hover:text-white sm:w-auto sm:gap-1.5 sm:px-3.5 sm:text-xs sm:font-medium"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>

        {/* Editor Toolbar (Post cuts, actions, update scripts) */}
        <EditorToolbar
          deliverable={deliverable}
          brief={brief}
          projectId={project.project_id}
          onPostNewCut={onPostNewCut}
          onSetActionAlert={onSetActionAlert}
          onUpdateScript={onUpdateScript}
        />

        {/* Project Stage Stepper & Due Date */}
        <TopBar
          project={project}
          onStatusChange={onStatusChange}
          onProjectTypeChange={onProjectTypeChange}
          onProjectTitleChange={onProjectTitleChange}
          onDueDateChange={onDueDateChange}
          isStatusSaving={isStatusSaving}
        />

        {/* Team Members & Permissions */}
        <ProjectMembersManager projectId={project.project_id} />

        {/* Project Danger Zone */}
        <ProjectDangerZone projectId={project.project_id} projectTitle={project.title} />

        {/* Two-Column Responsive Workspace */}
        <main className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          {/* Script-related content and video-related content flow in separate columns. */}
          <section className="order-2 min-w-0 space-y-0 lg:order-none lg:col-span-6">
            <ScriptBox brief={brief} editable />
            <VisualReferences
              references={brief?.references}
              projectId={project.project_id}
              scriptText={[
                brief?.target_audience ? `Target audience: ${brief.target_audience}` : '',
                ...(brief?.script_scenes ?? []).map((scene) => [scene.title, scene.visual_description, scene.voiceover].filter(Boolean).join('. ')),
                ...(brief?.script_sections ?? []).map((section) => [section.title, section.content].filter(Boolean).join('\n')),
              ].filter(Boolean).join('\n').slice(0, 16000)}
              onChange={(references: MoodboardReference[]) =>
                onUpdateScript({ ...brief, references })
              }
            />
          </section>

          <section className="order-1 min-w-0 space-y-6 lg:order-none lg:col-span-6">
            <ActionAlert deliverable={deliverable} />
            <VideoPlayer deliverable={deliverable} videoAspectRatio={project.video_aspect_ratio ?? '16:9'} onTimecodeSelected={setTc} onApproveCut={onApproveCut} />
            <FeedbackSection
              notes={deliverable?.feedback_notes}
              currentTimecode={tc}
              onAddNote={onAddNote}
            />
          </section>
        </main>

        {/* Client Portal Preview Modal */}
        {preview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-md">
            <div className="w-full max-w-6xl overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl">
              <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900/90 p-4 text-white">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                    Live Client View Simulator
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPreview(false)}
                  className="rounded-lg bg-neutral-800 p-1.5 text-neutral-400 hover:text-white transition"
                  aria-label="Close client preview"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="max-h-[85vh] overflow-y-auto p-4 sm:p-6">
                <ClientPortal
                  project={project}
                  brief={brief}
                  deliverable={deliverable}
                  onAddNote={onAddNote}
                  onApproveCut={onApproveCut}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </ScriptEditorProvider>
  );
};
