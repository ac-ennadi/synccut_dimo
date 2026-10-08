'use client';

import React, { useState } from 'react';
import { FeedbackNote } from '@/types';
import { MessageSquare, Send, Clock, CheckCheck } from 'lucide-react';

interface FeedbackSectionProps {
  notes: FeedbackNote[];
  currentTimecode: string;
  onAddNote: (note: Omit<FeedbackNote, 'id' | 'created_at'>) => void;
}

export const FeedbackSection: React.FC<FeedbackSectionProps> = ({
  notes,
  currentTimecode,
  onAddNote,
}) => {
  const [content, setContent] = useState('');
  const [timecodeTag, setTimecodeTag] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onAddNote({
      author_name: 'Client (You)',
      timecode: timecodeTag || undefined,
      content: content.trim(),
    });

    setContent('');
    setTimecodeTag(null);
  };

  const handleStampTimecode = () => {
    setTimecodeTag(currentTimecode);
  };

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 md:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-500" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
            Feedback & Notes
          </h2>
        </div>
        <span className="text-[11px] text-neutral-500">Directly syncs to editing bay</span>
      </div>

      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        Type your notes below. No need to send an email—our editors receive these immediately with frame timestamps:
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="e.g., At 00:15, loved the barista espresso shot! Please ensure the background sign is in focus."
            required
            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-3 text-xs leading-relaxed text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
          />

          {timecodeTag && (
            <div className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 text-[10px] font-mono font-bold border border-indigo-200 dark:border-indigo-800">
              <Clock className="w-3 h-3" />
              <span>Stamped @ {timecodeTag}</span>
              <button
                type="button"
                onClick={() => setTimecodeTag(null)}
                className="ml-1 hover:text-rose-500"
              >
                ×
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleStampTimecode}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-medium transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>+ Stamp Timecode ({currentTimecode})</span>
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs transition-transform active:scale-98"
          >
            <span>Send Note</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      {/* Logged Notes Feed */}
      <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            Logged Feedback ({notes.length})
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCheck className="w-3 h-3" /> Real-time active
          </span>
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/40 text-xs space-y-1"
            >
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-neutral-900 dark:text-neutral-100">
                    {note.author_name}
                  </span>
                  {note.timecode && (
                    <span className="px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-mono font-bold text-[10px] border border-indigo-200 dark:border-indigo-800/40">
                      ⏱ {note.timecode}
                    </span>
                  )}
                </div>
                <span className="text-neutral-400 text-[10px]">{note.created_at}</span>
              </div>
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {note.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
