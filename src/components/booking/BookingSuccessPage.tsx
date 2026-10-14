'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Calendar, MapPin, Mail, ArrowRight, RefreshCw } from 'lucide-react';
import type { BookingFormData } from '@/types/bookingForm';

interface BookingSuccessPageProps {
  formData: BookingFormData;
  bookingReference: string;
  onBookAnother?: () => void;
}

export function BookingSuccessPage({
  formData,
  bookingReference,
}: BookingSuccessPageProps) {
  const addOnsDisplay =
    formData.selectedAddOns && formData.selectedAddOns.length > 0
      ? formData.selectedAddOns.map((a) => a.title).join(', ')
      : 'None selected';

  return (
    <div className="bg-[#F7F3E8] border border-[#3A4F1C]/20 rounded-2xl p-6 sm:p-10 shadow-sm space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header Icon & Title */}
      <div className="text-center space-y-3 pb-2 border-b border-[#3A4F1C]/15">
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-[#3A4F1C]/10 flex items-center justify-center text-[#BC6F07] shadow-inner">
          <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-[#3A4F1C]" />
        </div>
        <div>
          <span className="text-xs font-bold tracking-widest uppercase text-[#BC6F07] block mb-1">
            Reservation Confirmed
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#3A4F1C]">
            Booking Request Received
          </h1>
          <p className="text-xs sm:text-sm text-[#3A4F1C]/75 font-light mt-1 max-w-lg mx-auto">
            Thank you, <span className="font-semibold text-[#3A4F1C]">{formData.clientFullName}</span>! Your event reservation request has been secured in our calendar.
          </p>
        </div>
      </div>

      {/* Official Reference Box */}
      <div className="p-5 rounded-xl bg-[#EFEAD8] border border-[#3A4F1C]/15 text-center space-y-1">
        <span className="text-[10px] sm:text-xs font-semibold text-[#3A4F1C]/60 uppercase tracking-widest block">
          Official Booking Reference
        </span>
        <span className="text-2xl sm:text-3xl font-serif font-bold text-[#BC6F07] tracking-wider block selection:bg-[#3A4F1C] selection:text-[#F7F3E8]">
          {bookingReference}
        </span>
        <span className="text-[11px] text-[#3A4F1C]/70 font-light block">
          Save this reference number for all future inquiries with our team.
        </span>
      </div>

      {/* Quick Summary Grid */}
      <div className="bg-[#EFEAD8]/60 p-5 sm:p-6 rounded-xl border border-[#3A4F1C]/15 space-y-3.5 text-xs text-[#3A4F1C]">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#3A4F1C]/70 block border-b border-[#3A4F1C]/10 pb-2">
          Event Summary Overview
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="font-semibold block text-[10px] text-[#3A4F1C]/60 uppercase">Selected Service</span>
            <span className="font-medium text-[#3A4F1C] text-sm">{formData.serviceTitle}</span>
            <span className="text-[11px] text-[#3A4F1C]/60 block">{formData.categoryTitle}</span>
          </div>

          <div>
            <span className="font-semibold block text-[10px] text-[#3A4F1C]/60 uppercase">Selected Add-ons</span>
            <span className="font-medium text-[#3A4F1C]">{addOnsDisplay}</span>
          </div>

          <div>
            <span className="font-semibold block text-[10px] text-[#3A4F1C]/60 uppercase flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#BC6F07]" /> Target Event Date
            </span>
            <span className="font-medium text-[#3A4F1C]">
              {formData.eventDate}
              {formData.isHolidayDate && formData.holidayName && (
                <span className="ml-1 text-[10px] font-semibold text-[#BC6F07]">
                  [{formData.holidayName}]
                </span>
              )}
            </span>
          </div>

          <div>
            <span className="font-semibold block text-[10px] text-[#3A4F1C]/60 uppercase flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#BC6F07]" /> Venue Location
            </span>
            <span className="font-medium text-[#3A4F1C]">
              {formData.venueCity}
              {formData.venueAddress ? `, ${formData.venueAddress}` : ''}
              <span className="text-[11px] text-[#3A4F1C]/60 block">
                {formData.eventCountryName || formData.eventCountry}
              </span>
            </span>
          </div>

          <div>
            <span className="font-semibold block text-[10px] text-[#3A4F1C]/60 uppercase flex items-center gap-1">
              <Mail className="w-3 h-3 text-[#BC6F07]" /> Confirmation Emailed To
            </span>
            <span className="font-medium text-[#3A4F1C]">{formData.clientEmail}</span>
            {formData.clientPhone && (
              <span className="text-[11px] text-[#3A4F1C]/60 block">{formData.clientPhone}</span>
            )}
          </div>

          {formData.specialNotes && (
            <div>
              <span className="font-semibold block text-[10px] text-[#3A4F1C]/60 uppercase">Special Requirements</span>
              <span className="font-light italic text-[#3A4F1C]/80 block line-clamp-3">
                &ldquo;{formData.specialNotes}&rdquo;
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Next Steps Callout */}
      <div className="p-4 sm:p-5 bg-[#3A4F1C]/5 rounded-xl border border-[#3A4F1C]/10 text-xs text-[#3A4F1C] space-y-1.5">
        <span className="font-semibold uppercase tracking-wider text-[11px] text-[#BC6F07] block">
          What Happens Next?
        </span>
        <p className="text-xs sm:text-sm text-[#3A4F1C]/80 leading-relaxed font-light">
          Our event coordination team has received your booking sheet and is processing it. A coordinator will contact you via email or phone within <strong>24 to 48 business hours</strong> to finalize schedule details.
        </p>
      </div>

      {/* Action Buttons (Aligned to right/end as requested) */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-3 border-t border-[#3A4F1C]/15">
        <Link
          href="/services"
          className="px-6 py-3 rounded-xl border border-[#3A4F1C]/25 text-[#3A4F1C] hover:bg-[#3A4F1C]/5 text-xs font-semibold uppercase tracking-wider transition text-center cursor-pointer flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Book Another Service
        </Link>

        <Link
          href="/"
          className="px-7 py-3 rounded-xl bg-[#3A4F1C] hover:bg-[#2C3C15] text-[#F7F3E8] text-xs font-semibold uppercase tracking-wider transition-all shadow-md text-center flex items-center justify-center gap-2 cursor-pointer"
        >
          Return to Home
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
