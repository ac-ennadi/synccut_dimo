'use client';

import React, { useState } from 'react';
import { Deliverable, CreativeBrief, ActionRequiredBy } from '@/types';
import { 
  Settings2, 
  Upload, 
  AlertCircle, 
  FileEdit, 
  X
} from 'lucide-react';

interface EditorToolbarProps {
  deliverable: Deliverable;
  brief: CreativeBrief;
  onPostNewCut: (cut: { version: string; videoUrl: string; duration: number }) => void;
  onSetActionAlert: (actionBy: ActionRequiredBy, bannerText: string) => void;
  onUpdateScript: (newScript: CreativeBrief) => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  deliverable,
  brief,
  onPostNewCut,
  onSetActionAlert,
  onUpdateScript,
}) => {
  const [activeModal, setActiveModal] = useState<'none' | 'newCut' | 'actionAlert' | 'editScript'>('none');

  // New Cut Form state
  const [cutVersion, setCutVersion] = useState('');
  const [cutUrl, setCutUrl] = useState('');
  const [cutDuration, setCutDuration] = useState(0);

  // Action Banner state
  const [alertText, setAlertText] = useState(
    deliverable.action_banner_text || 'Waiting on Client: Please upload your vector logo (.SVG or .AI)'
  );
  const [alertParty, setAlertParty] = useState<ActionRequiredBy>(deliverable.action_required_by);

  // Script Edit state
  const [editingBrief, setEditingBrief] = useState(brief);

  const handlePublishCut = (e: React.FormEvent) => {
    e.preventDefault();
    onPostNewCut({
      version: cutVersion,
      videoUrl: cutUrl,
      duration: cutDuration,
    });
    setActiveModal('none');
  };

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
            onClick={() => setActiveModal('editScript')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 transition-colors"
          >
            <FileEdit className="w-3.5 h-3.5 text-neutral-400" />
            <span>Edit Script / Brief</span>
          </button>
        </div>
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
                <label className="block text-neutral-300 font-semibold mb-1">
                  Video URL
                </label>
                <input
                  type="text"
                  value={cutUrl}
                  onChange={(e) => setCutUrl(e.target.value)}
                  placeholder="MP4, WebM, or video embed link"
                  required
                  className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-[11px] focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Duration in seconds</label>
                <input
                  type="number"
                  value={cutDuration}
                  min={1}
                  onChange={(e) => setCutDuration(Number(e.target.value))}
                  required
                  className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-neutral-300 leading-relaxed text-[11px]">
                💡 <strong>What happens:</strong> Publishing replaces the current video in the client portal, where the client can review it and leave notes.
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
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Publish Cut to Client
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

              <div className="space-y-3">
                <span className="font-bold text-neutral-300">Scenes & Voiceover Lines:</span>
                {editingBrief.script_scenes.map((scene, idx) => (
                  <div key={scene.scene_number} className="p-3 rounded-xl border border-neutral-800 bg-neutral-950 space-y-2">
                    <div className="font-semibold text-indigo-400">
                      Scene {scene.scene_number}: {scene.title} ({scene.timecode})
                    </div>
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-0.5">Voiceover Text</label>
                      <textarea
                        rows={2}
                        value={scene.voiceover}
                        onChange={(e) => {
                          const updated = [...editingBrief.script_scenes];
                          updated[idx] = { ...updated[idx], voiceover: e.target.value };
                          setEditingBrief({ ...editingBrief, script_scenes: updated });
                        }}
                        className="w-full p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs"
                      />
                    </div>
                  </div>
                ))}
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








