import React from 'react';
import { SkeletonPulse, SkeletonLine } from './admin-skeleton-base';

/**
 * Reusable Dashboard Page Skeleton.
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-[#3A4F1C]/15 bg-white p-6 shadow-sm sm:p-8 space-y-2">
        <SkeletonLine width="w-64 sm:w-80" height="h-7 sm:h-8" className="rounded-md" />
        <SkeletonLine width="w-full max-w-lg" height="h-4" />
      </div>

      {/* Workspace Readiness Shell */}
      <div className="rounded-2xl border border-dashed border-[#3A4F1C]/20 bg-white/50 p-8 text-center space-y-2">
        <SkeletonLine width="w-72" height="h-5" className="mx-auto" />
        <SkeletonLine width="w-full max-w-md" height="h-3" className="mx-auto" />
      </div>
    </div>
  );
}
