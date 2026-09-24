'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ClientFeedback } from '@/types';
import { FeedbackCard } from './FeedbackCard';

interface FeedbackSliderProps {
  feedbacks: ClientFeedback[];
  compact?: boolean;
}

export function FeedbackSlider({ feedbacks, compact = false }: FeedbackSliderProps) {
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

  const totalFeedbacks = feedbacks?.length || 0;
  const maxIndex = Math.max(0, totalFeedbacks - itemsPerPage);
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

  if (!feedbacks || totalFeedbacks === 0) {
    return (
      <div className="flex items-center justify-center p-8 bg-[#EFEAD8]/40 border border-[#3A4F1C]/10 rounded-2xl text-[#3A4F1C]/70 text-sm italic font-serif">
        No featured client stories available yet.
      </div>
    );
  }

  // Dynamic Translate X calculation accounting for mobile peek & gap spacing
  let translateXStyle = `calc(-${effectiveIndex} * (82% + 1rem))`;
  if (itemsPerPage === 2) {
    translateXStyle = `calc(-${effectiveIndex} * (50% + 0.5rem))`;
  } else if (itemsPerPage === 3) {
    translateXStyle = `calc(-${effectiveIndex} * (33.3333% + 0.5rem))`;
  }

  const isAtStart = effectiveIndex === 0;
  const isAtEnd = effectiveIndex >= maxIndex;

  return (
    <div className="relative w-full select-none">
      {/* Slider Viewport with Left/Right Controls */}
      <div className="relative w-full flex items-center gap-2 sm:gap-4">
        {/* Left Arrow Button */}
        {totalFeedbacks > itemsPerPage ? (
          <button
            onClick={handlePrev}
            disabled={isAtStart}
            className={`shrink-0 p-2.5 sm:p-3 rounded-full border border-[#3A4F1C]/20 bg-[#F7F3E8] text-[#3A4F1C] transition-all duration-300 z-10 ${
              isAtStart
                ? 'opacity-30 cursor-not-allowed'
                : 'hover:bg-[#BC6F07] hover:text-[#F7F3E8] hover:border-[#BC6F07] cursor-pointer shadow-xs transform hover:scale-105'
            }`}
            aria-label="Previous client stories"
          >
            <ChevronLeft size={20} />
          </button>
        ) : (
          <div className="w-0 sm:w-1" />
        )}

        {/* Carousel Viewport */}
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
            className="flex items-stretch gap-4 sm:gap-6 transition-transform duration-500 ease-out"
            style={{ transform: `translateX(${translateXStyle})` }}
          >
            {feedbacks.map((item, index) => (
              <div
                key={item._id || index}
                className="w-[82%] md:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)] shrink-0 flex flex-col"
              >
                <FeedbackCard feedback={item} compact={compact} />
              </div>
            ))}
          </div>
        </div>

        {/* Right Arrow Button */}
        {totalFeedbacks > itemsPerPage ? (
          <button
            onClick={handleNext}
            disabled={isAtEnd}
            className={`shrink-0 p-2.5 sm:p-3 rounded-full border border-[#3A4F1C]/20 bg-[#F7F3E8] text-[#3A4F1C] transition-all duration-300 z-10 ${
              isAtEnd
                ? 'opacity-30 cursor-not-allowed'
                : 'hover:bg-[#BC6F07] hover:text-[#F7F3E8] hover:border-[#BC6F07] cursor-pointer shadow-xs transform hover:scale-105'
            }`}
            aria-label="Next client stories"
          >
            <ChevronRight size={20} />
          </button>
        ) : (
          <div className="w-0 sm:w-1" />
        )}
      </div>

      {/* Pagination Dots */}
      {totalFeedbacks > itemsPerPage && (
        <div className="flex items-center justify-center gap-1.5 mt-6">
          {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
            <button
              key={`feedback-dot-${idx}`}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex
                  ? 'w-5 bg-[#BC6F07]'
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
