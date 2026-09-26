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
        <h2 className="text-2xl font-serif text-[#3A4F1C] font-semibold">
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
          {/* Summary Breakdown Card */}
          <div className="bg-[#EFEAD8]/60 p-4 rounded-xl border border-[#3A4F1C]/15 space-y-3 text-xs text-[#3A4F1C]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#3A4F1C]/70 block border-b border-[#3A4F1C]/10 pb-2">
              Booking Summary Review
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-semibold block text-[10px] text-[#3A4F1C]/60 uppercase">Client Name</span>
                <span>{formData.clientFullName} ({formData.clientEmail})</span>
              </div>
              <div>
                <span className="font-semibold block text-[10px] text-[#3A4F1C]/60 uppercase">Contact Phone</span>
                <span>{formData.clientPhone}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="font-semibold block text-[10px] text-[#3A4F1C]/60 uppercase">Event Date & Target Location</span>
                <span>
                  {formData.eventDate} ({formData.venueCity})
                  {formData.isHolidayDate && <span className="text-[#BC6F07] font-semibold ml-1">[{formData.holidayName}]</span>}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#3A4F1C]/10 flex items-center justify-between font-serif">
              <span className="text-xs font-semibold text-[#3A4F1C]">Estimated Total Package:</span>
              <span className="text-lg font-bold text-[#3A4F1C]">
                ₱{formData.totalEstimate.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#3A4F1C]/70 block">
              Select Preferred Payment Gateway
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label
                onClick={() => onChange({ paymentProvider: 'dragonpay' })}
                className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col justify-between space-y-2 ${formData.paymentProvider === 'dragonpay'
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
                    onChange={() => { }}
                    className="text-[#BC6F07] focus:ring-[#BC6F07]"
                  />
                </div>
                <p className="text-[10px] text-[#3A4F1C]/70 leading-tight">
                  GCash, Maya, ShopeePay, & PH Online Banking
                </p>
              </label>

              <label
                onClick={() => onChange({ paymentProvider: 'paypal' })}
                className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col justify-between space-y-2 ${formData.paymentProvider === 'paypal'
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
                    onChange={() => { }}
                    className="text-[#BC6F07] focus:ring-[#BC6F07]"
                  />
                </div>
                <p className="text-[10px] text-[#3A4F1C]/70 leading-tight">
                  International Credit / Debit Cards & PayPal Balance
                </p>
              </label>

              <label
                onClick={() => onChange({ paymentProvider: 'manual_bank' })}
                className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col justify-between space-y-2 ${formData.paymentProvider === 'manual_bank'
                    ? 'bg-[#3A4F1C]/10 border-[#BC6F07] ring-1 ring-[#BC6F07]'
                    : 'bg-[#EFEAD8]/40 border-[#3A4F1C]/15 hover:bg-[#EFEAD8]'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#3A4F1C]">Bank Transfer</span>
                  <input
                    type="radio"
                    name="paymentProvider"
                    checked={formData.paymentProvider === 'manual_bank'}
                    onChange={() => { }}
                    className="text-[#BC6F07] focus:ring-[#BC6F07]"
                  />
                </div>
                <p className="text-[10px] text-[#3A4F1C]/70 leading-tight">
                  Direct BDO / BPI / UnionBank Deposit
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
