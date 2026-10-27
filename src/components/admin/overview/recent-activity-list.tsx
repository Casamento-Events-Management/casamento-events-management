'use client';

// =============================================================================
// components/admin/overview/recent-activity-list.tsx — Plain-Language Activity Feed
// =============================================================================

import React from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
} from 'lucide-react';
import type { OverviewRecentActivity } from '@/types/admin-overview';

interface RecentActivityListProps {
  activities: OverviewRecentActivity[];
}

export function RecentActivityList({ activities = [] }: RecentActivityListProps) {
  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffSec < 60) return 'Just now';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHour = Math.floor(diffMin / 60);
      if (diffHour < 24) return `${diffHour}h ago`;
      const diffDay = Math.floor(diffHour / 24);
      if (diffDay < 7) return `${diffDay}d ago`;

      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const getSeverityDot = (severity: 'Info' | 'Warning' | 'Critical') => {
    if (severity === 'Critical') {
      return <span className="h-2 w-2 rounded-full bg-red-600 shrink-0" title="Critical Alert" />;
    }
    if (severity === 'Warning') {
      return <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" title="Warning" />;
    }
    return <span className="h-2 w-2 rounded-full bg-[#3A4F1C]/60 shrink-0" title="Informational" />;
  };

  return (
    <div className="rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-5 shadow-2xs space-y-3">
      {/* Header */}
      <div className="flex items-center pb-2 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-[#3A4F1C]" />
          <h2 className="text-sm font-semibold text-stone-900">
            Recent Activity
          </h2>
        </div>

        <Link
          href="/admin/audit"
          className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-[#3A4F1C] hover:text-[#2B3817] hover:underline"
        >
          <span>Audit Trail</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Feed Stream */}
      {activities.length === 0 ? (
        <div className="py-8 text-center text-xs text-stone-400">
          No recent activity logs recorded.
        </div>
      ) : (
        <div className="divide-y divide-stone-100">
          {activities.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-2.5 py-2.5 hover:bg-[#F7F3E8]/30 rounded-xl px-2 transition -mx-2"
            >
              <div className="mt-1.5">{getSeverityDot(item.severity)}</div>

              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-xs font-medium text-stone-800 leading-snug">
                  {item.summary}
                </p>

                <div className="flex items-center gap-2 text-[10px] text-stone-500 flex-wrap">
                  <span className="font-semibold text-stone-700">
                    {item.actor_name}
                  </span>
                  <span className="font-mono text-stone-400">
                    ({item.actor_code})
                  </span>
                  {item.entity_ref && (
                    <>
                      <span>·</span>
                      <span className="font-mono text-stone-600 bg-stone-100 px-1 py-0.2 rounded">
                        {item.entity_ref}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Timestamp (Right Side) */}
              <div className="shrink-0 ml-auto pt-0.5 text-[10px] font-mono text-stone-400">
                {formatRelativeTime(item.created_at)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
