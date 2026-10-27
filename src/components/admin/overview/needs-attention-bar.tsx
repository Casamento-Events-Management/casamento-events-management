'use client';

// =============================================================================
// components/admin/overview/needs-attention-bar.tsx — High-Priority Action Items
// =============================================================================

import React from 'react';
import Link from 'next/link';
import {
  Inbox,
  Clock,
  ShieldAlert,
  AlertTriangle,
  ChevronRight,
  CheckCheck,
  MessageSquareHeart,
} from 'lucide-react';
import type { OverviewNeedsAttention } from '@/types/admin-overview';

interface NeedsAttentionBarProps {
  data: OverviewNeedsAttention;
  isStaff: boolean;
}

export function NeedsAttentionBar({ data, isStaff }: NeedsAttentionBarProps) {
  // Compute items relevant to user's role
  const items: Array<{
    id: string;
    title: string;
    count: number;
    badge?: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    accentClass: string;
  }> = [];

  // 1. Pending Bookings (Admins only)
  if (!isStaff && data.pendingBookingsCount > 0) {
    const oldestBadge =
      data.oldestPendingDays !== null
        ? data.oldestPendingDays === 0
          ? 'Today'
          : `${data.oldestPendingDays}d waiting`
        : undefined;

    items.push({
      id: 'pending-requests',
      title: 'Booking Requests',
      count: data.pendingBookingsCount,
      badge: oldestBadge,
      href: '/admin/bookings?tab=requests&status=pending',
      icon: Inbox,
      accentClass: 'border-amber-200 bg-amber-50/70 hover:bg-amber-100/70 text-amber-900',
    });
  }

  // 2. Events in Next 7 Days with Open Tasks (All roles)
  if (data.upcomingEventsWithOpenTasksCount > 0) {
    items.push({
      id: 'upcoming-open-tasks',
      title: 'Events with Incomplete Tasks',
      count: data.upcomingEventsWithOpenTasksCount,
      badge: 'Next 7 Days',
      href: '/admin/bookings?tab=list&listTab=upcoming&days=7',
      icon: Clock,
      accentClass: 'border-[#3A4F1C]/25 bg-[#F7F3E8]/80 hover:bg-[#F0ECE1] text-[#2B3817]',
    });
  }

  // 3. Unacknowledged System Warnings (Admins only)
  if (!isStaff && data.unacknowledgedAuditsCount > 0) {
    items.push({
      id: 'unack-audits',
      title: 'Unacknowledged Audit Alerts',
      count: data.unacknowledgedAuditsCount,
      badge: 'Attention',
      href: '/admin/audit?severity=Warning',
      icon: ShieldAlert,
      accentClass: 'border-red-200 bg-red-50/70 hover:bg-red-100/70 text-red-900',
    });
  }

  // 4. Overdue Tasks (Team for Admins, Personal for Staff)
  const overdueCount = isStaff ? data.myOverdueTasksCount : data.teamOverdueTasksCount;
  if (overdueCount > 0) {
    items.push({
      id: 'overdue-tasks',
      title: isStaff ? 'Your Overdue Tasks' : 'Team Overdue Tasks',
      count: overdueCount,
      badge: 'Past Due',
      href: isStaff
        ? '/admin/bookings?tab=tasks&taskView=assigned_to_me&taskStatus=pending'
        : '/admin/bookings?tab=tasks&taskStatus=pending',
      icon: AlertTriangle,
      accentClass: 'border-orange-200 bg-orange-50/70 hover:bg-orange-100/70 text-orange-900',
    });
  }

  // 5. Feedbacks Awaiting Review (Admins only)
  if (!isStaff && data.pendingFeedbacksCount > 0) {
    items.push({
      id: 'pending-feedbacks',
      title: 'Feedbacks to Review',
      count: data.pendingFeedbacksCount,
      badge: 'Pending',
      href: '/studio/structure/clientFeedback',
      icon: MessageSquareHeart,
      accentClass: 'border-amber-200 bg-amber-50/70 hover:bg-amber-100/70 text-amber-900',
    });
  }

  // If nothing needs attention, display reassuring zero state
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs flex items-center gap-3">
        <div className="h-8 w-8 rounded-xl bg-emerald-50 border border-emerald-100 inline-flex items-center justify-center text-emerald-700 shrink-0">
          <CheckCheck className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs font-semibold text-stone-800">
            All clear — no items currently require immediate action
          </p>
          <p className="text-[11px] text-stone-500">
            Pending booking requests, checklist deadlines, and system logs are up to date.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-stone-200/90 bg-white p-3.5 sm:p-4 shadow-2xs space-y-2.5">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
        <h2 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
          Action Required
        </h2>
      </div>

      {/* Action Pills Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`group flex items-center gap-2 sm:gap-3 rounded-xl border p-2.5 sm:p-3 transition shadow-2xs cursor-pointer ${item.accentClass}`}
            >
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-white/80 inline-flex items-center justify-center shrink-0 shadow-2xs">
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="text-xs sm:text-sm font-bold">{item.count}</span>
                  {item.badge && (
                    <span className="rounded-md bg-white/70 px-1 sm:px-1.5 py-0.2 text-[8px] sm:text-[9px] font-semibold uppercase tracking-tight truncate">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-[10px] sm:text-[11px] font-medium truncate opacity-90">
                  {item.title}
                </p>
              </div>

              <div className="shrink-0 ml-auto hidden sm:block">
                <ChevronRight className="h-3.5 w-3.5 opacity-60 group-hover:translate-x-0.5 transition" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
