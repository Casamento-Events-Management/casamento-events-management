'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { MediaCategory, ActiveCategoryFilter } from '@/types';

export interface MediaCategoryFilterProps {
  /** Array of available media categories */
  categories: MediaCategory[];
  /** Currently selected category slug string */
  activeSlug: ActiveCategoryFilter;
  /** Callback fired when a category tab is clicked */
  onSelect: (slug: ActiveCategoryFilter) => void;
  /** Custom label for the "All" tab. Defaults to "All". */
  allLabel?: string;
  /** Accessibility label for screen readers */
  ariaLabel?: string;
  /** Optional center alignment for tabs. Defaults to false. */
  centered?: boolean;
  /** Additional container styling */
  className?: string;
}

export function MediaCategoryFilter({
  categories,
  activeSlug,
  onSelect,
  allLabel = 'All',
  ariaLabel = 'Filter items by category',
  centered = false,
  className = '',
}: MediaCategoryFilterProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const sortedCategories = [...categories].sort(
    (a, b) => (b.priority ?? 0) - (a.priority ?? 0)
  );

  const allTabs = [
    { id: 'all', title: allLabel, slug: 'all', priority: 999 },
    ...sortedCategories,
  ];

  const checkScrollability = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 2);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    checkScrollability();
    el.addEventListener('scroll', checkScrollability, { passive: true });
    window.addEventListener('resize', checkScrollability);

    return () => {
      el.removeEventListener('scroll', checkScrollability);
      window.removeEventListener('resize', checkScrollability);
    };
  }, [categories, checkScrollability]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.65;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleTabClick = (slug: string, e: React.MouseEvent<HTMLButtonElement>) => {
    onSelect(slug);
    e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  };

  return (
    <div className={`relative px-4 sm:px-8 max-w-7xl mx-auto ${className}`}>
      {/* Scroll Controls Flanking the Container */}
      <div className="relative flex items-center">
        {/* Left Arrow Button */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scroll('left')}
            className="absolute left-0 z-10 p-1.5 rounded-full bg-[#F7F3E8] border border-[#3A4F1C]/20 text-[#3A4F1C] shadow-sm hover:bg-[#BC6F07] hover:text-[#F7F3E8] transition-all cursor-pointer -translate-x-2 sm:-translate-x-4"
            aria-label="Scroll categories left"
          >
            <ChevronLeft size={16} />
          </button>
        )}

        {/* Categories Tab Bar */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-x-auto scrollbar-hide py-1 scroll-smooth"
          role="tablist"
          aria-label={ariaLabel}
        >
          <div
            className={`inline-flex items-center gap-6 sm:gap-8 min-w-full pb-1 ${
              centered ? 'justify-start md:justify-center' : 'justify-start'
            }`}
          >
            {allTabs.map((tab) => {
              const tabSlug = typeof tab.slug === 'string' ? tab.slug : (tab.slug as { current: string })?.current;
              const isActive = tabSlug === activeSlug;

              return (
                <button
                  key={tabSlug || tab.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={(e) => handleTabClick(tabSlug, e)}
                  className={`whitespace-nowrap text-xs font-semibold tracking-widest uppercase pb-2 border-b-2 transition-all duration-200 cursor-pointer shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BC6F07] ${
                    isActive
                      ? 'border-[#BC6F07] text-[#3A4F1C]'
                      : 'border-transparent text-[#3A4F1C]/60 hover:text-[#3A4F1C] hover:border-[#3A4F1C]/30'
                  }`}
                >
                  {tab.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Arrow Button */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scroll('right')}
            className="absolute right-0 z-10 p-1.5 rounded-full bg-[#F7F3E8] border border-[#3A4F1C]/20 text-[#3A4F1C] shadow-sm hover:bg-[#BC6F07] hover:text-[#F7F3E8] transition-all cursor-pointer translate-x-2 sm:translate-x-4"
            aria-label="Scroll categories right"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>

      {/* Sleek divider line below tabs */}
      <div className="w-full h-px bg-[#3A4F1C]/10 mt-0" />
    </div>
  );
}
