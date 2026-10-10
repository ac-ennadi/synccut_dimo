'use client';

import React, { useState } from 'react';
import { Project, CreativeBrief, Deliverable, ProjectStatus, ActionRequiredBy, FeedbackNote } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { TopBar } from './TopBar';
import { ScriptBox } from './ScriptBox';
import { VisualReferences } from './VisualReferences';
import { ActionAlert } from './ActionAlert';
import { VideoPlayer } from './VideoPlayer';
import { FeedbackSection } from './FeedbackSection';
import { EditorToolbar } from './EditorToolbar';
import { ClientPortal } from './ClientPortal';
import { Clapperboard, LogOut, Shield, Eye, X, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

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
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const [currentTimecode, setCurrentTimecode] = useState('00:18');
  const [showClientPreviewModal, setShowClientPreviewModal] = useState(false);
  const [clientDetails, setClientDetails] = useState({ name: '', companyName: '', email: '', password: '' });
  const [clientMessage, setClientMessage] = useState<{ error: boolean; text: string } | null>(null);
  const [isAddingClient, setIsAddingClient] = useState(false);

  const handleAddClient = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsAddingClient(true);
    setClientMessage(null);
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      setClientMessage({ error: true, text: 'Your session expired. Sign in again.' });
      setIsAddingClient(false);
      return;
    }
    try {
      const response = await fetch('/api/editor/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(clientDetails),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not add this client.');
      setClientMessage({ error: false, text: `Client account created for ${result.email}.` });
      setClientDetails({ name: '', companyName: '', email: '', password: '' });
    } catch (error) {
      setClientMessage({ error: true, text: error instanceof Error ? error.message : 'Could not add this client.' });
    } finally {
      setIsAddingClient(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/editor/login');
  };

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
              onClick={handleLogout}
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

        <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><UserPlus size={18} /></div>
            <div><h2 className="font-bold">Add a client account</h2><p className="text-xs text-neutral-500">Only the configured editor can create client logins. No email verification is sent.</p></div>
          </div>
          <form onSubmit={handleAddClient} className="grid gap-3 sm:grid-cols-2">
            <input aria-label="Client name" placeholder="Client name" value={clientDetails.name} onChange={(e) => setClientDetails({ ...clientDetails, name: e.target.value })} required minLength={2} className="rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-950" />
            <input aria-label="Company name" placeholder="Company name" value={clientDetails.companyName} onChange={(e) => setClientDetails({ ...clientDetails, companyName: e.target.value })} required minLength={2} className="rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-950" />
            <input aria-label="Client email" type="email" placeholder="Client email" value={clientDetails.email} onChange={(e) => setClientDetails({ ...clientDetails, email: e.target.value })} required className="rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-950" />
            <input aria-label="Temporary password" type="password" placeholder="Temporary password (12+ characters)" value={clientDetails.password} onChange={(e) => setClientDetails({ ...clientDetails, password: e.target.value })} required minLength={12} autoComplete="new-password" className="rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-950" />
            <button disabled={isAddingClient} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60 sm:col-span-2">{isAddingClient ? 'Adding…' : 'Create client login'}</button>
          </form>
          {clientMessage && <p role="status" className={`mt-3 flex items-center gap-2 text-sm ${clientMessage.error ? 'text-rose-600' : 'text-emerald-600'}`}>{clientMessage.error ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}{clientMessage.text}</p>}
        </section>

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
