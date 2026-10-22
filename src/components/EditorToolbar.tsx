'use client';

import React, { useEffect, useState } from 'react';
import { Deliverable, CreativeBrief, ActionRequiredBy } from '@/types';
import { supabase } from '@/lib/supabase';
import { 
  Settings2, 
  Upload, 
  AlertCircle, 
  FileEdit, 
  X,
  Download
} from 'lucide-react';
import { migrateScriptToBlocks, ScriptBlocksEditor } from './ScriptBlocksEditor';
import { useScriptEditor } from '@/context/ScriptEditorContext';

function readVideoDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    video.preload = 'metadata';
    video.onloadedmetadata = () => { const duration = Number.isFinite(video.duration) ? Math.round(video.duration) : 0; URL.revokeObjectURL(url); resolve(duration); };
    video.onerror = () => { URL.revokeObjectURL(url); resolve(0); };
    video.src = url;
  });
}

interface EditorToolbarProps {
  deliverable: Deliverable;
  brief: CreativeBrief;
  projectId: string;
  onPostNewCut: (cut: { version: string; videoUrl: string; videoStoragePath?: string; duration: number }) => void;
  onSetActionAlert: (actionBy: ActionRequiredBy, bannerText: string) => void;
  onUpdateScript: (newScript: CreativeBrief) => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  deliverable,
  brief,
  projectId,
  onPostNewCut,
  onSetActionAlert,
  onUpdateScript,
}) => {
  const [activeModal, setActiveModal] = useState<'none' | 'newCut' | 'actionAlert' | 'editScript'>('none');
  const { registerEditor } = useScriptEditor();

  // New Cut Form state. Duration is never asked for: it is read from the chosen
  // file, and the player falls back to the real media duration on playback.
  const [cutVersion, setCutVersion] = useState('');
  const [cutUrl, setCutUrl] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [videoDuration, setVideoDuration] = useState(0);

  // Action Banner state
  const [alertText, setAlertText] = useState(
    deliverable?.action_banner_text || 'Waiting on Client: Please upload your vector logo (.SVG or .AI)'
  );
  const [alertParty, setAlertParty] = useState<ActionRequiredBy>(deliverable?.action_required_by ?? 'Client');

  // Script Edit state
  const [editingBrief, setEditingBrief] = useState(brief);
  const [logoDownloadError, setLogoDownloadError] = useState('');
  const [downloadingLogo, setDownloadingLogo] = useState(false);

  useEffect(() => registerEditor(() => {
    setEditingBrief({ ...brief, script_scenes: [], script_sections: migrateScriptToBlocks(brief.script_scenes ?? [], brief.script_sections ?? []) });
    setActiveModal('editScript');
  }), [brief, registerEditor]);

  const downloadClientLogo = async () => {
    if (!deliverable.logo_storage_path) return;
    setDownloadingLogo(true); setLogoDownloadError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Your editor session expired. Sign in again.');
      const response = await fetch('/api/video/playback-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ projectId, path: deliverable.logo_storage_path, downloadName: deliverable.logo_file_name || 'client-logo' }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not download the client logo.');
      window.location.assign(result.url);
    } catch (error) { setLogoDownloadError(error instanceof Error ? error.message : 'Could not download the client logo.'); }
    finally { setDownloadingLogo(false); }
  };

  const handlePublishCut = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError('');
    setIsUploading(true);
    try {
      const videoUrl = cutUrl.trim();
      let videoStoragePath: string | undefined;
      // Detected when the file is picked, with a re-read here as a fallback.
      let duration = videoDuration;
      if (videoFile) {
        if (videoFile.size > 512 * 1024 * 1024) throw new Error('This video is larger than the 512 MB per-file limit.');
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) throw new Error('Your editor session expired. Sign in again and retry.');
        const ticketResponse = await fetch('/api/video/upload-ticket', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({ projectId, fileName: videoFile.name, contentType: videoFile.type }),
        });
        const ticket = await ticketResponse.json();
        if (!ticketResponse.ok) throw new Error(ticket.error || 'Could not prepare video upload.');
        const { error } = await supabase.storage.from('project-videos').uploadToSignedUrl(ticket.path, ticket.token, videoFile, { contentType: videoFile.type, upsert: false });
        if (error) throw error;
        videoStoragePath = ticket.path;
        if (!duration) duration = await readVideoDuration(videoFile);
      }
      if (!videoUrl && !videoStoragePath) throw new Error('Choose a video file or enter a video URL.');
      onPostNewCut({ version: cutVersion, videoUrl, videoStoragePath, duration });
      setVideoFile(null);
      setCutUrl('');
      setVideoDuration(0);
      setActiveModal('none');
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Video upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const updateScriptBlocks = (content: string) => setEditingBrief({ ...editingBrief, script_scenes: [], script_sections: [{ id: 'script-document', title: '', content, type: 'document' }] });

  const handleSaveActionAlert = (e: React.FormEvent) => {
    e.preventDefault();
    onSetActionAlert(alertParty, alertText);
    setActiveModal('none');
  };

  const handleSaveScript = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateScript(editingBrief);
    setActiveModal('none');
  };

  return (
    <div className="rounded-2xl border border-indigo-500/25 bg-indigo-950/10 p-5 mb-6 shadow-sm space-y-4">
      {/* Editor Header & Role Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-indigo-500/20">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            <Settings2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <span>Editor workspace</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                Editor tools
              </span>
            </div>
            <div className="text-[11px] text-neutral-400">
              Changes are saved to this project and shared with the client portal.
            </div>
          </div>
        </div>

        {/* Quick Action Triggers */}
        <div className="flex flex-wrap items-center gap-2">
          {deliverable.logo_storage_path && <button type="button" onClick={downloadClientLogo} disabled={downloadingLogo} className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-700/50 bg-emerald-950/30 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-950/60 disabled:opacity-60"><Download className="h-3.5 w-3.5"/><span>{downloadingLogo ? 'Preparing logo…' : `Download client logo${deliverable.logo_file_name ? ` · ${deliverable.logo_file_name}` : ''}`}</span></button>}
          <button
            onClick={() => setActiveModal('newCut')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Publish New Cut</span>
          </button>

          <button
            onClick={() => setActiveModal('actionAlert')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-xs font-semibold border border-amber-500/30 transition-colors"
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Manage Client Alert</span>
          </button>

          <button
            onClick={() => { setEditingBrief({ ...brief, script_scenes: [], script_sections: migrateScriptToBlocks(brief.script_scenes ?? [], brief.script_sections ?? []) }); setActiveModal('editScript'); }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 transition-colors"
          >
            <FileEdit className="w-3.5 h-3.5 text-neutral-400" />
            <span>Edit Script / Brief</span>
          </button>
        </div>
        {logoDownloadError && <p role="alert" className="mt-2 text-xs text-red-400">{logoDownloadError}</p>}
      </div>

      {/* MODAL 1: Publish New Cut */}
      {activeModal === 'newCut' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-400" />
                Publish New Video Cut to Client
              </h3>
              <button onClick={() => setActiveModal('none')} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePublishCut} className="space-y-3.5">
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Version Label</label>
                <input
                  type="text"
                  value={cutVersion}
                  onChange={(e) => setCutVersion(e.target.value)}
                  placeholder="e.g. Rough Cut v2, Color Grade v1"
                  required
                  className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Upload video file</label>
                <input type="file" accept="video/*" onChange={async (e) => { const file = e.target.files?.[0] ?? null; setVideoFile(file); setUploadError(''); if (file) { setCutUrl(''); setVideoDuration(await readVideoDuration(file)); } else setVideoDuration(0); }} className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-800 file:px-3 file:py-2 file:text-neutral-100" />
                {videoFile && <p className="mt-1 text-[11px] text-neutral-400">{videoFile.name} · {(videoFile.size / 1024 / 1024).toFixed(1)} MB{videoDuration ? ` · ${Math.floor(videoDuration / 60)}:${String(videoDuration % 60).padStart(2, '0')}` : ''}</p>}
                <p className="mt-1 text-[11px] text-neutral-500">The file uploads directly to the project video storage. Large files may take a few minutes.</p>
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Or paste a hosted video URL</label>
                <input
                  type="text"
                  value={cutUrl}
                  onChange={(e) => setCutUrl(e.target.value)}
                  placeholder="Google Drive share link, MP4, WebM, or embed link"
                  disabled={Boolean(videoFile)}
                  className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-[11px] focus:outline-none focus:border-indigo-500"
                />
                <p className="mt-1 text-[11px] text-neutral-500">For Google Drive, set the file’s General access to “Anyone with the link” and Viewer.</p>
              </div>

              {uploadError && <p role="alert" className="rounded-lg border border-red-900 bg-red-950/40 p-2.5 text-red-300">{uploadError}</p>}

              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-neutral-300 leading-relaxed text-[11px]">
                💡 <strong>What happens:</strong> Publishing replaces the current video in the client portal, where the client can review it and leave notes. The length is read from the video itself.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal('none')}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 hover:bg-neutral-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || (!videoFile && !cutUrl.trim())}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold disabled:cursor-wait disabled:opacity-60"
                >
                  {isUploading ? 'Uploading video…' : 'Publish Cut to Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Manage Client Action Alert */}
      {activeModal === 'actionAlert' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                Control Client Action Item Alert
              </h3>
              <button onClick={() => setActiveModal('none')} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveActionAlert} className="space-y-3.5">
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Who are you waiting on?</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAlertParty('Client')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-colors ${
                      alertParty === 'Client'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    ⚠️ Waiting on Client
                  </button>
                  <button
                    type="button"
                    onClick={() => setAlertParty('None')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-colors ${
                      alertParty === 'None'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    ✓ No Action Needed (Editor Working)
                  </button>
                </div>
              </div>

              {alertParty === 'Client' && (
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">
                    Alert Headline Text
                  </label>
                  <input
                    type="text"
                    value={alertText}
                    onChange={(e) => setAlertText(e.target.value)}
                    placeholder="e.g. Waiting on Client: Please upload your vector logo"
                    required
                    className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal('none')}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 hover:bg-neutral-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold"
                >
                  Save Alert Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Edit Script & Brief */}
      {activeModal === 'editScript' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl space-y-4 text-xs max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileEdit className="w-4 h-4 text-indigo-400" />
                Edit Script & Voiceover
              </h3>
              <button onClick={() => setActiveModal('none')} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveScript} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-neutral-300 font-semibold">Script Version Label</label>
                  <input
                    type="text"
                    value={editingBrief.version_label}
                    onChange={(e) => setEditingBrief({ ...editingBrief, version_label: e.target.value })}
                    className="p-2 rounded-lg bg-neutral-950 border border-neutral-800 text-white mt-1"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-neutral-300 font-semibold">Lock Script</label>
                  <input
                    type="checkbox"
                    checked={editingBrief.is_locked}
                    onChange={(e) => setEditingBrief({ ...editingBrief, is_locked: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                </div>
              </div>

              <div className="space-y-2"><div><h4 className="font-bold text-neutral-200">Script document</h4><p className="mt-1 text-[11px] text-neutral-500">Write naturally in one document. Use the toolbar or Markdown shortcuts to format headings, lists, to-dos, and voice-over.</p></div><ScriptBlocksEditor value={editingBrief.script_sections?.find((section) => section.type === 'document')?.content ?? ''} onChange={updateScriptBlocks} /></div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal('none')}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 hover:bg-neutral-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Save Script Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};








