'use client';

// =============================================================================
// components/admin/layout/admin-header.tsx — Top Navigation Bar with Profile & Logout
// =============================================================================

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Shield, User, Loader2 } from 'lucide-react';
import { logoutAdminAction } from '@/lib/services/admin-auth-actions';
import type { AdminProfile } from '@/types/admin-auth';

interface AdminHeaderProps {
  admin: AdminProfile;
}

export function AdminHeader({ admin }: AdminHeaderProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const result = await logoutAdminAction();
      router.push(result.redirectUrl || '/admin/login');
      router.refresh();
    } catch (err) {
      console.error('[Header Logout Error]:', err);
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#3A4F1C]/15 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3A4F1C] text-white shadow-sm">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <Link
            href="/admin/dashboard"
            className="text-sm font-bold tracking-tight text-[#2B3817] hover:text-[#3A4F1C]"
          >
            Casamento
            <span className="ml-1 text-xs font-semibold text-[#BC6F07]">Portal</span>
          </Link>
          <p className="text-[10px] text-[#2B3817]/60 tracking-wider uppercase">
            Management Gateway
          </p>
        </div>
      </div>

      {/* Admin User Profile & Sign Out */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-3 text-right">
          <div>
            <p className="text-xs font-semibold text-[#2B3817]">
              {admin.full_name}
            </p>
            <p className="text-[11px] text-[#2B3817]/60">{admin.email}</p>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${
              admin.role === 'super_admin'
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
            }`}
          >
            {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
          </span>
        </div>

        <div className="h-6 w-px bg-[#3A4F1C]/15" />

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#3A4F1C]/20 bg-white px-3 py-1.5 text-xs font-medium text-[#2B3817] transition hover:bg-red-50 hover:border-red-200 hover:text-red-700 focus:outline-none disabled:opacity-50"
          title="Sign Out of Admin Portal"
        >
          {isLoggingOut ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <LogOut className="h-3.5 w-3.5" />
          )}
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
