// =============================================================================
// portfolio-filter-bar.tsx — Category Filter Tab Component
// =============================================================================

'use client';

import React from 'react';
import type { PortfolioCategory, ActiveCategoryFilter } from '@/types';
import { MediaCategoryFilter } from '@/components/ui/media-category-filter';

interface PortfolioFilterBarProps {
  categories: PortfolioCategory[];
  activeCategory: ActiveCategoryFilter;
  onSelectCategory: (slug: ActiveCategoryFilter) => void;
}

export function PortfolioFilterBar({
  categories,
  activeCategory,
  onSelectCategory,
}: PortfolioFilterBarProps) {
  return (
    <div className="mb-6">
      <MediaCategoryFilter
        categories={categories}
        activeSlug={activeCategory}
        onSelect={onSelectCategory}
        allLabel="All Work"
        ariaLabel="Filter portfolio work by category"
        centered={true}
      />
    </div>
  );
}
