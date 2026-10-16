// =============================================================================
// adminBookingService.ts — Server-Side Query Service for Admin Bookings
// =============================================================================

import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { getCurrentActiveAdmin } from '@/lib/services/adminProfileService';
import type { BookingRecord, AdminBookingFilters } from '@/types/booking';

export interface AdminBookingsResponse {
  bookings: BookingRecord[];
  totalCount: number;
  pendingCount: number;
  page: number;
  pageSize: number;
}

/**
 * Fetches bookings with filtering, pagination, and pending count.
 * Exclusively executed on the server in Server Components.
 */
export async function getAdminBookings(
  filters: AdminBookingFilters = {}
): Promise<AdminBookingsResponse> {
  const adminData = await getCurrentActiveAdmin();
  if (!adminData) {
    throw new Error('Unauthorized. Active admin session required.');
  }

  const supabase = await createClient();
  const page = Math.max(1, filters.page || 1);
  const pageSize = Math.max(1, Math.min(50, filters.pageSize || 15));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // 1. Pending count for badge
  const { count: pendingCount } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')
    .eq('is_archived', false);

  // 2. Query bookings with filters
  let query = supabase
    .from('bookings')
    .select('*', { count: 'exact' })
    .eq('is_archived', false)
    .order('created_at', { ascending: false });

  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters.search && filters.search.trim().length > 0) {
    const term = `%${filters.search.trim()}%`;
    query = query.or(
      `booking_reference.ilike.${term},client_full_name.ilike.${term},client_email.ilike.${term},service_title.ilike.${term},venue_city.ilike.${term}`
    );
  }

  const { data, count, error } = await query.range(from, to);

  if (error) {
    console.error('[adminBookingService getAdminBookings Error]:', error);
    throw new Error('Failed to load bookings from database.');
  }

  return {
    bookings: (data || []) as BookingRecord[],
    totalCount: count || 0,
    pendingCount: pendingCount || 0,
    page,
    pageSize,
  };
}
