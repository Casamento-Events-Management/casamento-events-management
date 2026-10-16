-- =============================================================================
-- Migration: 004_pending_bookings_management.sql
-- Description: Extends public.bookings for administrative decision workflows,
--              rejection reasons, internal notes, and soft cancellation tracking.
-- Note: agreed_total_centavos will be introduced in the dedicated Payment & Billing migration when that module is formally scheduled.
-- =============================================================================

-- 1. Add administrative and decision tracking columns to public.bookings
alter table public.bookings
  add column if not exists rejection_reason text,
  add column if not exists admin_notes text,
  add column if not exists decision_by uuid references auth.users(id) on delete set null,
  add column if not exists decision_at timestamptz,
  add column if not exists is_archived boolean not null default false,
  add column if not exists cancelled_at timestamptz;

-- 2. Performance indexes for queue sorting & dashboard filters
create index if not exists idx_bookings_status_created 
  on public.bookings(status, created_at desc);

create index if not exists idx_bookings_is_archived 
  on public.bookings(is_archived);

-- 3. Enhance audit trigger for public.bookings to log administrative decisions
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
  -- Resolve actor from auth.uid() if executed in active admin session
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
    -- Detect Status Transitions
    if old.status is distinct from new.status then
      v_changes := v_changes || jsonb_build_object('status', jsonb_build_object('old', old.status, 'new', new.status));
      if new.status = 'confirmed' then
        v_action := 'Accept';
        v_summary := format('%s accepted booking %s', v_actor_name, new.booking_reference);
      elsif new.status = 'cancelled' then
        v_action := 'Reject';
        v_severity := 'Warning';
        v_summary := format('%s rejected booking %s (Reason: %s)', 
                            v_actor_name, new.booking_reference, coalesce(new.rejection_reason, 'No reason provided'));
      end if;
    end if;

    -- Track Rejection Reason Changes
    if old.rejection_reason is distinct from new.rejection_reason then
      v_changes := v_changes || jsonb_build_object('rejection_reason', jsonb_build_object('old', old.rejection_reason, 'new', new.rejection_reason));
    end if;

    -- Track Event Date Rescheduling
    if old.event_date is distinct from new.event_date then
      v_changes := v_changes || jsonb_build_object('event_date', jsonb_build_object('old', old.event_date, 'new', new.event_date));
      v_severity := 'Warning';
    end if;

    -- Track Venue Updates
    if old.venue_city is distinct from new.venue_city then
      v_changes := v_changes || jsonb_build_object('venue_city', jsonb_build_object('old', old.venue_city, 'new', new.venue_city));
    end if;

    -- Track Client Contact Changes
    if old.client_email is distinct from new.client_email then
      v_changes := v_changes || jsonb_build_object('client_email', jsonb_build_object('old', old.client_email, 'new', new.client_email));
      v_severity := 'Warning';
    end if;

    -- Track Internal Admin Notes
    if old.admin_notes is distinct from new.admin_notes then
      v_changes := v_changes || jsonb_build_object('admin_notes', jsonb_build_object('old', old.admin_notes, 'new', new.admin_notes));
    end if;

    -- Track Soft Archive / Deletion
    if old.is_archived is distinct from new.is_archived then
      v_changes := v_changes || jsonb_build_object('is_archived', jsonb_build_object('old', old.is_archived, 'new', new.is_archived));
      v_severity := 'Critical';
    end if;

    if v_changes <> '{}'::jsonb then
      v_action := coalesce(v_action, 'Update');
      v_summary := coalesce(v_summary, format('%s updated booking %s', v_actor_name, new.booking_reference));

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
        jsonb_build_object('client_name', new.client_full_name, 'decision_by', new.decision_by)
      );
    end if;
    return new;
  end if;

  return null;
end;
$$;
