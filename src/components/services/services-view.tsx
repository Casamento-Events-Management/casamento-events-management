'use client';

import React, { useState, useEffect, useTransition, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
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
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [, startTransition] = useTransition();

    const [activeCategory, setActiveCategory] = useState<ActiveServiceCategoryFilter>(initialActiveCategory);
    const [selectedService, setSelectedService] = useState<ServiceItem | null>(
        services && services.length > 0 ? services[0] : null
    );
    const [mobileModalService, setMobileModalService] = useState<ServiceItem | null>(null);

    const serviceParam = searchParams.get('service');
    const categoryParam = searchParams.get('category');

    // Sync with URL params
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

    // Prevent body scroll when mobile modal is open
    useEffect(() => {
        if (mobileModalService) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileModalService]);

    // Filter services by category
    const filteredServices = activeCategory === 'all'
        ? services
        : services.filter((s) => s.category.slug === activeCategory);

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
            startTransition(() => {
                router.push(newUrl, { scroll: false });
            });
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
        /* Body section styled with subtle background matching Home page's Upcoming event section */
        <section className="py-8 sm:py-12 bg-[#EFEAD8]/60 border-t border-[#3A4F1C]/10 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* 3-Column Layout: 15% / 50% / 35% Breakdown (lg:col-span-2 / lg:col-span-6 / lg:col-span-4) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                    
                    {/* Column 1 (15% Ratio -> lg:col-span-2) — Category Navigation (Sticky) */}
                    <div className="lg:col-span-2">
                        <ServicesCategoryFilter
                            categories={categories}
                            activeCategory={activeCategory}
                            onSelectCategory={handleSelectCategory}
                        />
                    </div>

                    {/* Column 2 (50% Ratio -> lg:col-span-6) — Service Cards Vertical List */}
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

                    {/* Column 3 (35% Ratio -> lg:col-span-4) — Sticky Appearing Detail Preview Card */}
                    <div className="hidden lg:block lg:col-span-4">
                        <ServicesDetailPanel
                            service={selectedService}
                        />
                    </div>

                </div>
            </div>

            {/* Mobile View Details & Book Now Modal */}
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
