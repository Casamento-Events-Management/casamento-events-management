import React from 'react';
import { SkeletonPulse, SkeletonLine } from './admin-skeleton-base';

/**
 * Reusable Member Management Tab Skeleton.
 * Matches exact layout, banner, search bar, and staff directory table.
 */
export function TeamTableSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-[#3A4F1C]/15 bg-white p-6 shadow-xs sm:p-8 space-y-2">
        <div className="flex items-center gap-2">
          <SkeletonPulse className="h-4 w-4 rounded shrink-0" />
          <SkeletonLine width="w-36" height="h-3" />
        </div>
        <SkeletonLine width="w-56 sm:w-72" height="h-7 sm:h-8" className="rounded-md" />
        <SkeletonLine width="w-full max-w-lg" height="h-3.5" />
      </div>

      {/* Search and Action Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm h-9 rounded-xl border border-[#3A4F1C]/20 bg-white flex items-center px-3 gap-2.5">
          <SkeletonPulse className="h-4 w-4 rounded shrink-0" />
          <SkeletonLine width="w-48" height="h-3" />
        </div>

        <div className="h-9 w-40 rounded-xl bg-[#3A4F1C]/15 self-start sm:self-auto flex items-center justify-center">
          <SkeletonLine width="w-28" height="h-3" />
        </div>
      </div>

      {/* Directory Table */}
      <div className="overflow-hidden rounded-2xl border border-[#3A4F1C]/15 bg-white shadow-xs">
        <div className="overflow-x-auto min-h-[240px]">
          <table className="w-full text-left text-xs text-[#2B3817]">
            <thead className="border-b border-[#3A4F1C]/10 bg-[#F7F3E8]/50 text-[10px] font-semibold uppercase tracking-wider text-[#2B3817]/60">
              <tr>
                <th className="px-5 py-3.5">Staff Member</th>
                <th className="px-5 py-3.5">Access Role</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Added On</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3A4F1C]/10">
              {[1, 2, 3, 4, 5].map((row) => (
                <tr key={row} className="h-16">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <SkeletonPulse className="h-8 w-8 rounded-full shrink-0" />
                      <div className="space-y-1">
                        <SkeletonLine width="w-32" height="h-3.5" />
                        <SkeletonLine width="w-40" height="h-2.5" />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <SkeletonPulse className="h-5 w-24 rounded-full" />
                  </td>
                  <td className="px-5 py-3.5">
                    <SkeletonPulse className="h-5 w-16 rounded-full" />
                  </td>
                  <td className="px-5 py-3.5">
                    <SkeletonLine width="w-24" height="h-3" />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <SkeletonPulse className="h-7 w-7 rounded-lg ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
