'use client';

import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { DataPrivacyDisclaimer } from './DataPrivacyDisclaimer';
import { checkCountryHoliday, getCountriesList } from '@/lib/utils/holidayUtils';
import { InFormServiceCard } from './InFormServiceCard';
import type { BookingFormData, ServiceItem } from '@/types';

interface Step2EventDetailsProps {
  formData: BookingFormData;
  service: ServiceItem | null;
  onChange: (updated: Partial<BookingFormData>) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onOpenModal: () => void;
}

export function Step2EventDetails({
  formData,
  service,
  onChange,
  onNextStep,
  onPrevStep,
  onOpenModal,
}: Step2EventDetailsProps) {
  const countriesList = useMemo(() => getCountriesList(), []);
  const selectedCountryCode = formData.eventCountry || 'PH';

  const todayDateString = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const match = countriesList.find((c) => c.code === code);
    const countryName = match ? match.name : code;

    const holidayCheck = checkCountryHoliday(formData.eventDate, code);

    onChange({
      eventCountry: code,
      eventCountryName: countryName,
      isHolidayDate: holidayCheck.isHoliday,
      holidayName: holidayCheck.name || '',
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val && val < todayDateString) {
      return;
    }
    const holidayCheck = checkCountryHoliday(val, selectedCountryCode);

    onChange({
      eventDate: val,
      isHolidayDate: holidayCheck.isHoliday,
      holidayName: holidayCheck.name || '',
    });
  };

  const isFormValid =
    formData.clientFullName.trim() !== '' &&
    formData.clientEmail.trim() !== '' &&
    formData.clientPhone.trim() !== '' &&
    formData.eventDate.trim() !== '' &&
    formData.venueCity.trim() !== '';

  return (
    <div className="bg-[#F7F3E8] border border-[#3A4F1C]/20 rounded-xl p-6 sm:p-8 space-y-6">
      {/* Form Header */}
      <div className="border-b border-[#3A4F1C]/15 pb-4">
        <h2 className="text-xl sm:text-2xl font-serif text-[#3A4F1C] font-semibold">
          Tell Us About Your Event
        </h2>
      </div>

      {/* 2-Column Grid: On Mobile, Selected Service appears FIRST (order-1), Contact Details SECOND (order-2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Selected Service Package (order-1 on Mobile, md:order-2 on Desktop) */}
        <div className="space-y-2 order-1 md:order-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#3A4F1C]/70 block">
            Selected Service Package
          </span>
          <InFormServiceCard service={service} onOpenModal={onOpenModal} />
        </div>

        {/* Contact Details (order-2 on Mobile, md:order-1 on Desktop) */}
        <div className="space-y-4 order-2 md:order-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#3A4F1C]/70 block">
            Contact Details
          </span>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#3A4F1C]">
                Full Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Maria Santos"
                value={formData.clientFullName}
                onChange={(e) => onChange({ clientFullName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#3A4F1C]/20 bg-[#EFEAD8]/40 focus:bg-[#F7F3E8] focus:border-[#BC6F07] focus:outline-none text-[#3A4F1C]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#3A4F1C]">
                  Email Address <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="maria@example.com"
                  value={formData.clientEmail}
                  onChange={(e) => onChange({ clientEmail: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#3A4F1C]/20 bg-[#EFEAD8]/40 focus:bg-[#F7F3E8] focus:border-[#BC6F07] focus:outline-none text-[#3A4F1C]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#3A4F1C]">
                  Mobile Phone <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+63 917 123 4567"
                  value={formData.clientPhone}
                  onChange={(e) => onChange({ clientPhone: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#3A4F1C]/20 bg-[#EFEAD8]/40 focus:bg-[#F7F3E8] focus:border-[#BC6F07] focus:outline-none text-[#3A4F1C]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#3A4F1C]">
                Company / Organization <span className="text-[#3A4F1C]/50">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="Company or Group Name"
                value={formData.companyName || ''}
                onChange={(e) => onChange({ companyName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#3A4F1C]/20 bg-[#EFEAD8]/40 focus:bg-[#F7F3E8] focus:border-[#BC6F07] focus:outline-none text-[#3A4F1C]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Schedule & Location Section (3-Grid Layout) */}
      <div className="space-y-4 pt-4 border-t border-[#3A4F1C]/15">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#3A4F1C]/70 block">
          Event Schedule & Location
        </span>

        {/* 3-Grid Row: Target Event Country | Target Venue Address | Target Event Date */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Target Event Country */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#3A4F1C]">
              Target Event Country <span className="text-red-600">*</span>
            </label>
            <select
              value={selectedCountryCode}
              onChange={handleCountryChange}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#3A4F1C]/20 bg-[#EFEAD8]/40 focus:bg-[#F7F3E8] focus:border-[#BC6F07] focus:outline-none text-[#3A4F1C] cursor-pointer"
            >
              {countriesList.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          {/* Target Venue Address */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#3A4F1C]">
              Target Venue Address <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. BGC Taguig, Tagaytay, Cebu"
              value={formData.venueCity}
              onChange={(e) => onChange({ venueCity: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#3A4F1C]/20 bg-[#EFEAD8]/40 focus:bg-[#F7F3E8] focus:border-[#BC6F07] focus:outline-none text-[#3A4F1C]"
            />
          </div>

          {/* Target Event Date */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#3A4F1C]">
              Target Event Date <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              required
              min={todayDateString}
              value={formData.eventDate}
              onChange={handleDateChange}
              onClick={(e) => {
                try {
                  e.currentTarget.showPicker?.();
                } catch {
                  // Fallback for older browsers
                }
              }}
              onFocus={(e) => {
                try {
                  e.currentTarget.showPicker?.();
                } catch {
                  // Fallback for older browsers
                }
              }}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#3A4F1C]/20 bg-[#EFEAD8]/40 focus:bg-[#F7F3E8] focus:border-[#BC6F07] focus:outline-none text-[#3A4F1C] cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer"
            />
          </div>
        </div>

        {formData.isHolidayDate && (
          <div className="p-3 bg-[#BC6F07]/10 border border-[#BC6F07]/30 rounded-lg text-xs text-[#3A4F1C] space-y-0.5">
            <span className="font-semibold text-[#BC6F07] uppercase block tracking-wider text-[10px]">
              Public Holiday Detected: {formData.holidayName}
            </span>
            <p className="text-[11px] font-light leading-snug">
              The selected date lands on a recognized public holiday in {formData.eventCountryName || 'Philippines'}. Our team will verify vendor availability and applicable holiday rates during consultation.
            </p>
          </div>
        )}

        <div className="space-y-1">
          <label className="block text-xs font-medium text-[#3A4F1C]">
            Special Requirements / Notes <span className="text-[#3A4F1C]/50">(Optional)</span>
          </label>
          <textarea
            rows={3}
            placeholder="Share any specific requests, estimated guest count, or technical requirements..."
            value={formData.specialNotes || ''}
            onChange={(e) => onChange({ specialNotes: e.target.value })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-[#3A4F1C]/20 bg-[#EFEAD8]/40 focus:bg-[#F7F3E8] focus:border-[#BC6F07] focus:outline-none text-[#3A4F1C]"
          />
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="pt-6 border-t border-[#3A4F1C]/15 flex items-end justify-between gap-4">
        <Button
          onClick={onPrevStep}
          variant="secondary"
          size="sm"
          className="text-xs sm:text-sm px-4 sm:px-6 py-2.5 sm:py-3"
        >
          Back
        </Button>

        <div className="flex flex-col items-end gap-2 text-right">
          {/* Costs Breakdown (Clean Right-Aligned Text, NO Card) */}
          <div className="space-y-1 text-right text-xs text-[#3A4F1C]">
            <div className="text-[11px] text-[#3A4F1C]/80">
              <span>Base Package ({formData.serviceTitle || 'Selected Service'}): </span>
              <span className="font-semibold text-[#3A4F1C]">₱{formData.basePrice.toLocaleString()}</span>
            </div>

            {formData.selectedAddOns && formData.selectedAddOns.length > 0 && (
              <div className="space-y-0.5">
                {formData.selectedAddOns.map((addon) => (
                  <div key={addon.id} className="text-[11px] text-[#3A4F1C]/80">
                    <span>+ {addon.title}: </span>
                    <span className="font-semibold text-[#3A4F1C]">₱{addon.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-1.5 border-t border-[#3A4F1C]/15 mt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#3A4F1C]/70 block">
                TOTAL PRICE: <span className="text-xl sm:text-2xl font-serif font-bold text-[#3A4F1C]">
                  ₱{formData.totalEstimate.toLocaleString()}
                </span>
              </span>
            </div>
          </div>

          <Button
            onClick={onNextStep}
            disabled={!isFormValid}
            variant="primary"
            size="sm"
            className="w-full sm:w-auto text-xs sm:text-sm px-6 sm:px-8 py-3 shadow-md mt-1"
          >
            Payment & Review &rarr;
          </Button>
        </div>
      </div>

      {/* Privacy Disclaimer rendered at the Form Footer */}
      <DataPrivacyDisclaimer />
    </div>
  );
}
