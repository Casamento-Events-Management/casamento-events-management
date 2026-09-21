'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react';
import type { HeroSection, VideoSource } from '@/types';

interface HeroCarouselProps {
  hero: HeroSection;
}

type VideoEmbedInfo =
  | { type: 'native'; url: string }
  | { type: 'youtube'; url: string }
  | { type: 'vimeo'; url: string };

function getVideoEmbedInfo(source?: VideoSource): VideoEmbedInfo {
  if (!source) return { type: 'native', url: '' };
  if (source._type === 'sanity') {
    return { type: 'native', url: source.asset?.url ?? '' };
  }

  const rawUrl = source.url ?? '';
  if (
    rawUrl.endsWith('.mp4') ||
    rawUrl.endsWith('.webm') ||
    rawUrl.endsWith('.mov') ||
    rawUrl.includes('.mp4?') ||
    rawUrl.includes('gtv-videos-bucket')
  ) {
    return { type: 'native', url: rawUrl };
  }

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
    const embedUrl = videoId
      ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&controls=1`
      : rawUrl;
    return { type: 'youtube', url: embedUrl };
  }

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

  return { type: 'native', url: rawUrl };
}

export function HeroCarousel({ hero }: HeroCarouselProps) {
  const slides = hero.slides || [];
  const autoPlayIntervalSec = hero.autoPlayInterval || 3;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [inlinePlayingKey, setInlinePlayingKey] = useState<string | null>(null);

  // Touch & Mouse Drag Swipe State
  const dragStartX = useRef<number | null>(null);
  const dragEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;

  const handleNext = useCallback(() => {
    if (slides.length === 0) return;
    setInlinePlayingKey(null);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const handlePrev = useCallback(() => {
    if (slides.length === 0) return;
    setInlinePlayingKey(null);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const handleSelectSlide = (idx: number) => {
    setInlinePlayingKey(null);
    setCurrentIndex(idx);
  };

  // Auto-play timer
  useEffect(() => {
    if (isPaused || slides.length <= 1 || inlinePlayingKey !== null) return;

    const timer = setInterval(() => {
      handleNext();
    }, autoPlayIntervalSec * 1000);

    return () => clearInterval(timer);
  }, [handleNext, isPaused, slides.length, autoPlayIntervalSec, inlinePlayingKey]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartX.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    dragEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (dragStartX.current !== null && dragEndX.current !== null) {
      const distance = dragStartX.current - dragEndX.current;
      if (distance > minSwipeDistance) {
        handleNext();
      } else if (distance < -minSwipeDistance) {
        handlePrev();
      }
    }
    dragStartX.current = null;
    dragEndX.current = null;
    setIsPaused(false);
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    dragStartX.current = e.clientX;
    setIsPaused(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragStartX.current !== null) {
      dragEndX.current = e.clientX;
    }
  };

  const handleMouseUp = () => {
    if (dragStartX.current !== null && dragEndX.current !== null) {
      const distance = dragStartX.current - dragEndX.current;
      if (distance > minSwipeDistance) {
        handleNext();
      } else if (distance < -minSwipeDistance) {
        handlePrev();
      }
    }
    dragStartX.current = null;
    dragEndX.current = null;
    setIsPaused(false);
  };

  if (slides.length === 0) return null;

  const currentSlide = slides[currentIndex];
  const targetLink =
    currentSlide.ctaLink ||
    (currentSlide.serviceCategorySlug
      ? `/services?category=${currentSlide.serviceCategorySlug}`
      : '/services');

  const currentSlideKey = currentSlide._key || `slide-media-${currentIndex}`;
  const isCurrentInlinePlaying = inlinePlayingKey === currentSlideKey;

  return (
    <div
      className="relative w-full bg-[#2A3A14] overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* ── MAIN HERO LAYOUT CONTAINER ── */}
      <div className="flex flex-col lg:flex-row w-full h-[580px] sm:h-[680px] md:h-[720px] lg:h-auto lg:min-h-[680px]">
        
        {/* ── DESKTOP LEFT PANE (30% Width on Desktop `lg:flex`, Hidden on Mobile/Tablet) ── */}
        <div className="hidden lg:flex w-full lg:w-[32%] xl:w-[30%] bg-[#2A3A14] text-[#F7F3E8] p-8 sm:p-12 lg:p-16 flex-col justify-between z-10 border-r border-[#BC6F07]/20">
          <div>
            {/* Category Tag / Subtitle */}
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <span className="w-6 h-0.5 bg-[#BC6F07]" />
              <span className="text-xs font-semibold uppercase tracking-widest text-[#BC6F07]">
                Service Highlight
              </span>
              <span className="w-6 h-0.5 bg-[#BC6F07]" />
            </div>

            {/* Slide Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal tracking-tight text-[#F7F3E8] leading-tight mb-4 sm:mb-6">
              {currentSlide.heading}
            </h1>

            {/* Slide Description */}
            <p className="text-sm sm:text-base text-[#F7F3E8]/80 leading-relaxed font-light mb-8 max-w-lg">
              {currentSlide.description}
            </p>

            {/* CTA Button */}
            <div>
              <Link
                href={targetLink}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#BC6F07] hover:bg-[#9E5B04] text-[#F7F3E8] font-medium text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span>{currentSlide.ctaText || 'Explore Service'}</span>
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>

          {/* Desktop Controls (Counter, Arrows, Dots) */}
          <div className="pt-8 sm:pt-12 flex items-center justify-between border-t border-[#F7F3E8]/10 mt-8">
            {/* Slide Counter */}
            <div className="text-xs font-mono text-[#F7F3E8]/70">
              <span className="text-[#BC6F07] font-bold text-sm">
                {String(currentIndex + 1).padStart(2, '0')}
              </span>
              <span className="mx-1">/</span>
              <span>{String(slides.length).padStart(2, '0')}</span>
            </div>

            {/* Pagination Indicators */}
            <div className="flex items-center gap-1.5">
              {slides.map((_, idx) => (
                <button
                  key={`desktop-dot-${idx}`}
                  onClick={() => handleSelectSlide(idx)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentIndex
                      ? 'w-6 bg-[#BC6F07]'
                      : 'w-2 bg-[#F7F3E8]/30 hover:bg-[#F7F3E8]/60'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Navigation Arrows */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="p-2.5 rounded-full border border-[#F7F3E8]/20 text-[#F7F3E8] hover:bg-[#BC6F07] hover:border-[#BC6F07] transition-all duration-300 cursor-pointer"
                title="Previous Slide"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={handleNext}
                className="p-2.5 rounded-full border border-[#F7F3E8]/20 text-[#F7F3E8] hover:bg-[#BC6F07] hover:border-[#BC6F07] transition-all duration-300 cursor-pointer"
                title="Next Slide"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANE / FULL-BLEED MEDIA CONTAINER ── */}
        <div className="w-full lg:w-[68%] xl:w-[70%] relative h-full lg:h-auto min-h-full bg-black overflow-hidden flex-1">
          {slides.map((slide, idx) => {
            const isCurrent = idx === currentIndex;
            const slideKey = slide._key || `slide-media-${idx}`;
            const isInlinePlaying = inlinePlayingKey === slideKey;

            const imageUrl =
              slide.mediaType === 'image'
                ? slide.image?.asset?.url
                : slide.videoPoster?.asset?.url || slide.image?.asset?.url;

            const altText =
              slide.mediaType === 'image'
                ? slide.image?.alt || slide.heading
                : slide.videoPoster?.alt || slide.heading;

            return (
              <div
                key={slideKey}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {/* 1. INLINE VIDEO PLAYBACK MODE (Plays directly inside media pane) */}
                {isInlinePlaying && slide.video ? (
                  <div className="relative w-full h-full bg-black">
                    <button
                      onClick={() => setInlinePlayingKey(null)}
                      className="absolute top-4 right-4 z-40 p-2.5 rounded-full bg-black/70 text-white hover:bg-red-600 transition-colors shadow-lg cursor-pointer"
                      title="Stop Video & Return to Slide"
                    >
                      <X size={18} />
                    </button>
                    {(() => {
                      const info = getVideoEmbedInfo(slide.video);
                      if (info.type === 'native') {
                        return (
                          <video
                            src={info.url}
                            controls
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                          />
                        );
                      }
                      return (
                        <iframe
                          src={info.url}
                          title={slide.heading}
                          className="w-full h-full border-0"
                          allow="autoplay; picture-in-picture; fullscreen"
                          allowFullScreen
                        />
                      );
                    })()}
                  </div>
                ) : (
                  /* 2. POSTER / IMAGE MODE */
                  <>
                    {imageUrl && (
                      <Image
                        src={imageUrl}
                        alt={altText}
                        fill
                        priority={idx === 0}
                        sizes="(max-width: 1024px) 100vw, 70vw"
                        className="object-cover transition-transform duration-1000 ease-out hover:scale-105"
                      />
                    )}

                    {/* Dark gradient overlay for contrast */}
                    <div className="absolute inset-0 bg-black/40 lg:bg-gradient-to-t lg:from-black/60 lg:via-black/20 lg:to-transparent" />

                    {/* Video Play Button Overlay if mediaType === 'video' (Desktop layout) */}
                    {slide.mediaType === 'video' && slide.video && (
                      <div className="hidden lg:flex absolute inset-0 items-center justify-center z-20">
                        <button
                          onClick={() => setInlinePlayingKey(slideKey)}
                          className="group flex items-center gap-3 px-6 py-3.5 rounded-full bg-black/50 hover:bg-black/75 border border-white/30 backdrop-blur-md transition-all duration-300 transform hover:scale-105 cursor-pointer"
                        >
                          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#BC6F07] text-[#F7F3E8] shadow-md group-hover:bg-[#9E5B04] transition-colors">
                            <Play size={18} className="ml-0.5" fill="currentColor" />
                          </span>
                          <span className="text-xs sm:text-sm font-medium tracking-wider uppercase text-white">
                            Play Video Inline
                          </span>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}

          {/* ── MOBILE & TABLET / IPAD OVERLAY (Visible ONLY on `< lg`, Hidden on Desktop) ── */}
          {!isCurrentInlinePlaying && (
            <div className="lg:hidden absolute inset-0 z-30 flex flex-col justify-between p-6 sm:p-10 md:p-12 text-center bg-[#171f0f]/80 sm:bg-[#171f0f]/75 backdrop-blur-xs text-[#F7F3E8]">
              
              {/* Top / Center Info Block */}
              <div className="my-auto space-y-4 sm:space-y-6 max-w-xl mx-auto px-2 sm:px-4">
                <div className="inline-flex items-center gap-2 sm:gap-3">
                  <span className="w-6 sm:w-8 h-0.5 bg-[#BC6F07]" />
                  <span className="text-xs sm:text-sm md:text-base font-semibold uppercase tracking-widest text-[#BC6F07]">
                    Service Highlight
                  </span>
                  <span className="w-6 sm:w-8 h-0.5 bg-[#BC6F07]" />
                </div>

                <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-normal text-[#F7F3E8] leading-tight tracking-tight drop-shadow-md">
                  {currentSlide.heading}
                </h1>

                <p className="text-sm sm:text-base md:text-lg text-[#F7F3E8]/90 leading-relaxed font-light max-w-lg md:max-w-xl mx-auto">
                  {currentSlide.description}
                </p>

                <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-5">
                  <Link
                    href={targetLink}
                    className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 sm:px-8 sm:py-4 rounded-full bg-[#BC6F07] hover:bg-[#9E5B04] text-[#F7F3E8] font-medium text-xs sm:text-sm md:text-base tracking-wider uppercase transition-all duration-300 shadow-xl cursor-pointer"
                  >
                    <span>{currentSlide.ctaText || 'Explore Service'}</span>
                    <ChevronRight size={18} />
                  </Link>

                  {/* Inline Video Play button on mobile/tablet if slide is a video */}
                  {currentSlide.mediaType === 'video' && currentSlide.video && (
                    <button
                      onClick={() => setInlinePlayingKey(currentSlideKey)}
                      className="inline-flex items-center justify-center gap-2.5 px-6 py-3 sm:px-7 sm:py-3.5 rounded-full bg-black/60 hover:bg-black/80 border border-white/30 text-white font-medium text-xs sm:text-sm md:text-base tracking-wider uppercase transition-all shadow-lg cursor-pointer"
                    >
                      <Play size={16} fill="currentColor" className="text-[#BC6F07]" />
                      <span>Play Video</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Mobile / Tablet Controls Bar */}
              <div className="flex items-center justify-between pt-4 sm:pt-6 border-t border-[#F7F3E8]/20">
                {/* Counter */}
                <div className="text-xs sm:text-sm font-mono text-[#F7F3E8]/80">
                  <span className="text-[#BC6F07] font-bold text-sm sm:text-base">
                    {String(currentIndex + 1).padStart(2, '0')}
                  </span>
                  <span className="mx-1">/</span>
                  <span>{String(slides.length).padStart(2, '0')}</span>
                </div>

                {/* Pagination Dots */}
                <div className="flex items-center gap-2">
                  {slides.map((_, idx) => (
                    <button
                      key={`mobile-dot-${idx}`}
                      onClick={() => handleSelectSlide(idx)}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        idx === currentIndex
                          ? 'w-6 sm:w-8 bg-[#BC6F07]'
                          : 'w-2 bg-[#F7F3E8]/40'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>

                {/* Left/Right Chevrons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrev}
                    className="p-2.5 sm:p-3 rounded-full border border-[#F7F3E8]/20 text-[#F7F3E8] active:bg-[#BC6F07] transition-all cursor-pointer"
                    title="Previous Slide"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={handleNext}
                    className="p-2.5 sm:p-3 rounded-full border border-[#F7F3E8]/20 text-[#F7F3E8] active:bg-[#BC6F07] transition-all cursor-pointer"
                    title="Next Slide"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
