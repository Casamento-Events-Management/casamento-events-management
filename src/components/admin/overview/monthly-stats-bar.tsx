'use client';

// =============================================================================
// components/admin/overview/monthly-stats-bar.tsx — Light Monthly Operational Numbers
// =============================================================================

import React from 'react';
import Link from 'next/link';
import {
  CalendarDays,
} from 'lucide-react';
import type { OverviewMonthlyStats } from '@/types/admin-overview';

interface MonthlyStatsBarProps {
  stats: OverviewMonthlyStats;
}

export function MonthlyStatsBar({ stats }: MonthlyStatsBarProps) {
  const currentMonthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date());

  return (
    <div className="rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-5 shadow-2xs space-y-3">
      {/* Header */}
      <div className="flex items-center pb-2 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-[#3A4F1C]" />
          <h2 className="text-sm font-semibold text-stone-900">
            {currentMonthName} Numbers
          </h2>
        </div>
      </div>

      {/* 3 Compact Metric Cells */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
        {/* Bookings Created This Month */}
        <div className="rounded-xl bg-[#F7F3E8]/60 p-2.5 sm:p-3 border border-stone-200/60">
          <p className="text-lg sm:text-xl font-bold font-serif text-[#2B3817]">
            {stats.bookingsThisMonth}
          </p>
          <p className="text-[10px] sm:text-[11px] font-medium text-stone-500 truncate" title="Inquiries received this month">
            Received
          </p>
        </div>

        {/* Confirmed Events This Month */}
        <Link
          href="/admin/bookings?tab=list&listTab=upcoming"
          className="rounded-xl bg-emerald-50/60 p-2.5 sm:p-3 border border-emerald-200/60 hover:bg-emerald-100/50 transition cursor-pointer"
        >
          <p className="text-lg sm:text-xl font-bold font-serif text-emerald-800">
            {stats.confirmedEventsThisMonth}
          </p>
          <p className="text-[10px] sm:text-[11px] font-medium text-emerald-700 truncate" title="Confirmed events scheduled this month">
            Scheduled
          </p>
        </Link>

        {/* Pending Queue */}
        <Link
          href="/admin/bookings?tab=requests&status=pending"
          className="rounded-xl bg-amber-50/60 p-2.5 sm:p-3 border border-amber-200/60 hover:bg-amber-100/50 transition cursor-pointer"
        >
          <p className="text-lg sm:text-xl font-bold font-serif text-amber-800">
            {stats.pendingBookingsCount}
          </p>
          <p className="text-[10px] sm:text-[11px] font-medium text-amber-700 truncate" title="Booking requests awaiting review">
            In Queue
          </p>
        </Link>
      </div>
    </div>
  );
}
