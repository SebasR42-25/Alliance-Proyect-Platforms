'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import type { Story, User } from '@/types';

const STORY_DURATION = 5000;

interface StoryViewerProps {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
}

export default function StoryViewer({ stories, initialIndex, onClose }: StoryViewerProps) {
  const [current, setCurrent]   = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused]     = useState(false);
  const [muted, setMuted]       = useState(true);
  const intervalRef             = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef                = useRef<HTMLVideoElement>(null);

  const story  = stories[current];
  const author = story?.author && typeof story.author === 'object' ? story.author as User : null;

  const goNext = useCallback(() => {
    if (current < stories.length - 1) {
      setCurrent((c) => c + 1);
      setProgress(0);
    } else {
      onClose();
    }
  }, [current, stories.length, onClose]);

  const goPrev = () => {
    if (current > 0) {
      setCurrent((c) => c - 1);
      setProgress(0);
    }
  };

  useEffect(() => {
    setProgress(0);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [current]);

  useEffect(() => {
    if (paused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    const step = 100 / (STORY_DURATION / 50);
    intervalRef.current = setInterval(() => {
      setProgress((p) => Math.min(p + step, 100));
    }, 50);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [paused, current, goNext]);

  useEffect(() => {
    if (progress >= 100) goNext();
  }, [progress, goNext]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, goNext]);

  if (!story) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm h-full max-h-[100dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 inset-x-0 z-10 flex gap-1 px-3 pt-3">
          {stories.map((_, i) => (
            <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-none"
                style={{ width: i < current ? '100%' : i === current ? `${progress}%` : '0%' }}
              />
            </div>
          ))}
        </div>

        <div className="absolute top-6 inset-x-0 z-10 flex items-center justify-between px-3 pt-2">
          <div className="flex items-center gap-2">
            {author?.profilePicture
              ? <img src={author.profilePicture} alt={author.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-white" />
              : <div className="w-8 h-8 rounded-full bg-violet-400 flex items-center justify-center text-white font-bold text-sm ring-2 ring-white">
                  {(author?.name ?? 'U').charAt(0).toUpperCase()}
                </div>
            }
            <div>
              <p className="text-white text-xs font-bold drop-shadow">{author?.name ?? 'User'}</p>
              <p className="text-white/60 text-[10px]">
                {new Date(story.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {story.mediaType === 'video' && (
              <button
                onClick={() => {
                  setMuted((m) => !m);
                  if (videoRef.current) videoRef.current.muted = !muted;
                }}
                className="p-1.5 text-white/80 hover:text-white transition-colors"
              >
                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            )}
            <button onClick={onClose} className="p-1.5 text-white/80 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        <div
          className="relative flex-1 overflow-hidden bg-black"
          onMouseDown={() => setPaused(true)}
          onMouseUp={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
        >
          {story.mediaType === 'video'
            ? <video
                ref={videoRef}
                src={story.mediaUrl}
                className="w-full h-full object-contain"
                autoPlay
                loop={false}
                muted={muted}
                playsInline
                onEnded={goNext}
              />
            : <img src={story.mediaUrl} alt="story" className="w-full h-full object-contain" />
          }

          <button
            onClick={goPrev}
            disabled={current === 0}
            className="absolute left-0 inset-y-0 w-1/3 flex items-center justify-start pl-2 opacity-0 hover:opacity-100 transition-opacity disabled:hidden"
          >
            <div className="bg-black/30 rounded-full p-1">
              <ChevronLeft size={20} className="text-white" />
            </div>
          </button>
          <button
            onClick={goNext}
            className="absolute right-0 inset-y-0 w-1/3 flex items-center justify-end pr-2 opacity-0 hover:opacity-100 transition-opacity"
          >
            <div className="bg-black/30 rounded-full p-1">
              <ChevronRight size={20} className="text-white" />
            </div>
          </button>
        </div>

        {stories.length > 1 && (
          <div className="absolute bottom-6 inset-x-0 flex justify-center gap-1.5 z-10">
            {stories.map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrent(i); setProgress(0); }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? 'bg-white scale-125' : 'bg-white/40'}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
