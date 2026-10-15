// =============================================================================
// app/admin/(protected)/audit/page.tsx — Admin Audit Trail & Activity Log
// =============================================================================

import React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentActiveAdmin } from '@/lib/services/adminProfileService';
import { AuditTable } from '@/components/admin/audit/audit-table';

export const metadata: Metadata = {
  title: 'Audit Trail | Casamento Admin Portal',
  description: 'Enterprise activity logging, event forensics, and operational audit trail.',
};

export const dynamic = 'force-dynamic';

export default async function AdminAuditPage() {
  const adminData = await getCurrentActiveAdmin();

  if (!adminData) {
    redirect('/admin/login');
  }

  return (
    <div className="space-y-6">
      <AuditTable />
    </div>
  );
}
