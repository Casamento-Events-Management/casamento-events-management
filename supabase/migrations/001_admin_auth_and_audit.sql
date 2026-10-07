-- =============================================================================
-- Migration: 001_admin_auth_and_audit.sql
-- Description: Sets up admin_profiles, admin_audit_logs, helper functions, and RLS.
-- =============================================================================

-- 1. Create admin_profiles table
create table if not exists public.admin_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  email text not null,
  full_name text not null,
  role text not null check (role in ('super_admin', 'admin')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Create admin_audit_logs table
create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_email text,
  action text not null,
  target_resource text not null,
  details jsonb default '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

-- 3. Indexes for fast query and authentication resolution
create index if not exists idx_admin_profiles_user_id on public.admin_profiles(user_id);
create index if not exists idx_admin_profiles_active on public.admin_profiles(user_id, is_active);
create index if not exists idx_admin_audit_logs_actor on public.admin_audit_logs(actor_user_id);
create index if not exists idx_admin_audit_logs_action on public.admin_audit_logs(action);
create index if not exists idx_admin_audit_logs_created_at on public.admin_audit_logs(created_at desc);

-- 4. Enable Row Level Security (RLS)
alter table public.admin_profiles enable row level security;
alter table public.admin_audit_logs enable row level security;

-- 5. Helper Function: is_active_admin()
-- Checks if the calling authenticated user has an active admin profile.
create or replace function public.is_active_admin()
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
      and is_active = true
  );
$$;

-- 6. Helper Function: is_super_admin()
-- Checks if the calling authenticated user has an active super_admin profile.
create or replace function public.is_super_admin()
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
      and role = 'super_admin'
      and is_active = true
  );
$$;

-- 7. RLS Policies on admin_profiles
drop policy if exists "Active admins can view admin profiles" on public.admin_profiles;
create policy "Active admins can view admin profiles"
  on public.admin_profiles
  for select
  to authenticated
  using (public.is_active_admin());

drop policy if exists "Super admins can manage admin profiles" on public.admin_profiles;
create policy "Super admins can manage admin profiles"
  on public.admin_profiles
  for all
  to authenticated
  using (public.is_super_admin());

-- 8. RLS Policies on admin_audit_logs
drop policy if exists "Active admins can view audit logs" on public.admin_audit_logs;
create policy "Active admins can view audit logs"
  on public.admin_audit_logs
  for select
  to authenticated
  using (public.is_active_admin());

drop policy if exists "Active admins can insert audit logs" on public.admin_audit_logs;
create policy "Active admins can insert audit logs"
  on public.admin_audit_logs
  for insert
  to authenticated
  with check (public.is_active_admin());
