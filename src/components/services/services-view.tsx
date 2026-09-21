'use client';

import React, { useState, useEffect, useTransition, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { ServicesCategoryAccordion } from './services-category-accordion';
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
}: ServicesViewProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // State for array of currently expanded category slugs
    const [openCategorySlugs, setOpenCategorySlugs] = useState<string[]>([]);
    
    // State for selected service across categories
    const [selectedService, setSelectedService] = useState<ServiceItem | null>(
        services && services.length > 0 ? services[0] : null
    );
    
    // Mobile modal state
    const [mobileModalService, setMobileModalService] = useState<ServiceItem | null>(null);
    const [, startTransition] = useTransition();

    const serviceParam = searchParams.get('service');
    const categoryParam = searchParams.get('category');

    // 1. Initial load & Deep Link URL parameter auto-open logic
    useEffect(() => {
        let initialOpenSlug: string | null = null;
        let matchedService: ServiceItem | null = null;

        if (serviceParam) {
            matchedService = services.find((s) => s.slug === serviceParam || s.id === serviceParam) || null;
            if (matchedService) {
                initialOpenSlug = matchedService.category.slug;
            }
        } else if (categoryParam && categoryParam !== 'all') {
            initialOpenSlug = categoryParam;
            const catServices = services.filter((s) => s.category.slug === categoryParam);
            if (catServices.length > 0) {
                matchedService = catServices[0];
            }
        }

        if (initialOpenSlug) {
            startTransition(() => {
                setOpenCategorySlugs((prev) =>
                    prev.includes(initialOpenSlug!) ? prev : [...prev, initialOpenSlug!]
                );
                if (matchedService) {
                    setSelectedService(matchedService);
                }
            });
        }
    }, [serviceParam, categoryParam, services, startTransition]);

    // Handle toggling category open/closed
    const handleToggleCategory = (catSlug: string) => {
        const isCurrentlyOpen = openCategorySlugs.includes(catSlug);
        const nextOpen = isCurrentlyOpen
            ? openCategorySlugs.filter((s) => s !== catSlug)
            : [...openCategorySlugs, catSlug];

        setOpenCategorySlugs(nextOpen);

        // If opening a category, automatically select its first service if none selected in it
        if (!isCurrentlyOpen) {
            const catServices = services.filter((s) => s.category.slug === catSlug);
            if (catServices.length > 0) {
                setSelectedService(catServices[0]);
            }
        }

        // Sync URL state cleanly without calling replaceState inside pure state updater
        if (typeof window !== 'undefined') {
            const newParams = new URLSearchParams(window.location.search);
            if (!isCurrentlyOpen) {
                newParams.set('category', catSlug);
            } else {
                newParams.delete('category');
                newParams.delete('service');
            }
            const queryStr = newParams.toString();
            const newUrl = queryStr ? `${pathname}?${queryStr}` : pathname;
            window.history.replaceState(null, '', newUrl);
        }
    };

    const handleSelectService = (service: ServiceItem) => {
        setSelectedService(service);

        // Ensure category is open if service selected
        if (!openCategorySlugs.includes(service.category.slug)) {
            setOpenCategorySlugs((prev) => [...prev, service.category.slug]);
        }

        if (typeof window !== 'undefined') {
            const newParams = new URLSearchParams(window.location.search);
            newParams.set('service', service.slug);
            newParams.set('category', service.category.slug);
            const queryStr = newParams.toString();
            const newUrl = `${pathname}?${queryStr}`;
            window.history.replaceState(null, '', newUrl);
        }
    };

    const handleOpenMobileModal = (service: ServiceItem) => {
        handleSelectService(service);
        setMobileModalService(service);
    };

    const handleExpandAll = () => {
        setOpenCategorySlugs(categories.map((c) => c.slug));
    };

    const handleCollapseAll = () => {
        setOpenCategorySlugs([]);
    };

    return (
        <section className="py-6 sm:py-12 bg-[#EFEAD8]/60 border-t border-[#3A4F1C]/10 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
                
                {/* Accordion Controls & Quick Filter Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F7F3E8] p-3.5 sm:p-4 rounded-xl border border-[#3A4F1C]/15 shadow-xs">
                    <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#3A4F1C]">
                            Service Categories
                        </span>
                        <span className="text-xs text-[#3A4F1C]/60">
                            ({categories.length} Total)
                        </span>
                    </div>

                    {/* Expand All / Collapse All Quick Actions */}
                    <div className="flex items-center space-x-2 text-xs font-medium">
                        <button
                            type="button"
                            onClick={handleExpandAll}
                            className="px-3 py-1.5 rounded-lg bg-[#3A4F1C]/10 hover:bg-[#3A4F1C] hover:text-[#F7F3E8] text-[#3A4F1C] transition-colors cursor-pointer"
                        >
                            Expand All
                        </button>
                        <button
                            type="button"
                            onClick={handleCollapseAll}
                            className="px-3 py-1.5 rounded-lg border border-[#3A4F1C]/20 hover:bg-[#3A4F1C]/10 text-[#3A4F1C]/80 transition-colors cursor-pointer"
                        >
                            Collapse All
                        </button>
                    </div>
                </div>

                {/* Collapsible Accordions List */}
                <div className="space-y-4 sm:space-y-6">
                    {categories.map((cat, idx) => {
                        const catServices = services.filter((s) => s.category.slug === cat.slug);
                        const isOpen = openCategorySlugs.includes(cat.slug);

                        return (
                            <ServicesCategoryAccordion
                                key={cat.id || cat.slug || `category-${idx}`}
                                category={{
                                    slug: cat.slug,
                                    title: cat.title,
                                    description: cat.description,
                                }}
                                services={catServices}
                                isOpen={isOpen}
                                onToggle={() => handleToggleCategory(cat.slug)}
                                selectedService={selectedService}
                                onSelectService={handleSelectService}
                                onOpenMobileModal={handleOpenMobileModal}
                                isFirstPriority={idx === 0}
                            />
                        );
                    })}
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
