'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { TeaserVideo } from '@/types';
import { SectionHeading } from '@/components/ui/section-heading';
import { TeaserCard } from './teaser-card';
import { PaginationDots } from '@/components/ui/pagination-dots';

interface TeaserVideosSectionProps {
  teaserVideos: TeaserVideo[];
  eyebrow?: string;
  title?: string;
  description?: string;
}

export function TeaserVideosSection({
  teaserVideos,
  eyebrow,
  title,
  description,
}: TeaserVideosSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(2);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isMouseDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);

  // Responsive Items Per Page (1 on Mobile/Tablet, 2 on Desktop)
  useEffect(() => {
    const updateItemsPerPage = () => {
      setItemsPerPage(window.innerWidth < 1024 ? 1 : 2);
    };

    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage, { passive: true });
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  const totalTeasers = teaserVideos?.length || 0;
  const maxIndex = Math.max(0, totalTeasers - itemsPerPage);

  // Scroll listener to keep pagination dots synced with scroll position
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const cardWidth = clientWidth / itemsPerPage;
    if (cardWidth > 0) {
      const index = Math.round(scrollLeft / cardWidth);
      setCurrentIndex(Math.min(Math.max(0, index), maxIndex));
    }
  }, [itemsPerPage, maxIndex]);

  // Smooth scroll to target slide index
  const scrollToSlide = useCallback(
    (index: number) => {
      if (!scrollRef.current) return;
      const targetIndex = Math.min(Math.max(0, index), maxIndex);
      const clientWidth = scrollRef.current.clientWidth;
      const cardWidth = clientWidth / itemsPerPage;
      scrollRef.current.scrollTo({
        left: targetIndex * cardWidth,
        behavior: 'smooth',
      });
      setCurrentIndex(targetIndex);
    },
    [itemsPerPage, maxIndex]
  );

  // Mouse Drag Handlers for Desktop Smooth Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isMouseDown.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftStart.current = scrollRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown.current || !scrollRef.current) return;
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    scrollRef.current.scrollLeft = scrollLeftStart.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isMouseDown.current = false;
  };

  if (!teaserVideos || totalTeasers === 0) return null;

  const displayEyebrow = eyebrow && eyebrow.trim() ? eyebrow : 'Visual Stories';
  const displayTitle = title && title.trim() ? title : 'Featured Teaser Highlights';
  const displayDescription =
    description && description.trim()
      ? description
      : 'Explore event highlights across corporate productions, brand activations, stage designs, and milestone celebrations.';

  return (
    <section className="py-16 sm:py-20 md:py-28 bg-[#EFEAD8]/60 border-y border-[#3A4F1C]/10 select-none overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <SectionHeading
          eyebrow={displayEyebrow}
          title={displayTitle}
          description={displayDescription}
          centered={true}
        />

        {/* Slider Viewport */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className="flex items-stretch gap-4 sm:gap-6 md:gap-8 overflow-x-auto scrollbar-none snap-x snap-mandatory py-2 px-0.5 scroll-smooth cursor-grab active:cursor-grabbing"
        >
          {teaserVideos.map((teaser, index) => (
            <div
              key={`${teaser.title}-${index}`}
              className="w-[88%] sm:w-[80%] md:w-[70%] lg:w-[calc((100%-2rem)/2)] shrink-0 snap-start flex flex-col"
            >
              <TeaserCard teaser={teaser} />
            </div>
          ))}
        </div>

        {/* Controls Footer: Pagination Dots + Subtle Prev/Next Controls */}
        {totalTeasers > itemsPerPage && (
          <div className="mt-8 md:mt-10 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => scrollToSlide(currentIndex - 1)}
              disabled={currentIndex === 0}
              aria-label="Previous highlight"
              className="hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-full border border-[#3A4F1C]/20 text-[#3A4F1C] hover:border-[#BC6F07] hover:text-[#BC6F07] disabled:opacity-35 disabled:pointer-events-none transition-colors duration-200 active:scale-[0.97] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BC6F07]"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
            </button>

            <PaginationDots
              total={maxIndex + 1}
              currentIndex={currentIndex}
              onSelect={scrollToSlide}
              variant="light"
              size="md"
              ariaLabel="Featured highlight slides"
            />

            <button
              type="button"
              onClick={() => scrollToSlide(currentIndex + 1)}
              disabled={currentIndex >= maxIndex}
              aria-label="Next highlight"
              className="hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-full border border-[#3A4F1C]/20 text-[#3A4F1C] hover:border-[#BC6F07] hover:text-[#BC6F07] disabled:opacity-35 disabled:pointer-events-none transition-colors duration-200 active:scale-[0.97] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BC6F07]"
            >
              <ChevronRight className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
