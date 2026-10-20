-- =============================================================================
-- Migration: 009_event_tasks_multi_assignee_and_cancellation.sql
-- Description: Adds multi-member assignment (assignee_ids, assignee_names)
--              and cancellation/soft-delete columns to public.event_tasks.
-- =============================================================================

-- 1. Multi-assignee support
alter table public.event_tasks
  add column if not exists assignee_ids uuid[] default '{}',
  add column if not exists assignee_names text[] default '{}';

-- 2. Soft cancellation support
alter table public.event_tasks
  add column if not exists is_cancelled boolean not null default false,
  add column if not exists cancelled_at timestamptz,
  add column if not exists cancelled_by uuid references auth.users(id) on delete set null,
  add column if not exists cancellation_reason text;

-- 3. Backfill existing single assignees into array columns
update public.event_tasks
set 
  assignee_ids = array[assignee_id],
  assignee_names = array[assignee_name]
where assignee_id is not null 
  and (assignee_ids is null or cardinality(assignee_ids) = 0);

-- 4. Create Indexes for fast querying
create index if not exists idx_event_tasks_assignee_ids
  on public.event_tasks using gin(assignee_ids);

create index if not exists idx_event_tasks_cancellation
  on public.event_tasks(is_cancelled, is_done, due_date);

create index if not exists idx_event_tasks_created_by
  on public.event_tasks(created_by);
