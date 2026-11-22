'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';

export interface HeroBannerSlide {
  url: string;
  alt?: string;
}

interface HeroBannerMediaProps {
  images: HeroBannerSlide[];
  fallbackAlt: string;
  /** Auto-advance interval in milliseconds (defaults to 2000ms). */
  intervalMs?: number;
}

/**
 * Client leaf for the PageHero background banner carousel.
 *
 * - Keeps PageHero a Server Component for fast SSR H1 & SEO.
 * - Crossfades between slides on a 2s interval using GPU-composited opacity only (zero hover zoom).
 * - Automatically pauses on `prefers-reduced-motion: reduce` and when the browser tab is hidden.
 * - Gracefully skips broken image URLs; if all fail, renders null so the underlying olive backdrop
 *   preserves full WCAG AA contrast for the hero text.
 */
export function HeroBannerMedia({
  images,
  fallbackAlt,
  intervalMs = 2000,
}: HeroBannerMediaProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedUrls, setFailedUrls] = useState<string[]>([]);

  const validImages = useMemo(
    () => images.filter((img) => Boolean(img.url?.trim()) && !failedUrls.includes(img.url)),
    [images, failedUrls]
  );

  const slideCount = validImages.length;
  const safeIndex = slideCount > 0 ? activeIndex % slideCount : 0;

  useEffect(() => {
    if (slideCount <= 1) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let timerId: ReturnType<typeof setInterval> | null = null;

    const startTimer = () => {
      if (timerId !== null) return;
      timerId = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % slideCount);
      }, intervalMs);
    };

    const stopTimer = () => {
      if (timerId !== null) {
        clearInterval(timerId);
        timerId = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopTimer();
      } else {
        startTimer();
      }
    };

    if (!document.hidden) {
      startTimer();
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopTimer();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [slideCount, intervalMs]);

  if (slideCount === 0) {
    return null;
  }

  return (
    <>
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {validImages.map((img, idx) => {
          const isActive = idx === safeIndex;
          return (
            <div
              key={`${img.url}-${idx}`}
              className={`absolute inset-0 transition-opacity duration-500 ease-out motion-reduce:transition-none ${
                isActive ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Image
                src={img.url}
                alt={img.alt || fallbackAlt}
                fill
                priority={idx === 0}
                fetchPriority={idx === 0 ? 'high' : 'low'}
                sizes="100vw"
                onError={() =>
                  setFailedUrls((prev) => (prev.includes(img.url) ? prev : [...prev, img.url]))
                }
                className="object-cover object-center"
              />
            </div>
          );
        })}
      </div>

      {/* Minimal slide step bars in bottom-right when multiple banner slides exist */}
      {slideCount > 1 && (
        <div
          role="tablist"
          aria-label="Hero banner slides"
          className="absolute bottom-4 right-4 sm:bottom-6 sm:right-8 z-20 flex items-center gap-1.5"
        >
          {validImages.map((img, idx) => {
            const isActive = idx === safeIndex;
            return (
              <button
                key={`indicator-${img.url}-${idx}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Show banner image ${idx + 1} of ${slideCount}`}
                onClick={() => setActiveIndex(idx)}
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
    </>
  );
}
