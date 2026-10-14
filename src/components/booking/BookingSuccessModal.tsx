'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Calendar, MapPin, Mail, ArrowRight } from 'lucide-react';
import type { BookingFormData } from '@/types/bookingForm';

interface BookingSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingReference: string;
  formData: BookingFormData;
}

export function BookingSuccessModal({
  isOpen,
  onClose,
  bookingReference,
  formData,
}: BookingSuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-[#F7F3E8] border border-[#3A4F1C]/20 p-6 sm:p-8 shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#3A4F1C]/10 flex items-center justify-center text-[#BC6F07] shadow-inner">
            <CheckCircle2 className="w-10 h-10 text-[#3A4F1C]" />
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#3A4F1C]">
            Booking Request Received
          </h2>
          <p className="text-xs sm:text-sm text-[#3A4F1C]/75 font-light">
            Thank you, <span className="font-semibold text-[#3A4F1C]">{formData.clientFullName}</span>! Your event reservation request has been secured.
          </p>
        </div>

        {/* Official Reference Box */}
        <div className="p-4 rounded-xl bg-[#EFEAD8] border border-[#3A4F1C]/15 text-center space-y-1">
          <span className="text-[10px] font-semibold text-[#3A4F1C]/60 uppercase tracking-widest block">
            Official Booking Reference
          </span>
          <span className="text-xl sm:text-2xl font-serif font-bold text-[#BC6F07] tracking-wider block selection:bg-[#3A4F1C] selection:text-[#F7F3E8]">
            {bookingReference}
          </span>
          <span className="text-[11px] text-[#3A4F1C]/70 font-light block">
            Save this reference number for all future inquiries with our team.
          </span>
        </div>

        {/* Quick Summary Grid */}
        <div className="text-xs space-y-2 py-1 border-y border-[#3A4F1C]/10 text-[#3A4F1C]">
          <div className="flex items-center justify-between">
            <span className="text-[#3A4F1C]/60 font-medium">Selected Service:</span>
            <span className="font-semibold text-right">{formData.serviceTitle}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#3A4F1C]/60 font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Event Date:
            </span>
            <span className="font-semibold">{formData.eventDate}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#3A4F1C]/60 font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Target Venue:
            </span>
            <span className="font-semibold">{formData.venueCity}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#3A4F1C]/60 font-medium flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" /> Confirmation Emailed To:
            </span>
            <span className="font-semibold">{formData.clientEmail}</span>
          </div>
        </div>

        {/* Next Steps Callout */}
        <div className="p-3.5 bg-[#3A4F1C]/5 rounded-xl border border-[#3A4F1C]/10 text-xs text-[#3A4F1C] space-y-1">
          <span className="font-semibold uppercase tracking-wider text-[10px] text-[#BC6F07] block">
            What Happens Next?
          </span>
          <p className="text-[11px] text-[#3A4F1C]/80 leading-relaxed font-light">
            Our event coordination team has received your booking sheet and is processing it. A coordinator will contact you via email or phone within <strong>24 to 48 business hours</strong> to finalize schedule details.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-end justify-end gap-3 pt-2">
          <Link
            href="/"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#3A4F1C] hover:bg-[#2C3C15] text-[#F7F3E8] text-xs font-semibold uppercase tracking-wider transition-all shadow-md text-center flex items-center justify-center gap-2 cursor-pointer"
          >
            Return to Home
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[#3A4F1C]/25 text-[#3A4F1C] hover:bg-[#3A4F1C]/5 text-xs font-semibold uppercase tracking-wider transition text-center cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
