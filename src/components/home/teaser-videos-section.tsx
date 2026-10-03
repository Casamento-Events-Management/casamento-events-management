'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const isMouseDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);

  // Responsive Items Per Page (1 on Mobile/Tablet, 2 on Desktop for larger cards)
  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 1024) {
        setItemsPerPage(1);
      } else {
        setItemsPerPage(2);
      }
    };

    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
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
  const scrollToSlide = (index: number) => {
    if (!scrollRef.current) return;
    const targetIndex = Math.min(Math.max(0, index), maxIndex);
    const clientWidth = scrollRef.current.clientWidth;
    const cardWidth = clientWidth / itemsPerPage;
    scrollRef.current.scrollTo({
      left: targetIndex * cardWidth,
      behavior: 'smooth',
    });
    setCurrentIndex(targetIndex);
  };

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

        {/* Slider Viewport — Full Width, Side Peeking, No Side Arrow Buttons */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className="flex items-stretch gap-5 sm:gap-6 md:gap-8 overflow-x-auto scrollbar-none snap-x snap-mandatory py-4 px-1 scroll-smooth cursor-grab active:cursor-grabbing"
        >
          {teaserVideos.map((teaser, index) => (
            <div
              key={teaser.title + index}
              className="w-[95%] xs:w-[92%] sm:w-[85%] md:w-[75%] lg:w-[calc((100%-2rem)/2)] shrink-0 snap-start flex flex-col"
            >
              <TeaserCard teaser={teaser} />
            </div>
          ))}
        </div>

        {/* Pagination Dots */}
        {totalTeasers > itemsPerPage && (
          <div className="flex items-center justify-center gap-2 mt-8 md:mt-10">
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={`teaser-dot-${idx}`}
                onClick={() => scrollToSlide(idx)}
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
