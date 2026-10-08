'use client';

import React, { useState, useEffect } from 'react';
import { Deliverable } from '@/types';
import { Play, Pause, Film, Copy, Check, CheckCircle } from 'lucide-react';

interface VideoPlayerProps {
  deliverable: Deliverable;
  onTimecodeSelected?: (timecode: string) => void;
  onApproveCut?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  deliverable,
  onTimecodeSelected,
  onApproveCut,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSeconds, setCurrentSeconds] = useState(18);
  const totalSeconds = deliverable.duration_seconds || 65;
  const [copied, setCopied] = useState(false);
  const [isApproved, setIsApproved] = useState(deliverable.approval_status === 'Approved');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentSeconds((prev) => (prev >= totalSeconds ? 0 : prev + 1));
      }, 500);
    }
    return () => clearInterval(timer);
  }, [isPlaying, totalSeconds]);

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const formattedCurrentTime = formatTime(currentSeconds);
  const formattedTotalTime = formatTime(totalSeconds);

  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newSec = Math.round(ratio * totalSeconds);
    setCurrentSeconds(newSec);
    if (onTimecodeSelected) {
      onTimecodeSelected(formatTime(newSec));
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleApprove = () => {
    setIsApproved(true);
    if (onApproveCut) onApproveCut();
  };

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 md:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-indigo-500" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
            Recent Uploads & Cut Preview
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
            {deliverable.version_number}
          </span>
          {isApproved && (
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1">
              <Check className="w-3 h-3" /> Approved
            </span>
          )}
        </div>
      </div>

      {/* Player Frame */}
      <div className="relative rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden group aspect-video flex flex-col justify-between p-4 select-none shadow-md">
        {/* Background Simulated Film Canvas */}
        <div className="absolute inset-0 bg-gradient-to-tr from-neutral-950 via-neutral-900 to-indigo-950/70 -z-10" />
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:16px_16px] -z-10" />

        {/* Top Badges */}
        <div className="flex items-center justify-between z-10">
          <span className="px-2.5 py-1 rounded bg-black/75 text-white font-mono text-[11px] backdrop-blur-xs">
            BUNNY HLS • 4K PRORES PROXY
          </span>
          <span className="px-2 py-0.5 rounded bg-amber-500/90 text-neutral-950 font-bold text-[10px] uppercase">
            Work in Progress
          </span>
        </div>

        {/* Center Simple Play / Pause Button */}
        <div className="flex items-center justify-center z-10 my-auto">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 group-hover:ring-4 group-hover:ring-indigo-500/25"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 translate-x-0.5" fill="currentColor" />
            )}
          </button>
        </div>

        {/* Bottom Scrub Bar & Timecodes */}
        <div className="space-y-1.5 z-10 pt-2">
          <div
            className="w-full bg-white/20 hover:bg-white/30 h-2 rounded-full overflow-hidden cursor-pointer transition-colors"
            onClick={handleScrub}
          >
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-150"
              style={{ width: `${(currentSeconds / totalSeconds) * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-neutral-300 font-mono">
            <span className="font-semibold">
              {formattedCurrentTime} / {formattedTotalTime}
            </span>
            <span className="text-[10px] text-neutral-400">
              Click scrub bar to tag timecode for notes
            </span>
          </div>
        </div>
      </div>

      {/* Controls & Metadata Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-500 dark:text-neutral-400 px-1">
        <span>{deliverable.uploaded_at}</span>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 hover:text-neutral-900 dark:hover:text-neutral-100 font-medium transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied!' : 'Copy direct link'}</span>
          </button>

          {!isApproved && (
            <button
              onClick={handleApprove}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-xs transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Approve This Cut</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
