-- =============================================================================
-- Migration: 010_staff_viewer_role.sql
-- Description: Adds 'staff' (intern / viewer) role to public.admin_profiles.
--              Introduces public.is_admin_operator() function and splits RLS policies
--              so that staff users have read-only access to calendar, bookings, and tasks,
--              while restricting mutations, audit logs, and team management to operators.
-- =============================================================================

-- 1. Update role check constraint and columns on public.admin_profiles
alter table public.admin_profiles
  drop constraint if exists admin_profiles_role_check;

alter table public.admin_profiles
  add constraint admin_profiles_role_check
  check (role in ('super_admin', 'admin', 'staff'));

alter table public.admin_profiles
  add column if not exists phone text;

-- 2. Helper Function: is_admin_operator()
-- Returns true ONLY if caller has role 'super_admin' or 'admin' and is active.
create or replace function public.is_admin_operator()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.admin_profiles
    where user_id = (select auth.uid())
      and role in ('super_admin', 'admin')
      and is_active = true
  );
$$;

-- 3. RLS Policies on public.bookings
-- Staff can view bookings, but only admin operators can insert, update, or delete.
drop policy if exists "Active admins can update bookings" on public.bookings;
drop policy if exists "Admin operators can update bookings" on public.bookings;
create policy "Admin operators can update bookings"
  on public.bookings
  for update
  to authenticated
  using (public.is_admin_operator())
  with check (public.is_admin_operator());

drop policy if exists "Active admins can delete bookings" on public.bookings;
drop policy if exists "Admin operators can delete bookings" on public.bookings;
create policy "Admin operators can delete bookings"
  on public.bookings
  for delete
  to authenticated
  using (public.is_admin_operator());

drop policy if exists "Active admins can insert bookings" on public.bookings;
drop policy if exists "Admin operators can insert bookings" on public.bookings;
create policy "Admin operators can insert bookings"
  on public.bookings
  for insert
  to authenticated
  with check (public.is_admin_operator());

-- 4. RLS Policies on public.event_tasks
-- Staff can view tasks, operators can manage all tasks, staff can only mark assigned tasks done.
drop policy if exists "Active admins can manage event tasks" on public.event_tasks;
drop policy if exists "Admin operators can manage event tasks" on public.event_tasks;
create policy "Admin operators can manage event tasks"
  on public.event_tasks
  for all
  to authenticated
  using (public.is_admin_operator())
  with check (public.is_admin_operator());

drop policy if exists "Staff can update completion on assigned tasks" on public.event_tasks;
create policy "Staff can update completion on assigned tasks"
  on public.event_tasks
  for update
  to authenticated
  using (
    public.is_active_admin() and (
      assignee_id = (select auth.uid()) or
      (select auth.uid()) = any(assignee_ids)
    )
  )
  with check (
    public.is_active_admin() and (
      assignee_id = (select auth.uid()) or
      (select auth.uid()) = any(assignee_ids)
    )
  );

-- 5. RLS Policies on public.audit_logs & public.audit_log_acknowledgments
-- Strictly restrict viewing and acknowledgment to admin operators (Staff cannot access Audit Trail).
drop policy if exists "Active admins can view audit logs" on public.audit_logs;
drop policy if exists "Admin operators can view audit logs" on public.audit_logs;
create policy "Admin operators can view audit logs"
  on public.audit_logs
  for select
  to authenticated
  using (public.is_admin_operator());

drop policy if exists "Active admins can view acknowledgments" on public.audit_log_acknowledgments;
drop policy if exists "Admin operators can view acknowledgments" on public.audit_log_acknowledgments;
create policy "Admin operators can view acknowledgments"
  on public.audit_log_acknowledgments
  for select
  to authenticated
  using (public.is_admin_operator());

drop policy if exists "Active admins can insert acknowledgments" on public.audit_log_acknowledgments;
drop policy if exists "Admin operators can insert acknowledgments" on public.audit_log_acknowledgments;
create policy "Admin operators can insert acknowledgments"
  on public.audit_log_acknowledgments
  for insert
  to authenticated
  with check (public.is_admin_operator());

-- 6. Self-Profile Update Policy on public.admin_profiles
-- Allows active authenticated users (including staff) to update their own profile details.
drop policy if exists "Users can update own profile" on public.admin_profiles;
create policy "Users can update own profile"
  on public.admin_profiles
  for update
  to authenticated
  using (user_id = (select auth.uid()) and is_active = true)
  with check (user_id = (select auth.uid()) and is_active = true);

-- 7. RLS Policies on public.admin_notifications
-- All active users can view and update (mark read) their notifications.
drop policy if exists "Active admins can view and manage notifications" on public.admin_notifications;
drop policy if exists "Active admins can view notifications" on public.admin_notifications;
create policy "Active admins can view notifications"
  on public.admin_notifications
  for select
  to authenticated
  using (public.is_active_admin());

drop policy if exists "Active admins can update notifications" on public.admin_notifications;
create policy "Active admins can update notifications"
  on public.admin_notifications
  for update
  to authenticated
  using (public.is_active_admin())
  with check (public.is_active_admin());
