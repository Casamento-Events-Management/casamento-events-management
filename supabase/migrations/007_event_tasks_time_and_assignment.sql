-- =============================================================================
-- Migration: 007_event_tasks_time_and_assignment.sql
-- Description: Adds due_time column to public.event_tasks for precise time tracking.
-- =============================================================================

alter table public.event_tasks
  add column if not exists due_time text;
