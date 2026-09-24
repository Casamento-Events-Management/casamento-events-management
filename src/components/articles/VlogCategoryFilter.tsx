'use client';

import React from 'react';
import type { VlogCategoryFilterProps } from '@/types';
import { MediaCategoryFilter } from '@/components/ui/media-category-filter';

export function VlogCategoryFilter({ categories, activeSlug, onSelect }: VlogCategoryFilterProps) {
  return (
    <MediaCategoryFilter
      categories={categories}
      activeSlug={activeSlug}
      onSelect={onSelect}
      allLabel="All"
      ariaLabel="Filter vlogs by category"
      centered={true}
    />
  );
}
