import React from 'react';
import { SkeletonPulse, SkeletonLine } from './admin-skeleton-base';

/**
 * Reusable Audit Trail Tab Skeleton.
 * Matches exact dimensions, header controls, 10 table columns (min-w-[1150px]),
 * and pagination footer of AuditTable.
 */
export function AuditTableSkeleton() {
  return (
    <div className="space-y-6">
      {/* UNIFIED CARD: Matches AuditTable */}
      <div className="rounded-2xl border border-[#3A4F1C]/15 bg-white shadow-sm overflow-hidden">
        {/* Top Header & Controls Area */}
        <div className="p-3.5 sm:p-5 space-y-3.5">
          {/* Row 1: Title & Action Buttons */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <SkeletonLine width="w-48 sm:w-64" height="h-6 sm:h-7" className="rounded-md" />
              <SkeletonLine width="w-60 sm:w-96" height="h-3.5" />
            </div>

            {/* Action Buttons: Pinned to Top-Right */}
            <div className="shrink-0 flex items-center justify-end gap-1.5 sm:gap-2 ml-auto">
              <div className="flex h-8 w-8 sm:w-10 items-center justify-center rounded-lg border border-[#3A4F1C]/20 bg-white">
                <SkeletonPulse className="h-3.5 w-3.5 rounded" />
              </div>
              <div className="flex h-8 w-20 sm:w-24 items-center justify-center rounded-lg border border-[#3A4F1C]/20 bg-white">
                <SkeletonLine width="w-12" height="h-3" />
              </div>
            </div>
          </div>

          {/* Row 2: Search Bar (Left) and 5 Filter Buttons (Right) in 1 grid-x on md+ */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] items-center gap-2 sm:gap-2.5 pt-1">
            {/* Search Input Placeholder */}
            <div className="relative w-full h-8 sm:h-9 rounded-lg border border-[#3A4F1C]/20 bg-[#FAF8F2] flex items-center px-3 gap-2.5">
              <SkeletonPulse className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded shrink-0" />
              <SkeletonLine width="w-48 sm:w-64" height="h-3" />
            </div>

            {/* 5 Filter Placeholders on Right */}
            <div className="flex items-center justify-end gap-1 sm:gap-1.5 md:gap-2 flex-wrap md:flex-nowrap ml-auto shrink-0 w-full md:w-auto">
              {[1, 2, 3, 4, 5].map((idx) => (
                <div
                  key={idx}
                  className="h-7 sm:h-8 rounded-lg border border-[#3A4F1C]/20 bg-white px-2 sm:px-2.5 flex items-center gap-1.5"
                >
                  <SkeletonPulse className="h-3.5 w-3.5 rounded shrink-0" />
                  <SkeletonLine width="w-12 sm:w-16" height="h-2.5" className="hidden sm:inline-block" />
                  <SkeletonPulse className="h-2.5 w-2.5 rounded shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Table View: Exactly matches min-w-[1150px] and 10 columns */}
        <div className="border-t border-[#3A4F1C]/15">
          <div className="max-h-[580px] sm:max-h-[640px] overflow-y-auto overflow-x-auto">
            <table className="min-w-[1150px] w-full text-left text-[11px] sm:text-xs">
              <thead className="sticky top-0 z-10 border-b border-[#3A4F1C]/15 bg-[#F7F3E8] text-[#2B3817]/70 uppercase text-[9px] sm:text-[10px] tracking-wider font-semibold shadow-xs">
                <tr>
                  <th className="px-3 sm:px-4 py-2.5 sm:py-3.5 w-24">Timestamp</th>
                  <th className="px-2.5 sm:px-3 py-2.5 sm:py-3.5 w-24">User Code</th>
                  <th className="px-3 sm:px-4 py-2.5 sm:py-3.5 w-36">Actor</th>
                  <th className="px-2.5 sm:px-3 py-2.5 sm:py-3.5 w-28">Category</th>
                  <th className="px-2.5 sm:px-3 py-2.5 sm:py-3.5 w-32">Action</th>
                  <th className="px-2.5 sm:px-3 py-2.5 sm:py-3.5 w-24">Severity</th>
                  <th className="px-2.5 sm:px-3 py-2.5 sm:py-3.5 w-24">Outcome</th>
                  <th className="px-4 sm:px-6 py-2.5 sm:py-3.5 min-w-[280px] max-w-[420px]">Activity Summary</th>
                  <th className="px-3 sm:px-4 py-2.5 sm:py-3.5 text-center w-20">Changes</th>
                  <th className="px-3 sm:px-4 py-2.5 sm:py-3.5 text-right w-20">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3A4F1C]/10 font-sans">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
                  <tr key={row} className="h-12">
                    {/* Timestamp */}
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3.5 whitespace-nowrap">
                      <SkeletonLine width="w-20" height="h-3" />
                    </td>

                    {/* User Code */}
                    <td className="px-2.5 sm:px-3 py-2.5 sm:py-3.5 whitespace-nowrap">
                      <SkeletonPulse className="h-4 w-12 rounded" />
                    </td>

                    {/* Actor */}
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3.5">
                      <SkeletonLine width="w-24" height="h-3" />
                    </td>

                    {/* Category */}
                    <td className="px-2.5 sm:px-3 py-2.5 sm:py-3.5">
                      <SkeletonPulse className="h-4 w-16 rounded-full" />
                    </td>

                    {/* Action */}
                    <td className="px-2.5 sm:px-3 py-2.5 sm:py-3.5">
                      <SkeletonLine width="w-24" height="h-3" />
                    </td>

                    {/* Severity */}
                    <td className="px-2.5 sm:px-3 py-2.5 sm:py-3.5">
                      <SkeletonPulse className="h-4 w-14 rounded-full" />
                    </td>

                    {/* Outcome */}
                    <td className="px-2.5 sm:px-3 py-2.5 sm:py-3.5">
                      <SkeletonPulse className="h-4 w-14 rounded-full" />
                    </td>

                    {/* Activity Summary */}
                    <td className="px-4 sm:px-6 py-2.5 sm:py-3.5 min-w-[280px] max-w-[420px] space-y-1">
                      <SkeletonLine width="w-full max-w-[340px]" height="h-3" />
                      <SkeletonLine width="w-3/4 max-w-[240px]" height="h-2.5" />
                    </td>

                    {/* Changes */}
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3.5 whitespace-nowrap text-center">
                      <SkeletonPulse className="h-5 w-14 rounded mx-auto" />
                    </td>

                    {/* Details */}
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3.5 whitespace-nowrap text-right">
                      <SkeletonPulse className="h-6 w-14 rounded-lg ml-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table Footer with Pagination: 1 Single Row on All Screen Sizes */}
        <div className="flex flex-row items-center justify-between border-t border-[#3A4F1C]/15 bg-[#F7F3E8] px-3 sm:px-6 py-2.5 sm:py-3 text-[10px] sm:text-xs text-[#2B3817]/70 gap-2">
          <SkeletonLine width="w-40 sm:w-52" height="h-3" />
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <SkeletonPulse className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg" />
            <SkeletonLine width="w-16 sm:w-20" height="h-3" />
            <SkeletonPulse className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
