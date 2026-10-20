'use client';

// =============================================================================
// booking-payment-placeholder.tsx — Future-Ready Payment Placeholder Card
// =============================================================================

import React from 'react';
import { CreditCard, Info } from 'lucide-react';

export function BookingPaymentPlaceholder() {
  return (
    <div className="rounded-xl border border-[#3A4F1C]/15 bg-[#F7F3E8]/50 p-3 sm:p-4">
      <div className="flex items-center gap-2">
        <span title="Payment & Billing">
          <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#3A4F1C]" />
        </span>
        <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#3A4F1C]">
          Payment & Billing
        </span>
        <span className="ml-auto inline-flex items-center rounded-full border border-stone-300 bg-stone-100 px-2 py-0.5 text-[10px] sm:text-[11px] font-medium text-stone-600">
          Not available
        </span>
      </div>

      <div className="mt-2.5 sm:mt-3 grid grid-cols-2 gap-2.5 sm:gap-3 text-[11px] sm:text-xs">
        <div>
          <span className="text-[#3A4F1C]/60">Agreed Total:</span>
          <p className="mt-0.5 font-medium text-[#2B3817]">Not available</p>
        </div>
        <div>
          <span className="text-[#3A4F1C]/60">Payment Status:</span>
          <p className="mt-0.5 font-medium text-[#2B3817]">Not available</p>
        </div>
      </div>

      <div className="mt-2.5 sm:mt-3 flex items-start gap-1.5 border-t border-[#3A4F1C]/10 pt-2 text-[10px] sm:text-[11px] text-[#3A4F1C]/70">
        <Info className="mt-0.5 h-3 w-3 shrink-0 text-[#BC6F07]" />
        <span>Online payment and billing tracking will activate here when the payment module goes live.</span>
      </div>
    </div>
  );
}
