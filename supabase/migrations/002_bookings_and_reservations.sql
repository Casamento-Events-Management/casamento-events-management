-- =============================================================================
-- Migration: 002_bookings_and_reservations.sql
-- Description: Sets up the public.bookings table, indexes, and admin RLS policies.
-- =============================================================================

-- 1. Create bookings table
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_reference text not null unique,
  
  -- Service Details
  service_id text not null,
  service_slug text not null,
  service_title text not null,
  category_slug text not null,
  category_title text not null,
  selected_add_ons jsonb default '[]'::jsonb,
  
  -- Client & Contact Info
  client_full_name text not null,
  client_email text not null,
  client_phone text, -- Nullable contact phone
  company_name text,
  
  -- Event Details
  event_country text not null default 'PH',
  event_country_name text,
  event_date date not null,
  is_holiday_date boolean not null default false,
  holiday_name text,
  venue_city text not null,
  venue_address text,
  special_notes text,
  
  -- Payment & Status Flags
  payment_enabled boolean not null default false,
  payment_provider text check (payment_provider in ('dragonpay', 'paypal') or payment_provider is null),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'downpayment_pending', 'paid', 'waived')),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  
  -- Verification & Audit Timestamps
  email_verified_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Indexes for efficient lookup & dashboard queries
create index if not exists idx_bookings_reference on public.bookings(booking_reference);
create index if not exists idx_bookings_client_email on public.bookings(client_email);
create index if not exists idx_bookings_event_date on public.bookings(event_date desc);
create index if not exists idx_bookings_status on public.bookings(status);
create index if not exists idx_bookings_created_at on public.bookings(created_at desc);

-- 3. Enable Row Level Security (RLS)
alter table public.bookings enable row level security;

-- 4. RLS Policies for Authenticated Active Admins
drop policy if exists "Active admins can view all bookings" on public.bookings;
create policy "Active admins can view all bookings"
  on public.bookings
  for select
  to authenticated
  using (public.is_active_admin());

drop policy if exists "Active admins can update bookings" on public.bookings;
create policy "Active admins can update bookings"
  on public.bookings
  for update
  to authenticated
  using (public.is_active_admin())
  with check (public.is_active_admin());

drop policy if exists "Active admins can delete bookings" on public.bookings;
create policy "Active admins can delete bookings"
  on public.bookings
  for delete
  to authenticated
  using (public.is_active_admin());
