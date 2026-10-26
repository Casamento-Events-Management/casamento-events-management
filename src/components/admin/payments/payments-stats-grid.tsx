'use client';

// =============================================================================
// components/admin/payments/payments-stats-grid.tsx — 3 Statistics Metric Cards
// =============================================================================

import React from 'react';
import { Banknote, Clock, ShieldAlert } from 'lucide-react';
import { formatPesos } from '@/lib/utils/currencyUtils';
import type { FinancialTotalsSummary } from '@/types/payment';

interface PaymentsStatsGridProps {
  stats: FinancialTotalsSummary | null;
  isLoading?: boolean;
}

export function PaymentsStatsGrid({ stats, isLoading = false }: PaymentsStatsGridProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-[#3A4F1C]/15 bg-white/70 p-5 shadow-xs animate-pulse space-y-3"
          >
            <div className="h-3 w-28 bg-stone-200 rounded-sm" />
            <div className="h-7 w-36 bg-stone-300 rounded-md" />
            <div className="h-3 w-44 bg-stone-200 rounded-sm" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Card 1: Total Collected This Month */}
      <div className="rounded-2xl border border-[#3A4F1C]/15 bg-white p-5 shadow-xs hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#2B3817]/70">
            Total Revenue (This Month)
          </span>
          <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
            <Banknote className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-2xl font-serif font-bold text-[#2B3817] tracking-tight">
            {formatPesos(stats.totalCollectedThisMonthCentavos)}
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
            <span>{stats.totalPaymentsRecordedThisMonth} payments recorded this month</span>
          </div>
        </div>
      </div>

      {/* Card 2: Total Outstanding Balance */}
      <div className="rounded-2xl border border-[#3A4F1C]/15 bg-white p-5 shadow-xs hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#2B3817]/70">
            Pending Balance
          </span>
          <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
            <Clock className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-2xl font-serif font-bold text-[#2B3817] tracking-tight">
            {formatPesos(stats.totalOutstandingAcrossBookingsCentavos)}
          </p>
          <p className="mt-1 text-xs text-amber-700 font-medium">
            Across {stats.partiallyPaidBookingsCount + stats.unpaidBookingsCount} bookings with pending balance
          </p>
        </div>
      </div>

      {/* Card 3: Billing Status Health */}
      <div className="rounded-2xl border border-[#3A4F1C]/15 bg-white p-5 shadow-xs hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#2B3817]/70">
            Billing Status
          </span>
          <div className="h-8 w-8 rounded-full bg-stone-100 flex items-center justify-center text-[#3A4F1C]">
            <ShieldAlert className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-2xl font-serif font-bold text-[#2B3817] tracking-tight">
            {stats.fullyPaidBookingsCount + stats.partiallyPaidBookingsCount + stats.unpaidBookingsCount}{' '}
            <span className="text-sm font-sans font-normal text-stone-500">Bookings</span>
          </p>
          <div className="mt-1 flex items-center gap-2 text-xs font-medium">
            <span className="text-emerald-700">{stats.fullyPaidBookingsCount} Paid</span>
            <span className="text-stone-300">·</span>
            <span className="text-amber-700">{stats.partiallyPaidBookingsCount} Partial</span>
            <span className="text-stone-300">·</span>
            <span className="text-rose-700">{stats.unpaidBookingsCount} Unpaid</span>
          </div>
        </div>
      </div>
    </div>
  );
}
