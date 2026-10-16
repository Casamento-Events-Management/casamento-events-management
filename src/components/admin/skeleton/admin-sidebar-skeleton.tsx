import React from 'react';
import { SkeletonPulse, SkeletonLine } from './admin-skeleton-base';

/**
 * Reusable Sidebar Skeleton for Admin Portal.
 * Pixel-perfect match for both Mobile Top Bar (< lg) and Desktop Fixed Aside (>= lg).
 */
export function AdminSidebarSkeleton() {
  return (
    <>
      {/* 1. Mobile & Tablet Top Header Bar (< lg) */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#3A4F1C]/15 bg-white/95 px-4 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          {/* Hamburger button skeleton */}
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#3A4F1C]/15 bg-white shadow-xs p-2">
            <SkeletonPulse className="h-4 w-5 rounded" />
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#3A4F1C]/15 bg-white p-1">
              <SkeletonPulse className="h-full w-full rounded" />
            </div>
            <div className="space-y-1">
              <SkeletonLine width="w-28" height="h-3" />
              <SkeletonLine width="w-20" height="h-2" />
            </div>
          </div>
        </div>
      </header>

      {/* 2. Desktop Fixed Sidebar (>= lg) */}
      <aside className="hidden w-72 shrink-0 border-r border-[#3A4F1C]/15 bg-white/80 backdrop-blur lg:block">
        <div className="sticky top-0 flex h-screen flex-col justify-between p-5">
          <div className="space-y-6">
            {/* Brand Header */}
            <div className="flex items-center gap-3 border-b border-[#3A4F1C]/15 pb-5">
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#3A4F1C]/15 bg-white p-1 shadow-xs">
                <SkeletonPulse className="h-full w-full rounded-lg" />
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <SkeletonLine width="w-32" height="h-3.5" />
                <SkeletonLine width="w-24" height="h-2.5" />
              </div>
            </div>

            {/* Navigation Links Skeleton */}
            <nav className="space-y-6" aria-label="Loading navigation">
              {/* Section 1: Main Modules */}
              <div>
                <SkeletonLine width="w-20" height="h-2.5" className="mb-2.5 ml-2" />
                <div className="space-y-1">
                  {[
                    { labelWidth: 'w-24', hasBadge: false },
                    { labelWidth: 'w-20', hasBadge: true },
                    { labelWidth: 'w-28', hasBadge: false },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg px-3 py-2 border border-transparent"
                    >
                      <div className="flex items-center gap-2.5">
                        <SkeletonPulse className="h-4 w-4 rounded shrink-0" />
                        <SkeletonLine width={item.labelWidth} height="h-3" />
                      </div>
                      {item.hasBadge && <SkeletonPulse className="h-4 w-8 rounded" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 2: External Management */}
              <div>
                <SkeletonLine width="w-28" height="h-2.5" className="mb-2.5 ml-2" />
                <div className="space-y-1">
                  {[
                    { labelWidth: 'w-24' },
                    { labelWidth: 'w-28' },
                    { labelWidth: 'w-32' },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg px-3 py-2 border border-transparent"
                    >
                      <div className="flex items-center gap-2.5">
                        <SkeletonPulse className="h-4 w-4 rounded shrink-0" />
                        <SkeletonLine width={item.labelWidth} height="h-3" />
                      </div>
                      <SkeletonPulse className="h-3 w-3 rounded shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </nav>
          </div>

          {/* Bottom Profile & Sign Out Skeleton */}
          <div className="border-t border-[#3A4F1C]/15 pt-4 space-y-3">
            <div className="flex items-center justify-between pr-2">
              <div className="space-y-1.5 min-w-0">
                <SkeletonLine width="w-24" height="h-3" />
                <SkeletonLine width="w-32" height="h-2.5" />
              </div>
              <SkeletonPulse className="h-5 w-16 rounded-full shrink-0" />
            </div>

            <div className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#3A4F1C]/20 bg-white py-2 px-3 h-9">
              <SkeletonPulse className="h-3.5 w-3.5 rounded" />
              <SkeletonLine width="w-14" height="h-3" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
