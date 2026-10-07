// =============================================================================
// app/admin/(protected)/dashboard/page.tsx — Admin Portal Dashboard Landing
// =============================================================================

import React from 'react';
import type { Metadata } from 'next';
import { getCurrentActiveAdmin } from '@/lib/services/adminProfileService';
import { ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dashboard | Casamento Admin Portal',
};

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const adminData = await getCurrentActiveAdmin();
  const profile = adminData?.profile;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-[#3A4F1C]/15 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mt-1 text-2xl font-serif font-bold text-[#2B3817] sm:text-3xl">
              Welcome back, {profile?.full_name || 'Administrator'}
            </h1>
            <p className="mt-1 text-sm text-[#2B3817]/70">
              Casamento Events Management Portal · Connected via verified administrative session.
            </p>
          </div>
        </div>
      </div>

      {/* Workspace Readiness Shell */}
      <div className="rounded-2xl border border-dashed border-[#3A4F1C]/20 bg-white/50 p-8 text-center">
        <h2 className="text-base font-semibold text-[#2B3817]">
          Authentication & Authorization Workspace Ready
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-xs text-[#2B3817]/70 leading-relaxed">
          The Admin Gateway is armed and secure. Dashboard features and management modules will be mounted here.
        </p>
      </div>
    </div>
  );
}
