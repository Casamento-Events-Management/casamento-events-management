-- =============================================================================
-- Migration: 006_calendar_tasks_and_reminders.sql
-- Description: Extends bookings for 7-day reminder tracking, rescheduling, 
--              and soft cancellation. Creates event_tasks and admin_notifications tables.
-- =============================================================================

-- 1. Extend public.bookings with reminder and rescheduling tracking
alter table public.bookings
  add column if not exists reminder_7d_sent_at timestamptz,
  add column if not exists rescheduled_from_date date,
  add column if not exists cancellation_reason text,
  add column if not exists cancelled_by uuid references auth.users(id) on delete set null;

-- Index for querying confirmed upcoming events
create index if not exists idx_bookings_confirmed_calendar
  on public.bookings(event_date, status)
  where status = 'confirmed' and is_archived = false;

-- Index for 7-day reminder query
create index if not exists idx_bookings_reminder_7d
  on public.bookings(event_date, reminder_7d_sent_at)
  where status = 'confirmed' and is_archived = false and reminder_7d_sent_at is null;

-- 2. Create public.event_tasks table for event checklist management
create table if not exists public.event_tasks (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  title text not null,
  assignee_name text,
  assignee_id uuid references auth.users(id) on delete set null,
  due_date date,
  is_done boolean not null default false,
  completed_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_event_tasks_booking
  on public.event_tasks(booking_id, is_done, due_date);

alter table public.event_tasks enable row level security;

drop policy if exists "Active admins can manage event tasks" on public.event_tasks;
create policy "Active admins can manage event tasks"
  on public.event_tasks
  for all
  to authenticated
  using (public.is_active_admin())
  with check (public.is_active_admin());

-- 3. Create public.admin_notifications table for in-dashboard notifications
create table if not exists public.admin_notifications (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete cascade,
  type text not null, -- 'reminder_7d', 'event_rescheduled', 'event_cancelled', 'task_due'
  title text not null,
  message text not null,
  is_read boolean not null default false,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_admin_notifications_unread
  on public.admin_notifications(is_read, created_at desc);

alter table public.admin_notifications enable row level security;

drop policy if exists "Active admins can view and manage notifications" on public.admin_notifications;
create policy "Active admins can view and manage notifications"
  on public.admin_notifications
  for all
  to authenticated
  using (public.is_active_admin())
  with check (public.is_active_admin());
