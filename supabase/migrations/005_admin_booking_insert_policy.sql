-- =============================================================================
-- Migration: 005_admin_booking_insert_policy.sql
-- Description: Adds RLS policy to allow active authenticated administrators
--              to insert new booking events directly into public.bookings.
-- =============================================================================

-- 1. RLS Policy for Active Admins to insert bookings
drop policy if exists "Active admins can insert bookings" on public.bookings;
create policy "Active admins can insert bookings"
  on public.bookings
  for insert
  to authenticated
  with check (public.is_active_admin());
