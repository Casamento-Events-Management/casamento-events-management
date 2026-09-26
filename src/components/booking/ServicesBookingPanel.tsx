'use client';

import React from 'react';
import Image from 'next/image';
import type { ServiceItem, ServiceAddOn, SelectedAddOn } from '@/types';

interface ServicesBookingPanelProps {
  service: ServiceItem | null;
  selectedAddOns: SelectedAddOn[];
  onToggleAddOn?: (addon: ServiceAddOn) => void;
  isInteractiveAddOns?: boolean;
}

/**
 * ServicesBookingPanel Component (Uplifted from ServicesDetailPanel)
 *
 * Displays the 30% Right Column Service Summary Panel.
 * Persistent across all steps of the /book-now page.
 * Displays live itemized add-on selections, deliverables, and estimated package total.
 * Reuses design system styling WITHOUT the "Book Now" CTA link button.
 */
export function ServicesBookingPanel({
  service,
  selectedAddOns,
  onToggleAddOn,
  isInteractiveAddOns = true,
}: ServicesBookingPanelProps) {
  if (!service) {
    return (
      <aside className="bg-[#F7F3E8] border border-[#3A4F1C]/20 rounded-xl p-6 text-center space-y-3 shadow-sm">
        <span className="text-xs font-bold tracking-widest text-[#BC6F07] uppercase block">
          Service Summary
        </span>
        <h3 className="text-base font-serif font-semibold text-[#3A4F1C]">
          No Service Selected
        </h3>
        <p className="text-xs text-[#3A4F1C]/70 leading-relaxed font-light">
          Please select a service from our catalog to view package inclusions, add-on pricing, and total estimates.
        </p>
      </aside>
    );
  }

  const selectedAddOnIds = selectedAddOns.map((item) => item.id);
  const basePrice = service.startingPrice || 0;
  const addOnsTotal = selectedAddOns.reduce((sum, item) => sum + (item.price || 0), 0);
  const grandTotal = basePrice + addOnsTotal;

  return (
    <aside className="bg-[#F7F3E8] border border-[#3A4F1C]/20 rounded-xl shadow-md overflow-hidden flex flex-col w-full max-h-[calc(100vh-7rem)] sticky top-28">
      {/* Header Banner */}
      <div className="relative h-32 w-full bg-[#EFEAD8] shrink-0">
        {service.images && service.images[0] && (
          <Image
            src={service.images[0].url}
            alt={service.title}
            fill
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="absolute bottom-3 left-3 right-3 text-white space-y-1">
          <span className="text-[9px] font-bold tracking-widest uppercase bg-[#BC6F07] px-1.5 py-0.5 rounded text-[#F7F3E8] inline-block">
            {service.category.title}
          </span>
          <h2 className="text-sm sm:text-base font-serif font-semibold leading-tight line-clamp-1">
            {service.title}
          </h2>
        </div>
      </div>

      {/* Scrollable Panel Body */}
      <div className="p-4 overflow-y-auto space-y-4 flex-1 text-[#3A4F1C] text-xs">
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
        {service.defaultInclusions && service.defaultInclusions.length > 0 && (
          <div>
            <h4 className="text-[10px] font-bold tracking-wider uppercase text-[#3A4F1C]/70 mb-1">
              Deliverables & Inclusions
            </h4>
            <ul className="space-y-1 bg-[#EFEAD8]/60 p-2.5 rounded-lg border border-[#3A4F1C]/10">
              {service.defaultInclusions.map((item, idx) => (
                <li key={idx} className="text-[11px] flex items-start space-x-1.5">
                  <span className="text-[#BC6F07] font-bold mt-0.5">✓</span>
                  <span className="text-[#3A4F1C]/90 leading-snug font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 3. Optional Add-On Upgrades */}
        {service.addOns && service.addOns.length > 0 && (
          <div>
            <h4 className="text-[10px] font-bold tracking-wider uppercase text-[#3A4F1C]/70 mb-1.5 flex items-center justify-between">
              <span>Optional Add-Ons</span>
              {isInteractiveAddOns && (
                <span className="text-[9px] text-[#BC6F07] normal-case">Select to include</span>
              )}
            </h4>
            <div className="space-y-1.5">
              {service.addOns.map((addon) => {
                const isChecked = selectedAddOnIds.includes(addon.id);
                return (
                  <label
                    key={addon.id}
                    onClick={() => isInteractiveAddOns && onToggleAddOn && onToggleAddOn(addon)}
                    className={`flex items-start space-x-2 p-2 rounded-lg border transition-all ${
                      isInteractiveAddOns ? 'cursor-pointer' : 'cursor-default'
                    } ${
                      isChecked
                        ? 'bg-[#3A4F1C]/10 border-[#BC6F07]'
                        : 'bg-[#F7F3E8] border-[#3A4F1C]/15 hover:bg-[#EFEAD8]'
                    }`}
                  >
                    {isInteractiveAddOns && (
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 rounded text-[#BC6F07] focus:ring-[#BC6F07]"
                      />
                    )}
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

      {/* Panel Footer - Price Summary Only (NO Book Now Button) */}
      <div className="p-3.5 bg-[#EFEAD8] border-t border-[#3A4F1C]/15 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[9px] uppercase font-bold tracking-wider text-[#3A4F1C]/60 block">
              Estimated Package Total
            </span>
            <span className="text-xl font-serif font-bold text-[#3A4F1C]">
              ₱{grandTotal.toLocaleString()}
            </span>
          </div>
          {selectedAddOns.length > 0 && (
            <span className="text-[10px] font-medium text-[#BC6F07] bg-[#BC6F07]/10 px-2 py-0.5 rounded-full border border-[#BC6F07]/20">
              {selectedAddOns.length} Add-on{selectedAddOns.length > 1 ? 's' : ''} Included
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}
