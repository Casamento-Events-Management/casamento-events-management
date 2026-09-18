// =============================================================================
// portfolio-filter-bar.tsx — Category Drop-down Filter Component
// =============================================================================

'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import type { PortfolioCategory, ActiveCategoryFilter } from '@/types';

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
    const allOption = { slug: 'all', title: 'All Work' };
    const options = [allOption, ...categories.map((c) => ({ slug: c.slug, title: c.title }))];

    return (
        <nav
            aria-label="Portfolio Category Filter"
            className="w-full flex items-center justify-center flex-wrap gap-3 py-6 mb-8"
        >

            {/* Drop-down Select */}
            <div className="relative min-w-[220px] sm:min-w-[260px]">
                <select
                    id="portfolio-category-select"
                    value={activeCategory}
                    onChange={(e) => onSelectCategory(e.target.value)}
                    aria-label="Select portfolio category"
                    className="w-full appearance-none rounded-xl bg-[#F7F3E8] border border-[#3A4F1C]/30 px-4 py-2.5 pr-10 text-sm font-medium text-[#3A4F1C] shadow-xs cursor-pointer focus:border-[#BC6F07] focus:outline-none focus:ring-2 focus:ring-[#BC6F07]/20 transition-colors"
                >
                    {options.map((option) => (
                        <option key={option.slug} value={option.slug} className="bg-[#F7F3E8] text-[#3A4F1C]">
                            {option.title}
                        </option>
                    ))}
                </select>

                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[#3A4F1C]">
                    <ChevronDown className="w-4 h-4" />
                </div>
            </div>
        </nav>
    );
}
