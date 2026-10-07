// =============================================================================
// app/admin/(protected)/team/page.tsx — Staff Management & Directory Page
// =============================================================================

import React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentActiveAdmin } from '@/lib/services/adminProfileService';
import { getStaffMembers } from '@/lib/services/admin-team-actions';
import { StaffTable } from '@/components/admin/team/staff-table';
import { Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Team Management | Casamento Admin Portal',
};

export const dynamic = 'force-dynamic';

export default async function AdminTeamPage() {
  const adminData = await getCurrentActiveAdmin();
  if (!adminData) {
    redirect('/admin/login');
  }

  const staffMembers = await getStaffMembers();
  const isSuperAdmin = adminData.profile.role === 'super_admin';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-[#3A4F1C]/15 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#BC6F07] uppercase">
              <Users className="h-4 w-4" />
              <span>Administrative Directory</span>
            </div>
            <h1 className="mt-1 text-2xl font-serif font-bold text-[#2B3817] sm:text-3xl">
              Team Management
            </h1>
            <p className="mt-1 text-xs text-[#2B3817]/70 sm:text-sm">
              Manage administrator permissions, invite new staff members, and control workspace access.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Table View */}
      <StaffTable
        initialStaff={staffMembers}
        currentUserId={adminData.user.id}
        isSuperAdmin={isSuperAdmin}
      />
    </div>
  );
}
