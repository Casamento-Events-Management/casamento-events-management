import React from 'react';

export default function AdminBookingsLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <div className="h-7 w-48 rounded-lg bg-stone-200" />
          <div className="h-3.5 w-72 rounded-md bg-stone-100" />
        </div>
        <div className="h-9 w-28 rounded-xl bg-stone-200" />
      </div>

      {/* Tabs Skeleton */}
      <div className="flex items-center gap-6 border-b border-stone-200 pb-3">
        <div className="h-4 w-20 rounded bg-stone-200" />
        <div className="h-4 w-20 rounded bg-stone-200" />
      </div>

      {/* 2-Column Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left List Skeleton */}
        <div className="lg:col-span-7 space-y-3">
          <div className="h-9 w-full rounded-xl bg-stone-100" />
          <div className="flex gap-2">
            <div className="h-7 w-20 rounded-lg bg-stone-200" />
            <div className="h-7 w-16 rounded-lg bg-stone-100" />
            <div className="h-7 w-20 rounded-lg bg-stone-100" />
          </div>
          <div className="space-y-2 pt-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 rounded-xl border border-stone-200 bg-white p-4 space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 w-32 rounded bg-stone-200" />
                  <div className="h-4 w-16 rounded bg-stone-100" />
                </div>
                <div className="h-3 w-24 rounded bg-stone-100" />
                <div className="h-3 w-44 rounded bg-stone-100" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Inspector Skeleton */}
        <div className="lg:col-span-5 h-[480px] rounded-2xl border border-stone-200 bg-white p-5 space-y-4">
          <div className="h-5 w-36 rounded bg-stone-200" />
          <div className="h-28 rounded-xl bg-stone-100" />
          <div className="h-28 rounded-xl bg-stone-100" />
          <div className="h-10 rounded-xl bg-stone-200 mt-auto" />
        </div>
      </div>
    </div>
  );
}
