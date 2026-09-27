'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DataPrivacyDisclaimer } from './DataPrivacyDisclaimer';
import { InFormServiceCard } from './InFormServiceCard';
import type { BookingFormData, ServiceItem } from '@/types';

interface Step3PaymentSummaryProps {
  formData: BookingFormData;
  service: ServiceItem | null;
  onChange: (updated: Partial<BookingFormData>) => void;
  onSubmit: () => void;
  onPrevStep: () => void;
  onOpenModal: () => void;
  isSubmitting?: boolean;
}

export function Step3PaymentSummary({
  formData,
  service,
  onChange,
  onSubmit,
  onPrevStep,
  onOpenModal,
  isSubmitting = false,
}: Step3PaymentSummaryProps) {
  const [submittedMessage, setSubmittedMessage] = useState(false);

  const handleFinalSubmit = () => {
    setSubmittedMessage(true);
    onSubmit();
  };

  return (
    <div className="bg-[#F7F3E8] border border-[#3A4F1C]/20 rounded-xl p-6 sm:p-8 space-y-6">
      <div className="border-b border-[#3A4F1C]/15 pb-4">
        <h2 className="text-xl sm:text-2xl font-serif text-[#3A4F1C] font-semibold">
          Confirm Your Booking
        </h2>
      </div>

      {submittedMessage ? (
        <div className="p-6 bg-[#3A4F1C]/10 border border-[#3A4F1C]/30 rounded-xl text-center space-y-3">
          <span className="text-sm font-bold tracking-widest uppercase text-[#BC6F07] block">
            Booking Request Received
          </span>
          <h3 className="text-xl font-serif text-[#3A4F1C] font-semibold">
            Thank You, {formData.clientFullName}!
          </h3>
          <p className="text-xs sm:text-sm text-[#3A4F1C]/80 leading-relaxed font-light max-w-md mx-auto">
            Your booking request for <span className="font-semibold">{formData.serviceTitle}</span> ({formData.eventDate}) has been recorded. Our event team will review your specs and contact you via {formData.clientEmail} shortly.
          </p>
        </div>
      ) : (
        <>
          {/* 2-Column Grid: Booking Summary Review (Left) vs Clickable Service Photo (Right) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left Column: Booking Summary Review (No Costs Breakdown) */}
            <div className="bg-[#EFEAD8]/60 p-5 rounded-xl border border-[#3A4F1C]/15 space-y-3 text-xs text-[#3A4F1C]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#3A4F1C]/70 block border-b border-[#3A4F1C]/10 pb-2">
                Booking Summary Review
              </span>
              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="font-semibold block text-[10px] text-[#3A4F1C]/60 uppercase">Client Name</span>
                  <span className="font-medium text-[#3A4F1C]">{formData.clientFullName} ({formData.clientEmail})</span>
                </div>
                <div>
                  <span className="font-semibold block text-[10px] text-[#3A4F1C]/60 uppercase">Contact Phone</span>
                  <span className="font-medium text-[#3A4F1C]">{formData.clientPhone}</span>
                </div>
                {formData.companyName && (
                  <div>
                    <span className="font-semibold block text-[10px] text-[#3A4F1C]/60 uppercase">Company / Organization</span>
                    <span className="font-medium text-[#3A4F1C]">{formData.companyName}</span>
                  </div>
                )}
                <div>
                  <span className="font-semibold block text-[10px] text-[#3A4F1C]/60 uppercase">Event Date & Target Location</span>
                  <span className="font-medium text-[#3A4F1C]">
                    {formData.eventDate} ({formData.venueCity})
                    {formData.isHolidayDate && <span className="text-[#BC6F07] font-semibold ml-1">[{formData.holidayName}]</span>}
                  </span>
                </div>
                {formData.specialNotes && (
                  <div>
                    <span className="font-semibold block text-[10px] text-[#3A4F1C]/60 uppercase">Special Requirements</span>
                    <span className="font-light italic text-[#3A4F1C]/80 block line-clamp-2">{formData.specialNotes}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: In-Form Clickable Service Photo */}
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#3A4F1C]/70 block">
                Selected Service Overview
              </span>
              <InFormServiceCard service={service} onOpenModal={onOpenModal} />
            </div>
          </div>

          {/* Select Payment Gateway Section (Below 2-Grid) */}
          <div className="space-y-3 pt-4 border-t border-[#3A4F1C]/15">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#3A4F1C]/70 block">
              Select Payment Gateway
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                onClick={() => onChange({ paymentProvider: 'dragonpay' })}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                  formData.paymentProvider === 'dragonpay'
                    ? 'bg-[#3A4F1C]/10 border-[#BC6F07] ring-1 ring-[#BC6F07]'
                    : 'bg-[#EFEAD8]/40 border-[#3A4F1C]/15 hover:bg-[#EFEAD8]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#3A4F1C]">Dragonpay</span>
                  <input
                    type="radio"
                    name="paymentProvider"
                    checked={formData.paymentProvider === 'dragonpay'}
                    onChange={() => {}}
                    className="text-[#BC6F07] focus:ring-[#BC6F07]"
                  />
                </div>
                <p className="text-[11px] text-[#3A4F1C]/70 leading-relaxed font-light">
                  GCash, Maya, ShopeePay, & Philippine Online Banking
                </p>
              </label>

              <label
                onClick={() => onChange({ paymentProvider: 'paypal' })}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                  formData.paymentProvider === 'paypal'
                    ? 'bg-[#3A4F1C]/10 border-[#BC6F07] ring-1 ring-[#BC6F07]'
                    : 'bg-[#EFEAD8]/40 border-[#3A4F1C]/15 hover:bg-[#EFEAD8]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#3A4F1C]">PayPal</span>
                  <input
                    type="radio"
                    name="paymentProvider"
                    checked={formData.paymentProvider === 'paypal'}
                    onChange={() => {}}
                    className="text-[#BC6F07] focus:ring-[#BC6F07]"
                  />
                </div>
                <p className="text-[11px] text-[#3A4F1C]/70 leading-relaxed font-light">
                  International Credit / Debit Cards & PayPal Wallet Balance
                </p>
              </label>
            </div>
          </div>

          {/* Terms Acceptance Checkbox */}
          <div className="pt-2">
            <label className="flex items-start space-x-2 cursor-pointer text-xs text-[#3A4F1C]">
              <input
                type="checkbox"
                checked={formData.termsAccepted}
                onChange={(e) => onChange({ termsAccepted: e.target.checked })}
                className="mt-0.5 rounded text-[#BC6F07] focus:ring-[#BC6F07]"
              />
              <span className="leading-snug">
                I agree to the booking terms, service cancellation policy, and date reservation guidelines.
              </span>
            </label>
          </div>

          {/* Short Text-only Data Privacy Disclaimer */}
          <DataPrivacyDisclaimer />

          {/* Bottom Action Bar: Right-Aligned Costs Breakdown & Total Price stacked ABOVE Proceed Button (No Card) */}
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
                    TOTAL PRICE
                  </span>
                  <span className="text-xl sm:text-2xl font-serif font-bold text-[#3A4F1C]">
                    ₱{formData.totalEstimate.toLocaleString()}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleFinalSubmit}
                disabled={!formData.termsAccepted || isSubmitting}
                variant="primary"
                size="sm"
                className="w-full sm:w-auto text-xs sm:text-sm px-6 sm:px-8 py-3 shadow-md mt-1"
              >
                {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
