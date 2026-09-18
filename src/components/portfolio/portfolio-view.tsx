// =============================================================================
// portfolio-view.tsx — Master Portfolio Client View
//
// Combines category tab navigation, responsive video cards grid, and lightbox modal.
// Synchronizes tab state with Next.js router URL shallowly without page reloads.
// =============================================================================

'use client';

import React, { useState, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { PortfolioFilterBar } from './portfolio-filter-bar';
import { PortfolioCard } from './portfolio-card';
import { PortfolioModal } from './portfolio-modal';
import type { PortfolioCategory, PortfolioItem, ActiveCategoryFilter } from '@/types';

interface PortfolioViewProps {
    categories: PortfolioCategory[];
    items: PortfolioItem[];
    activeCategory: ActiveCategoryFilter;
}

export function PortfolioView({
    categories,
    items,
    activeCategory: initialActiveCategory,
}: PortfolioViewProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [, startTransition] = useTransition();

    const [activeCategory, setActiveCategory] = useState<ActiveCategoryFilter>(initialActiveCategory);
    const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

    // Filter items based on active category state
    const filteredItems = activeCategory === 'all'
        ? items
        : items.filter((item) => item.category.slug === activeCategory);

    const handleSelectCategory = (slug: ActiveCategoryFilter) => {
        setActiveCategory(slug);

        // Update URL shallowly so link sharing works without full page refresh
        const targetPath = slug === 'all' ? '/portfolio' : `/portfolio/${slug}`;
        if (pathname !== targetPath) {
            startTransition(() => {
                router.push(targetPath, { scroll: false });
            });
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-10">
            {/* Category Filter Tabs */}
            <PortfolioFilterBar
                categories={categories}
                activeCategory={activeCategory}
                onSelectCategory={handleSelectCategory}
            />

            {/* Portfolio Grid */}
            {filteredItems.length > 0 ? (
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {filteredItems.map((item, index) => (
                        <PortfolioCard
                            key={item.id}
                            item={item}
                            priority={index < 6}
                            onSelect={(selected) => setSelectedItem(selected)}
                        />
                    ))}
                </div>
            ) : (
                <div className="mt-12 py-16 text-center rounded-2xl bg-[#F7F3E8] border border-[#3A4F1C]/20 shadow-xs">
                    <p className="text-[#3A4F1C]/70 text-lg">No portfolio films found in this category yet.</p>
                </div>
            )}

            {/* Video Lightbox Modal */}
            <PortfolioModal
                item={selectedItem}
                isOpen={Boolean(selectedItem)}
                onClose={() => setSelectedItem(null)}
            />
        </div>
    );
}
