'use client';

import React from 'react';
import type { VlogCategoryFilterProps } from '@/types';

export function VlogCategoryFilter({ categories, activeSlug, onSelect }: VlogCategoryFilterProps) {
  const allTabs = [
    { id: 'all', title: 'All', slug: 'all', priority: 999 },
    ...categories,
  ];

  return (
    <div className="px-6 sm:px-8 max-w-7xl mx-auto">
      <div
        className="flex items-center gap-6 sm:gap-8 overflow-x-auto scrollbar-hide pb-1"
        role="tablist"
        aria-label="Filter vlogs by category"
      >
        {allTabs.map((tab) => {
          const isActive = tab.slug === activeSlug;
          return (
            <button
              key={tab.slug}
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelect(tab.slug)}
              className={`whitespace-nowrap text-xs font-semibold tracking-widest uppercase pb-2 border-b-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BC6F07] ${
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
      {/* Divider line below tabs */}
      <div className="w-full h-px bg-[#3A4F1C]/10 mt-0" />
    </div>
  );
}
