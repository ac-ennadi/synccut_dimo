'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Deliverable } from '@/types';
import { Film, Copy, Check, CheckCircle, Play } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface VideoPlayerProps {
  deliverable: Deliverable;
  onTimecodeSelected?: (timecode: string) => void;
  onApproveCut?: () => void;
}

const formatTime = (seconds: number) => {
  const wholeSeconds = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(wholeSeconds / 60)).padStart(2, '0')}:${String(wholeSeconds % 60).padStart(2, '0')}`;
};

function getGoogleDrivePreviewUrl(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);
    if (!['drive.google.com', 'www.drive.google.com'].includes(url.hostname.toLowerCase())) return null;
    const fileId = url.pathname.match(/\/file\/d\/([^/]+)/)?.[1] || url.searchParams.get('id');
    if (!fileId || !/^[a-zA-Z0-9_-]+$/.test(fileId)) return null;
    return `https://drive.google.com/file/d/${fileId}/preview`;
  } catch {
    return null;
  }
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ deliverable, onTimecodeSelected, onApproveCut }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [copied, setCopied] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'landscape' | 'portrait'>('landscape');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(deliverable.duration_seconds || 0);
  const [signedVideoUrl, setSignedVideoUrl] = useState('');
  const [videoLoadError, setVideoLoadError] = useState('');
  const videoUrl = deliverable.video_url?.trim() || signedVideoUrl;
  const isDirectVideo = /\.(mp4|webm|ogg|mov|m4v)(?:$|[?#])/i.test(videoUrl);
  const googleDrivePreviewUrl = getGoogleDrivePreviewUrl(videoUrl);
  const isApproved = deliverable.approval_status === 'Approved';

  useEffect(() => {
    setCurrentTime(0);
    setDuration(deliverable.duration_seconds || 0);
  }, [videoUrl, deliverable.duration_seconds]);

  useEffect(() => {
    let cancelled = false;
    const loadPrivateVideo = async () => {
      if (!deliverable.video_storage_path) { setSignedVideoUrl(''); setVideoLoadError(''); return; }
      setVideoLoadError('');
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) throw new Error('Sign in again to view this project video.');
        const response = await fetch('/api/video/playback-ticket', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({ projectId: deliverable.project_id, path: deliverable.video_storage_path }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Could not load this video.');
        if (!cancelled) setSignedVideoUrl(result.url);
      } catch (error) {
        if (!cancelled) setVideoLoadError(error instanceof Error ? error.message : 'Could not load this video.');
      }
    };
    void loadPrivateVideo();
    return () => { cancelled = true; };
  }, [deliverable.project_id, deliverable.video_storage_path]);

  const handleCopyLink = async () => {
    if (!videoUrl || !navigator.clipboard) return;
    await navigator.clipboard.writeText(videoUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
    onTimecodeSelected?.(formatTime(video.currentTime));
    if (Number.isFinite(video.duration)) setDuration(video.duration);
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextTime = Number(event.target.value);
    if (videoRef.current) videoRef.current.currentTime = nextTime;
    setCurrentTime(nextTime);
    onTimecodeSelected?.(formatTime(nextTime));
  };

  return (
    <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 md:p-6 shadow-xs space-y-4" aria-labelledby="video-title">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2"><Film className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /><h2 id="video-title" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Video review</h2></div>
        <div className="flex flex-wrap items-center gap-2"><div className="inline-flex rounded-lg border border-neutral-200 p-0.5 dark:border-neutral-700" role="group" aria-label="Video aspect ratio"><button type="button" aria-pressed={aspectRatio === 'landscape'} onClick={() => setAspectRatio('landscape')} className={`rounded-md px-2 py-1 text-[11px] font-medium ${aspectRatio === 'landscape' ? 'bg-neutral-200 text-neutral-900 dark:bg-neutral-700 dark:text-white' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}>16:9</button><button type="button" aria-pressed={aspectRatio === 'portrait'} onClick={() => setAspectRatio('portrait')} className={`rounded-md px-2 py-1 text-[11px] font-medium ${aspectRatio === 'portrait' ? 'bg-neutral-200 text-neutral-900 dark:bg-neutral-700 dark:text-white' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}>9:16</button></div><span className="text-xs text-neutral-600 dark:text-neutral-300">{deliverable.version_number}</span>{isApproved && <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400"><Check className="h-3.5 w-3.5" /> Approved</span>}</div>
      </div>

      <div className={`flex justify-center overflow-hidden rounded-xl bg-neutral-950 ${aspectRatio === 'landscape' ? 'w-full' : 'w-full'}`}>
      <div className={`relative overflow-hidden bg-neutral-950 ${aspectRatio === 'landscape' ? 'aspect-video w-full' : 'h-[min(70vh,700px)] max-h-[70vh] max-w-full aspect-[9/16]'}`}>
        {videoUrl ? (
          isDirectVideo ? (
            <video ref={videoRef} src={videoUrl} controls playsInline className="h-full w-full bg-black object-contain" onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleTimeUpdate} aria-label={`${deliverable.version_number} video`} />
          ) : (
            <iframe src={googleDrivePreviewUrl ?? videoUrl} title={`${deliverable.version_number} video`} className="h-full w-full border-0" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
          )
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-neutral-300">
            <span className="grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-white/5 text-neutral-400"><Play className="h-5 w-5" /></span>
            <div><p className="text-sm font-medium text-white">{videoLoadError ? 'Video unavailable' : 'Video coming soon'}</p><p className="mt-1 text-xs text-neutral-400">{videoLoadError || (deliverable.video_storage_path ? 'Preparing the secure video link…' : 'The editor will add the first cut here.')}</p></div>
          </div>
        )}
      </div>
      </div>

      {videoUrl && isDirectVideo && <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400"><span className="w-12 shrink-0 font-mono tabular-nums">{formatTime(currentTime)}</span><input aria-label="Seek video and set feedback timecode" type="range" min={0} max={duration || 0} step={0.1} value={Math.min(currentTime, duration || 0)} onChange={handleSeek} disabled={!duration} className="h-1.5 w-full cursor-pointer accent-emerald-600 disabled:cursor-not-allowed" /><span className="w-12 shrink-0 text-right font-mono tabular-nums">{duration ? formatTime(duration) : '--:--'}</span><span className="hidden sm:inline">Seeking sets the note timecode</span></div>}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 pt-3 text-sm dark:border-neutral-800">
        <span className="text-xs text-neutral-500 dark:text-neutral-400">{deliverable.uploaded_at}</span>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleCopyLink} disabled={!videoUrl} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-neutral-300 px-3 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800">{copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}{copied ? 'Copied' : 'Copy video link'}</button>
          {!isApproved && <button type="button" onClick={onApproveCut} disabled={!videoUrl} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-emerald-700 px-3 text-xs font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-emerald-600 dark:hover:bg-emerald-500"><CheckCircle className="h-3.5 w-3.5" /> Approve cut</button>}
        </div>
      </div>
    </section>
  );
};

