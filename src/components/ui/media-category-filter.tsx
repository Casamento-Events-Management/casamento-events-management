'use client';

import React from 'react';
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
  const sortedCategories = [...categories].sort(
    (a, b) => (b.priority ?? 0) - (a.priority ?? 0)
  );

  const allTabs = [
    { id: 'all', title: allLabel, slug: 'all', priority: 999 },
    ...sortedCategories,
  ];

  return (
    <div className={`px-4 sm:px-8 max-w-7xl mx-auto ${className}`}>
      <div
        className={`flex items-center gap-6 sm:gap-8 overflow-x-auto scrollbar-hide pb-1 ${
          centered ? 'justify-center' : ''
        }`}
        role="tablist"
        aria-label={ariaLabel}
      >
        {allTabs.map((tab) => {
          const tabSlug = typeof tab.slug === 'string' ? tab.slug : (tab.slug as { current: string })?.current;
          const isActive = tabSlug === activeSlug;

          return (
            <button
              key={tabSlug || tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelect(tabSlug)}
              className={`whitespace-nowrap text-xs font-semibold tracking-widest uppercase pb-2 border-b-2 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BC6F07] ${
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
      {/* Sleek divider line below tabs */}
      <div className="w-full h-px bg-[#3A4F1C]/10 mt-0" />
    </div>
  );
}
