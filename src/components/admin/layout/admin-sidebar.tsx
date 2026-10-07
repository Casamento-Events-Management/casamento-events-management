// =============================================================================
// components/admin/layout/admin-sidebar.tsx — Admin Navigation Sidebar
// =============================================================================

import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  CalendarCheck,
  CreditCard,
  FileText,
  Lock,
} from 'lucide-react';

export function AdminSidebar() {
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
    <aside className="hidden w-64 shrink-0 border-r border-[#3A4F1C]/15 bg-white/70 backdrop-blur lg:block">
      <div className="flex h-full flex-col justify-between p-4">
        <div className="space-y-1">
          <p className="px-3 py-2 text-[11px] font-semibold tracking-wider text-[#2B3817]/50 uppercase">
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
                    className="flex items-center justify-between rounded-lg bg-[#3A4F1C] px-3 py-2 text-xs font-semibold text-white shadow-sm"
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
    </aside>
  );
}
