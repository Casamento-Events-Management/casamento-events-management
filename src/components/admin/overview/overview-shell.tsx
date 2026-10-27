'use client';

// =============================================================================
// components/admin/overview/overview-shell.tsx — Master Client Shell for Overview
// =============================================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { AdminProfile } from '@/types/admin-auth';
import type { OverviewPayload } from '@/types/admin-overview';
import { createClient } from '@/lib/supabase/client';
import { fetchOverviewData } from '@/lib/services/admin-overview-service';
import { WelcomeBar } from './welcome-bar';
import { NeedsAttentionBar } from './needs-attention-bar';
import { TodayEventSpotlight } from './today-event-spotlight';
import { UpcomingEventsList } from './upcoming-events-list';
import { PersonalTasksList } from './personal-tasks-list';
import { RecentActivityList } from './recent-activity-list';
import { MonthlyStatsBar } from './monthly-stats-bar';
import { PendingFeedbackList } from './pending-feedback-list';
import { PaymentsStatsGrid } from '@/components/admin/payments/payments-stats-grid';
import { getPendingFeedbacksAction } from '@/lib/services/admin-feedback-service';
import { fetchPaymentStatsAction } from '@/lib/services/admin-payment-actions';

interface OverviewShellProps {
  initialData: OverviewPayload;
  profile: AdminProfile;
}

export function OverviewShell({ initialData, profile }: OverviewShellProps) {
  const [data, setData] = useState<OverviewPayload>(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const lastFetchedRef = useRef<number>(0);
  const isStaff = profile.role === 'staff';

  // Client-side refresh using browser Supabase instance + Server Action for pending feedbacks & payment stats
  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const browserClient = createClient();
      const fresh = await fetchOverviewData(browserClient, profile);

      if (!isStaff) {
        const [fbRes, payRes] = await Promise.all([
          getPendingFeedbacksAction(),
          fetchPaymentStatsAction(),
        ]);
        if (fbRes.success && fbRes.feedbacks) {
          fresh.pendingFeedbacks = fbRes.feedbacks;
          fresh.needsAttention.pendingFeedbacksCount = fbRes.feedbacks.length;
        }
        if (payRes.success && payRes.stats) {
          fresh.paymentStats = payRes.stats;
        }
      }

      setData(fresh);
      lastFetchedRef.current = Date.now();
    } catch (err) {
      console.error('[OverviewShell Refresh Error]:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [isStaff, profile]);

  // Visibility-based 90-second background polling
  useEffect(() => {
    const POLLING_INTERVAL_MS = 90_000; // 90 seconds
    let intervalId: NodeJS.Timeout | null = null;

    const startPolling = () => {
      if (!intervalId) {
        intervalId = setInterval(() => {
          if (document.visibilityState === 'visible') {
            void refreshData();
          }
        }, POLLING_INTERVAL_MS);
      }
    };

    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // If user was away longer than the polling interval, refresh immediately
        const elapsed = Date.now() - lastFetchedRef.current;
        if (elapsed > POLLING_INTERVAL_MS) {
          void refreshData();
        }
        startPolling();
      } else {
        stopPolling();
      }
    };

    if (lastFetchedRef.current === 0) {
      lastFetchedRef.current = Date.now();
    }
    startPolling();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshData]);

  // Compute total needs-attention items count
  const totalNeedsAttentionCount =
    (isStaff ? 0 : data.needsAttention.pendingBookingsCount) +
    data.needsAttention.upcomingEventsWithOpenTasksCount +
    (isStaff ? 0 : data.needsAttention.unacknowledgedAuditsCount) +
    (isStaff ? data.needsAttention.myOverdueTasksCount : data.needsAttention.teamOverdueTasksCount) +
    (isStaff ? 0 : data.needsAttention.pendingFeedbacksCount);

  return (
    <div className="space-y-5">
      {/* Welcome Bar Header */}
      <WelcomeBar
        profile={profile}
        needsAttentionCount={totalNeedsAttentionCount}
        isRefreshing={isRefreshing}
      />

      {/* Action Required / Calm State */}
      <NeedsAttentionBar data={data.needsAttention} isStaff={isStaff} />

      {/* Payment Stats Grid (Rendered immediately after Action Required card) */}
      {!isStaff && (
        <PaymentsStatsGrid stats={data.paymentStats || null} />
      )}

      {!isStaff && (
        <MonthlyStatsBar stats={data.monthlyStats} />
      )}

      {/* Today's Active Event Spotlight (Rendered only when an event is scheduled today) */}
      {data.todayEvent && <TodayEventSpotlight event={data.todayEvent} />}

      {/* 2-Column Responsive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Right Column: Personal Tasks & Monthly Numbers (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <PersonalTasksList
            initialTasks={data.personalTasks}
            onTaskToggled={() => {
              // Soft background refresh on task toggle to update counts
              setTimeout(refreshData, 800);
            }}
          />

          {!isStaff && (
            <PendingFeedbackList
              initialFeedbacks={data.pendingFeedbacks}
              onFeedbackAction={() => {
                void refreshData();
              }}
            />
          )}
        </div>

        {/* Left Column: Upcoming Schedule, Recent Activity & Pending Feedback (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <UpcomingEventsList events={data.upcomingEvents} />
          {!isStaff && (
            <>
              <RecentActivityList activities={data.recentActivity} />

            </>
          )}
        </div>


      </div>
    </div>
  );
}
