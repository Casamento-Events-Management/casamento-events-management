'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Play, X } from 'lucide-react';
import type { HeroSection } from '@/types';
import { Button } from '@/components/ui/button';

interface HeroPlayerProps {
  hero: HeroSection;
}

export function HeroPlayer({ hero }: HeroPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Close player when pressing ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPlaying(false);
      }
    };

    if (isPlaying) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying]);

  const selectedVideo = hero.showreelMobileVideo || hero.showreelVideo;
  const rawVideoUrl =
    selectedVideo._type === 'sanity'
      ? (selectedVideo.asset?.url || '')
      : selectedVideo.url;

  // Embedded YouTube showreel simulation URL
  const embedShowreelUrl =
    rawVideoUrl && (rawVideoUrl.includes('youtube.com') || rawVideoUrl.includes('youtu.be'))
      ? rawVideoUrl.replace('watch?v=', 'embed/')
      : 'https://www.youtube.com/embed/5qap5aO4i9A?autoplay=1';


  return (
    <div className="relative w-full h-[90vh] min-h-[550px] md:h-[90vh] md:min-h-[700px] flex items-center justify-center overflow-hidden bg-[#2A3A14]">
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

      {/* 2. VIDEO PLAYBACK MODE (Click outside or ESC key exits playback) */}
      {isPlaying && (
        <div
          onClick={() => setIsPlaying(false)}
          className="absolute inset-0 z-30 bg-black flex items-center justify-center p-4"
        >
          {/* Close Button */}
          <button
            onClick={() => setIsPlaying(false)}
            className="absolute top-4 right-4 z-40 p-2.5 rounded-full bg-black/60 text-white hover:text-[#BC6F07] hover:bg-black/80 transition-colors cursor-pointer"
            aria-label="Close Showreel"
          >
            <X size={24} />
          </button>

          {/* YouTube Video Player Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden border border-white/20 shadow-2xl"
          >
            <iframe
              src={embedShowreelUrl}
              title="Casamento Events Showreel"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* 3. HERO OVERLAY CONTENT (Brandline, Play Trigger, CTAs) */}
      <div
        className={`relative z-20 max-w-5xl mx-auto px-4 sm:px-6 text-center text-white transition-opacity duration-500 ${
          isPlaying ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-normal tracking-tight text-[#F7F3E8] leading-tight mb-6 sm:mb-8 drop-shadow-md">
          {hero.brandline}
        </h1>

        {/* Play Showreel Button (Reduced on Mobile) */}
        <div className="mb-6 sm:mb-10">
          <button
            onClick={() => setIsPlaying(true)}
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

        {/* CTA Buttons (MUST be in ONE line on mobile) */}
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

