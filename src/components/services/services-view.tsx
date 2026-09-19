'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { ServicesCategoryFilter } from './services-category-filter';
import { ServicesCard } from './services-card';
import { ServicesDetailPanel } from './services-detail-panel';
import type { ServiceCategory, ServiceItem, ActiveServiceCategoryFilter } from '@/types';

interface ServicesViewProps {
    categories: ServiceCategory[];
    services: ServiceItem[];
    activeCategory: ActiveServiceCategoryFilter;
}

function ServicesViewContent({
    categories,
    services,
    activeCategory: initialActiveCategory,
}: ServicesViewProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [activeCategory, setActiveCategory] = useState<ActiveServiceCategoryFilter>(initialActiveCategory);
    const [selectedService, setSelectedService] = useState<ServiceItem | null>(
        services && services.length > 0 ? services[0] : null
    );
    const [mobileModalService, setMobileModalService] = useState<ServiceItem | null>(null);

    const serviceParam = searchParams.get('service');
    const categoryParam = searchParams.get('category');

    const allCategoriesList = [
        { slug: 'all', title: 'All Services' },
        ...categories.map((cat) => ({
            slug: cat.slug,
            title: cat.title,
        })),
    ];

    // Sync state with URL search params
    useEffect(() => {
        if (categoryParam && categoryParam !== activeCategory) {
            setActiveCategory(categoryParam);
        }
        if (serviceParam) {
            const match = services.find((s) => s.slug === serviceParam || s.id === serviceParam);
            if (match) {
                setSelectedService(match);
            }
        }
    }, [serviceParam, categoryParam, services]);

    // Filter service items by active category
    const filteredServices = activeCategory === 'all'
        ? services
        : services.filter((s) => s.category.slug === activeCategory);

    // Instant category selection without screen freeze
    const handleSelectCategory = (slug: ActiveServiceCategoryFilter) => {
        setActiveCategory(slug);

        const categoryItems = slug === 'all' ? services : services.filter((s) => s.category.slug === slug);
        if (categoryItems.length > 0) {
            setSelectedService(categoryItems[0]);
        }

        if (typeof window !== 'undefined') {
            const newParams = new URLSearchParams(window.location.search);
            if (slug === 'all') {
                newParams.delete('category');
            } else {
                newParams.set('category', slug);
            }
            const queryStr = newParams.toString();
            const newUrl = queryStr ? `${pathname}?${queryStr}` : pathname;
            window.history.replaceState(null, '', newUrl);
        }
    };

    const handleSelectService = (service: ServiceItem) => {
        setSelectedService(service);

        if (typeof window !== 'undefined') {
            const newParams = new URLSearchParams(window.location.search);
            newParams.set('service', service.slug);
            const queryStr = newParams.toString();
            const newUrl = `${pathname}?${queryStr}`;
            window.history.replaceState(null, '', newUrl);
        }
    };

    const handleOpenMobileModal = (service: ServiceItem) => {
        handleSelectService(service);
        setMobileModalService(service);
    };

    return (
        <section className="py-6 sm:py-12 bg-[#EFEAD8]/60 border-t border-[#3A4F1C]/10 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Mobile Category Dropdown — Sits inside Services body, sticky when scrolling down */}
                <div className="lg:hidden sticky top-[56px] sm:top-[64px] z-30 bg-[#EFEAD8] py-2 mb-4 border-b border-[#3A4F1C]/20 shadow-xs">
                    <label htmlFor="mobile-category-select-body" className="sr-only">
                        Select Category
                    </label>
                    <div className="relative">
                        <select
                            id="mobile-category-select-body"
                            value={activeCategory}
                            onChange={(e) => handleSelectCategory(e.target.value)}
                            className="w-full appearance-none bg-[#F7F3E8] text-[#3A4F1C] text-xs font-semibold uppercase tracking-wider py-2.5 px-3.5 pr-10 rounded-xl border border-[#3A4F1C]/30 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#BC6F07] cursor-pointer"
                        >
                            {allCategoriesList.map((cat) => (
                                <option key={cat.slug} value={cat.slug}>
                                    {cat.title}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#3A4F1C]">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* 3-Column Layout: 15% / 50% / 35% Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                    
                    {/* Column 1 (15% Category Navigation) — Sticky on Desktop */}
                    <div className="hidden lg:block lg:col-span-2 lg:sticky lg:top-24 lg:self-start">
                        <ServicesCategoryFilter
                            categories={categories}
                            activeCategory={activeCategory}
                            onSelectCategory={handleSelectCategory}
                        />
                    </div>

                    {/* Column 2 (50% Service Cards List) — Primary Scrollable Feed */}
                    <div className="lg:col-span-6 space-y-4 sm:space-y-5">
                        {filteredServices.length > 0 ? (
                            filteredServices.map((service, index) => (
                                <ServicesCard
                                    key={service.id || service.slug || `service-card-${index}`}
                                    service={service}
                                    isSelected={selectedService?.id === service.id}
                                    onSelect={handleSelectService}
                                    onOpenMobileModal={handleOpenMobileModal}
                                    priority={index === 0}
                                />
                            ))
                        ) : (
                            <div className="py-16 text-center rounded-xl bg-[#F7F3E8] border border-[#3A4F1C]/15">
                                <p className="text-[#3A4F1C]/80 text-sm font-medium">
                                    No services found in this category.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Column 3 (35% Book Now Detail Card) — Sticky on Desktop */}
                    <div className="hidden lg:block lg:col-span-4 lg:sticky lg:top-24 lg:self-start">
                        <ServicesDetailPanel
                            service={selectedService}
                        />
                    </div>

                </div>
            </div>

            {/* Mobile View Details Modal */}
            {mobileModalService && (
                <div className="lg:hidden fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
                    <div className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
                        <ServicesDetailPanel
                            service={mobileModalService}
                            isMobileModal={true}
                            onCloseMobile={() => setMobileModalService(null)}
                        />
                    </div>
                </div>
            )}
        </section>
    );
}

export function ServicesView(props: ServicesViewProps) {
    return (
        <Suspense fallback={
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <div className="animate-pulse flex flex-col items-center space-y-4">
                    <div className="h-8 bg-[#3A4F1C]/10 rounded w-1/3"></div>
                    <div className="h-64 bg-[#3A4F1C]/10 rounded w-full"></div>
                </div>
            </div>
        }>
            <ServicesViewContent {...props} />
        </Suspense>
    );
}
