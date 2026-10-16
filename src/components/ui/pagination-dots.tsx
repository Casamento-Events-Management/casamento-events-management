'use client';

import React from 'react';

export interface PaginationDotsProps {
  /**
   * Total number of pages or slides
   */
  total: number;
  /**
   * Currently active page or slide index (0-based)
   */
  currentIndex: number;
  /**
   * Callback fired when a dot is clicked
   */
  onSelect: (index: number) => void;
  /**
   * Maximum visible dots at once (default: 5)
   */
  maxVisible?: number;
  /**
   * Color theme variant: 'light' (on light backgrounds) or 'dark' (on dark hero banners)
   */
  variant?: 'light' | 'dark';
  /**
   * Size presets: 'sm' (h-1.5) or 'md' (h-2)
   */
  size?: 'sm' | 'md';
  /**
   * Optional custom container class name
   */
  className?: string;
  /**
   * Accessible label for the pagination group
   */
  ariaLabel?: string;
}

/**
 * Reusable dynamic pagination dot indicator.
 * Displays up to `maxVisible` dots (default: 5) with a sliding window and mini edge dots
 * to communicate overflow content without crowding mobile viewports.
 */
export function PaginationDots({
  total,
  currentIndex,
  onSelect,
  maxVisible = 5,
  variant = 'light',
  size = 'md',
  className = '',
  ariaLabel = 'Pagination',
}: PaginationDotsProps) {
  // If only 1 or 0 items, pagination dots are unnecessary
  if (total <= 1) return null;

  const effectiveMax = Math.max(3, maxVisible);

  // Compute sliding window range for visible dots
  let startIndex = 0;
  if (total > effectiveMax) {
    const half = Math.floor(effectiveMax / 2);
    startIndex = currentIndex - half;
    if (startIndex < 0) {
      startIndex = 0;
    } else if (startIndex + effectiveMax > total) {
      startIndex = total - effectiveMax;
    }
  }

  const visibleCount = Math.min(total, effectiveMax);
  const visibleIndices = Array.from({ length: visibleCount }, (_, i) => startIndex + i);

  // Color palettes
  const colorStyles = {
    light: {
      active: 'bg-[#BC6F07]',
      inactive: 'bg-[#3A4F1C]/25 hover:bg-[#3A4F1C]/50',
    },
    dark: {
      active: 'bg-[#BC6F07]',
      inactive: 'bg-[#F7F3E8]/35 hover:bg-[#F7F3E8]/65',
    },
  }[variant];

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`flex items-center justify-center gap-1 sm:gap-1.5 ${className}`}
    >
      {visibleIndices.map((idx) => {
        const isActive = idx === currentIndex;
        const isLeftEdge = total > effectiveMax && idx === startIndex && startIndex > 0;
        const isRightEdge =
          total > effectiveMax &&
          idx === startIndex + effectiveMax - 1 &&
          startIndex + effectiveMax < total;
        const isMini = !isActive && (isLeftEdge || isRightEdge);

        // Dot dimensions based on size & active/mini state
        let dotDimensions = '';
        if (isActive) {
          dotDimensions = size === 'sm' ? 'w-6 h-1.5' : 'w-6 sm:w-8 h-2';
        } else if (isMini) {
          dotDimensions = size === 'sm' ? 'w-1 h-1 opacity-50' : 'w-1.5 h-1.5 opacity-50';
        } else {
          dotDimensions = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';
        }

        const dotBg = isActive ? colorStyles.active : colorStyles.inactive;

        return (
          <button
            key={`dot-${idx}`}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={`Go to slide ${idx + 1}`}
            onClick={() => onSelect(idx)}
            className="flex items-center justify-center p-0.5 rounded-full cursor-pointer transition-transform hover:scale-110 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#BC6F07]"
          >
            <span
              className={`rounded-full transition-all duration-300 block ${dotDimensions} ${dotBg}`}
            />
          </button>
        );
      })}
    </div>
  );
}
