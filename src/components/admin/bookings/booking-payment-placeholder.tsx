'use client';

// =============================================================================
// booking-payment-placeholder.tsx — Payment & Billing Summary Card
// =============================================================================

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CreditCard, ArrowUpRight, Loader2 } from 'lucide-react';
import { formatPesos } from '@/lib/utils/currencyUtils';
import { getBookingBalanceAction } from '@/lib/services/admin-payment-actions';
import type { BookingRecord } from '@/types/booking';

interface BookingPaymentCardProps {
  booking?: BookingRecord;
}

export function BookingPaymentPlaceholder({ booking }: BookingPaymentCardProps) {
  const [balanceData, setBalanceData] = useState<{
    agreedTotalCentavos: number | null;
    totalPaidCentavos: number;
    remainingBalanceCentavos: number | null;
    paymentStatus: string;
    isLoading: boolean;
  }>({
    agreedTotalCentavos: booking?.agreed_total_centavos ?? null,
    totalPaidCentavos: 0,
    remainingBalanceCentavos: booking?.agreed_total_centavos ?? null,
    paymentStatus: booking?.payment_status || 'unpaid',
    isLoading: Boolean(booking?.id),
  });

  useEffect(() => {
    if (!booking?.id) return;

    let active = true;
    getBookingBalanceAction(booking.id).then((res) => {
      if (active && res.success) {
        setBalanceData({
          agreedTotalCentavos: res.agreedTotalCentavos ?? null,
          totalPaidCentavos: res.totalPaidCentavos ?? 0,
          remainingBalanceCentavos: res.remainingBalanceCentavos ?? null,
          paymentStatus: res.paymentStatus || booking.payment_status || 'unpaid',
          isLoading: false,
        });
      } else if (active) {
        setBalanceData((prev) => ({ ...prev, isLoading: false }));
      }
    });

    return () => {
      active = false;
    };
  }, [booking?.id, booking?.agreed_total_centavos, booking?.payment_status]);

  const paymentStatus = balanceData.paymentStatus;

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
            {paymentStatus.replace('_', ' ')}
          </span>
        );
    }
  };

  const hasAgreed = balanceData.agreedTotalCentavos !== null && balanceData.agreedTotalCentavos !== undefined;

  return (
    <div className="rounded-xl border border-[#3A4F1C]/15 bg-[#F7F3E8]/60 p-3 sm:p-4">
      <div className="flex items-center gap-2">
        <span title="Payment & Billing">
          <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#3A4F1C]" />
        </span>
        <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#3A4F1C]">
          Payment & Billing
        </span>
        <div className="ml-auto flex items-center gap-2">
          {balanceData.isLoading && <Loader2 className="h-3 w-3 animate-spin text-[#3A4F1C]/60" />}
          {renderStatusBadge()}
        </div>
      </div>

      <div className="mt-2.5 sm:mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 text-[11px] sm:text-xs">
        <div>
          <span className="text-[#3A4F1C]/60 block text-[10px] uppercase font-semibold tracking-wider">
            Agreed Total
          </span>
          <p className="mt-0.5 font-bold text-[#2B3817]">
            {hasAgreed ? formatPesos(balanceData.agreedTotalCentavos) : 'Not declared'}
          </p>
        </div>

        <div>
          <span className="text-[#3A4F1C]/60 block text-[10px] uppercase font-semibold tracking-wider">
            Total Paid
          </span>
          <p className="mt-0.5 font-bold text-emerald-800">
            {formatPesos(balanceData.totalPaidCentavos)}
          </p>
        </div>

        <div className="col-span-2 sm:col-span-1">
          <span className="text-[#3A4F1C]/60 block text-[10px] uppercase font-semibold tracking-wider">
            Outstanding Balance
          </span>
          <p
            className={`mt-0.5 font-bold ${
              !hasAgreed
                ? 'text-stone-500 font-normal'
                : balanceData.remainingBalanceCentavos === 0
                ? 'text-emerald-700'
                : 'text-amber-800'
            }`}
          >
            {!hasAgreed
              ? '—'
              : balanceData.remainingBalanceCentavos === 0
              ? '₱0.00 (Fully Settled)'
              : formatPesos(balanceData.remainingBalanceCentavos)}
          </p>
        </div>
      </div>

      {booking?.booking_reference && (
        <div className="mt-2.5 sm:mt-3 pt-2 border-t border-[#3A4F1C]/10 flex items-center justify-end text-[10px] text-[#3A4F1C]/70">
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

