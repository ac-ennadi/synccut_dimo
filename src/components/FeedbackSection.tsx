'use client';

import React, { useState } from 'react';
import { FeedbackNote } from '@/types';
import { MessageSquare, Send, Clock, CheckCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface FeedbackSectionProps {
  notes: FeedbackNote[];
  currentTimecode: string;
  onAddNote: (note: Omit<FeedbackNote, 'id' | 'created_at'>) => void | Promise<void>;
}

export const FeedbackSection: React.FC<FeedbackSectionProps> = ({
  notes,
  currentTimecode,
  onAddNote,
}) => {
  const [content, setContent] = useState('');
  const [manualTimecode, setManualTimecode] = useState('');
  const [timecodeTag, setTimecodeTag] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { currentUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSending) return;

    setIsSending(true);
    setErrorMessage('');
    try {
      await onAddNote({
        author_name: currentUser?.name || 'Team member',
        timecode: timecodeTag || undefined,
        content: content.trim(),
      });
      setContent('');
      setManualTimecode('');
      setTimecodeTag(null);
    } catch {
      setErrorMessage('Could not save your feedback. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleStampTimecode = () => {
    const timecode = manualTimecode.trim() || currentTimecode;
    if (timecode) setTimecodeTag(timecode);
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
        <span className="text-[11px] text-neutral-500">Shared with your editor</span>
      </div>

      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        Tell us what you think about the video, why it works or doesn’t, and what you’d like changed. Add a timecode to point to a specific moment.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What do you think about this moment, and why? What would you like changed?"
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
          <label className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400"><span>Timecode</span><input type="text" inputMode="numeric" pattern="[0-9]{2}:[0-9]{2}" maxLength={5} value={manualTimecode} onChange={(event) => setManualTimecode(event.target.value)} placeholder={currentTimecode || "00:00"} aria-label="Enter a video timecode in minutes and seconds" className="w-20 rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-1.5 font-mono text-neutral-900 placeholder:text-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100" /></label>
          <button
            type="button"
            onClick={handleStampTimecode}
            disabled={!currentTimecode && !manualTimecode.trim()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>{manualTimecode ? "Stamp entered timecode" : currentTimecode ? "Stamp current moment (" + currentTimecode + ")" : "Add a timecode"}</span>
          </button>

          <button
            type="submit"
            disabled={isSending || !content.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs transition-transform active:scale-98"
          >
            <span>{isSending ? 'Saving…' : 'Post feedback'}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        {errorMessage && <p role="alert" className="text-xs text-rose-500">{errorMessage}</p>}
      </form>

      {/* Logged Notes Feed */}
      <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            Feedback ({notes.length})
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCheck className="w-3 h-3" /> Shared feedback
          </span>
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {notes.length === 0 ? (
            <p className="rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 p-4 text-center text-xs text-neutral-500 dark:text-neutral-400">
              No feedback yet. Your notes about the video will appear here.
            </p>
          ) : notes.map((note) => (
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








