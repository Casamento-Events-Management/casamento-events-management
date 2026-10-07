'use client';

// =============================================================================
// components/admin/team/staff-actions-dropdown.tsx — Staff Row Actions Menu
// =============================================================================

import React, { useState, useRef, useEffect } from 'react';
import {
  MoreHorizontal,
  UserCheck,
  UserX,
  ShieldCheck,
  ShieldAlert,
  Send,
  Trash2,
  Loader2,
} from 'lucide-react';
import {
  toggleStaffStatusAction,
  updateStaffRoleAction,
  resendInviteAction,
  removeStaffAction,
} from '@/lib/services/admin-team-actions';
import type { AdminProfile } from '@/types/admin-auth';

interface StaffActionsDropdownProps {
  staff: AdminProfile;
  isCurrentAdmin: boolean;
  onRefresh?: () => void;
}

export function StaffActionsDropdown({
  staff,
  isCurrentAdmin,
  onRefresh,
}: StaffActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const handleToggleStatus = async () => {
    setIsLoading(true);
    setIsOpen(false);
    try {
      await toggleStaffStatusAction({
        userId: staff.user_id,
        isActive: !staff.is_active,
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('[handleToggleStatus Error]:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRole = async () => {
    setIsLoading(true);
    setIsOpen(false);
    const targetRole = staff.role === 'super_admin' ? 'admin' : 'super_admin';
    try {
      await updateStaffRoleAction({
        userId: staff.user_id,
        role: targetRole,
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('[handleToggleRole Error]:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendInvite = async () => {
    setIsLoading(true);
    setIsOpen(false);
    try {
      await resendInviteAction(staff.user_id);
    } catch (err) {
      console.error('[handleResendInvite Error]:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently revoke ${staff.full_name}'s administrative account?`
    );
    if (!confirmed) return;

    setIsLoading(true);
    setIsOpen(false);
    try {
      await removeStaffAction(staff.user_id);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('[handleRemove Error]:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCurrentAdmin) {
    return (
      <span className="text-[11px] font-medium text-[#2B3817]/40 italic">
        (Your Account)
      </span>
    );
  }

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        disabled={isLoading}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Staff actions"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#3A4F1C]/15 bg-white text-[#2B3817] hover:bg-[#3A4F1C]/5 transition cursor-pointer disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <MoreHorizontal className="h-4 w-4" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-30 mt-1.5 w-48 rounded-xl border border-[#3A4F1C]/15 bg-white p-1.5 shadow-xl animate-fade-in-scale">
          {/* Status Toggle */}
          <button
            type="button"
            onClick={handleToggleStatus}
            className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition cursor-pointer ${
              staff.is_active
                ? 'text-amber-800 hover:bg-amber-50'
                : 'text-emerald-800 hover:bg-emerald-50'
            }`}
          >
            {staff.is_active ? (
              <>
                <UserX className="h-3.5 w-3.5 text-amber-600" />
                <span>Deactivate Account</span>
              </>
            ) : (
              <>
                <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Activate Account</span>
              </>
            )}
          </button>

          {/* Role Adjustment */}
          <button
            type="button"
            onClick={handleToggleRole}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#2B3817] hover:bg-[#3A4F1C]/5 transition cursor-pointer"
          >
            {staff.role === 'admin' ? (
              <>
                <ShieldCheck className="h-3.5 w-3.5 text-[#BC6F07]" />
                <span>Make Super Admin</span>
              </>
            ) : (
              <>
                <ShieldAlert className="h-3.5 w-3.5 text-[#3A4F1C]" />
                <span>Demote to Admin</span>
              </>
            )}
          </button>

          {/* Resend Invite */}
          <button
            type="button"
            onClick={handleResendInvite}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#2B3817] hover:bg-[#3A4F1C]/5 transition cursor-pointer"
          >
            <Send className="h-3.5 w-3.5 text-[#3A4F1C]/60" />
            <span>Resend Invite Link</span>
          </button>

          <div className="my-1 border-t border-[#3A4F1C]/10" />

          {/* Remove / Revoke */}
          <button
            type="button"
            onClick={handleRemove}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 transition cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5 text-red-600" />
            <span>Revoke Account</span>
          </button>
        </div>
      )}
    </div>
  );
}
