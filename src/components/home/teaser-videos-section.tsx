'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { TeaserVideo } from '@/types';
import { SectionHeading } from '@/components/ui/section-heading';
import { TeaserCard } from './teaser-card';

interface TeaserVideosSectionProps {
  teaserVideos: TeaserVideo[];
  eyebrow?: string;
  title?: string;
  description?: string;
}

export function TeaserVideosSection({ teaserVideos, eyebrow, title, description }: TeaserVideosSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);

  // Touch & Mouse Drag state
  const dragStartX = useRef<number | null>(null);
  const dragEndX = useRef<number | null>(null);
  const minSwipeDistance = 40;

  // Responsive Items Per Page (1 on Mobile, 2 on Tablet, 3 on Desktop)
  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 768) {
        setItemsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(3);
      }
    };

    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  const totalTeasers = teaserVideos?.length || 0;
  const maxIndex = Math.max(0, totalTeasers - itemsPerPage);

  const effectiveIndex = Math.min(currentIndex, maxIndex);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  }, [maxIndex]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartX.current = e.touches[0].clientX;
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
  };

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    dragStartX.current = e.clientX;
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
  };

  if (!teaserVideos || totalTeasers === 0) return null;

  // Dynamic Translate X calculation accounting for card gap spacing
  let translateXStyle = `calc(-${effectiveIndex} * (100% + 1.5rem))`;
  if (itemsPerPage === 2) {
    translateXStyle = `calc(-${effectiveIndex} * (50% + 0.75rem))`;
  } else if (itemsPerPage === 3) {
    translateXStyle = `calc(-${effectiveIndex} * (33.3333% + 0.6667rem))`;
  }

  const isAtStart = effectiveIndex === 0;
  const isAtEnd = effectiveIndex >= maxIndex;

  const displayEyebrow = (eyebrow && eyebrow.trim()) ? eyebrow : 'Visual Stories';
  const displayTitle = (title && title.trim()) ? title : 'Featured Teaser Highlights';
  const displayDescription = (description && description.trim()) ? description : 'Experience the emotional intensity and cinematic splendor of our handcrafted celebrations.';

  return (
    <section className="py-20 md:py-28 bg-[#EFEAD8]/60 border-y border-[#3A4F1C]/10 select-none overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Heading */}
        <SectionHeading
          eyebrow={displayEyebrow}
          title={displayTitle}
          description={displayDescription}
          centered={true}
        />

        {/* Carousel Container Flanked by Left & Right Arrows: < [t1] [t2] [t3] > */}
        <div className="relative w-full flex items-center gap-2 sm:gap-4 md:gap-6">

          {/* Left Arrow Button */}
          {totalTeasers > itemsPerPage ? (
            <button
              onClick={handlePrev}
              disabled={isAtStart}
              className={`shrink-0 p-2.5 sm:p-3 md:p-3.5 rounded-full border border-[#3A4F1C]/20 bg-[#F7F3E8] text-[#3A4F1C] transition-all duration-300 z-10 ${isAtStart
                  ? 'opacity-30 cursor-not-allowed'
                  : 'hover:bg-[#BC6F07] hover:text-[#F7F3E8] hover:border-[#BC6F07] cursor-pointer shadow-md transform hover:scale-105'
                }`}
              title="Previous Teasers"
              aria-label="Previous Teaser Highlights"
            >
              <ChevronLeft size={20} />
            </button>
          ) : (
            <div className="w-0 sm:w-2" />
          )}

          {/* Carousel Cards Viewport */}
          <div
            className="flex-1 overflow-hidden py-2"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <div
              className="flex items-stretch gap-6 md:gap-8 transition-transform duration-500 ease-out"
              style={{ transform: `translateX(${translateXStyle})` }}
            >
              {teaserVideos.map((teaser, index) => (
                <div
                  key={teaser.title + index}
                  className="w-full md:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-4rem)/3)] shrink-0 flex flex-col"
                >
                  <TeaserCard teaser={teaser} />
                </div>
              ))}
            </div>
          </div>

          {/* Right Arrow Button */}
          {totalTeasers > itemsPerPage ? (
            <button
              onClick={handleNext}
              disabled={isAtEnd}
              className={`shrink-0 p-2.5 sm:p-3 md:p-3.5 rounded-full border border-[#3A4F1C]/20 bg-[#F7F3E8] text-[#3A4F1C] transition-all duration-300 z-10 ${isAtEnd
                  ? 'opacity-30 cursor-not-allowed'
                  : 'hover:bg-[#BC6F07] hover:text-[#F7F3E8] hover:border-[#BC6F07] cursor-pointer shadow-md transform hover:scale-105'
                }`}
              title="Next Teasers"
              aria-label="Next Teaser Highlights"
            >
              <ChevronRight size={20} />
            </button>
          ) : (
            <div className="w-0 sm:w-2" />
          )}
        </div>

        {/* Pagination Dots (Rendered if totalTeasers exceed itemsPerPage) */}
        {totalTeasers > itemsPerPage && (
          <div className="flex items-center justify-center gap-2 mt-8 md:mt-10">
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={`teaser-dot-${idx}`}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${idx === currentIndex
                    ? 'w-6 bg-[#BC6F07]'
                    : 'w-2 bg-[#3A4F1C]/25 hover:bg-[#3A4F1C]/50'
                  }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
