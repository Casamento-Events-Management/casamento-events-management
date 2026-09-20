// =============================================================================
// portfolio-view.tsx — Master Portfolio Client View
//
// Combines category tab navigation, responsive video cards grid, and lightbox modal.
// Synchronizes tab state with Next.js router URL shallowly without page reloads.
// =============================================================================

'use client';

import React, { useState, useEffect, useTransition, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { PortfolioFilterBar } from './portfolio-filter-bar';
import { PortfolioCard } from './portfolio-card';
import { PortfolioModal } from './portfolio-modal';
import type { PortfolioCategory, PortfolioItem, ActiveCategoryFilter } from '@/types';

interface PortfolioViewProps {
    categories: PortfolioCategory[];
    items: PortfolioItem[];
    activeCategory: ActiveCategoryFilter;
}

function PortfolioViewContent({
    categories,
    items,
    activeCategory: initialActiveCategory,
}: PortfolioViewProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [, startTransition] = useTransition();

    const [activeCategory, setActiveCategory] = useState<ActiveCategoryFilter>(initialActiveCategory);
    const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

    const itemParam = searchParams.get('item');

    // Auto-open modal when accessing shared URL with ?item= parameter
    useEffect(() => {
        if (itemParam) {
            const match = items.find((i) => i.slug === itemParam || i.id === itemParam);
            if (match) {
                startTransition(() => {
                    setSelectedItem(match);
                });
            }
        }
    }, [itemParam, items, startTransition]);

    const handleOpenModal = (item: PortfolioItem) => {
        setSelectedItem(item);
        if (typeof window !== 'undefined') {
            const newParams = new URLSearchParams(window.location.search);
            newParams.set('item', item.slug);
            const newUrl = `${pathname}?${newParams.toString()}`;
            window.history.replaceState(null, '', newUrl);
        }
    };

    const handleCloseModal = () => {
        setSelectedItem(null);
        if (typeof window !== 'undefined') {
            const newParams = new URLSearchParams(window.location.search);
            newParams.delete('item');
            const queryStr = newParams.toString();
            const newUrl = queryStr ? `${pathname}?${queryStr}` : pathname;
            window.history.replaceState(null, '', newUrl);
        }
    };

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
            {/* Category Filter Tabs */}
            <PortfolioFilterBar
                categories={categories}
                activeCategory={activeCategory}
                onSelectCategory={handleSelectCategory}
            />

            {/* Portfolio Masonry Layout (Display Whole Item) */}
            {filteredItems.length > 0 ? (
                <div className="mt-8 columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6">
                    {filteredItems.map((item, index) => (
                        <PortfolioCard
                            key={item.id || item.slug || `portfolio-card-${index}`}
                            item={item}
                            priority={index < 4}
                            onSelect={handleOpenModal}
                        />
                    ))}
                </div>
            ) : (
                <div className="mt-12 py-16 text-center rounded-2xl bg-[#EFEAD8]/60 border border-[#3A4F1C]/15 shadow-xs">
                    <p className="text-[#3A4F1C]/80 text-base sm:text-lg font-medium">No portfolio showcase found in this category yet.</p>
                </div>
            )}

            {/* Video Lightbox Modal */}
            <PortfolioModal
                item={selectedItem}
                isOpen={Boolean(selectedItem)}
                onClose={handleCloseModal}
            />
        </div>
    );
}

export function PortfolioView(props: PortfolioViewProps) {
    return (
        <Suspense fallback={
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <div className="animate-pulse flex flex-col items-center space-y-4">
                    <div className="h-8 bg-[#3A4F1C]/10 rounded w-1/3"></div>
                    <div className="h-64 bg-[#3A4F1C]/10 rounded w-full"></div>
                </div>
            </div>
        }>
            <PortfolioViewContent {...props} />
        </Suspense>
    );
}

