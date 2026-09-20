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
 * Renders Desktop vertical category navigation tabs.
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
        <nav aria-label="Service Categories Navigation" className="w-full hidden lg:block">
            <div className="flex flex-col space-y-2 max-h-[calc(100vh-7rem)] overflow-y-auto pr-1">
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
        </nav>
    );
}
