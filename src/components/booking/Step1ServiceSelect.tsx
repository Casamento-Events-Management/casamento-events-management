'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { InFormServiceCard } from './InFormServiceCard';
import type { ServiceItem, ServiceAddOn, SelectedAddOn } from '@/types';

interface Step1ServiceSelectProps {
  service: ServiceItem | null;
  selectedAddOns: SelectedAddOn[];
  onToggleAddOn: (addon: ServiceAddOn) => void;
  onNextStep: () => void;
  onOpenModal: () => void;
}

export function Step1ServiceSelect({
  service,
  selectedAddOns,
  onToggleAddOn,
  onNextStep,
  onOpenModal,
}: Step1ServiceSelectProps) {
  if (!service) {
    return (
      <div className="py-12 sm:py-20 text-center space-y-6 sm:space-y-8 w-full min-h-[60vh] lg:min-h-[75vh] flex flex-col items-center justify-center">
        <div className="text-center space-y-2 sm:space-y-3 max-w-lg mx-auto">
          <h2 className="text-xl sm:text-3xl font-serif text-[#3A4F1C] font-semibold">
            Choose a Service Package
          </h2>
          <p className="text-xs sm:text-base text-[#3A4F1C]/80 font-light leading-relaxed">
            Please choose a service from our catalog to view package inclusions, add-on options, and continue your booking inquiry.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Button href="/services" variant="primary" size="md">
            View Our Services
          </Button>
        </div>
      </div>
    );
  }

  const selectedAddOnIds = selectedAddOns.map((item) => item.id);
  const basePrice = service.startingPrice || 0;
  const addOnsTotal = selectedAddOns.reduce((sum, item) => sum + item.price, 0);
  const totalPrice = basePrice + addOnsTotal;

  return (
    <div className="bg-[#F7F3E8] border border-[#3A4F1C]/20 rounded-xl p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="border-b border-[#3A4F1C]/15 pb-4 flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-serif text-[#3A4F1C] font-semibold">
          Checkout your Package
        </h2>
        <Link
          href="/services"
          className="text-xs font-medium text-[#BC6F07] hover:underline shrink-0"
        >
          Change Service
        </Link>
      </div>

      {/* Parent 2-Column Grid (Equal 50/50 split on desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left Column: Deliverables & Inclusions */}
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#3A4F1C]/70 block">
            Deliverables & Inclusions
          </span>
          <div className="bg-[#EFEAD8]/60 p-4 rounded-xl border border-[#3A4F1C]/15 space-y-2">
            {service.defaultInclusions && service.defaultInclusions.length > 0 ? (
              service.defaultInclusions.map((item, idx) => (
                <div key={idx} className="text-[11px] sm:text-xs flex items-start space-x-2 text-[#3A4F1C]">
                  <span className="text-[#BC6F07] font-bold">✓</span>
                  <span>{item}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#3A4F1C]/70 italic">Standard event package inclusions apply.</p>
            )}
          </div>
        </div>

        {/* Right Column: Child 2-Grid Service Card (Left image, Right specs) */}
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#3A4F1C]/70 block">
            Selected Service Overview
          </span>
          <InFormServiceCard service={service} onOpenModal={onOpenModal} />
        </div>
      </div>

      {/* Optional Add-on Upgrades Section (Vertical List Stack) */}
      {service.addOns && service.addOns.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-[#3A4F1C]/15">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#3A4F1C]/70 block">
            Select Optional Add-On Upgrades
          </span>
          <div className="space-y-2">
            {service.addOns.map((addon) => {
              const isChecked = selectedAddOnIds.includes(addon.id);
              return (
                <label
                  key={addon.id}
                  onClick={() => onToggleAddOn(addon)}
                  className={`flex items-start space-x-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                    isChecked
                      ? 'bg-[#3A4F1C]/10 border-[#BC6F07]'
                      : 'bg-[#EFEAD8]/40 border-[#3A4F1C]/15 hover:bg-[#EFEAD8]'
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
                      <span className="text-[11px] sm:text-xs font-semibold text-[#3A4F1C]">
                        {addon.title}
                      </span>
                      <span className="text-[11px] sm:text-xs font-bold text-[#BC6F07] ml-2 shrink-0">
                        {addon.priceFormatted || (addon.price ? `+₱${addon.price.toLocaleString()}` : '')}
                      </span>
                    </div>
                    {addon.description && (
                      <p className="text-[10px] sm:text-xs text-[#3A4F1C]/80 mt-0.5 font-light leading-snug">
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

      {/* Bottom Action Bar */}
      <div className="pt-6 border-t border-[#3A4F1C]/15 flex justify-end">
        <div className="flex flex-col items-end gap-2 text-right">
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#3A4F1C]/70 block">
              TOTAL PRICE
            </span>
            <span className="text-lg sm:text-xl font-serif font-bold text-[#3A4F1C]">
              ₱{totalPrice.toLocaleString()}
            </span>
          </div>

          <Button
            onClick={onNextStep}
            variant="primary"
            size="sm"
            className="w-full sm:w-auto text-xs sm:text-sm px-5 sm:px-7 py-2.5 sm:py-3 shadow-md"
          >
            Event Details &rarr;
          </Button>
        </div>
      </div>
    </div>
  );
}
