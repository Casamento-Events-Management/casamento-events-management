-- =============================================================================
-- Migration: 011_event_completion_workflow.sql
-- Description: Adds event conclusion tracking columns (completed_at, completed_by,
--              completion_notes) and indexing for completed event reporting.
-- =============================================================================

-- 1. Add completion tracking columns to public.bookings
alter table public.bookings
  add column if not exists completed_at timestamptz,
  add column if not exists completed_by uuid references auth.users(id) on delete set null,
  add column if not exists completion_notes text;

-- 2. Create performance indexes for filtering and chronological reporting
create index if not exists idx_bookings_status_completed_at
  on public.bookings(status, completed_at desc nulls last);

create index if not exists idx_bookings_event_date_status
  on public.bookings(event_date desc, status);

-- 3. Documentation comments
comment on column public.bookings.completed_at is 'Timestamp when event was formally marked concluded / completed.';
comment on column public.bookings.completed_by is 'Admin user ID who marked the event as completed.';
comment on column public.bookings.completion_notes is 'Post-event operational wrap-up summary and feedback notes.';
