-- =============================================================================
-- Migration: 012_payment_tracking_and_billing.sql
-- Description: Establishes the Payment Tracking and Billing infrastructure.
--              1. Adds agreed_total and billing columns to public.bookings.
--              2. Updates payment_status constraint to support partially_paid & refunded.
--              3. Creates public.payments table for manual & online payment records.
--              4. Defines public.v_booking_financials derived view with security_invoker.
--              5. Implements trigger fn_sync_booking_payment_status with audit logging.
--              6. Configures RLS policies isolating financial data to admin operators.
--              7. Initializes private Supabase storage buckets for proofs & receipts with RLS.
-- =============================================================================

-- 1. Extend bookings table for agreed pricing and billing tracking
alter table public.bookings
  add column if not exists agreed_total_centavos bigint check (agreed_total_centavos is null or agreed_total_centavos >= 0),
  add column if not exists agreed_total_currency text not null default 'PHP',
  add column if not exists agreed_total_set_at timestamptz,
  add column if not exists agreed_total_set_by uuid references auth.users(id) on delete set null,
  add column if not exists agreed_total_notes text;

-- 2. Update payment_status check constraint to include 'partially_paid' and 'refunded'
alter table public.bookings
  drop constraint if exists bookings_payment_status_check;

alter table public.bookings
  add constraint bookings_payment_status_check
  check (payment_status in ('unpaid', 'downpayment_pending', 'partially_paid', 'paid', 'refunded', 'waived'));

-- 3. Indexes on bookings for financial queries
create index if not exists idx_bookings_agreed_total 
  on public.bookings(agreed_total_centavos) 
  where agreed_total_centavos is not null;

-- 4. Create public.payments table
-- Note: payment_method is stored as text without an inline check constraint,
-- allowing new methods to be added via application-layer enums without migrations.
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  booking_reference text not null,
  
  -- Tracking Identifiers
  payment_number text not null unique,     -- Internal sequence: PAY-YYYY-XXXXX
  receipt_number text unique,              -- Client facing: CSM-RCPT-YYYY-XXXXX (Optional / Nullable)
  
  -- Classification
  payment_type text not null default 'manual' check (payment_type in ('manual', 'online')),
  payment_method text not null,            -- Governed by application layer (cash, bank_transfer, gcash, maya, etc.)
  
  -- Structured details (e.g. { bank_name: "BDO", ref_no: "12345678", sender_name: "Juan" })
  channel_details jsonb not null default '{}'::jsonb,
  
  -- Monetary Values (Integer Centavos)
  amount_centavos bigint not null check (amount_centavos > 0),
  currency text not null default 'PHP',
  
  -- Transaction Lifecycle
  status text not null default 'paid' check (
    status in ('pending', 'paid', 'failed', 'cancelled', 'refunded')
  ),
  paid_at timestamptz not null default now(),
  recorded_by uuid references auth.users(id) on delete set null,
  notes text,
  
  -- Optional Proof of Payment (All fields strictly Nullable)
  proof_attachment_path text,
  proof_attachment_name text,
  proof_attachment_size_bytes bigint,
  proof_attachment_mime_type text,
  
  -- Optional Receipt Reference (All fields strictly Nullable)
  receipt_pdf_path text,
  receipt_sent_at timestamptz,
  receipt_sent_to text,
  
  -- Refund Management
  is_refunded boolean not null default false,
  refund_amount_centavos bigint check (
    refund_amount_centavos is null or 
    (refund_amount_centavos > 0 and refund_amount_centavos <= amount_centavos)
  ),
  refund_reason text,
  refunded_at timestamptz,
  refunded_by uuid references auth.users(id) on delete set null,
  
  -- Online Gateway Future-Readiness (Dragonpay / PayPal)
  online_provider text check (online_provider in ('dragonpay', 'paypal') or online_provider is null),
  provider_txn_id text,
  provider_ref text,
  provider_payer_email text,
  raw_webhook_payload jsonb default null,
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Performance Indexes on payments
create index if not exists idx_payments_booking_id on public.payments(booking_id);
create index if not exists idx_payments_booking_reference on public.payments(booking_reference);
create index if not exists idx_payments_status on public.payments(status);
create index if not exists idx_payments_paid_at on public.payments(paid_at desc);
create index if not exists idx_payments_payment_method on public.payments(payment_method);
create index if not exists idx_payments_created_at on public.payments(created_at desc);

-- 5. Financial Calculations & Derived View: public.v_booking_financials
-- Uses security_invoker = true to respect the executing user's RLS policies
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
    when b.agreed_total_centavos is null then null
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
    when b.agreed_total_centavos is null and coalesce(sum(case when p.status = 'paid' then p.amount_centavos else 0 end), 0) = 0 then 'unpaid'
    when b.agreed_total_centavos is null and coalesce(sum(case when p.status = 'paid' then p.amount_centavos else 0 end), 0) > 0 then 'partially_paid'
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

-- 6. Trigger Function: Synchronize payment status & log audit on payment changes
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

  -- Determine target status
  if v_total_paid = 0 then
    v_new_status := 'unpaid';
  elsif v_agreed_total is not null and v_total_paid >= v_agreed_total then
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

drop trigger if exists trg_sync_booking_payment_status on public.payments;
create trigger trg_sync_booking_payment_status
after insert or update or delete on public.payments
for each row execute function public.fn_sync_booking_payment_status();

-- 7. Row Level Security on public.payments
-- Only Admin Operators (super_admin and admin) have access.
-- Staff users (intern/viewer) have zero access (default deny).
alter table public.payments enable row level security;

drop policy if exists "Admin operators can view payments" on public.payments;
create policy "Admin operators can view payments"
  on public.payments
  for select
  to authenticated
  using (public.is_admin_operator());

drop policy if exists "Admin operators can insert payments" on public.payments;
create policy "Admin operators can insert payments"
  on public.payments
  for insert
  to authenticated
  with check (public.is_admin_operator());

drop policy if exists "Admin operators can update payments" on public.payments;
create policy "Admin operators can update payments"
  on public.payments
  for update
  to authenticated
  using (public.is_admin_operator())
  with check (public.is_admin_operator());

-- Payments cannot be deleted by anyone to preserve immutable financial audit records.

-- 8. Storage Buckets & Policies (payment-proofs and payment-receipts)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values 
  (
    'payment-proofs', 
    'payment-proofs', 
    false, 
    10485760, -- 10 MB in bytes
    array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  ),
  (
    'payment-receipts', 
    'payment-receipts', 
    false, 
    5242880,  -- 5 MB in bytes
    array['application/pdf']
  )
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Storage RLS on payment-proofs: Operator only
drop policy if exists "Admin operators can view payment proofs" on storage.objects;
create policy "Admin operators can view payment proofs"
  on storage.objects for select to authenticated
  using (bucket_id = 'payment-proofs' and public.is_admin_operator());

drop policy if exists "Admin operators can upload payment proofs" on storage.objects;
create policy "Admin operators can upload payment proofs"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'payment-proofs' and public.is_admin_operator());

drop policy if exists "Admin operators can delete payment proofs" on storage.objects;
create policy "Admin operators can delete payment proofs"
  on storage.objects for delete to authenticated
  using (bucket_id = 'payment-proofs' and public.is_admin_operator());

-- Storage RLS on payment-receipts: Operator view/upload
drop policy if exists "Admin operators can view payment receipts" on storage.objects;
create policy "Admin operators can view payment receipts"
  on storage.objects for select to authenticated
  using (bucket_id = 'payment-receipts' and public.is_admin_operator());

drop policy if exists "Admin operators can upload payment receipts" on storage.objects;
create policy "Admin operators can upload payment receipts"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'payment-receipts' and public.is_admin_operator());
