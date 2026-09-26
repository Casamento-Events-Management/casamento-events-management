'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { DataPrivacyDisclaimer } from './DataPrivacyDisclaimer';
import { checkPhilippineHoliday } from '@/lib/utils/holidayUtils';
import type { BookingFormData } from '@/types';

interface Step2EventDetailsProps {
  formData: BookingFormData;
  onChange: (updated: Partial<BookingFormData>) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
}

export function Step2EventDetails({
  formData,
  onChange,
  onNextStep,
  onPrevStep,
}: Step2EventDetailsProps) {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const holidayCheck = checkPhilippineHoliday(val);

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
      <div className="border-b border-[#3A4F1C]/15 pb-4">
        <h2 className="text-2xl font-serif text-[#3A4F1C] font-semibold">
          Tell Us About Your Event
        </h2>
      </div>

      <div className="space-y-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#3A4F1C]/70 block">
          Contact Details
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      <div className="space-y-4 pt-2 border-t border-[#3A4F1C]/15">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#3A4F1C]/70 block">
          Event Schedule & Location
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#3A4F1C]">
              Target Event Date <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              required
              value={formData.eventDate}
              onChange={handleDateChange}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#3A4F1C]/20 bg-[#EFEAD8]/40 focus:bg-[#F7F3E8] focus:border-[#BC6F07] focus:outline-none text-[#3A4F1C]"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#3A4F1C]">
              Target Venue / City <span className="text-red-600">*</span>
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
        </div>

        {formData.isHolidayDate && (
          <div className="p-3 bg-[#BC6F07]/10 border border-[#BC6F07]/30 rounded-lg text-xs text-[#3A4F1C] space-y-0.5">
            <span className="font-semibold text-[#BC6F07] uppercase block tracking-wider text-[10px]">
              Public Holiday Detected: {formData.holidayName}
            </span>
            <p className="text-[11px] font-light leading-snug">
              The selected date lands on a recognized Philippine public holiday. Our team will verify vendor availability and applicable holiday rates during consultation.
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

      {/* Short Text-only Data Privacy Disclaimer (RA 10173) */}
      <DataPrivacyDisclaimer />

      <div className="pt-4 flex items-center justify-between gap-3">
        <Button
          onClick={onPrevStep}
          variant="secondary"
          size="sm"
          className="text-xs sm:text-sm px-3.5 sm:px-6 py-2 sm:py-3"
        >
          Back
        </Button>
        <Button
          onClick={onNextStep}
          disabled={!isFormValid}
          variant="primary"
          size="sm"
          className="text-xs sm:text-sm px-3.5 sm:px-6 py-2 sm:py-3"
        >
          Payment & Review &rarr;
        </Button>
      </div>
    </div>
  );
}
