'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Play, Pause, Volume2, VolumeX, X } from 'lucide-react';
import type { HeroSection } from '@/types';
import { Button } from '@/components/ui/button';

interface HeroPlayerProps {
  hero: HeroSection;
}

export function HeroPlayer({ hero }: HeroPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const videoUrl =
    hero.showreelVideo._type === 'sanity'
      ? (hero.showreelVideo.asset.url || '')
      : hero.showreelVideo.url;

  const audioUrl = hero.backgroundMusic?.asset.url;

  const handleStartPlay = () => {
    setIsPlaying(true);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play().catch((err) => console.log('Video play error:', err));
      }
      if (audioRef.current && audioUrl) {
        audioRef.current.play().catch((err) => console.log('Audio play error:', err));
      }
    }, 100);
  };

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isAudioMuted;
      setIsAudioMuted(!isAudioMuted);
    }
  };

  return (
    <div className="relative w-full h-[90vh] min-h-[700px] flex items-center justify-center overflow-hidden bg-[#2A3A14]">
      {/* 1. THUMBNAIL POSTER MODE (Default - NO autoplay) */}
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

      {/* 2. VIDEO PLAYBACK MODE */}
      {isPlaying && (
        <div className="absolute inset-0 z-10 bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            src={videoUrl}
            controls={false}
            loop
            playsInline
            className="w-full h-full object-cover"
          />

          {audioUrl && (
            <audio ref={audioRef} src={audioUrl} loop muted={isAudioMuted} />
          )}

          {/* Controls Bar when Video is Active */}
          <div className="absolute bottom-6 right-6 z-30 flex items-center space-x-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
            <button
              onClick={handlePause}
              className="p-2 rounded-full text-white hover:text-[#BC6F07] transition-colors"
              title="Pause Video"
            >
              <Pause size={20} />
            </button>

            {audioUrl && (
              <button
                onClick={toggleAudio}
                className="p-2 rounded-full text-white hover:text-[#BC6F07] transition-colors"
                title={isAudioMuted ? 'Unmute Music' : 'Mute Music'}
              >
                {isAudioMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
            )}

            <button
              onClick={handlePause}
              className="p-2 rounded-full text-white hover:text-red-400 transition-colors border-l border-white/20 pl-3"
              title="Close Player"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* 3. HERO OVERLAY CONTENT (Brandline, Play Trigger, CTAs) */}
      <div className={`relative z-20 max-w-5xl mx-auto px-6 text-center text-white transition-opacity duration-500 ${isPlaying ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-[#BC6F07]/20 border border-[#BC6F07]/60 backdrop-blur-md">
          <span className="text-xs font-semibold tracking-widest text-[#F7F3E8] uppercase">
            Bespoke Event Management
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-normal tracking-tight text-[#F7F3E8] leading-tight mb-8 drop-shadow-md">
          {hero.brandline}
        </h1>

        {/* Play Showreel Button */}
        <div className="mb-10">
          <button
            onClick={handleStartPlay}
            className="group inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/40 backdrop-blur-md transition-all duration-300 transform hover:scale-105 cursor-pointer"
          >
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#BC6F07] text-[#F7F3E8] shadow-md group-hover:bg-[#9E5B04] transition-colors">
              <Play size={18} className="ml-0.5" fill="currentColor" />
            </span>
            <span className="text-sm font-medium tracking-wider uppercase text-white">
              Watch Showreel
            </span>
          </button>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {hero.ctaButtons.map((cta, index) => (
            <Button
              key={cta.label}
              href={cta.href}
              variant={index === 0 ? 'primary' : 'secondary'}
              size="lg"
            >
              {cta.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
