// =============================================================================
// app/admin/(protected)/dashboard/page.tsx — Admin Operations Overview
// =============================================================================

import React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentActiveAdmin } from '@/lib/services/adminProfileService';
import { createClient } from '@/lib/supabase/server';
import { fetchOverviewData } from '@/lib/services/admin-overview-service';
import { fetchPendingFeedbacks } from '@/lib/services/admin-feedback-service';
import { OverviewShell } from '@/components/admin/overview/overview-shell';

export const metadata: Metadata = {
  title: 'Overview | Casamento Admin Portal',
  description: 'Operations overview, urgent action items, upcoming events, and personal checklist.',
};

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const adminData = await getCurrentActiveAdmin();
  if (!adminData) {
    redirect('/admin/login');
  }

  // Fetch initial overview dataset via SSR
  const supabase = await createClient();
  const initialData = await fetchOverviewData(supabase, adminData.profile);

  // If Admin or Superadmin, query pending client feedbacks directly from Sanity CMS
  if (adminData.profile.role !== 'staff') {
    const pendingFeedbacks = await fetchPendingFeedbacks();
    initialData.pendingFeedbacks = pendingFeedbacks;
    initialData.needsAttention.pendingFeedbacksCount = pendingFeedbacks.length;
  }

  return <OverviewShell initialData={initialData} profile={adminData.profile} />;
}
