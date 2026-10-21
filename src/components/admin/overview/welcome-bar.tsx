'use client';

// =============================================================================
// components/admin/overview/welcome-bar.tsx — Compact Overview Header & Status
// =============================================================================

import React from 'react';
import { Calendar, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { AdminProfile } from '@/types/admin-auth';

interface WelcomeBarProps {
  profile: AdminProfile;
  needsAttentionCount: number;
  isRefreshing: boolean;
}

export function WelcomeBar({
  profile,
  needsAttentionCount,
  isRefreshing,
}: WelcomeBarProps) {
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  const firstName = profile.full_name.split(' ')[0] || profile.full_name;

  return (
    <div className="rounded-2xl border border-[#3A4F1C]/15 bg-white p-4 sm:p-5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Left: Greeting & Date */}
        <div className="space-y-0.5">
          <h1 className="text-lg sm:text-xl font-serif font-bold text-[#2B3817]">
            Welcome back, {firstName}
          </h1>
          <div className="flex items-center gap-2 text-[11px] text-[#2B3817]/70">
            <Calendar className="h-3.5 w-3.5 text-[#3A4F1C]" />
            <span>{todayFormatted}</span>
            <span>·</span>
            <span>Casamento Operations</span>
          </div>
        </div>

        {/* Right: Operational Status & Refresh Button */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto sm:ml-auto pt-1 sm:pt-0">
          {needsAttentionCount > 0 ? (
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/10 px-3 py-1.5 border border-amber-500/20 text-amber-900 text-xs font-semibold">
              <AlertCircle className="h-3.5 w-3.5 text-amber-700 shrink-0" />
              <span>{needsAttentionCount} {needsAttentionCount === 1 ? 'item requires' : 'items require'} attention</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 border border-emerald-200 text-emerald-800 text-xs font-medium">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>All caught up</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
