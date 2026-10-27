-- =============================================================================
-- Migration: 013_payment_status_undeclared.sql
-- Description: Updates payment status domain to explicitly include 'undeclared'.
--              1. Modifies bookings_payment_status_check on public.bookings.
--              2. Updates existing rows with null/zero agreed total to 'undeclared'.
--              3. Refreshes public.v_booking_financials derived view.
--              4. Updates trigger fn_sync_booking_payment_status to assign 'undeclared'
--                 when agreed total is not yet set and no payments have been made.
-- =============================================================================

-- 1. Update check constraint on public.bookings
alter table public.bookings
  drop constraint if exists bookings_payment_status_check;

alter table public.bookings
  add constraint bookings_payment_status_check
  check (payment_status in ('undeclared', 'unpaid', 'downpayment_pending', 'partially_paid', 'paid', 'refunded', 'waived'));

-- 2. Migrate existing pending/unpaid bookings with null or zero agreed total to 'undeclared'
update public.bookings
set payment_status = 'undeclared'
where (agreed_total_centavos is null or agreed_total_centavos <= 0)
  and payment_status in ('unpaid', 'downpayment_pending');

-- 3. Update public.v_booking_financials derived view
create or replace view public.v_booking_financials
with (security_invoker = true)
as
select 
  b.id as booking_id,
  b.booking_reference,
  b.client_full_name,
  b.client_email,
  b.service_title,
  b.event_date,
  b.status as booking_status,
  b.payment_status,
  b.agreed_total_centavos,
  b.agreed_total_currency,
  
  -- Sum of verified paid payments (excluding refunded amounts)
  coalesce(
    sum(
      case 
        when p.status = 'paid' then p.amount_centavos - coalesce(p.refund_amount_centavos, 0)
        else 0 
      end
    ), 0
  )::bigint as total_paid_centavos,
  
  -- Count of successful payments
  count(p.id) filter (where p.status = 'paid') as payment_count,
  
  -- Derived remaining balance
  case 
    when b.agreed_total_centavos is null or b.agreed_total_centavos <= 0 then null
    else greatest(
      0,
      b.agreed_total_centavos - coalesce(
        sum(
          case 
            when p.status = 'paid' then p.amount_centavos - coalesce(p.refund_amount_centavos, 0)
            else 0 
          end
        ), 0
      )
    )
  end::bigint as remaining_balance_centavos,
  
  -- Derived payment completion status
  case 
    when b.payment_status = 'refunded' then 'refunded'
    when count(p.id) filter (where p.is_refunded = true) > 0 and coalesce(sum(case when p.status = 'paid' then p.amount_centavos - coalesce(p.refund_amount_centavos, 0) else 0 end), 0) = 0 then 'refunded'
    when b.agreed_total_centavos is null or b.agreed_total_centavos <= 0 then
      case 
        when coalesce(sum(case when p.status = 'paid' then p.amount_centavos else 0 end), 0) > 0 then 'partially_paid'
        else 'undeclared'
      end
    when coalesce(sum(case when p.status = 'paid' then p.amount_centavos - coalesce(p.refund_amount_centavos, 0) else 0 end), 0) = 0 then 'unpaid'
    when coalesce(sum(case when p.status = 'paid' then p.amount_centavos - coalesce(p.refund_amount_centavos, 0) else 0 end), 0) >= b.agreed_total_centavos then 'paid'
    else 'partially_paid'
  end as derived_payment_status,

  max(p.paid_at) as last_payment_at

from public.bookings b
left join public.payments p on p.booking_id = b.id
group by 
  b.id,
  b.booking_reference,
  b.client_full_name,
  b.client_email,
  b.service_title,
  b.event_date,
  b.status,
  b.payment_status,
  b.agreed_total_centavos,
  b.agreed_total_currency;

-- 4. Trigger Function: Synchronize payment status & log audit on payment changes
create or replace function public.fn_sync_booking_payment_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_booking_id uuid;
  v_agreed_total bigint;
  v_total_paid bigint;
  v_refund_count int;
  v_new_status text;
  v_actor_id uuid := auth.uid();
  v_actor_code text := 'SYS-000';
  v_actor_name text := 'System';
  v_actor_email text := null;
begin
  v_booking_id := coalesce(new.booking_id, old.booking_id);

  -- Fetch current agreed total
  select agreed_total_centavos into v_agreed_total
  from public.bookings
  where id = v_booking_id;

  -- Calculate sum of paid payments (deducting refunds)
  select coalesce(sum(amount_centavos - coalesce(refund_amount_centavos, 0)), 0)
  into v_total_paid
  from public.payments
  where booking_id = v_booking_id and status = 'paid';

  -- Check for any refunded transactions
  select count(*) into v_refund_count
  from public.payments
  where booking_id = v_booking_id and is_refunded = true;

  -- Determine target status
  if v_total_paid = 0 and v_refund_count > 0 then
    v_new_status := 'refunded';
  elsif v_agreed_total is null or v_agreed_total <= 0 then
    if v_total_paid = 0 then
      v_new_status := 'undeclared';
    else
      v_new_status := 'partially_paid';
    end if;
  elsif v_total_paid = 0 then
    v_new_status := 'unpaid';
  elsif v_total_paid >= v_agreed_total then
    v_new_status := 'paid';
  else
    v_new_status := 'partially_paid';
  end if;

  -- Update booking payment status
  update public.bookings
  set payment_status = v_new_status,
      updated_at = now()
  where id = v_booking_id and payment_status is distinct from v_new_status;

  -- Resolve actor from auth.uid()
  if v_actor_id is not null then
    select user_code, full_name, email
      into v_actor_code, v_actor_name, v_actor_email
      from public.admin_profiles
     where user_id = v_actor_id;
  end if;

  if (TG_OP = 'INSERT') then
    insert into public.audit_logs (
      actor_user_id, actor_code, actor_name, actor_email, actor_type,
      category, action, severity, outcome, summary,
      entity_type, entity_id, entity_ref,
      changes, metadata
    ) values (
      v_actor_id, coalesce(v_actor_code, 'SYS-000'), coalesce(v_actor_name, 'System'), v_actor_email, 'admin',
      'Payment', 'Record Payment', 'Info', 'Success',
      format('%s recorded payment %s (%s centavos) for booking %s', coalesce(v_actor_name, 'Admin'), new.payment_number, new.amount_centavos, new.booking_reference),
      'payment', new.id::text, new.payment_number,
      jsonb_build_object('amount_centavos', new.amount_centavos, 'payment_method', new.payment_method),
      jsonb_build_object('booking_reference', new.booking_reference, 'receipt_number', new.receipt_number)
    );
  elsif (TG_OP = 'UPDATE' and old.is_refunded is false and new.is_refunded is true) then
    insert into public.audit_logs (
      actor_user_id, actor_code, actor_name, actor_email, actor_type,
      category, action, severity, outcome, summary,
      entity_type, entity_id, entity_ref,
      changes, metadata
    ) values (
      v_actor_id, coalesce(v_actor_code, 'SYS-000'), coalesce(v_actor_name, 'System'), v_actor_email, 'admin',
      'Payment', 'Refund Payment', 'Warning', 'Success',
      format('%s refunded payment %s (%s centavos) - Reason: %s', coalesce(v_actor_name, 'Admin'), new.payment_number, new.refund_amount_centavos, coalesce(new.refund_reason, 'N/A')),
      'payment', new.id::text, new.payment_number,
      jsonb_build_object('refund_amount_centavos', new.refund_amount_centavos, 'refund_reason', new.refund_reason),
      jsonb_build_object('booking_reference', new.booking_reference)
    );
  end if;

  return coalesce(new, old);
end;
$$;
