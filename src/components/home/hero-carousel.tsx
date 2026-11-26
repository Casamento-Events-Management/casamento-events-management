'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Play, X } from 'lucide-react';
import type { HeroSection, VideoSource } from '@/types';
import { PaginationDots } from '@/components/ui/pagination-dots';

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
  const autoPlayIntervalSec = hero.autoPlayInterval || 2;

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

  // Auto-play timer: continuously loops, cleanly pausing on reduced motion or hidden tab
  useEffect(() => {
    if (isPaused || slides.length <= 1 || inlinePlayingKey !== null) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let timer: ReturnType<typeof setTimeout> | null = null;

    const schedule = () => {
      if (timer !== null || document.hidden) return;
      timer = setTimeout(() => {
        timer = null;
        handleNext();
      }, autoPlayIntervalSec * 1000);
    };

    const clear = () => {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clear();
      } else {
        schedule();
      }
    };

    schedule();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clear();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentIndex, handleNext, isPaused, slides.length, autoPlayIntervalSec, inlinePlayingKey]);

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

  const handleMouseLeave = () => {
    // If mouse leaves during a drag, cleanly cancel drag and unpause
    if (dragStartX.current !== null) {
      dragStartX.current = null;
      dragEndX.current = null;
    }
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
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* ── MAIN HERO LAYOUT CONTAINER ──
          - Desktop (xl+): Current 30/70 split-pane layout (left deep-olive info pane + right media pane)
          - iPad / Laptop (md–lg) & Mobile (< md): Adapts to PageHero's bottom-left editorial overlay layout
      */}
      <div className="relative flex flex-col justify-end xl:flex-row xl:justify-normal w-full min-h-[580px] md:min-h-[420px] lg:min-h-[480px] xl:min-h-[680px]">
        {/* ── MEDIA PANE (Full-bleed background on Mobile/iPad/Laptop; 68-70% Right Pane on Desktop) ── */}
        <div className="absolute inset-0 z-0 xl:relative xl:inset-auto xl:order-2 xl:w-[68%] 2xl:w-[70%] bg-[#161E0B] overflow-hidden xl:flex-1">
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
                className={`absolute inset-0 transition-opacity duration-500 ease-out motion-reduce:transition-none ${
                  isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {/* 1. INLINE VIDEO PLAYBACK MODE (Plays directly inside media pane) */}
                {isInlinePlaying && slide.video ? (
                  <div className="relative w-full h-full bg-[#161E0B]">
                    <button
                      type="button"
                      onClick={() => setInlinePlayingKey(null)}
                      aria-label="Stop video and return to slide"
                      className="absolute top-4 right-4 z-40 w-10 h-10 rounded-full inline-flex items-center justify-center bg-[#2A3A14]/90 text-[#F7F3E8] hover:bg-[#BC6F07] border border-[#F7F3E8]/20 transition-colors duration-200 active:scale-[0.97] shadow-md cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BC6F07]"
                    >
                      <X className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
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
                  /* 2. POSTER / IMAGE MODE — zero hover zoom */
                  <>
                    {imageUrl && (
                      <Image
                        src={imageUrl}
                        alt={altText}
                        fill
                        priority={idx === 0}
                        fetchPriority={idx === 0 ? 'high' : 'low'}
                        sizes="(max-width: 1280px) 100vw, 70vw"
                        className="object-cover object-center"
                      />
                    )}

                    {/* Warm Deep-Olive Scrim — PageHero gradient on Mobile/iPad/Laptop, softer bottom fade on Desktop */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1A2310]/90 via-[#1A2310]/50 to-[#1A2310]/20 xl:from-[#171f0f]/60 xl:via-[#171f0f]/15 xl:to-transparent"
                    />

                    {/* Video Play Button Overlay (Desktop split-pane media center) */}
                    {slide.mediaType === 'video' && slide.video && (
                      <div className="hidden xl:flex absolute inset-0 items-center justify-center z-20">
                        <button
                          type="button"
                          onClick={() => setInlinePlayingKey(slideKey)}
                          className="group inline-flex items-center gap-2.5 px-5 py-3 rounded-full bg-[#2A3A14]/85 hover:bg-[#BC6F07] text-[#F7F3E8] border border-[#F7F3E8]/25 hover:border-[#BC6F07] backdrop-blur-sm transition-colors duration-200 active:scale-[0.98] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BC6F07]"
                        >
                          <Play
                            className="w-4 h-4 fill-current shrink-0"
                            strokeWidth={1.75}
                            aria-hidden="true"
                          />
                          <span className="text-xs font-medium tracking-[0.14em] uppercase">
                            Play Video
                          </span>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* ── CONTENT PANE (Single H1 — PageHero bottom-left overlay on < xl; Left split pane on xl+) ── */}
        <div
          className={`${
            isCurrentInlinePlaying ? 'hidden xl:flex' : 'flex'
          } relative z-10 flex-col justify-end w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-16 text-[#F7F3E8] xl:order-1 xl:justify-between xl:w-[32%] 2xl:w-[30%] xl:max-w-none xl:mx-0 xl:bg-[#2A3A14] xl:p-12 2xl:p-16 xl:border-r xl:border-[#BC6F07]/20`}
        >
          <div className="max-w-3xl space-y-3 sm:space-y-4 xl:max-w-none xl:space-y-0">
            {/* Eyebrow */}
            <div className="xl:flex xl:items-center xl:gap-2 xl:mb-6">
              <span className="hidden xl:inline-block w-6 h-0.5 bg-[#BC6F07]" aria-hidden="true" />
              <span className="inline-block text-xs sm:text-sm xl:text-xs font-semibold tracking-[0.2em] xl:tracking-widest text-[#BC6F07] uppercase">
                Service Highlight
              </span>
              <span className="hidden xl:inline-block w-6 h-0.5 bg-[#BC6F07]" aria-hidden="true" />
            </div>

            {/* Single Page H1 Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl xl:text-4xl 2xl:text-5xl font-semibold tracking-tight leading-[1.1] xl:leading-tight [text-wrap:balance] text-[#F7F3E8] xl:mb-6">
              {currentSlide.heading}
            </h1>

            {/* Gold Hairline Accent (PageHero layout on Mobile/iPad/Laptop) */}
            <div className="w-12 h-0.5 bg-[#BC6F07] xl:hidden" aria-hidden="true" />

            {/* Slide Description */}
            <p className="text-sm sm:text-base md:text-lg xl:text-base text-[#F7F3E8]/85 xl:text-[#F7F3E8]/80 leading-relaxed font-light max-w-2xl xl:max-w-lg xl:mb-8">
              {currentSlide.description}
            </p>

            {/* Actions Row (CTA + inline Play Video on Mobile/iPad/Laptop) */}
            <div className="pt-2 sm:pt-3 xl:pt-0 flex flex-wrap items-center gap-2 md:gap-3">
              <Link
                href={targetLink}
                className="inline-flex items-center justify-center gap-1.5 md:gap-2 px-3.5 py-2 md:px-5 md:py-2.5 xl:px-6 xl:py-3.5 rounded-full bg-[#BC6F07] hover:bg-[#9E5B04] text-[#F7F3E8] border border-[#BC6F07] font-medium text-[11px] md:text-xs xl:text-sm tracking-wider uppercase transition-colors duration-200 active:scale-[0.98] shadow-sm cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F7F3E8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#2A3A14]"
              >
                <span>{currentSlide.ctaText || 'Explore Service'}</span>
                <ArrowRight className="w-3 h-3 md:w-3.5 md:h-3.5 xl:w-4 xl:h-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
              </Link>

              {currentSlide.mediaType === 'video' && currentSlide.video && (
                <button
                  type="button"
                  onClick={() => setInlinePlayingKey(currentSlideKey)}
                  className="xl:hidden inline-flex items-center justify-center gap-1.5 md:gap-2 px-3.5 py-2 md:px-5 md:py-2.5 rounded-full bg-[#F7F3E8]/10 hover:bg-[#F7F3E8]/20 border border-[#F7F3E8]/30 text-[#F7F3E8] font-medium text-[11px] md:text-xs tracking-wider uppercase transition-colors duration-200 active:scale-[0.98] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BC6F07]"
                >
                  <Play className="w-3 h-3 md:w-3.5 md:h-3.5 fill-current shrink-0" strokeWidth={1.75} aria-hidden="true" />
                  <span>Play Video</span>
                </button>
              )}
            </div>
          </div>

          {/* Desktop Controls (Counter + Pagination Dots — Desktop `xl+` only) */}
          <div className="hidden xl:flex pt-12 items-center justify-between border-t border-[#F7F3E8]/10 mt-8">
            <div className="text-xs font-mono text-[#F7F3E8]/70">
              <span className="text-[#BC6F07] font-bold text-sm">
                {String(currentIndex + 1).padStart(2, '0')}
              </span>
              <span className="mx-1">/</span>
              <span>{String(slides.length).padStart(2, '0')}</span>
            </div>

            <PaginationDots
              total={slides.length}
              currentIndex={currentIndex}
              onSelect={handleSelectSlide}
              variant="dark"
              size="md"
              ariaLabel="Home hero slides"
            />
          </div>
        </div>

        {/* ── MOBILE / IPAD / LAPTOP SLIDE STEP BARS (Matches PageHero / HeroBannerMedia) ── */}
        {!isCurrentInlinePlaying && slides.length > 1 && (
          <div
            role="tablist"
            aria-label="Hero banner slides"
            className="xl:hidden absolute bottom-4 right-4 sm:bottom-6 sm:right-8 z-20 flex items-center gap-1.5"
          >
            {slides.map((slide, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={`step-${slide._key || idx}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Show slide ${idx + 1} of ${slides.length}`}
                  onClick={() => handleSelectSlide(idx)}
                  className="p-1 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BC6F07] rounded-full"
                >
                  <span
                    className={`block h-1 rounded-full transition-[width,background-color] duration-200 ${
                      isActive
                        ? 'w-6 bg-[#BC6F07]'
                        : 'w-2 bg-[#F7F3E8]/45 hover:bg-[#F7F3E8]/80'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
