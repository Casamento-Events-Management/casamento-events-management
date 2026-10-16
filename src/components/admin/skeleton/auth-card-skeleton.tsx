import React from 'react';
import { SkeletonPulse, SkeletonLine } from './admin-skeleton-base';

interface AuthCardSkeletonProps {
  variant?: 'login' | 'reset-password' | 'forgot-password';
}

/**
 * Reusable Authentication & Password Reset Screen Skeleton.
 * Matches exact dimensions and layout of AuthCard with login, reset, and forgot variants.
 */
export function AuthCardSkeleton({ variant = 'login' }: AuthCardSkeletonProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#F7F3E8]">
      <div className="w-full max-w-md rounded-2xl border border-[#3A4F1C]/15 bg-white p-8 shadow-xl sm:p-10">
        {/* Brand Header */}
        <div className="mb-8 text-center space-y-2">
          {/* Shield Icon Circle */}
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#3A4F1C]/10">
            <SkeletonPulse className="h-7 w-7 rounded" />
          </div>

          {/* Subheading / Link */}
          <SkeletonLine width="w-32" height="h-3" className="mx-auto" />

          {/* Title */}
          <SkeletonLine width="w-44" height="h-7 sm:h-8" className="mx-auto rounded-md" />

          {/* Subtitle */}
          <SkeletonLine width="w-60" height="h-3.5" className="mx-auto" />
        </div>

        {/* Form Body Skeleton */}
        <div className="space-y-5">
          {variant === 'login' && (
            <>
              {/* Staff Email */}
              <div className="space-y-1.5">
                <SkeletonLine width="w-20" height="h-3" />
                <SkeletonPulse className="h-10 w-full rounded-lg" />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <SkeletonLine width="w-16" height="h-3" />
                  <SkeletonLine width="w-24" height="h-3" />
                </div>
                <SkeletonPulse className="h-10 w-full rounded-lg" />
              </div>

              {/* Submit Button */}
              <SkeletonPulse className="h-10 w-full rounded-lg bg-[#3A4F1C]/20" />
            </>
          )}

          {variant === 'reset-password' && (
            <>
              {/* New Password */}
              <div className="space-y-1.5">
                <SkeletonLine width="w-24" height="h-3" />
                <SkeletonPulse className="h-10 w-full rounded-lg" />
                <SkeletonLine width="w-56" height="h-2.5" />
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <SkeletonLine width="w-36" height="h-3" />
                <SkeletonPulse className="h-10 w-full rounded-lg" />
              </div>

              {/* Submit Button */}
              <SkeletonPulse className="h-10 w-full rounded-lg bg-[#3A4F1C]/20" />
            </>
          )}

          {variant === 'forgot-password' && (
            <>
              {/* Staff Email */}
              <div className="space-y-1.5">
                <SkeletonLine width="w-32" height="h-3" />
                <SkeletonPulse className="h-10 w-full rounded-lg" />
              </div>

              {/* Submit Button */}
              <SkeletonPulse className="h-10 w-full rounded-lg bg-[#3A4F1C]/20" />

              {/* Back to sign in */}
              <div className="flex justify-center pt-2">
                <SkeletonLine width="w-28" height="h-3" />
              </div>
            </>
          )}
        </div>

        {/* Security Footnote */}
        <div className="mt-8 border-t border-[#3A4F1C]/10 pt-4 flex flex-col items-center gap-1.5">
          <SkeletonLine width="w-4/5" height="h-2.5" />
          <SkeletonLine width="w-3/5" height="h-2.5" />
        </div>
      </div>
    </div>
  );
}
