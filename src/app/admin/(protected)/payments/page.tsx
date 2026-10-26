// =============================================================================
// app/admin/(protected)/payments/page.tsx — Admin Payments & Billing Ledger
// =============================================================================

import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentActiveAdmin } from '@/lib/services/adminProfileService';
import { PaymentsShell } from '@/components/admin/payments/payments-shell';
import { DashboardSkeleton } from '@/components/admin/skeleton/dashboard-skeleton';

export const metadata: Metadata = {
  title: 'Payments & Billing | Casamento Admin Portal',
  description: 'Manage client payments, record manual receipts, track agreed totals and outstanding balances.',
};

export const dynamic = 'force-dynamic';

export default async function AdminPaymentsPage() {
  const adminData = await getCurrentActiveAdmin();

  if (!adminData) {
    redirect('/admin/login');
  }

  // Strict operator access: staff cannot access financial billing
  if (adminData.profile.role === 'staff') {
    redirect('/admin/dashboard');
  }

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <PaymentsShell />
    </Suspense>
  );
}
