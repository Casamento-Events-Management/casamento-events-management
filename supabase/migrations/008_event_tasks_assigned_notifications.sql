-- =============================================================================
-- Migration: 008_event_tasks_assigned_notifications.sql
-- Description: Adds notified_at column to public.event_tasks to track
--              task assignment email notification delivery.
-- =============================================================================

alter table public.event_tasks
  add column if not exists notified_at timestamptz;

create index if not exists idx_event_tasks_unnotified
  on public.event_tasks(booking_id, notified_at)
  where assignee_id is not null and notified_at is null;
