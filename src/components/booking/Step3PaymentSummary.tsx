'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DataPrivacyDisclaimer } from './DataPrivacyDisclaimer';
import type { BookingFormData } from '@/types';

interface Step3PaymentSummaryProps {
  formData: BookingFormData;
  onChange: (updated: Partial<BookingFormData>) => void;
  onSubmit: () => void;
  onPrevStep: () => void;
  isSubmitting?: boolean;
}

export function Step3PaymentSummary({
  formData,
  onChange,
  onSubmit,
  onPrevStep,
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
          {/* Side-by-Side Grid Layout: Summary Review (Left) vs Select Payment Type (Right) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            
            
            {/* Left Column: Booking Summary Review */}
            <div className="bg-[#EFEAD8]/60 p-5 rounded-xl border border-[#3A4F1C]/15 space-y-4 text-xs text-[#3A4F1C]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#3A4F1C]/70 block border-b border-[#3A4F1C]/10 pb-2">
                Select Payment Type
              </span>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-semibold block text-[10px] text-[#3A4F1C]/60 uppercase">Client Name</span>
                  <span className="font-medium">{formData.clientFullName} ({formData.clientEmail})</span>
                </div>
                <div>
                  <span className="font-semibold block text-[10px] text-[#3A4F1C]/60 uppercase">Contact Phone</span>
                  <span className="font-medium">{formData.clientPhone}</span>
                </div>
                <div>
                  <span className="font-semibold block text-[10px] text-[#3A4F1C]/60 uppercase">Event Date & Target Location</span>
                  <span className="font-medium">
                    {formData.eventDate} ({formData.venueCity})
                    {formData.isHolidayDate && <span className="text-[#BC6F07] font-semibold ml-1">[{formData.holidayName}]</span>}
                  </span>
                </div>
              </div>

              {/* Costs Breakdown */}
              <div className="pt-3 border-t border-[#3A4F1C]/15 space-y-2">
                <span className="font-semibold block text-[10px] text-[#3A4F1C]/60 uppercase">Costs Breakdown</span>
                <div className="space-y-1 text-xs text-[#3A4F1C]/90">
                    <span className="font-semibold block text-[10px] text-[#3A4F1C]/60">Base Service Package</span>
                  <div className="flex justify-between">
                    <span className="font-medium">({formData.serviceTitle || 'Selected Service'}): ₱{formData.basePrice.toLocaleString()}</span>
                  </div>

                  {formData.selectedAddOns && formData.selectedAddOns.length > 0 && (
                    <div className="pl-2 space-y-1 border-l-2 border-[#BC6F07]/40 my-1">
                      {formData.selectedAddOns.map((addon) => (
                        <div key={addon.id} className="flex justify-between text-[11px] text-[#3A4F1C]/80">
                          <span>+ {addon.title}</span>
                          <span>₱{addon.price.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-[#3A4F1C]/15 flex items-center justify-between font-serif">
                  <span className="text-xs font-semibold text-[#3A4F1C]">Total Cost:</span>
                  <span className="text-xl font-bold text-[#3A4F1C]">
                    ₱{formData.totalEstimate.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Select Payment Type */}
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#3A4F1C]/70 block border-b border-[#3A4F1C]/10 pb-2">
                Select Payment Type
              </span>

              <div className="space-y-3">
                <label
                  onClick={() => onChange({ paymentProvider: 'dragonpay' })}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
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
                  <p className="text-[10px] text-[#3A4F1C]/70 leading-tight">
                    GCash, Maya, ShopeePay, & PH Online Banking
                  </p>
                </label>

                <label
                  onClick={() => onChange({ paymentProvider: 'paypal' })}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
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
                  <p className="text-[10px] text-[#3A4F1C]/70 leading-tight">
                    International Credit / Debit Cards & PayPal Balance
                  </p>
                </label>
              </div>
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
              onClick={handleFinalSubmit}
              disabled={!formData.termsAccepted || isSubmitting}
              variant="primary"
              size="sm"
              className="text-xs sm:text-sm px-3.5 sm:px-6 py-2 sm:py-3"
            >
              {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
