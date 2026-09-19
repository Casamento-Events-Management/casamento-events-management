'use client';

import React from 'react';
import type { ServiceCategory, ActiveServiceCategoryFilter } from '@/types';

interface ServicesCategoryFilterProps {
    categories: ServiceCategory[];
    activeCategory: ActiveServiceCategoryFilter;
    onSelectCategory: (slug: ActiveServiceCategoryFilter) => void;
}

/**
 * ServicesCategoryFilter Component
 *
 * Desktop: Fixed/Sticky 15% column vertical navigation.
 * Mobile: Fixed/Sticky category dropdown menu.
 */
export function ServicesCategoryFilter({
    categories,
    activeCategory,
    onSelectCategory,
}: ServicesCategoryFilterProps) {
    const allCategoriesList = [
        { slug: 'all', title: 'All Services' },
        ...categories.map((cat) => ({
            slug: cat.slug,
            title: cat.title,
        })),
    ];

    return (
        <nav aria-label="Service Categories Navigation" className="w-full">
            {/* Desktop Fixed/Sticky Vertical Menu (15% Column) */}
            <div className="hidden lg:flex flex-col space-y-2 sticky top-28 z-10 self-start max-h-[calc(100vh-8rem)] overflow-y-auto pr-1">
                <div className="pb-2 border-b border-[#3A4F1C]/15 mb-2">
                    <span className="text-xs font-bold tracking-wider uppercase text-[#3A4F1C]/70">
                        Categories
                    </span>
                </div>
                {allCategoriesList.map((cat) => {
                    const isActive = activeCategory === cat.slug;
                    return (
                        <button
                            key={cat.slug}
                            type="button"
                            onClick={() => onSelectCategory(cat.slug)}
                            className={`group w-full text-left px-3.5 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-between cursor-pointer border ${
                                isActive
                                    ? 'bg-[#3A4F1C] text-[#F7F3E8] border-[#BC6F07] shadow-xs font-semibold'
                                    : 'bg-[#F7F3E8]/80 text-[#3A4F1C]/80 border-transparent hover:bg-[#F7F3E8] hover:text-[#3A4F1C]'
                            }`}
                        >
                            <span className="text-xs sm:text-sm tracking-wide leading-snug">
                                {cat.title}
                            </span>
                            {isActive && (
                                <span className="w-2 h-2 rounded-full bg-[#BC6F07] shrink-0 ml-2" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Mobile Pinned Fixed/Sticky Dropdown Selector */}
            <div className="lg:hidden sticky top-16 z-30 bg-[#EFEAD8] py-2 px-2 border-b border-[#3A4F1C]/20 shadow-xs mb-4">
                <label htmlFor="mobile-category-select" className="sr-only">
                    Select Category
                </label>
                <div className="relative">
                    <select
                        id="mobile-category-select"
                        value={activeCategory}
                        onChange={(e) => onSelectCategory(e.target.value)}
                        className="w-full appearance-none bg-[#F7F3E8] text-[#3A4F1C] text-xs font-semibold uppercase tracking-wider py-2 px-3 pr-8 rounded-lg border border-[#3A4F1C]/25 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#BC6F07] cursor-pointer"
                    >
                        {allCategoriesList.map((cat) => (
                            <option key={cat.slug} value={cat.slug}>
                                {cat.title}
                            </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#3A4F1C]">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>
        </nav>
    );
}
