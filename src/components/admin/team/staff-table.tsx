'use client';

// =============================================================================
// components/admin/team/staff-table.tsx — Interactive Team Directory Table
// =============================================================================

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, UserPlus, Users, Shield } from 'lucide-react';
import { InviteStaffModal } from '@/components/admin/team/invite-staff-modal';
import { StaffActionsDropdown } from '@/components/admin/team/staff-actions-dropdown';
import type { AdminProfile } from '@/types/admin-auth';

interface StaffTableProps {
  initialStaff: AdminProfile[];
  currentUserId: string;
  isSuperAdmin: boolean;
}

export function StaffTable({
  initialStaff,
  currentUserId,
  isSuperAdmin,
}: StaffTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const filteredStaff = initialStaff.filter((member) => {
    const q = searchQuery.toLowerCase();
    return (
      member.full_name.toLowerCase().includes(q) ||
      member.email.toLowerCase().includes(q) ||
      member.role.toLowerCase().includes(q)
    );
  });

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {/* Search and Action Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#3A4F1C]/40">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or role..."
            className="w-full rounded-xl border border-[#3A4F1C]/20 bg-white py-2 pr-3 pl-9 text-xs text-[#2B3817] placeholder-[#2B3817]/40 transition focus:border-[#BC6F07] focus:ring-1 focus:ring-[#BC6F07] focus:outline-none"
          />
        </div>

        {isSuperAdmin && (
          <button
            type="button"
            onClick={() => setIsInviteModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3A4F1C] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#2A3A14] transition cursor-pointer self-start sm:self-auto"
          >
            <UserPlus className="h-4 w-4" />
            <span>Invite Team Member</span>
          </button>
        )}
      </div>

      {/* Directory Table */}
      <div className="overflow-hidden rounded-2xl border border-[#3A4F1C]/15 bg-white shadow-xs">
        <div className="overflow-x-auto min-h-[160px]">
          <table className="w-full text-left text-xs text-[#2B3817]">
            <thead className="border-b border-[#3A4F1C]/10 bg-[#F7F3E8]/50 text-[10px] font-semibold uppercase tracking-wider text-[#2B3817]/60">
              <tr>
                <th scope="col" className="px-5 py-3.5">
                  Staff Member
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Access Role
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Status
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Added On
                </th>
                {isSuperAdmin && (
                  <th scope="col" className="px-5 py-3.5 text-right">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3A4F1C]/10">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td
                    colSpan={isSuperAdmin ? 5 : 4}
                    className="px-5 py-10 text-center text-xs text-[#2B3817]/50"
                  >
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#3A4F1C]/5 text-[#3A4F1C]/40">
                      <Users className="h-5 w-5" />
                    </div>
                    <p className="mt-2 font-medium">No administrators found</p>
                    <p className="text-[11px] text-[#2B3817]/40">
                      Try adjusting your search criteria.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStaff.map((member) => {
                  const isSelf = member.user_id === currentUserId;
                  const dateStr = new Date(member.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-[#3A4F1C]/[0.02] transition"
                    >
                      {/* Name & Email */}
                      <td className="px-5 py-3.5 font-medium whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3A4F1C]/10 text-xs font-semibold text-[#3A4F1C]">
                            {member.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-[#2B3817]">
                              {member.full_name}
                            </p>
                            <p className="text-[11px] text-[#2B3817]/60">
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${
                            member.role === 'super_admin'
                              ? 'border border-amber-300 bg-amber-100 text-amber-900'
                              : 'border border-emerald-300 bg-emerald-100 text-emerald-900'
                          }`}
                        >
                          <Shield className="h-3 w-3" />
                          <span>{member.role === 'super_admin' ? 'Super Admin' : 'Admin'}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            member.is_active
                              ? 'bg-emerald-50 text-emerald-800'
                              : 'bg-red-50 text-red-800'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              member.is_active ? 'bg-emerald-500' : 'bg-red-500'
                            }`}
                          />
                          <span>{member.is_active ? 'Active' : 'Deactivated'}</span>
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-[#2B3817]/60 text-[11px]">
                        {dateStr}
                      </td>

                      {/* Actions */}
                      {isSuperAdmin && (
                        <td className="px-5 py-3.5 whitespace-nowrap text-right">
                          <StaffActionsDropdown
                            staff={member}
                            isCurrentAdmin={isSelf}
                            onRefresh={handleRefresh}
                          />
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {isSuperAdmin && (
        <InviteStaffModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          onSuccess={handleRefresh}
        />
      )}
    </div>
  );
}
