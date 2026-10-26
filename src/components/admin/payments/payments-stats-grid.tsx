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
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4">
        <div className="col-span-2 md:col-span-1 rounded-xl sm:rounded-2xl border border-[#3A4F1C]/15 bg-white/70 p-3 sm:p-5 shadow-xs animate-pulse space-y-2 sm:space-y-3">
          <div className="h-2.5 sm:h-3 w-24 sm:w-28 bg-stone-200 rounded-sm" />
          <div className="h-5 sm:h-7 w-28 sm:w-36 bg-stone-300 rounded-md" />
          <div className="h-2.5 sm:h-3 w-32 sm:w-44 bg-stone-200 rounded-sm" />
        </div>
        <div className="col-span-1 md:col-span-1 rounded-xl sm:rounded-2xl border border-[#3A4F1C]/15 bg-white/70 p-3 sm:p-5 shadow-xs animate-pulse space-y-2 sm:space-y-3">
          <div className="h-2.5 sm:h-3 w-20 sm:w-28 bg-stone-200 rounded-sm" />
          <div className="h-5 sm:h-7 w-20 sm:w-36 bg-stone-300 rounded-md" />
          <div className="h-2.5 sm:h-3 w-24 sm:w-44 bg-stone-200 rounded-sm" />
        </div>
        <div className="col-span-1 md:col-span-1 rounded-xl sm:rounded-2xl border border-[#3A4F1C]/15 bg-white/70 p-3 sm:p-5 shadow-xs animate-pulse space-y-2 sm:space-y-3">
          <div className="h-2.5 sm:h-3 w-20 sm:w-28 bg-stone-200 rounded-sm" />
          <div className="h-5 sm:h-7 w-20 sm:w-36 bg-stone-300 rounded-md" />
          <div className="h-2.5 sm:h-3 w-24 sm:w-44 bg-stone-200 rounded-sm" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4">
      {/* Card 1: Total Revenue (This Month) — Full width on mobile (col-span-2) */}
      <div className="col-span-2 md:col-span-1 rounded-xl sm:rounded-2xl border border-[#3A4F1C]/15 bg-white p-3.5 sm:p-5 shadow-xs hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#2B3817]/70">
            Total Revenue (This Month)
          </span>
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
            <Banknote className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
        </div>
        <div className="mt-1 sm:mt-2">
          <p className="text-lg sm:text-2xl font-serif font-bold text-[#2B3817] tracking-tight">
            {formatPesos(stats.totalCollectedThisMonthCentavos)}
          </p>
          <div className="mt-0.5 sm:mt-1 flex items-center gap-1.5 text-[10px] sm:text-xs text-emerald-700 font-medium">
            <span>{stats.totalPaymentsRecordedThisMonth} payments recorded this month</span>
          </div>
        </div>
      </div>

      {/* Card 2: Total Outstanding Balance — 1 col on mobile */}
      <div className="col-span-1 md:col-span-1 rounded-xl sm:rounded-2xl border border-[#3A4F1C]/15 bg-white p-3 sm:p-5 shadow-xs hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#2B3817]/70 truncate">
            Pending Balance
          </span>
          <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
          </div>
        </div>
        <div className="mt-1 sm:mt-2">
          <p className="text-base sm:text-2xl font-serif font-bold text-[#2B3817] tracking-tight truncate">
            {formatPesos(stats.totalOutstandingAcrossBookingsCentavos)}
          </p>
          <p className="mt-0.5 sm:mt-1 text-[9px] sm:text-xs text-amber-700 font-medium truncate">
            {stats.partiallyPaidBookingsCount + stats.unpaidBookingsCount} bookings pending
          </p>
        </div>
      </div>

      {/* Card 3: Billing Status Health — 1 col on mobile */}
      <div className="col-span-1 md:col-span-1 rounded-xl sm:rounded-2xl border border-[#3A4F1C]/15 bg-white p-3 sm:p-5 shadow-xs hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#2B3817]/70 truncate">
            Billing Status
          </span>
          <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-stone-100 flex items-center justify-center text-[#3A4F1C] shrink-0">
            <ShieldAlert className="h-3 w-3 sm:h-4 sm:w-4" />
          </div>
        </div>
        <div className="mt-1 sm:mt-2">
          <p className="text-base sm:text-2xl font-serif font-bold text-[#2B3817] tracking-tight truncate">
            {stats.fullyPaidBookingsCount + stats.partiallyPaidBookingsCount + stats.unpaidBookingsCount}{' '}
            <span className="text-[10px] sm:text-sm font-sans font-normal text-stone-500">Bookings</span>
          </p>
          <div className="mt-0.5 sm:mt-1 flex flex-wrap items-center gap-1 sm:gap-2 text-[9px] sm:text-xs font-medium">
            <span className="text-emerald-700">{stats.fullyPaidBookingsCount} Paid</span>
            <span className="text-stone-300">·</span>
            <span className="text-amber-700">{stats.partiallyPaidBookingsCount} Part</span>
            <span className="text-stone-300">·</span>
            <span className="text-rose-700">{stats.unpaidBookingsCount} Unpd</span>
          </div>
        </div>
      </div>
    </div>
  );
}
