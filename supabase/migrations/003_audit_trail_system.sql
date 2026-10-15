-- =============================================================================
-- Migration: 003_audit_trail_system.sql
-- Description: Adds user_code to admin_profiles, creates append-only audit_logs,
--              audit_log_acknowledgments, triggers on bookings & admin_profiles,
--              and RLS security policies.
-- =============================================================================

-- 1. Add user_code to public.admin_profiles
create sequence if not exists public.seq_admin_user_code start with 1 increment by 1;

alter table public.admin_profiles
  add column if not exists user_code text unique
  default ('ADM-' || lpad(nextval('public.seq_admin_user_code')::text, 3, '0'));

-- Backfill any existing profiles missing user_code
update public.admin_profiles
set user_code = 'ADM-' || lpad(nextval('public.seq_admin_user_code')::text, 3, '0')
where user_code is null;

-- Ensure user_code is always generated if omitted during insert
create or replace function public.fn_assign_admin_user_code()
returns trigger
language plpgsql
as $$
begin
  if new.user_code is null or trim(new.user_code) = '' then
    new.user_code := 'ADM-' || lpad(nextval('public.seq_admin_user_code')::text, 3, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_assign_admin_user_code on public.admin_profiles;
create trigger trg_assign_admin_user_code
  before insert on public.admin_profiles
  for each row
  execute function public.fn_assign_admin_user_code();

-- 2. Create the unified audit_logs table
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Actor information
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_code text not null default 'SYS-000',
  actor_name text not null default 'System',
  actor_email text,
  actor_type text not null default 'system' check (actor_type in ('admin', 'client', 'webhook', 'system', 'db_direct')),

  -- Categorization & classification
  category text not null check (category in ('Booking', 'Payment', 'Team', 'Authentication', 'Feedback', 'Article', 'Security', 'System')),
  action text not null,
  severity text not null default 'Info' check (severity in ('Info', 'Warning', 'Critical')),
  outcome text not null default 'Success' check (outcome in ('Success', 'Failure', 'Blocked', 'Pending')),

  -- Human readable summary & entity reference
  summary text not null,
  entity_type text,
  entity_id text,
  entity_ref text, -- e.g. booking reference CAS-202610-XXXX

  -- State transitions and contextual metadata
  changes jsonb default '{}'::jsonb,
  metadata jsonb default '{}'::jsonb,

  -- Network telemetry
  ip_address text,
  user_agent text
);

-- 3. Create the separate acknowledgments table
create table if not exists public.audit_log_acknowledgments (
  id uuid primary key default gen_random_uuid(),
  audit_log_id uuid not null references public.audit_logs(id) on delete cascade unique,
  acknowledged_by uuid not null references auth.users(id),
  acknowledged_at timestamptz not null default now(),
  note text
);

-- 4. Create performance indexes for viewer queries and booking timeline lookups
create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at desc);
create index if not exists idx_audit_logs_category on public.audit_logs(category);
create index if not exists idx_audit_logs_severity on public.audit_logs(severity);
create index if not exists idx_audit_logs_outcome on public.audit_logs(outcome);
create index if not exists idx_audit_logs_actor_user_id on public.audit_logs(actor_user_id);
create index if not exists idx_audit_logs_entity_ref on public.audit_logs(entity_ref);
create index if not exists idx_audit_logs_entity_type on public.audit_logs(entity_type);
create index if not exists idx_audit_ack_log_id on public.audit_log_acknowledgments(audit_log_id);

-- 5. Enable Row Level Security (RLS)
alter table public.audit_logs enable row level security;
alter table public.audit_log_acknowledgments enable row level security;

-- Strictly append-only: Revoke UPDATE, DELETE, and TRUNCATE on audit_logs for all roles
revoke update, delete, truncate on public.audit_logs from public, anon, authenticated;

-- RLS Policies on audit_logs
drop policy if exists "Active admins can view audit logs" on public.audit_logs;
create policy "Active admins can view audit logs"
  on public.audit_logs
  for select
  to authenticated
  using (public.is_active_admin());

drop policy if exists "Active admins can insert audit logs" on public.audit_logs;
create policy "Active admins can insert audit logs"
  on public.audit_logs
  for insert
  to authenticated
  with check (public.is_active_admin());

-- RLS Policies on audit_log_acknowledgments
drop policy if exists "Active admins can view acknowledgments" on public.audit_log_acknowledgments;
create policy "Active admins can view acknowledgments"
  on public.audit_log_acknowledgments
  for select
  to authenticated
  using (public.is_active_admin());

drop policy if exists "Active admins can create acknowledgments" on public.audit_log_acknowledgments;
create policy "Active admins can create acknowledgments"
  on public.audit_log_acknowledgments
  for insert
  to authenticated
  with check (public.is_active_admin());

-- 6. Database Trigger Function for public.bookings
create or replace function public.fn_audit_bookings_trigger()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid;
  v_actor_code text := 'SYS-000';
  v_actor_name text := 'System';
  v_actor_email text := null;
  v_actor_type text := 'system';
  v_changes jsonb := '{}'::jsonb;
  v_summary text;
  v_action text;
  v_severity text := 'Info';
begin
  -- Resolve actor from auth.uid() if executed in user session
  v_actor_id := auth.uid();
  if v_actor_id is not null then
    select user_code, full_name, email
      into v_actor_code, v_actor_name, v_actor_email
      from public.admin_profiles
     where user_id = v_actor_id;

    if v_actor_code is not null then
      v_actor_type := 'admin';
    else
      v_actor_code := 'USR-CLI';
      v_actor_name := coalesce(new.client_full_name, 'Client User');
      v_actor_type := 'client';
    end if;
  end if;

  if (TG_OP = 'INSERT') then
    v_action := 'Create';
    v_summary := format('Booking reservation %s created for %s (%s)',
                        new.booking_reference, new.client_full_name, new.service_title);

    insert into public.audit_logs (
      actor_user_id, actor_code, actor_name, actor_email, actor_type,
      category, action, severity, outcome, summary,
      entity_type, entity_id, entity_ref,
      changes, metadata
    ) values (
      v_actor_id, v_actor_code, v_actor_name, v_actor_email, v_actor_type,
      'Booking', v_action, 'Info', 'Success', v_summary,
      'booking', new.id::text, new.booking_reference,
      '{}'::jsonb,
      jsonb_build_object('service', new.service_title, 'event_date', new.event_date, 'payment_status', new.payment_status)
    );
    return new;

  elsif (TG_OP = 'UPDATE') then
    -- Check for sensitive/monitored field changes
    if old.status is distinct from new.status then
      v_changes := v_changes || jsonb_build_object('status', jsonb_build_object('old', old.status, 'new', new.status));
    end if;
    if old.payment_status is distinct from new.payment_status then
      v_changes := v_changes || jsonb_build_object('payment_status', jsonb_build_object('old', old.payment_status, 'new', new.payment_status));
    end if;
    if old.payment_enabled is distinct from new.payment_enabled then
      v_changes := v_changes || jsonb_build_object('payment_enabled', jsonb_build_object('old', old.payment_enabled, 'new', new.payment_enabled));
    end if;
    if old.event_date is distinct from new.event_date then
      v_changes := v_changes || jsonb_build_object('event_date', jsonb_build_object('old', old.event_date, 'new', new.event_date));
      v_severity := 'Warning';
    end if;
    if old.venue_city is distinct from new.venue_city then
      v_changes := v_changes || jsonb_build_object('venue_city', jsonb_build_object('old', old.venue_city, 'new', new.venue_city));
    end if;
    if old.client_email is distinct from new.client_email then
      v_changes := v_changes || jsonb_build_object('client_email', jsonb_build_object('old', old.client_email, 'new', new.client_email));
      v_severity := 'Warning';
    end if;

    -- Only write to audit_logs if at least one monitored field changed
    if v_changes <> '{}'::jsonb then
      v_action := 'Update';
      v_summary := format('%s updated booking %s', v_actor_name, new.booking_reference);

      insert into public.audit_logs (
        actor_user_id, actor_code, actor_name, actor_email, actor_type,
        category, action, severity, outcome, summary,
        entity_type, entity_id, entity_ref,
        changes, metadata
      ) values (
        v_actor_id, v_actor_code, v_actor_name, v_actor_email, v_actor_type,
        'Booking', v_action, v_severity, 'Success', v_summary,
        'booking', new.id::text, new.booking_reference,
        v_changes,
        jsonb_build_object('client_name', new.client_full_name)
      );
    end if;
    return new;

  elsif (TG_OP = 'DELETE') then
    v_action := 'Delete';
    v_summary := format('%s deleted booking %s', v_actor_name, old.booking_reference);

    insert into public.audit_logs (
      actor_user_id, actor_code, actor_name, actor_email, actor_type,
      category, action, severity, outcome, summary,
      entity_type, entity_id, entity_ref,
      changes, metadata
    ) values (
      v_actor_id, v_actor_code, v_actor_name, v_actor_email, v_actor_type,
      'Booking', v_action, 'Critical', 'Success', v_summary,
      'booking', old.id::text, old.booking_reference,
      jsonb_build_object('deleted_record', row_to_json(old)),
      '{}'::jsonb
    );
    return old;
  end if;

  return null;
end;
$$;

drop trigger if exists trg_audit_bookings on public.bookings;
create trigger trg_audit_bookings
  after insert or update or delete on public.bookings
  for each row
  execute function public.fn_audit_bookings_trigger();

-- 7. Database Trigger Function for public.admin_profiles
create or replace function public.fn_audit_admin_profiles_trigger()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid;
  v_actor_code text := 'SYS-000';
  v_actor_name text := 'System';
  v_actor_email text := null;
  v_changes jsonb := '{}'::jsonb;
  v_summary text;
  v_severity text := 'Info';
begin
  v_actor_id := auth.uid();
  if v_actor_id is not null then
    select user_code, full_name, email
      into v_actor_code, v_actor_name, v_actor_email
      from public.admin_profiles
     where user_id = v_actor_id;
  end if;

  if (TG_OP = 'INSERT') then
    v_summary := format('New admin profile created for %s (%s, Code: %s)', new.full_name, new.role, new.user_code);
    insert into public.audit_logs (
      actor_user_id, actor_code, actor_name, actor_email, actor_type,
      category, action, severity, outcome, summary,
      entity_type, entity_id, entity_ref,
      changes, metadata
    ) values (
      v_actor_id, coalesce(v_actor_code, 'SYS-000'), coalesce(v_actor_name, 'System'), v_actor_email, 'admin',
      'Team', 'Create', 'Info', 'Success', v_summary,
      'admin_profile', new.id::text, new.user_code,
      '{}'::jsonb,
      jsonb_build_object('role', new.role, 'email', new.email)
    );
    return new;

  elsif (TG_OP = 'UPDATE') then
    if old.role is distinct from new.role then
      v_changes := v_changes || jsonb_build_object('role', jsonb_build_object('old', old.role, 'new', new.role));
      v_severity := 'Warning';
    end if;
    if old.is_active is distinct from new.is_active then
      v_changes := v_changes || jsonb_build_object('is_active', jsonb_build_object('old', old.is_active, 'new', new.is_active));
      v_severity := 'Critical';
    end if;
    if old.full_name is distinct from new.full_name then
      v_changes := v_changes || jsonb_build_object('full_name', jsonb_build_object('old', old.full_name, 'new', new.full_name));
    end if;

    if v_changes <> '{}'::jsonb then
      v_summary := format('%s updated admin profile for %s (%s)', coalesce(v_actor_name, 'System'), new.full_name, new.user_code);
      insert into public.audit_logs (
        actor_user_id, actor_code, actor_name, actor_email, actor_type,
        category, action, severity, outcome, summary,
        entity_type, entity_id, entity_ref,
        changes, metadata
      ) values (
        v_actor_id, coalesce(v_actor_code, 'SYS-000'), coalesce(v_actor_name, 'System'), v_actor_email, 'admin',
        'Team', 'Update', v_severity, 'Success', v_summary,
        'admin_profile', new.id::text, new.user_code,
        v_changes,
        '{}'::jsonb
      );
    end if;
    return new;
  end if;

  return null;
end;
$$;

drop trigger if exists trg_audit_admin_profiles on public.admin_profiles;
create trigger trg_audit_admin_profiles
  after insert or update on public.admin_profiles
  for each row
  execute function public.fn_audit_admin_profiles_trigger();
