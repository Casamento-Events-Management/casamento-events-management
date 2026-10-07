'use client';

// =============================================================================
// components/admin/layout/admin-sidebar.tsx — Admin Navigation Sidebar
// =============================================================================

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarCheck,
  CreditCard,
  FileText,
  LogOut,
  Loader2,
} from 'lucide-react';
import { logoutAdminAction } from '@/lib/services/admin-auth-actions';
import type { AdminProfile } from '@/types/admin-auth';

interface AdminSidebarProps {
  admin: AdminProfile;
}

export function AdminSidebar({ admin }: AdminSidebarProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const result = await logoutAdminAction();
      router.push(result.redirectUrl || '/admin/login');
      router.refresh();
    } catch (err) {
      console.error('[Sidebar Logout Error]:', err);
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    {
      name: 'Overview',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      active: true,
      badge: null,
    },
    {
      name: 'Bookings & Dates',
      href: '#',
      icon: CalendarCheck,
      active: false,
      badge: 'Upcoming',
    },
    {
      name: 'Payments & Billing',
      href: '#',
      icon: CreditCard,
      active: false,
      badge: 'Upcoming',
    },
    {
      name: 'Audit Trail',
      href: '#',
      icon: FileText,
      active: false,
      badge: 'Protected',
    },
  ];

  return (
    <aside className="hidden w-72 shrink-0 border-r border-[#3A4F1C]/15 bg-white/80 backdrop-blur lg:block">
      <div className="flex h-full min-h-screen flex-col justify-between p-5">
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center gap-3 border-b border-[#3A4F1C]/15 pb-5">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#3A4F1C]/15 bg-white p-1 shadow-xs">
              <Image
                src="/icon.png"
                alt="Casamento Events"
                width={44}
                height={44}
                className="h-full w-full object-contain"
                priority
              />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xs font-serif font-bold tracking-tight text-[#2B3817] uppercase">
                Casamento Events
              </h1>
              <p className="text-[11px] font-semibold tracking-wider text-[#BC6F07] uppercase">
                Admin Dashboard
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1.5">
            <p className="px-3 text-[10px] font-semibold tracking-wider text-[#2B3817]/50 uppercase">
              Workspace
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                if (item.active) {
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center justify-between rounded-lg bg-[#3A4F1C] px-3 py-2 text-xs font-semibold text-white shadow-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </div>
                    </Link>
                  );
                }

                return (
                  <div
                    key={item.name}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-[#2B3817]/60 hover:bg-[#3A4F1C]/5 transition cursor-not-allowed select-none"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4 text-[#2B3817]/40" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="rounded bg-[#3A4F1C]/10 px-1.5 py-0.5 text-[9px] font-medium tracking-wide text-[#3A4F1C] uppercase">
                        {item.badge}
                      </span>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Profile & Sign Out Controls */}
        <div className="border-t border-[#3A4F1C]/15 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <p className="truncate text-xs font-semibold text-[#2B3817]">
                {admin.full_name}
              </p>
              <p className="truncate text-[11px] text-[#2B3817]/60">{admin.email}</p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold tracking-wide uppercase ${
                admin.role === 'super_admin'
                  ? 'border border-amber-300 bg-amber-100 text-amber-900'
                  : 'border border-emerald-300 bg-emerald-100 text-emerald-900'
              }`}
            >
              {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#3A4F1C]/20 bg-white py-2 px-3 text-xs font-medium text-[#2B3817] transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus:outline-none disabled:opacity-50 cursor-pointer"
            title="Sign Out of Admin Portal"
          >
            {isLoggingOut ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <LogOut className="h-3.5 w-3.5" />
            )}
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
