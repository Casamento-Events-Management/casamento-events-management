// =============================================================================
// app/admin/(protected)/bookings/page.tsx — Admin Bookings & Dates Workspace
// =============================================================================

import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentActiveAdmin } from '@/lib/services/adminProfileService';
import { getAdminBookings } from '@/lib/services/adminBookingService';
import { BookingsShell } from '@/components/admin/bookings/bookings-shell';
import { DashboardSkeleton } from '@/components/admin/skeleton/dashboard-skeleton';

export const metadata: Metadata = {
  title: 'Bookings & Dates | Casamento Admin Portal',
  description: 'Manage booking reservation requests, confirm events, and review operational schedule.',
};

export const dynamic = 'force-dynamic';

export default async function AdminBookingsPage() {
  const adminData = await getCurrentActiveAdmin();

  if (!adminData) {
    redirect('/admin/login');
  }

  const { bookings, pendingCount } = await getAdminBookings({
    status: 'all',
    page: 1,
    pageSize: 50,
  });

  return (
    <div className="space-y-6">
      <Suspense fallback={<DashboardSkeleton />}>
        <BookingsShell
          initialBookings={bookings}
          initialPendingCount={pendingCount}
          currentUserId={adminData.user.id}
          isSuperAdmin={adminData.profile.role === 'super_admin'}
          isStaff={adminData.profile.role === 'staff'}
        />
      </Suspense>
    </div>
  );
}
