'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Calendar, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import type { UpcomingEvent } from '@/types';
import { SectionHeading } from '@/components/ui/section-heading';
import { Badge } from '@/components/ui/badge';
import { PaginationDots } from '@/components/ui/pagination-dots';
import { formatDisplayDate } from '@/lib/utils/dateUtils';

interface UpcomingEventsSectionProps {
  events: UpcomingEvent[];
  eyebrow?: string;
  title?: string;
  description?: string;
}

function formatEventDate(dateString: string): string {
  return formatDisplayDate(dateString, 'long');
}

export function UpcomingEventsSection({
  events,
  eyebrow,
  title,
  description,
}: UpcomingEventsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isMouseDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);

  // Responsive visible cards: 1 on mobile, 2 on tablet, 3 on desktop before side-sliding
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
    window.addEventListener('resize', updateItemsPerPage, { passive: true });
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  const totalEvents = events?.length || 0;
  const maxIndex = Math.max(0, totalEvents - itemsPerPage);
  const canSlide = totalEvents > itemsPerPage;

  const getCardStride = useCallback((): number => {
    const container = scrollRef.current;
    if (!container) return 0;
    const firstChild = container.firstElementChild as HTMLElement | null;
    if (firstChild) {
      const style = window.getComputedStyle(container);
      const gap = parseFloat(style.columnGap || style.gap || '0') || 0;
      const stride = firstChild.offsetWidth + gap;
      if (stride > 0) return stride;
    }
    return container.clientWidth / itemsPerPage;
  }, [itemsPerPage]);

  // Sync pagination dots with horizontal scroll position
  const handleScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container || maxIndex === 0) return;
    const stride = getCardStride();
    if (stride > 0) {
      const index = Math.round(container.scrollLeft / stride);
      setCurrentIndex(Math.min(Math.max(0, index), maxIndex));
    }
  }, [getCardStride, maxIndex]);

  // Smooth scroll to target slide index
  const scrollToSlide = useCallback(
    (index: number) => {
      const container = scrollRef.current;
      if (!container) return;
      const targetIndex = Math.min(Math.max(0, index), maxIndex);
      const stride = getCardStride();
      container.scrollTo({
        left: targetIndex * stride,
        behavior: 'smooth',
      });
      setCurrentIndex(targetIndex);
    },
    [getCardStride, maxIndex]
  );

  // Mouse drag handlers for smooth desktop dragging when slider is active
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canSlide || !scrollRef.current) return;
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

  if (!events || totalEvents === 0) return null;

  const displayEyebrow = eyebrow && eyebrow.trim() ? eyebrow : 'Calendar & Events';
  const displayTitle = title && title.trim() ? title : 'Upcoming & Featured Events';
  const displayDescription =
    description && description.trim()
      ? description
      : 'Discover our upcoming celebrations and past milestone galas curated with timeless elegance.';

  return (
    <section className="py-16 sm:py-20 md:py-28 bg-[#EFEAD8]/60 border-y border-[#3A4F1C]/10 select-none overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={displayEyebrow}
          title={displayTitle}
          description={displayDescription}
          centered={true}
        />

        {/* Responsive Slider Viewport (3 default visible items on desktop before side-sliding) */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className={`flex items-stretch gap-4 sm:gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory py-2 px-0.5 scroll-smooth ${
            canSlide ? 'cursor-grab active:cursor-grabbing' : ''
          }`}
        >
          {events.map((event, index) => (
            <article
              key={event.slug?.current || `${event.title}-${index}`}
              className={`shrink-0 snap-start flex flex-col ${
                totalEvents === 1
                  ? 'w-full md:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]'
                  : 'w-[86%] sm:w-[75%] md:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]'
              }`}
            >
              <div className="group flex flex-col h-full w-full rounded-xl overflow-clip bg-[#FFFFFF] border border-[#3A4F1C]/12 hover:border-[#BC6F07]/60 transition-colors duration-200">
                {/* Cover Image Frame — intentionally zero hover zoom */}
                <div className="relative aspect-[4/3] w-full shrink-0 overflow-clip bg-[#2A3A14]">
                  {event.coverImage?.asset?.url && (
                    <Image
                      src={event.coverImage.asset.url}
                      alt={event.coverImage.alt || event.title}
                      fill
                      loading="lazy"
                      sizes="(max-width: 768px) 86vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  )}

                  {/* Subtle editorial bottom scrim */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1E2810]/65 via-[#1E2810]/10 to-transparent group-hover:from-[#1E2810]/75 transition-colors duration-200"
                  />

                  {/* Status Pill — bottom-left over subtle scrim for high contrast */}
                  <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-10">
                    <Badge status={event.status || 'upcoming'} />
                  </div>
                </div>

                {/* Editorial Card Body */}
                <div className="p-4 sm:p-5 md:p-6 flex flex-col gap-2.5 flex-1">
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.14em] uppercase text-[#BC6F07]">
                    <Calendar className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                    <span>{formatEventDate(event.date)}</span>
                  </div>

                  <h3 className="text-base sm:text-lg font-medium tracking-tight text-[#3A4F1C] group-hover:text-[#BC6F07] transition-colors duration-200 line-clamp-2 leading-snug">
                    {event.title}
                  </h3>

                  {event.location && (
                    <div className="mt-auto pt-3 border-t border-[#3A4F1C]/10 inline-flex items-center gap-1.5 text-xs sm:text-sm text-[#3A4F1C]/70 font-light">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-[#BC6F07]" strokeWidth={1.75} aria-hidden="true" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Controls Footer: Pagination Dots + Subtle Prev/Next Controls (shown only when > visible items) */}
        {canSlide && (
          <div className="mt-8 md:mt-10 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => scrollToSlide(currentIndex - 1)}
              disabled={currentIndex === 0}
              aria-label="Previous event"
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
              ariaLabel="Upcoming and featured event slides"
            />

            <button
              type="button"
              onClick={() => scrollToSlide(currentIndex + 1)}
              disabled={currentIndex >= maxIndex}
              aria-label="Next event"
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
