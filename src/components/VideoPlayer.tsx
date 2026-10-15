'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Deliverable } from '@/types';
import { Film, Copy, Check, CheckCircle, Play, Pause, Maximize2, Volume2, VolumeX, ExternalLink } from 'lucide-react';
import { onSignOut, supabase } from '@/lib/supabase';
import { formatRelativeTime } from '@/lib/formatters';

interface VideoPlayerProps {
  deliverable: Deliverable;
  onTimecodeSelected?: (timecode: string) => void;
  onApproveCut?: () => void;
}

/**
 * Signed playback links stay valid for an hour, so minting one on every render
 * or navigation is wasted latency in front of the video. In-flight requests are
 * cached too, which stops a second player for the same cut from asking twice.
 */
const playbackTicketCache = new Map<string, { url: string; expiresAt: number }>();
const playbackTicketRequests = new Map<string, Promise<string>>();
const PLAYBACK_TICKET_SAFETY_MS = 5 * 60 * 1000;

function getPlaybackTicket(projectId: string, path: string): Promise<string> {
  const key = `${projectId}:${path}`;
  const cached = playbackTicketCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return Promise.resolve(cached.url);
  const inFlight = playbackTicketRequests.get(key);
  if (inFlight) return inFlight;
  const request = (async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error('Sign in again to view this project video.');
    const response = await fetch('/api/video/playback-ticket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ projectId, path }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Could not load this video.');
    playbackTicketCache.set(key, { url: result.url, expiresAt: Date.now() + 60 * 60 * 1000 - PLAYBACK_TICKET_SAFETY_MS });
    return result.url as string;
  })();
  playbackTicketRequests.set(key, request);
  return request.finally(() => playbackTicketRequests.delete(key));
}

// A cached link must never outlive the session that asked for it.
onSignOut(() => { playbackTicketCache.clear(); playbackTicketRequests.clear(); });

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

function getGoogleDriveViewUrl(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);
    if (!['drive.google.com', 'www.drive.google.com'].includes(url.hostname.toLowerCase())) return null;
    const fileId = url.pathname.match(/\/file\/d\/([^/]+)/)?.[1] || url.searchParams.get('id');
    if (!fileId || !/^[a-zA-Z0-9_-]+$/.test(fileId)) return null;
    return `https://drive.google.com/file/d/${fileId}/view`;
  } catch {
    return null;
  }
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ deliverable, onTimecodeSelected, onApproveCut }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerFrameRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'landscape' | 'portrait'>('landscape');
  const [currentTime, setCurrentTime] = useState(0);
  // Starts from the stored duration and is corrected by the media's own metadata
  // as soon as it loads, so a stale or missing value is never shown.
  const [mediaDuration, setMediaDuration] = useState(deliverable.duration_seconds || 0);
  const [signedVideoUrl, setSignedVideoUrl] = useState('');
  const [videoLoadError, setVideoLoadError] = useState('');
  const videoUrl = deliverable.video_url?.trim() || signedVideoUrl;
  const isDirectVideo = /\.(mp4|webm|ogg|mov|m4v)(?:$|[?#])/i.test(videoUrl);
  const googleDrivePreviewUrl = getGoogleDrivePreviewUrl(videoUrl);
  const googleDriveViewUrl = getGoogleDriveViewUrl(videoUrl);
  const isApproved = deliverable.approval_status === 'Approved';
  // An embed (Drive, YouTube, Vimeo) exposes no metadata, so there is no usable
  // timeline: the seek bar and timecode stamping only apply to real video files.
  const hasTimeline = isDirectVideo && Number.isFinite(mediaDuration) && mediaDuration > 0;
  const durationLabel = hasTimeline ? formatTime(mediaDuration) : '--:--';

  useEffect(() => {
    setCurrentTime(0);
    setMediaDuration(deliverable.duration_seconds || 0);
    setIsPlaying(false);
  }, [videoUrl, deliverable.duration_seconds]);

  useEffect(() => {
    const updateFullscreen = () => setIsFullscreen(document.fullscreenElement === playerFrameRef.current);
    document.addEventListener('fullscreenchange', updateFullscreen);
    return () => document.removeEventListener('fullscreenchange', updateFullscreen);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadPrivateVideo = async () => {
      if (!deliverable.video_storage_path) { setSignedVideoUrl(''); setVideoLoadError(''); return; }
      setVideoLoadError('');
      try {
        const url = await getPlaybackTicket(deliverable.project_id, deliverable.video_storage_path);
        if (!cancelled) setSignedVideoUrl(url);
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

  const seekTo = (seconds: number) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(seconds)) return;
    const limit = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : seconds;
    const nextTime = Math.max(0, Math.min(seconds, limit));
    video.currentTime = nextTime;
    setCurrentTime(nextTime);
    onTimecodeSelected?.(formatTime(nextTime));
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
    onTimecodeSelected?.(formatTime(video.currentTime));
    // Trust the media file over the stored number: it is authoritative and works
    // even when a project was saved without one.
    if (Number.isFinite(video.duration) && video.duration > 0) setMediaDuration(video.duration);
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => seekTo(Number(event.target.value));

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      try {
        await video.play();
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setVideoLoadError('This video could not start. Try tapping play again.');
      }
    } else if (!video.paused) {
      video.pause();
    }
  };

  /** Shortcuts for reviewing frame by frame without reaching for the mouse. */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    const target = event.target as HTMLElement | null;
    if (target && ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A'].includes(target.tagName)) return;
    const video = videoRef.current;
    if (!video) return;
    switch (event.key) {
      case ' ':
      case 'k':
        event.preventDefault();
        void togglePlayback();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        seekTo(video.currentTime - (event.shiftKey ? 10 : 5));
        break;
      case 'ArrowRight':
        event.preventDefault();
        seekTo(video.currentTime + (event.shiftKey ? 10 : 5));
        break;
      case 'm':
        event.preventDefault();
        setIsMuted((muted) => !muted);
        break;
      case 'f':
        event.preventDefault();
        void toggleFullscreen();
        break;
      default:
        break;
    }
  };

  const toggleFullscreen = async () => {
    const video = videoRef.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (isFullscreen) { await document.exitFullscreen?.(); return; }
    if (video && typeof video.webkitEnterFullscreen === 'function') { video.webkitEnterFullscreen(); return; }
    try { await playerFrameRef.current?.requestFullscreen?.(); } catch { /* Fullscreen may be unavailable in an embedded browser. */ }
  };

  return (
    <section onKeyDown={handleKeyDown} tabIndex={-1} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 md:p-6 shadow-xs space-y-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500" aria-labelledby="video-title">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2"><Film className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /><h2 id="video-title" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Video review</h2></div>
        <div className="flex flex-wrap items-center gap-2"><div className="inline-flex rounded-lg border border-neutral-200 p-0.5 dark:border-neutral-700" role="group" aria-label="Video aspect ratio"><button type="button" aria-pressed={aspectRatio === 'landscape'} onClick={() => setAspectRatio('landscape')} className={`rounded-md px-2 py-1 text-[11px] font-medium ${aspectRatio === 'landscape' ? 'bg-neutral-200 text-neutral-900 dark:bg-neutral-700 dark:text-white' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}>16:9</button><button type="button" aria-pressed={aspectRatio === 'portrait'} onClick={() => setAspectRatio('portrait')} className={`rounded-md px-2 py-1 text-[11px] font-medium ${aspectRatio === 'portrait' ? 'bg-neutral-200 text-neutral-900 dark:bg-neutral-700 dark:text-white' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}>9:16</button></div><span className="text-xs text-neutral-600 dark:text-neutral-300">{deliverable.version_number}</span>{isApproved && <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400"><Check className="h-3.5 w-3.5" /> Approved</span>}</div>
      </div>

      <div ref={playerFrameRef} className={`flex justify-center overflow-hidden rounded-xl bg-neutral-950 ${aspectRatio === 'landscape' ? 'w-full' : 'w-full'}`}>
      <div className={`relative overflow-hidden bg-neutral-950 ${aspectRatio === 'landscape' ? 'aspect-video w-full' : 'h-[min(70vh,700px)] max-h-[70vh] max-w-full aspect-[9/16]'}`}>
        {videoUrl ? (
          isDirectVideo ? (
            <video ref={videoRef} src={videoUrl} muted={isMuted} playsInline preload="metadata" className="h-full w-full bg-black object-contain" onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={() => setIsPlaying(false)} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleTimeUpdate} aria-label={`${deliverable.version_number} video`} />
          ) : googleDrivePreviewUrl ? (
            <>
              <iframe src={googleDrivePreviewUrl} title={`${deliverable.version_number} video`} className="hidden h-full w-full border-0 sm:block" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
              <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center text-white sm:hidden">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-white/10"><Play className="h-6 w-6"/></span>
                <div><p className="text-sm font-semibold">Open this video in Google Drive</p><p className="mt-1 text-xs leading-relaxed text-neutral-400">Drive’s embedded controls are difficult to use on a phone. Open the video directly for full mobile playback controls.</p></div>
                <a href={googleDriveViewUrl ?? videoUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-neutral-950 active:scale-[0.98]"><ExternalLink className="h-4 w-4"/>Open video</a>
              </div>
            </>
          ) : (
            <iframe src={googleDrivePreviewUrl ?? videoUrl} title={`${deliverable.version_number} video`} className="h-full w-full border-0" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
          )
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-neutral-300">
            <span className="grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-white/5 text-neutral-400"><Play className="h-5 w-5" /></span>
            <div><p className="text-sm font-medium text-white">{videoLoadError ? 'Video unavailable' : 'Video coming soon'}</p><p className="mt-1 text-xs text-neutral-400">{videoLoadError || (deliverable.video_storage_path ? 'Preparing the secure video link…' : 'The editor will add the first cut here.')}</p></div>
          </div>
        )}
        {videoUrl && isDirectVideo && !isPlaying && <button type="button" onClick={togglePlayback} aria-label="Play video" className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/75 text-white shadow-lg ring-1 ring-white/30 transition hover:scale-105 hover:bg-black/90 focus:outline-none focus:ring-4 focus:ring-emerald-400"><Play className="h-7 w-7 fill-current" /></button>}
      </div>
      </div>

      {videoUrl && isDirectVideo && <div className="rounded-xl bg-neutral-950 px-2 py-2 text-white sm:px-4">
        <div className="flex items-center gap-1 sm:gap-3">
          <button type="button" onClick={togglePlayback} aria-label={isPlaying ? 'Pause video' : 'Play video'} className="grid h-10 w-10 shrink-0 touch-manipulation place-items-center rounded-full text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400 sm:h-11 sm:w-11">{isPlaying ? <Pause className="h-5 w-5 fill-current"/> : <Play className="h-5 w-5 fill-current"/>}</button>
          <span className="w-9 shrink-0 text-center font-mono text-[11px] tabular-nums sm:w-10 sm:text-xs">{formatTime(currentTime)}</span>
          <input aria-label="Seek video and set feedback timecode" type="range" min={0} max={mediaDuration || 0} step={0.1} value={Math.min(currentTime, mediaDuration || 0)} onChange={handleSeek} disabled={!hasTimeline} className="h-2 min-w-0 flex-1 cursor-pointer touch-manipulation accent-emerald-500 disabled:cursor-not-allowed" />
          <span className="w-9 shrink-0 text-center font-mono text-[11px] tabular-nums sm:w-10 sm:text-xs">{durationLabel}</span>
          <button type="button" onClick={() => setIsMuted((muted) => !muted)} aria-label={isMuted ? 'Unmute video' : 'Mute video'} aria-pressed={isMuted} className="grid h-10 w-9 shrink-0 touch-manipulation place-items-center rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400 sm:h-11 sm:w-11">{isMuted ? <VolumeX className="h-5 w-5"/> : <Volume2 className="h-5 w-5"/>}</button>
          <button type="button" onClick={toggleFullscreen} aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} className="grid h-10 w-9 shrink-0 touch-manipulation place-items-center rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400 sm:h-11 sm:w-11"><Maximize2 className="h-5 w-5"/></button>
        </div>
        <p className="mt-1 text-center text-[10px] text-neutral-400">{hasTimeline ? 'Space plays and pauses · ← → step 5 seconds · Shift + ← → step 10' : 'Loading the timeline…'}</p>
      </div>}

      {videoUrl && !isDirectVideo && <p className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-[11px] text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400">This cut is embedded from an external player, so the timeline and timecode stamping are unavailable. Upload the video file itself to enable frame-accurate notes.</p>}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 pt-3 text-sm dark:border-neutral-800">
        <span className="text-xs text-neutral-500 dark:text-neutral-400">{formatRelativeTime(deliverable.uploaded_at)}</span>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleCopyLink} disabled={!videoUrl} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-neutral-300 px-3 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800">{copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}{copied ? 'Copied' : 'Copy video link'}</button>
          {!isApproved && <button type="button" onClick={onApproveCut} disabled={!videoUrl || Boolean(videoLoadError)} title={videoLoadError ? 'The video must load before it can be approved.' : undefined} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-emerald-700 px-3 text-xs font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-emerald-600 dark:hover:bg-emerald-500"><CheckCircle className="h-3.5 w-3.5" /> Approve cut</button>}
        </div>
      </div>
    </section>
  );
};
