// =============================================================================
// app/admin/(protected)/layout.tsx — Authenticated Admin Protected Layout Shell
//
// Layer 2 Guard: Cryptographically re-verifies session & checks is_active === true.
// =============================================================================

import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentActiveAdmin } from '@/lib/services/adminProfileService';
import { AdminSidebar } from '@/components/admin/layout/admin-sidebar';

export const dynamic = 'force-dynamic';

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminData = await getCurrentActiveAdmin();

  if (!adminData) {
    redirect('/admin/login');
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-[#F7F3E8]">
      <AdminSidebar admin={adminData.profile} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
