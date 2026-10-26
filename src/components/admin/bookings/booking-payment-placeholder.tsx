'use client';

// =============================================================================
// booking-payment-placeholder.tsx — Payment & Billing Summary Card
// =============================================================================

import React from 'react';
import Link from 'next/link';
import { CreditCard, ArrowUpRight } from 'lucide-react';
import { formatPesos } from '@/lib/utils/currencyUtils';
import type { BookingRecord } from '@/types/booking';

interface BookingPaymentCardProps {
  booking?: BookingRecord;
}

export function BookingPaymentPlaceholder({ booking }: BookingPaymentCardProps) {
  const agreedFormatted = booking?.agreed_total_centavos
    ? formatPesos(booking.agreed_total_centavos)
    : 'Not declared';

  const paymentStatus = booking?.payment_status || 'unpaid';

  const renderStatusBadge = () => {
    switch (paymentStatus) {
      case 'paid':
        return (
          <span className="inline-flex items-center rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-emerald-800">
            Paid
          </span>
        );
      case 'partially_paid':
        return (
          <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-amber-800">
            Partially Paid
          </span>
        );
      case 'downpayment_pending':
        return (
          <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-amber-800">
            Downpayment Pending
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center rounded-full border border-rose-300 bg-rose-50 px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-rose-800">
            Refunded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full border border-stone-300 bg-stone-100 px-2 py-0.5 text-[10px] sm:text-[11px] font-medium text-stone-600 capitalize">
            {paymentStatus}
          </span>
        );
    }
  };

  return (
    <div className="rounded-xl border border-[#3A4F1C]/15 bg-[#F7F3E8]/60 p-3 sm:p-4">
      <div className="flex items-center gap-2">
        <span title="Payment & Billing">
          <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#3A4F1C]" />
        </span>
        <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#3A4F1C]">
          Payment & Billing
        </span>
        <div className="ml-auto">{renderStatusBadge()}</div>
      </div>

      <div className="mt-2.5 sm:mt-3 grid grid-cols-2 gap-2.5 sm:gap-3 text-[11px] sm:text-xs">
        <div>
          <span className="text-[#3A4F1C]/60">Agreed Total:</span>
          <p className="mt-0.5 font-bold text-[#2B3817]">{agreedFormatted}</p>
        </div>
        <div>
          <span className="text-[#3A4F1C]/60">Billing Status:</span>
          <p className="mt-0.5 font-medium text-[#2B3817] capitalize">{paymentStatus.replace('_', ' ')}</p>
        </div>
      </div>

      {booking?.booking_reference && (
        <div className="mt-2.5 sm:mt-3 pt-2 border-t border-[#3A4F1C]/10 flex items-center justify-between">
          <span className="text-[10px] text-[#3A4F1C]/70">Track payments or record receipts</span>
          <Link
            href={`/admin/payments?search=${booking.booking_reference}`}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#3A4F1C] hover:underline"
          >
            <span>Open in Payments</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      )}
    </div>
  );
}
