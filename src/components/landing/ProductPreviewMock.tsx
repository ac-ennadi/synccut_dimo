'use client';

import React, { useState } from 'react';
import {
  Play,
  Pause,
  Clock,
  Send,
  CheckCircle2,
  Lock,
  FileText,
  MessageSquare,
  Sparkles,
  UserCheck,
  Check,
  Clapperboard,
  Upload,
  ArrowRight
} from 'lucide-react';

export function ProductPreviewMock() {
  const [activeTab, setActiveTab] = useState<'client' | 'editor'>('client');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimecode, setCurrentTimecode] = useState('00:24');
  const [isApproved, setIsApproved] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [stampedTime, setStampedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState([
    {
      id: '1',
      author: 'Sarah Jenkins',
      role: 'Client',
      timecode: '00:24',
      text: 'Love the energy here! Can we hold the runner hero shot for 1 extra second before the beat drop?',
      time: '12m ago',
    },
    {
      id: '2',
      author: 'Marcus Vance',
      role: 'Editor',
      timecode: '00:45',
      text: 'Updated the sound mix so the voiceover cuts through the bass cleanly.',
      time: '2h ago',
    },
  ]);

  const handleAddDemoNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    setNotes([
      {
        id: String(Date.now()),
        author: activeTab === 'client' ? 'Sarah Jenkins' : 'Marcus Vance',
        role: activeTab === 'client' ? 'Client' : 'Editor',
        timecode: stampedTime || currentTimecode,
        text: newNoteText.trim(),
        time: 'Just now',
      },
      ...notes,
    ]);
    setNewNoteText('');
    setStampedTime(null);
  };

  const stages = [
    { name: 'Script', done: true },
    { name: 'Pre-prod', done: true },
    { name: 'Shoot', done: true },
    { name: 'Edit', current: true },
    { name: 'Final review', done: false },
    { name: 'Complete', done: false },
  ];

  return (
    <section id="preview" className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Container framing */}
      <div className="rounded-2xl sm:rounded-3xl border border-neutral-800 bg-neutral-900/60 p-2 sm:p-4 shadow-2xl backdrop-blur-xl">
        {/* Browser Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800/80 px-3 py-3 sm:px-5">
          {/* Traffic light dots */}
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-rose-500/80" />
            <div className="h-3 w-3 rounded-full bg-amber-500/80" />
            <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
            <span className="ml-3 hidden text-xs font-mono text-neutral-400 sm:inline">
              synccut.app/workspace/nike-summer-anthem
            </span>
          </div>

          {/* Interactive Mode Switcher */}
          <div className="flex items-center gap-1 rounded-xl border border-neutral-800 bg-neutral-950 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('client')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === 'client'
                  ? 'bg-emerald-500 text-neutral-950 shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span>Client View</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === 'editor'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Clapperboard className="h-3.5 w-3.5" />
              <span>Editor Cockpit</span>
            </button>
          </div>
        </div>

        {/* Mock Application Workspace */}
        <div className="space-y-5 p-3 sm:p-6">
          {/* Top Project Bar */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">
                  {activeTab === 'client' ? 'Client Workspace' : 'Editor Management'}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
                  Nike • Summer Campaign 2026
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Due Thursday, Oct 24 • Producer Marcus Vance
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                {activeTab === 'editor' ? (
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-500"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload New Cut (V4)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsApproved(!isApproved)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold shadow-xs transition ${
                      isApproved
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-emerald-500 text-neutral-950 hover:brightness-110'
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{isApproved ? 'Approved ✓' : 'Approve This Cut'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Stages Stepper */}
            <div className="mt-5 border-t border-neutral-800/80 pt-4">
              <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
                <span className="font-medium text-neutral-300">Project progress</span>
                <span className="text-emerald-400 font-mono text-[11px]">Editing in progress</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {stages.map((stage) => (
                  <div
                    key={stage.name}
                    className={`flex items-center justify-center gap-1.5 rounded-lg py-2 px-1 text-[11px] font-semibold border ${
                      stage.current
                        ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300 shadow-xs ring-1 ring-emerald-500/30'
                        : stage.done
                        ? 'border-neutral-800 bg-neutral-900/80 text-neutral-300'
                        : 'border-neutral-800/50 bg-neutral-950/40 text-neutral-600'
                    }`}
                  >
                    {stage.done ? (
                      <Check className="h-3 w-3 text-emerald-400" />
                    ) : stage.current ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    ) : null}
                    <span>{stage.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Two-Column Workspace Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column: Creative Brief & Script */}
            <div className="space-y-4 lg:col-span-5 order-2 lg:order-1">
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400">
                    <FileText className="h-4 w-4 text-indigo-400" />
                    <span>Creative Brief & Script</span>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/50 border border-emerald-800/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                    <Lock className="h-2.5 w-2.5" />
                    Locked V3
                  </span>
                </div>

                {/* Scene Breakdown */}
                <div className="mt-4 space-y-4">
                  <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-3 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-neutral-400">
                      <span className="font-mono font-bold text-indigo-400">01 • Intro Sunrise</span>
                      <span className="font-mono text-[10px]">00:00 - 00:15</span>
                    </div>
                    <p className="text-neutral-300">
                      Wide cinematic silhouette of athlete tying shoes on track in dawn mist.
                    </p>
                    <blockquote className="border-l-2 border-indigo-400/80 pl-2.5 italic text-neutral-400 text-[11px]">
                      &ldquo;Greatness doesn&rsquo;t wait for permission.&rdquo;
                    </blockquote>
                  </div>

                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-xs space-y-1.5 ring-1 ring-emerald-500/20">
                    <div className="flex items-center justify-between text-neutral-400">
                      <span className="font-mono font-bold text-emerald-400">02 • High Intensity Sprint</span>
                      <span className="font-mono text-[10px] text-emerald-400 font-bold">00:15 - 00:45 (Active)</span>
                    </div>
                    <p className="text-neutral-300">
                      High-speed track footage with beat sync, switching to close-up muscle movement.
                    </p>
                    <blockquote className="border-l-2 border-emerald-400/80 pl-2.5 italic text-neutral-300 text-[11px]">
                      &ldquo;Every stride, every second, every heartbeat.&rdquo;
                    </blockquote>
                  </div>
                </div>

                {/* Visual References */}
                <div className="mt-4 border-t border-neutral-800 pt-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                    Visual References
                  </span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-lg border border-neutral-800 bg-neutral-900 px-2 py-1 text-[11px] text-neutral-300">
                      🎨 High-contrast anamorphic
                    </span>
                    <span className="rounded-lg border border-neutral-800 bg-neutral-900 px-2 py-1 text-[11px] text-neutral-300">
                      ⚡ Quick-cut tempo
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Video Cut & Timecoded Feedback */}
            <div className="space-y-4 lg:col-span-7 order-1 lg:order-2">
              {/* Action Banner */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 px-4 py-2.5 flex items-center justify-between text-xs text-amber-300">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                  <span className="font-medium">
                    {activeTab === 'client'
                      ? 'Action needed: Review Cut V3 and leave notes or approve.'
                      : 'Client is currently reviewing Cut V3.'}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-amber-400/80">Cut V3.mp4</span>
              </div>

              {/* Video Player Mock */}
              <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-md">
                {/* Simulated video frame */}
                <div className="relative aspect-video w-full bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 flex items-center justify-center group">
                  {/* Subtle video background art */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/40 via-neutral-950/80 to-neutral-950" />
                  <div className="relative text-center space-y-2 z-10">
                    <button
                      type="button"
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-neutral-950 shadow-lg shadow-emerald-500/30 transition hover:scale-105 active:scale-95"
                      aria-label={isPlaying ? 'Pause video' : 'Play video'}
                    >
                      {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
                    </button>
                    <p className="text-xs font-mono text-neutral-400">
                      Nike_Summer_Campaign_V3_ColorGraded.mp4
                    </p>
                  </div>

                  {/* Top-right Cut Badge */}
                  <div className="absolute top-3 right-3 rounded-lg bg-neutral-900/80 px-2 py-1 text-[10px] font-mono text-neutral-300 border border-neutral-700/60 backdrop-blur-xs">
                    4K ProRes • 24 FPS
                  </div>
                </div>

                {/* Scrubber & Controls */}
                <div className="p-3 border-t border-neutral-800/80 bg-neutral-950/90 space-y-2">
                  <div className="relative h-1.5 w-full rounded-full bg-neutral-800 cursor-pointer overflow-hidden">
                    <div className="h-full w-[38%] rounded-full bg-gradient-to-r from-emerald-500 to-indigo-500" />
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-semibold">{currentTimecode}</span>
                      <span>/</span>
                      <span>01:30</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStampedTime(currentTimecode)}
                      className="inline-flex items-center gap-1 rounded-md bg-neutral-800 hover:bg-neutral-700 px-2 py-1 text-[11px] font-sans font-medium text-neutral-200 transition"
                    >
                      <Clock className="h-3 w-3 text-emerald-400" />
                      <span>Stamp moment ({currentTimecode})</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Feedback Section */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4 sm:p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-300">
                    <MessageSquare className="h-4 w-4 text-emerald-400" />
                    <span>Timecoded Notes ({notes.length})</span>
                  </div>
                  <span className="text-[11px] text-neutral-400">Shared instantly</span>
                </div>

                {/* Note submission input */}
                <form onSubmit={handleAddDemoNote} className="space-y-2">
                  <div className="relative">
                    <textarea
                      rows={2}
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder="Type a revision note... Click 'Stamp moment' to link to the video timeline."
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-900/80 p-3 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                    />
                    {stampedTime && (
                      <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 rounded bg-emerald-950/80 border border-emerald-800 px-1.5 py-0.5 text-[10px] font-mono text-emerald-400">
                        ⏱ {stampedTime}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!newNoteText.trim()}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 text-xs font-semibold text-neutral-950 transition"
                    >
                      <span>Post note</span>
                      <Send className="h-3 w-3" />
                    </button>
                  </div>
                </form>

                {/* Feed of Notes */}
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-xl border border-neutral-800/80 bg-neutral-900/50 p-3 text-xs space-y-1 transition hover:border-neutral-700"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{note.author}</span>
                          <span className="rounded bg-neutral-800 px-1.5 py-0.2 text-[9px] text-neutral-400">
                            {note.role}
                          </span>
                          <button
                            type="button"
                            onClick={() => setCurrentTimecode(note.timecode)}
                            className="inline-flex items-center gap-1 rounded bg-indigo-950/60 border border-indigo-800/40 px-1.5 py-0.2 text-[10px] font-mono font-bold text-indigo-400 hover:brightness-125"
                          >
                            ⏱ {note.timecode}
                          </button>
                        </div>
                        <span className="text-[10px] text-neutral-500">{note.time}</span>
                      </div>
                      <p className="text-neutral-300 leading-relaxed">{note.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
