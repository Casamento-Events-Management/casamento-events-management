'use client';

import React from 'react';
import type { ServiceItem } from '@/types';
import { ServicesCard } from './services-card';
import { ServicesDetailPanel } from './services-detail-panel';

interface ServicesCategoryAccordionProps {
    category: {
        slug: string;
        title: string;
        description?: string;
    };
    services: ServiceItem[];
    isOpen: boolean;
    onToggle: () => void;
    selectedService: ServiceItem | null;
    onSelectService: (service: ServiceItem) => void;
    onOpenMobileModal: (service: ServiceItem) => void;
    isFirstPriority?: boolean;
}

/**
 * ServicesCategoryAccordion Component
 *
 * Renders a collapsible category bar that expands to reveal a 2-column layout:
 * - Left column (60%): Vertical feed of service cards belonging to this category.
 * - Right column (40%, sticky on desktop): Interactive Service & Detail Panel.
 */
export function ServicesCategoryAccordion({
    category,
    services,
    isOpen,
    onToggle,
    selectedService,
    onSelectService,
    onOpenMobileModal,
    isFirstPriority = false,
}: ServicesCategoryAccordionProps) {
    const serviceCount = services.length;

    // Determine if the currently selected service is in this category
    const activeServiceInCat = selectedService && services.some((s) => s.id === selectedService.id)
        ? selectedService
        : services[0] || null;

    return (
        <div className="rounded-2xl border border-[#3A4F1C]/20 bg-[#F7F3E8] shadow-xs transition-all duration-300">
            {/* Accordion Trigger Header */}
            <button
                type="button"
                onClick={onToggle}
                className={`w-full px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between text-left transition-colors cursor-pointer select-none ${
                    isOpen
                        ? 'bg-[#3A4F1C] text-[#F7F3E8] rounded-t-2xl'
                        : 'bg-[#F7F3E8] hover:bg-[#EFEAD8] text-[#3A4F1C] rounded-2xl'
                }`}
                aria-expanded={isOpen}
            >
                <div className="flex items-center space-x-3.5 sm:space-x-4 min-w-0 pr-4">
                    <div className="min-w-0">
                        <div className="flex items-center space-x-2.5">
                            <h2 className="text-base sm:text-lg lg:text-xl font-serif font-semibold tracking-tight leading-snug truncate">
                                {category.title}
                            </h2>
                            <span
                                className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 uppercase tracking-wider ${
                                    isOpen
                                        ? 'bg-[#BC6F07] text-[#F7F3E8]'
                                        : 'bg-[#3A4F1C]/10 text-[#3A4F1C]'
                                }`}
                            >
                                {serviceCount} {serviceCount === 1 ? 'Service' : 'Services'}
                            </span>
                        </div>
                        {category.description && (
                            <p
                                className={`text-xs mt-0.5 font-medium line-clamp-1 ${
                                    isOpen ? 'text-[#F7F3E8]/80' : 'text-[#3A4F1C]/75'
                                }`}
                            >
                                {category.description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Animated Chevron Indicator */}
                <div className="flex items-center space-x-2 shrink-0">
                    <span
                        className={`text-xs font-semibold uppercase tracking-wider hidden sm:inline-block ${
                            isOpen ? 'text-[#BC6F07]' : 'text-[#3A4F1C]/70'
                        }`}
                    >
                        {isOpen ? 'Collapse' : 'Expand'}
                    </span>
                    <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 ${
                            isOpen ? 'rotate-180 bg-[#BC6F07] text-[#F7F3E8]' : 'bg-[#3A4F1C]/10 text-[#3A4F1C]'
                        }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </button>

            {/* Accordion Content Body */}
            {isOpen && (
                <div className="p-4 sm:p-6 bg-[#EFEAD8]/50 border-t border-[#3A4F1C]/15 rounded-b-2xl animate-in fade-in duration-300">
                    {services.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                            {/* Left Column: Service Cards List (60% Desktop Width / col-span-7) */}
                            <div className="lg:col-span-7 space-y-4 sm:space-y-5">
                                {services.map((service, index) => (
                                    <ServicesCard
                                        key={service.id || service.slug || `cat-service-${index}`}
                                        service={service}
                                        isSelected={selectedService?.id === service.id}
                                        onSelect={onSelectService}
                                        onOpenMobileModal={onOpenMobileModal}
                                        priority={isFirstPriority && index === 0}
                                    />
                                ))}
                            </div>

                            {/* Right Column: Sticky Detail Panel (40% Desktop Width / col-span-5) */}
                            <div className="hidden lg:block lg:col-span-5 lg:sticky lg:top-20 lg:self-start z-10">
                                <ServicesDetailPanel service={activeServiceInCat} />
                            </div>
                        </div>
                    ) : (
                        <div className="py-12 text-center rounded-xl bg-[#F7F3E8] border border-[#3A4F1C]/15">
                            <p className="text-[#3A4F1C]/80 text-sm font-medium">
                                No services found in this category.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
