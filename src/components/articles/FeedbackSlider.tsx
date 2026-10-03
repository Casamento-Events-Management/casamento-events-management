'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ClientFeedback } from '@/types';
import { FeedbackCard } from './FeedbackCard';

interface FeedbackSliderProps {
  feedbacks: ClientFeedback[];
  compact?: boolean;
}

export function FeedbackSlider({ feedbacks, compact = false }: FeedbackSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isMouseDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);

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

  const totalFeedbacks = feedbacks?.length || 0;
  const maxIndex = Math.max(0, totalFeedbacks - itemsPerPage);

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

  if (!feedbacks || totalFeedbacks === 0) {
    return (
      <div className="flex items-center justify-center p-8 bg-[#EFEAD8]/40 border border-[#3A4F1C]/10 rounded-2xl text-[#3A4F1C]/70 text-sm italic font-serif">
        No featured client stories available yet.
      </div>
    );
  }

  return (
    <div className="relative w-full select-none">
      {/* Slider Viewport — Full Width, No Side Arrow Buttons */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory py-3 px-1 scroll-smooth cursor-grab active:cursor-grabbing"
      >
        {feedbacks.map((item, index) => (
          <div
            key={item._id || index}
            className="w-[92%] xs:w-[90%] sm:w-[86%] md:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)] shrink-0 snap-start flex flex-col"
          >
            <FeedbackCard feedback={item} compact={compact} />
          </div>
        ))}
      </div>

      {/* Pagination Dots */}
      {totalFeedbacks > itemsPerPage && (
        <div className="flex items-center justify-center gap-1.5 mt-6">
          {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
            <button
              key={`feedback-dot-${idx}`}
              onClick={() => scrollToSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${idx === currentIndex
                  ? 'w-6 bg-[#BC6F07]'
                  : 'w-1.5 bg-[#3A4F1C]/25 hover:bg-[#3A4F1C]/50'
                }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
