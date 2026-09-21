'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { ServiceItem } from '@/types';
import { Badge } from '@/components/ui/badge';

interface ServicesCardProps {
    service: ServiceItem;
    isSelected: boolean;
    onSelect: (service: ServiceItem) => void;
    onOpenMobileModal?: (service: ServiceItem) => void;
    priority?: boolean;
}

/**
 * ServicesCard Component
 *
 * Rendered in Column 2 (50% list). Card clicks update selection state cleanly.
 */
export function ServicesCard({
    service,
    isSelected,
    onSelect,
    onOpenMobileModal,
    priority = false,
}: ServicesCardProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const images = service.images && service.images.length > 0
        ? service.images
        : [{ url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80', alt: service.title }];

    // Auto switching image carousel effect (4 seconds interval)
    useEffect(() => {
        if (images.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }, 4000);

        return () => clearInterval(timer);
    }, [images.length]);

    const handleNextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const handlePrevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const handleCardClick = () => {
        onSelect(service);
        // Only open mobile modal on mobile screen size (< 1024px)
        if (typeof window !== 'undefined' && window.innerWidth < 1024 && onOpenMobileModal) {
            onOpenMobileModal(service);
        }
    };

    // Seamless booking redirect URL with lifted details
    const bookingUrl = `/book-now?service=${encodeURIComponent(service.slug)}&category=${encodeURIComponent(service.category.slug)}&startingPrice=${service.startingPrice}`;

    return (
        <article
            onClick={handleCardClick}
            className={`group flex flex-col rounded-xl bg-[#F7F3E8] border transition-all duration-200 overflow-hidden cursor-pointer ${
                isSelected
                    ? 'border-[#BC6F07] ring-2 ring-[#BC6F07]/40 shadow-sm'
                    : 'border-[#3A4F1C]/15 hover:border-[#3A4F1C]/40 hover:shadow-xs'
            }`}
        >
            {/* 1. Carousel Container */}
            <div className="relative h-48 sm:h-68 md:h-76 lg:h-82 w-full bg-[#EFEAD8] overflow-hidden select-none">
                <Image
                    src={images[currentImageIndex]?.url || images[0].url}
                    alt={images[currentImageIndex]?.alt || service.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
                    priority={priority}
                    className="object-cover"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 pointer-events-none" />

                {/* Badge Tag */}
                {service.badge && (
                    <div className="absolute top-2.5 left-2.5 z-10">
                        <Badge status="upcoming" className="bg-[#3A4F1C]/90 text-[#F7F3E8] border-[#BC6F07]/60 text-[10px] py-0.5 px-2">
                            {service.badge}
                        </Badge>
                    </div>
                )}

                {/* Manual Carousel Controls */}
                {images.length > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={handlePrevImage}
                            aria-label="Previous image"
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            onClick={handleNextImage}
                            aria-label="Next image"
                            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        {/* Carousel Dots */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex space-x-1">
                            {images.map((_, idx) => (
                                <button
                                    key={`dot-${idx}`}
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentImageIndex(idx);
                                    }}
                                    className={`h-1 rounded-full transition-all ${
                                        idx === currentImageIndex ? 'bg-[#BC6F07] w-3' : 'bg-white/70 w-1'
                                    }`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* 2. Card Content Body */}
            <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between space-y-3">
                <div className="space-y-1">
                    <h3 className="text-sm sm:text-base font-serif font-semibold text-[#3A4F1C] leading-snug group-hover:text-[#BC6F07] transition-colors">
                        {service.title}
                    </h3>

                    {/* Tagline & Category */}
                    <div className="flex items-center text-[10px] sm:text-[11px] font-semibold tracking-wider text-[#BC6F07] uppercase">
                        <span className="text-[#BC6F07] mr-1">•</span>
                        <span>{service.serviceType}</span>
                        <span className="text-[#BC6F07] mx-1">•</span>
                        <span>{service.category.title}</span>
                    </div>

                    <p className="text-[11px] sm:text-xs text-[#3A4F1C]/90 font-medium line-clamp-2 leading-relaxed">
                        {service.shortDescription}
                    </p>
                </div>

                {/* Default Inclusions Teaser */}
                {service.defaultInclusions && service.defaultInclusions.length > 0 && (
                    <div className="pt-1.5 border-t border-[#3A4F1C]/10 space-y-0.5">
                        <span className="text-[9px] font-bold uppercase text-[#3A4F1C]/70 tracking-wider">
                            Key Inclusions:
                        </span>
                        <ul className="space-y-0.5">
                            {service.defaultInclusions.slice(0, 2).map((item, idx) => (
                                <li key={idx} className="text-[10px] sm:text-[11px] text-[#3A4F1C]/90 font-medium flex items-center space-x-1">
                                    <span className="text-[#BC6F07] text-[11px] font-bold">✓</span>
                                    <span className="truncate">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* 3. Card Footer Price & Reduced Mobile CTA Buttons */}
                <div className="pt-2 border-t border-[#3A4F1C]/15 flex items-center justify-between gap-1.5">
                    <div>
                        <span className="text-[9px] text-[#3A4F1C]/75 font-semibold block uppercase tracking-wider">Starting Rate</span>
                        <span className="text-sm sm:text-base font-bold font-serif text-[#3A4F1C]">
                            {service.priceFormatted}
                        </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                        {/* Mobile Only: Reduced View Details button */}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCardClick();
                            }}
                            className="lg:hidden px-2 py-1 rounded-full text-[10px] font-medium border border-[#3A4F1C]/30 text-[#3A4F1C] hover:bg-[#3A4F1C] hover:text-[#F7F3E8] transition-all cursor-pointer whitespace-nowrap"
                        >
                            View Details
                        </button>
                        
                        {/* Reduced Size Book Now Button */}
                        <Link
                            href={bookingUrl}
                            onClick={(e) => e.stopPropagation()}
                            className="px-2.5 py-1 lg:px-4 lg:py-1.5 rounded-full text-[10px] lg:text-xs font-semibold uppercase tracking-wider bg-[#3A4F1C] text-[#F7F3E8] hover:bg-[#2A3A14] border border-[#BC6F07]/50 shadow-xs transition-all text-center inline-block whitespace-nowrap"
                        >
                            Book Now
                        </Link>
                    </div>
                </div>
            </div>
        </article>
    );
}
