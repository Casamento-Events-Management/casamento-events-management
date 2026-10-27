// =============================================================================
// types/admin-overview.ts — Type Definitions for the Admin Overview Workspace
// =============================================================================

import type { EventTask } from './booking';
import type { FinancialTotalsSummary } from './payment';

export interface OverviewNeedsAttention {
  pendingBookingsCount: number;
  oldestPendingDays: number | null;
  upcomingEventsWithOpenTasksCount: number;
  unacknowledgedAuditsCount: number;
  teamOverdueTasksCount: number;
  myOverdueTasksCount: number;
  pendingFeedbacksCount: number;
}

export interface OverviewPendingFeedback {
  id: string;
  name: string;
  email: string;
  eventType: string;
  rating: number;
  message: string;
  submittedAt: string;
  photoUrl?: string | null;
}

export interface OverviewTodayEvent {
  id: string;
  booking_reference: string;
  service_title: string;
  client_full_name: string;
  client_phone: string | null;
  client_email: string;
  event_time: string | null;
  venue_name: string | null;
  venue_city: string | null;
  total_tasks: number;
  completed_tasks: number;
  my_tasks: EventTask[];
}

export interface OverviewUpcomingEvent {
  id: string;
  booking_reference: string;
  event_date: string;
  service_title: string;
  client_full_name: string;
  venue_city: string | null;
  total_tasks: number;
  completed_tasks: number;
}

export interface OverviewRecentActivity {
  id: string;
  created_at: string;
  action: string;
  summary: string;
  actor_name: string;
  actor_code: string;
  severity: 'Info' | 'Warning' | 'Critical';
  entity_ref: string | null;
}

export interface OverviewMonthlyStats {
  bookingsThisMonth: number;
  confirmedEventsThisMonth: number;
  pendingBookingsCount: number;
}

export interface OverviewPayload {
  needsAttention: OverviewNeedsAttention;
  todayEvent: OverviewTodayEvent | null;
  upcomingEvents: OverviewUpcomingEvent[];
  personalTasks: EventTask[];
  recentActivity: OverviewRecentActivity[];
  monthlyStats: OverviewMonthlyStats;
  pendingFeedbacks: OverviewPendingFeedback[];
  paymentStats?: FinancialTotalsSummary | null;
}
