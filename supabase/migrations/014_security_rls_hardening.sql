-- =============================================================================
-- Migration: 014_security_rls_hardening.sql
-- Description: Comprehensive database security & RLS hardening:
--   1. Prevent self-privilege escalation on public.admin_profiles via BEFORE UPDATE
--      trigger and column-level UPDATE privileges.
--   2. Restrict public.admin_profiles SELECT so 'staff' can only view their own row
--      while admin operators retain directory visibility.
--   3. Eliminate audit log forging: remove direct INSERT RLS policy on
--      public.audit_logs (all legitimate inserts run via service_role or
--      SECURITY DEFINER triggers) and drop legacy mismatched policy on
--      public.audit_log_acknowledgments and public.admin_audit_logs.
--   4. Guard public.event_tasks updates so 'staff' users can only toggle
--      completion fields (is_done, completed_at, updated_at) on assigned tasks.
--   5. Create private RLS-protected public.client_feedback_contacts table to
--      isolate client PII (email, phone, admin_note) out of the public Sanity dataset.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Guard public.admin_profiles against self-privilege escalation (CRIT-01)
-- -----------------------------------------------------------------------------
create or replace function public.fn_guard_admin_profile_self_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- service_role executions have auth.uid() = null; authenticated super_admins are allowed.
  if auth.uid() is not null and not public.is_super_admin() then
    if new.role is distinct from old.role
       or new.is_active is distinct from old.is_active
       or new.email is distinct from old.email
       or new.user_id is distinct from old.user_id
       or new.user_code is distinct from old.user_code
       or new.id is distinct from old.id then
      raise exception 'Forbidden: Only super_admin may modify role, status, email, or account identifiers.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_admin_profile_self_update on public.admin_profiles;
create trigger trg_guard_admin_profile_self_update
  before update on public.admin_profiles
  for each row
  execute function public.fn_guard_admin_profile_self_update();

-- Tighten column-level UPDATE privileges for authenticated sessions (defense-in-depth).
-- Super admin team management actions execute server-side via service_role.
revoke update on public.admin_profiles from authenticated;
grant update (full_name, phone, updated_at) on public.admin_profiles to authenticated;

-- -----------------------------------------------------------------------------
-- 2. Restrict public.admin_profiles SELECT visibility for 'staff' role (HIGH-08)
-- -----------------------------------------------------------------------------
drop policy if exists "Active admins can view admin profiles" on public.admin_profiles;
drop policy if exists "Admin operators can view all admin profiles" on public.admin_profiles;
drop policy if exists "Users can view own admin profile" on public.admin_profiles;

create policy "Admin operators can view all admin profiles"
  on public.admin_profiles
  for select
  to authenticated
  using (public.is_admin_operator());

create policy "Users can view own admin profile"
  on public.admin_profiles
  for select
  to authenticated
  using (user_id = (select auth.uid()) and is_active = true);

-- -----------------------------------------------------------------------------
-- 3. Lock down public.audit_logs, public.audit_log_acknowledgments, and
--    legacy public.admin_audit_logs (HIGH-08)
-- -----------------------------------------------------------------------------
-- Remove direct authenticated INSERT on public.audit_logs to prevent log forgery.
-- Legitimate writes come from server-side auditService (service_role) and DB triggers.
drop policy if exists "Active admins can insert audit logs" on public.audit_logs;

-- Drop the policy from Migration 003 whose name differed from Migration 010's DROP statement.
drop policy if exists "Active admins can create acknowledgments" on public.audit_log_acknowledgments;

-- Ensure only admin operators can insert acknowledgments.
drop policy if exists "Admin operators can insert acknowledgments" on public.audit_log_acknowledgments;
create policy "Admin operators can insert acknowledgments"
  on public.audit_log_acknowledgments
  for insert
  to authenticated
  with check (public.is_admin_operator());

-- Restrict legacy public.admin_audit_logs table (Migration 001) to operator read-only.
revoke update, delete, truncate on public.admin_audit_logs from public, anon, authenticated;
drop policy if exists "Active admins can view audit logs" on public.admin_audit_logs;
drop policy if exists "Active admins can insert audit logs" on public.admin_audit_logs;
drop policy if exists "Admin operators can view legacy audit logs" on public.admin_audit_logs;
create policy "Admin operators can view legacy audit logs"
  on public.admin_audit_logs
  for select
  to authenticated
  using (public.is_admin_operator());

-- -----------------------------------------------------------------------------
-- 4. Guard public.event_tasks column updates for 'staff' users (HIGH-08)
-- -----------------------------------------------------------------------------
create or replace function public.fn_guard_event_task_staff_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Non-operator authenticated users ('staff') may only update completion status fields.
  if auth.uid() is not null and not public.is_admin_operator() then
    if new.booking_id is distinct from old.booking_id
       or new.title is distinct from old.title
       or new.assignee_name is distinct from old.assignee_name
       or new.assignee_id is distinct from old.assignee_id
       or new.assignee_ids is distinct from old.assignee_ids
       or new.assignee_names is distinct from old.assignee_names
       or new.due_date is distinct from old.due_date
       or new.due_time is distinct from old.due_time
       or new.created_by is distinct from old.created_by
       or new.is_cancelled is distinct from old.is_cancelled
       or new.cancelled_at is distinct from old.cancelled_at
       or new.cancelled_by is distinct from old.cancelled_by
       or new.cancellation_reason is distinct from old.cancellation_reason
       or new.notified_at is distinct from old.notified_at then
      raise exception 'Forbidden: Staff accounts may only update task completion status.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_event_task_staff_update on public.event_tasks;
create trigger trg_guard_event_task_staff_update
  before update on public.event_tasks
  for each row
  execute function public.fn_guard_event_task_staff_update();

-- -----------------------------------------------------------------------------
-- 5. Private Client Feedback PII Storage Table (HIGH-04)
--    Keeps client email, phone, and private moderation notes out of Sanity's
--    public dataset while linking cleanly to Sanity clientFeedback._id.
-- -----------------------------------------------------------------------------
create table if not exists public.client_feedback_contacts (
  id uuid primary key default gen_random_uuid(),
  sanity_document_id text not null unique,
  client_name text not null,
  client_email text not null,
  client_phone text,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_client_feedback_contacts_sanity_id
  on public.client_feedback_contacts(sanity_document_id);

alter table public.client_feedback_contacts enable row level security;

drop policy if exists "Admin operators can view feedback contacts" on public.client_feedback_contacts;
create policy "Admin operators can view feedback contacts"
  on public.client_feedback_contacts
  for select
  to authenticated
  using (public.is_admin_operator());

drop policy if exists "Admin operators can update feedback contacts" on public.client_feedback_contacts;
create policy "Admin operators can update feedback contacts"
  on public.client_feedback_contacts
  for update
  to authenticated
  using (public.is_admin_operator())
  with check (public.is_admin_operator());
