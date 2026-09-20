'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { ServiceItem } from '@/types';

interface ServicesDetailPanelProps {
    service: ServiceItem | null;
    isMobileModal?: boolean;
    onCloseMobile?: () => void;
}

/**
 * ServicesDetailPanel Component
 *
 * Renders the 35% Book Now detail preview card.
 * Desktop: Fits inside sticky Column 3 container.
 * Mobile: Rendered inside modal dialog.
 */
export function ServicesDetailPanel({
    service,
    isMobileModal = false,
    onCloseMobile,
}: ServicesDetailPanelProps) {
    const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
    const [, startTransition] = useTransition();

    // Reset selected add-ons when switching active service
    useEffect(() => {
        startTransition(() => {
            setSelectedAddOnIds([]);
        });
    }, [service?.id, startTransition]);

    if (!service) {
        return (
            <div className="bg-[#F7F3E8] border border-[#3A4F1C]/15 rounded-xl p-5 text-center space-y-2">
                <p className="text-xs font-medium text-[#3A4F1C]/70">
                    Select a service card to view package details, add-ons, and total estimate.
                </p>
            </div>
        );
    }

    const toggleAddOn = (addonId: string) => {
        setSelectedAddOnIds((prev) =>
            prev.includes(addonId)
                ? prev.filter((id) => id !== addonId)
                : [...prev, addonId]
        );
    };

    // Calculate live total price rate
    const basePrice = service.startingPrice || 0;
    const addOnsTotal = (service.addOns || [])
        .filter((addon) => selectedAddOnIds.includes(addon.id))
        .reduce((sum, addon) => sum + (addon.price || 0), 0);

    const grandTotal = basePrice + addOnsTotal;

    // Seamless booking URL lifting all parameters
    const selectedAddOnsQuery = selectedAddOnIds.join(',');
    const bookingUrl = `/book-now?service=${encodeURIComponent(service.slug)}&category=${encodeURIComponent(service.category.slug)}&addons=${encodeURIComponent(selectedAddOnsQuery)}&totalEstimate=${grandTotal}`;

    return (
        <aside className={`bg-[#F7F3E8] border border-[#3A4F1C]/20 rounded-xl shadow-md overflow-hidden flex flex-col ${
            isMobileModal ? 'w-full max-h-[90vh]' : 'w-full max-h-[calc(100vh-7rem)]'
        }`}>
            {/* Header Banner & Close Control */}
            <div className="relative h-32 w-full bg-[#EFEAD8] shrink-0">
                {service.images && service.images[0] && (
                    <Image
                        src={service.images[0].url}
                        alt={service.title}
                        fill
                        className="object-cover"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

                {onCloseMobile && (
                    <button
                        type="button"
                        onClick={onCloseMobile}
                        aria-label="Close modal"
                        className="absolute top-2.5 right-2.5 z-10 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center cursor-pointer text-xs font-bold hover:bg-black/80 transition-colors"
                    >
                        ✕
                    </button>
                )}

                <div className="absolute bottom-2.5 left-3 right-3 text-white space-y-0.5">
                    <span className="text-[9px] font-bold tracking-widest uppercase bg-[#BC6F07] px-1.5 py-0.5 rounded text-[#F7F3E8] inline-block">
                        {service.category.title}
                    </span>
                    <h2 className="text-sm sm:text-base font-serif font-semibold leading-tight line-clamp-1">
                        {service.title}
                    </h2>
                </div>
            </div>

            {/* Scrollable Panel Body */}
            <div className="p-3.5 overflow-y-auto space-y-3.5 flex-1 text-[#3A4F1C] text-xs">
                {/* 1. Full Description */}
                <div>
                    <h4 className="text-[10px] font-bold tracking-wider uppercase text-[#3A4F1C]/70 mb-1">
                        Package Scope
                    </h4>
                    <p className="text-[11px] text-[#3A4F1C]/90 leading-relaxed font-medium">
                        {service.fullDescription || service.shortDescription}
                    </p>
                </div>

                {/* 2. Default Inclusions */}
                <div>
                    <h4 className="text-[10px] font-bold tracking-wider uppercase text-[#3A4F1C]/70 mb-1">
                        Deliverables & Inclusions
                    </h4>
                    <ul className="space-y-1 bg-[#EFEAD8]/60 p-2 rounded-lg border border-[#3A4F1C]/10">
                        {service.defaultInclusions.map((item, idx) => (
                            <li key={idx} className="text-[11px] flex items-start space-x-1.5">
                                <span className="text-[#BC6F07] font-bold mt-0.5">✓</span>
                                <span className="text-[#3A4F1C]/90 leading-snug font-medium">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 3. Optional Add-On Upgrades */}
                {service.addOns && service.addOns.length > 0 && (
                    <div>
                        <h4 className="text-[10px] font-bold tracking-wider uppercase text-[#3A4F1C]/70 mb-1 flex items-center justify-between">
                            <span>Optional Add-Ons</span>
                            <span className="text-[9px] text-[#BC6F07] normal-case">Select to add</span>
                        </h4>
                        <div className="space-y-1.5">
                            {service.addOns.map((addon) => {
                                const isChecked = selectedAddOnIds.includes(addon.id);
                                return (
                                    <label
                                        key={addon.id}
                                        onClick={() => toggleAddOn(addon.id)}
                                        className={`flex items-start space-x-2 p-2 rounded-lg border cursor-pointer transition-all ${
                                            isChecked
                                                ? 'bg-[#3A4F1C]/10 border-[#BC6F07]'
                                                : 'bg-[#F7F3E8] border-[#3A4F1C]/15 hover:bg-[#EFEAD8]'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => {}}
                                            className="mt-0.5 rounded text-[#BC6F07] focus:ring-[#BC6F07]"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] font-semibold text-[#3A4F1C]">
                                                    {addon.title}
                                                </span>
                                                <span className="text-[11px] font-bold text-[#BC6F07] ml-1.5 shrink-0">
                                                    {addon.priceFormatted || (addon.price ? `+₱${addon.price.toLocaleString()}` : '')}
                                                </span>
                                            </div>
                                            {addon.description && (
                                                <p className="text-[9px] text-[#3A4F1C]/85 leading-tight mt-0.5 font-medium">
                                                    {addon.description}
                                                </p>
                                            )}
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Panel Footer - Price & Book Now CTA */}
            <div className="p-3 bg-[#EFEAD8] border-t border-[#3A4F1C]/15 space-y-2 shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-[8px] uppercase font-bold tracking-wider text-[#3A4F1C]/60 block">
                            Estimated Package Total
                        </span>
                        <span className="text-lg font-serif font-bold text-[#3A4F1C]">
                            ₱{grandTotal.toLocaleString()}
                        </span>
                    </div>
                    {selectedAddOnIds.length > 0 && (
                        <span className="text-[9px] font-medium text-[#BC6F07] bg-[#BC6F07]/10 px-1.5 py-0.5 rounded">
                            {selectedAddOnIds.length} Add-on{selectedAddOnIds.length > 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                <Link
                    href={bookingUrl}
                    className="w-full py-2 px-3 rounded-full bg-[#3A4F1C] text-[#F7F3E8] font-semibold text-[10px] sm:text-xs uppercase tracking-wider text-center border border-[#BC6F07] shadow-xs hover:bg-[#2A3A14] transition-all block"
                >
                    Book Now with Upgrades
                </Link>
            </div>
        </aside>
    );
}
