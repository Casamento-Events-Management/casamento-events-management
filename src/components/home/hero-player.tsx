'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Play, Pause, Volume2, VolumeX, X } from 'lucide-react';
import type { HeroSection, VideoSource } from '@/types';
import { Button } from '@/components/ui/button';

interface HeroPlayerProps {
  hero: HeroSection;
}

type VideoEmbedInfo =
  | { type: 'native'; url: string }
  | { type: 'youtube'; url: string }
  | { type: 'vimeo'; url: string };

function getVideoEmbedInfo(source?: VideoSource): VideoEmbedInfo {
  if (!source) return { type: 'native', url: '' };

  // Sanity native file asset
  if (source._type === 'sanity') {
    return { type: 'native', url: source.asset?.url ?? '' };
  }

  const rawUrl = source.url ?? '';

  // Direct file extension — treat as native <video>
  if (
    rawUrl.endsWith('.mp4') ||
    rawUrl.endsWith('.webm') ||
    rawUrl.endsWith('.mov') ||
    rawUrl.includes('.mp4?') ||
    rawUrl.includes('gtv-videos-bucket')
  ) {
    return { type: 'native', url: rawUrl };
  }

  // YouTube
  if (
    rawUrl.includes('youtube.com') ||
    rawUrl.includes('youtu.be') ||
    rawUrl.includes('youtube-nocookie.com')
  ) {
    let videoId = '';
    if (rawUrl.includes('embed/')) {
      videoId = rawUrl.split('embed/')[1]?.split('?')[0] ?? '';
    } else if (rawUrl.includes('watch?v=')) {
      videoId = rawUrl.split('watch?v=')[1]?.split('&')[0] ?? '';
    } else if (rawUrl.includes('youtu.be/')) {
      videoId = rawUrl.split('youtu.be/')[1]?.split('?')[0] ?? '';
    }

    // youtube-nocookie.com avoids PREF / tracking cookies.
    // controls=1 → show YT native UI. rel=0 → no related vids after end.
    const embedUrl = videoId
      ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&controls=1`
      : rawUrl;

    return { type: 'youtube', url: embedUrl };
  }

  // Vimeo
  if (rawUrl.includes('vimeo.com')) {
    let videoId = '';
    if (rawUrl.includes('player.vimeo.com/video/')) {
      videoId = rawUrl.split('player.vimeo.com/video/')[1]?.split('?')[0] ?? '';
    } else if (rawUrl.includes('vimeo.com/')) {
      videoId = rawUrl.split('vimeo.com/')[1]?.split('?')[0] ?? '';
    }

    const embedUrl = videoId
      ? `https://player.vimeo.com/video/${videoId}?autoplay=1&color=BC6F07`
      : rawUrl;

    return { type: 'vimeo', url: embedUrl };
  }

  // Fallback — treat as native
  return { type: 'native', url: rawUrl };
}

export function HeroPlayer({ hero }: HeroPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const selectedVideo = hero.showreelMobileVideo || hero.showreelVideo;
  const videoInfo = getVideoEmbedInfo(selectedVideo);
  const audioUrl = hero.backgroundMusic?.asset?.url;

  // For external providers (YouTube/Vimeo) the platform's own player handles
  // play/pause/mute — we only expose the close button so the user can go back.
  const isExternal = videoInfo.type === 'youtube' || videoInfo.type === 'vimeo';

  const handleStartPlay = () => {
    setIsPlaying(true);
    setIsPaused(false);
    if (!isExternal) {
      setTimeout(() => {
        videoRef.current?.play().catch((err) => console.warn('Video play error:', err));
        if (audioUrl) {
          audioRef.current?.play().catch((err) => console.warn('Audio play error:', err));
        }
      }, 100);
    }
  };

  const handleTogglePause = () => {
    if (!videoRef.current) return;
    if (isPaused) {
      videoRef.current.play();
      if (audioUrl) audioRef.current?.play();
      setIsPaused(false);
    } else {
      videoRef.current.pause();
      if (audioUrl) audioRef.current?.pause();
      setIsPaused(true);
    }
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isAudioMuted;
    }
    setIsAudioMuted((prev) => !prev);
  };

  const handleClose = () => {
    if (videoRef.current) videoRef.current.pause();
    if (audioRef.current) audioRef.current.pause();
    setIsPlaying(false);
    setIsPaused(false);
  };

  return (
    <div className="relative w-full h-[90vh] min-h-[550px] md:h-[90vh] md:min-h-[700px] flex items-center justify-center overflow-hidden bg-[#2A3A14]">

      {/* ── 1. THUMBNAIL POSTER MODE (default – no autoplay) ── */}
      {!isPlaying && (
        <div className="absolute inset-0 z-10">
          <Image
            src={hero.showreelThumbnail.asset.url || ''}
            alt={hero.showreelThumbnail.alt || 'Casamento Events Showreel'}
            fill
            priority
            sizes="100vw"
            className="object-cover brightness-75 transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />
        </div>
      )}

      {/* ── 2. VIDEO PLAYBACK MODE ── */}
      {isPlaying && (
        <div className="absolute inset-0 z-10 bg-black">
          {videoInfo.type === 'native' ? (
            /* Native Sanity / direct MP4 */
            <video
              ref={videoRef}
              src={videoInfo.url}
              controls={false}
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            /* External (YouTube / Vimeo) – full-bleed iframe.
               The iframe itself handles all playback controls.
               pointer-events are enabled so the YT/Vimeo UI is interactive. */
            <div className="absolute inset-0 overflow-hidden">
              <iframe
                src={videoInfo.url}
                title="Casamento Events Showreel"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-0"
                style={{ width: '177.78vh', height: '100vh', minWidth: '100%', minHeight: '56.25vw' }}
                allow="autoplay; picture-in-picture; fullscreen"
                allowFullScreen
              />
            </div>
          )}

          {/* Background music track (only used for native videos) */}
          {audioUrl && !isExternal && (
            <audio ref={audioRef} src={audioUrl} loop muted={isAudioMuted} />
          )}

          {/* ── Controls Bar ── */}
          <div className="absolute bottom-6 right-6 z-30 flex items-center gap-1 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-xl">

            {/* Play / Pause — native only */}
            {!isExternal && (
              <>
                <button
                  onClick={handleTogglePause}
                  className="p-2 rounded-full text-white hover:text-[#BC6F07] transition-colors cursor-pointer"
                  title={isPaused ? 'Play Video' : 'Pause Video'}
                >
                  {isPaused
                    ? <Play size={18} fill="currentColor" />
                    : <Pause size={18} />
                  }
                </button>

                <button
                  onClick={toggleAudio}
                  className="p-2 rounded-full text-white hover:text-[#BC6F07] transition-colors cursor-pointer"
                  title={isAudioMuted ? 'Unmute Sound' : 'Mute Sound'}
                >
                  {isAudioMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>

                {/* Divider */}
                <div className="h-4 w-px bg-white/25 mx-1" />
              </>
            )}

            {/* Close — always visible */}
            <button
              onClick={handleClose}
              className="p-2 rounded-full text-white hover:text-red-400 transition-colors cursor-pointer"
              title="Close Video & Return to Hero"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ── 3. HERO OVERLAY CONTENT (Brandline, Play Trigger, CTAs) ── */}
      <div
        className={`relative z-20 max-w-5xl mx-auto px-4 sm:px-6 text-center text-white transition-opacity duration-500 ${
          isPlaying ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-normal tracking-tight text-[#F7F3E8] leading-tight mb-6 sm:mb-8 drop-shadow-md">
          {hero.brandline}
        </h1>

        {/* Play Showreel Button */}
        <div className="mb-6 sm:mb-10">
          <button
            onClick={handleStartPlay}
            className="group inline-flex items-center gap-2 sm:gap-3 px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/40 backdrop-blur-md transition-all duration-300 transform hover:scale-105 cursor-pointer"
          >
            <span className="flex items-center justify-center w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-[#BC6F07] text-[#F7F3E8] shadow-md group-hover:bg-[#9E5B04] transition-colors">
              <Play size={14} className="ml-0.5 sm:hidden" fill="currentColor" />
              <Play size={18} className="ml-0.5 hidden sm:inline-block" fill="currentColor" />
            </span>
            <span className="text-xs sm:text-sm font-medium tracking-wider uppercase text-white">
              Watch Showreel
            </span>
          </button>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-row items-center justify-center gap-2 sm:gap-4 w-full max-w-sm sm:max-w-none mx-auto">
          {hero.ctaButtons.map((cta, index) => (
            <Button
              key={cta.label}
              href={cta.href}
              variant={index === 0 ? 'primary' : 'secondary'}
              size="md"
              className="flex-1 sm:flex-initial text-[11px] xs:text-xs sm:text-sm px-3 sm:px-6 py-2.5 sm:py-3.5 whitespace-nowrap"
            >
              {cta.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
