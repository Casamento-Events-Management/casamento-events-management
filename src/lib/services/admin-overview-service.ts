// =============================================================================
// lib/services/admin-overview-service.ts — Overview Data Queries (Server & Client Safe)
//
// Designed for zero-cost operation on Vercel Hobby tier:
// - Runs on SSR via server Supabase client
// - Runs on 90s client polling directly via browser Supabase client (0 serverless calls)
// - Uses targeted, indexed count and limit(7) queries with no full-table scans
// =============================================================================

import type { SupabaseClient } from '@supabase/supabase-js';
import type { AdminProfile } from '@/types/admin-auth';
import type {
  OverviewPayload,
  OverviewNeedsAttention,
  OverviewTodayEvent,
  OverviewUpcomingEvent,
  OverviewRecentActivity,
  OverviewMonthlyStats,
} from '@/types/admin-overview';
import type { EventTask } from '@/types/booking';

/**
 * Generates YYYY-MM-DD string for today in local time.
 */
function getTodayStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Adds days to a date and returns YYYY-MM-DD.
 */
function getOffsetDateStr(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns { start, end } YYYY-MM-DD for the current month.
 */
function getCurrentMonthBounds(): { start: string; end: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const start = `${y}-${String(m + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(y, m + 1, 0).getDate();
  const end = `${y}-${String(m + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { start, end };
}

/**
 * Core overview aggregator. Compatible with both server and browser Supabase clients.
 */
export async function fetchOverviewData(
  supabase: SupabaseClient,
  profile: AdminProfile
): Promise<OverviewPayload> {
  const isStaff = profile.role === 'staff';
  const currentUserId = profile.user_id;
  const todayStr = getTodayStr();
  const next7DaysStr = getOffsetDateStr(7);
  const { start: monthStart, end: monthEnd } = getCurrentMonthBounds();

  // ---------------------------------------------------------------------------
  // 1. Parallel Data Fetching
  // ---------------------------------------------------------------------------

  const [
    pendingBookingsRes,
    oldestPendingRes,
    upcoming7DaysRes,
    unackAuditsRes,
    teamOverdueTasksRes,
    myOverdueTasksRes,
    todayEventRes,
    upcomingEventsRes,
    personalTasksRes,
    recentActivityRes,
    monthBookingsRes,
    monthConfirmedRes,
  ] = await Promise.all([
    // A. Pending Bookings Count (Admins only)
    !isStaff
      ? supabase
          .from('bookings')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending')
          .eq('is_archived', false)
      : Promise.resolve({ count: 0, error: null }),

    // B. Oldest Pending Booking (to calculate wait days)
    !isStaff
      ? supabase
          .from('bookings')
          .select('created_at')
          .eq('status', 'pending')
          .eq('is_archived', false)
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),

    // C. Confirmed events in next 7 days (to check for incomplete tasks)
    supabase
      .from('bookings')
      .select('id, event_date, event_tasks(id, is_done, is_cancelled)')
      .eq('status', 'confirmed')
      .eq('is_archived', false)
      .gte('event_date', todayStr)
      .lte('event_date', next7DaysStr),

    // D. Unacknowledged Warning & Critical Audits (Admins only)
    !isStaff
      ? supabase
          .from('audit_logs')
          .select(`
            id,
            audit_log_acknowledgments (
              id
            )
          `)
          .in('severity', ['Warning', 'Critical'])
          .order('created_at', { ascending: false })
          .limit(50)
      : Promise.resolve({ data: [], error: null }),

    // E. Team-wide Overdue Tasks (Admins only)
    !isStaff
      ? supabase
          .from('event_tasks')
          .select('id', { count: 'exact', head: true })
          .eq('is_done', false)
          .eq('is_cancelled', false)
          .lt('due_date', todayStr)
      : Promise.resolve({ count: 0, error: null }),

    // F. My Overdue Tasks (All roles)
    supabase
      .from('event_tasks')
      .select('id', { count: 'exact', head: true })
      .eq('is_done', false)
      .eq('is_cancelled', false)
      .lt('due_date', todayStr)
      .or(`assignee_id.eq.${currentUserId},assignee_ids.cs.{${currentUserId}}`),

    // G. Today's Event Spotlight (If an event is scheduled today)
    supabase
      .from('bookings')
      .select(`
        id,
        booking_reference,
        service_title,
        client_full_name,
        client_phone,
        client_email,
        event_time,
        venue_name,
        venue_city,
        event_tasks (*)
      `)
      .eq('status', 'confirmed')
      .eq('is_archived', false)
      .eq('event_date', todayStr)
      .limit(1)
      .maybeSingle(),

    // H. Next 6 Upcoming Events
    supabase
      .from('bookings')
      .select(`
        id,
        booking_reference,
        event_date,
        service_title,
        client_full_name,
        venue_city,
        event_tasks (
          id,
          is_done,
          is_cancelled
        )
      `)
      .eq('status', 'confirmed')
      .eq('is_archived', false)
      .gte('event_date', todayStr)
      .order('event_date', { ascending: true })
      .limit(6),

    // I. Personal Tasks Assigned to User
    supabase
      .from('event_tasks')
      .select(`
        *,
        booking:bookings!booking_id (
          id,
          booking_reference,
          service_title,
          event_date,
          client_full_name
        )
      `)
      .eq('is_done', false)
      .eq('is_cancelled', false)
      .or(`assignee_id.eq.${currentUserId},assignee_ids.cs.{${currentUserId}}`)
      .order('due_date', { ascending: true, nullsFirst: false })
      .limit(6),

    // J. Recent Audit Activity (Admins only, limit 8)
    !isStaff
      ? supabase
          .from('audit_logs')
          .select('id, created_at, action, summary, actor_name, actor_code, severity, entity_ref')
          .order('created_at', { ascending: false })
          .limit(8)
      : Promise.resolve({ data: [], error: null }),

    // K. Month Bookings Created (Admins only)
    !isStaff
      ? supabase
          .from('bookings')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', `${monthStart}T00:00:00Z`)
          .eq('is_archived', false)
      : Promise.resolve({ count: 0, error: null }),

    // L. Month Confirmed Events (Admins only)
    !isStaff
      ? supabase
          .from('bookings')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'confirmed')
          .eq('is_archived', false)
          .gte('event_date', monthStart)
          .lte('event_date', monthEnd)
      : Promise.resolve({ count: 0, error: null }),
  ]);

  // ---------------------------------------------------------------------------
  // 2. Data Processing & Formatting
  // ---------------------------------------------------------------------------

  // Compute oldest pending days
  let oldestPendingDays: number | null = null;
  if (oldestPendingRes.data?.created_at) {
    const created = new Date(oldestPendingRes.data.created_at);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    oldestPendingDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  }

  // Compute 7-day upcoming events with incomplete tasks
  let upcomingWithOpenTasks = 0;
  if (upcoming7DaysRes.data) {
    for (const b of upcoming7DaysRes.data) {
      const tasks = b.event_tasks || [];
      const hasOpen = tasks.some((t: { is_done: boolean; is_cancelled?: boolean }) => !t.is_done && !t.is_cancelled);
      if (hasOpen) upcomingWithOpenTasks++;
    }
  }

  // Compute unacknowledged audits count
  let unacknowledgedAuditsCount = 0;
  if (unackAuditsRes.data) {
    for (const item of unackAuditsRes.data as Array<{ audit_log_acknowledgments?: unknown[] | { id: string } | null }>) {
      const acks = Array.isArray(item.audit_log_acknowledgments)
        ? item.audit_log_acknowledgments
        : item.audit_log_acknowledgments
        ? [item.audit_log_acknowledgments]
        : [];
      if (acks.length === 0) unacknowledgedAuditsCount++;
    }
  }

  const needsAttention: OverviewNeedsAttention = {
    pendingBookingsCount: pendingBookingsRes.count || 0,
    oldestPendingDays,
    upcomingEventsWithOpenTasksCount: upcomingWithOpenTasks,
    unacknowledgedAuditsCount,
    teamOverdueTasksCount: teamOverdueTasksRes.count || 0,
    myOverdueTasksCount: myOverdueTasksRes.count || 0,
    pendingFeedbacksCount: 0,
  };

  // Format Today's Event Spotlight
  let todayEvent: OverviewTodayEvent | null = null;
  if (todayEventRes.data) {
    const raw = todayEventRes.data;
    const allTasks = (raw.event_tasks || []) as EventTask[];
    const activeTasks = allTasks.filter((t) => !t.is_cancelled);
    const completedTasks = activeTasks.filter((t) => t.is_done).length;
    const myTasks = activeTasks.filter(
      (t) =>
        t.assignee_id === currentUserId ||
        (t.assignee_ids && t.assignee_ids.includes(currentUserId))
    );

    todayEvent = {
      id: raw.id,
      booking_reference: raw.booking_reference,
      service_title: raw.service_title,
      client_full_name: raw.client_full_name,
      client_phone: raw.client_phone,
      client_email: raw.client_email,
      event_time: raw.event_time,
      venue_name: raw.venue_name,
      venue_city: raw.venue_city,
      total_tasks: activeTasks.length,
      completed_tasks: completedTasks,
      my_tasks: myTasks,
    };
  }

  // Format Upcoming Events List
  const upcomingEvents: OverviewUpcomingEvent[] = (upcomingEventsRes.data || []).map((b) => {
    const tasks = (b.event_tasks || []) as Array<{ id: string; is_done: boolean; is_cancelled?: boolean }>;
    const activeTasks = tasks.filter((t) => !t.is_cancelled);
    const completedTasks = activeTasks.filter((t) => t.is_done).length;

    return {
      id: b.id,
      booking_reference: b.booking_reference,
      event_date: b.event_date,
      service_title: b.service_title,
      client_full_name: b.client_full_name,
      venue_city: b.venue_city,
      total_tasks: activeTasks.length,
      completed_tasks: completedTasks,
    };
  });

  // Personal Tasks
  const personalTasks: EventTask[] = (personalTasksRes.data as EventTask[]) || [];

  // Recent Activity
  const recentActivity: OverviewRecentActivity[] = (recentActivityRes.data as OverviewRecentActivity[]) || [];

  // Monthly Light Numbers
  const monthlyStats: OverviewMonthlyStats = {
    bookingsThisMonth: monthBookingsRes.count || 0,
    confirmedEventsThisMonth: monthConfirmedRes.count || 0,
    pendingBookingsCount: pendingBookingsRes.count || 0,
  };

  return {
    needsAttention,
    todayEvent,
    upcomingEvents,
    personalTasks,
    recentActivity,
    monthlyStats,
    pendingFeedbacks: [],
  };
}
