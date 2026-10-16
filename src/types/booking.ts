// =============================================================================
// booking.ts — Booking Domain Types
// =============================================================================

import type { SanityDocument } from './sanity';
import type { SelectedAddOn, BookingFormData } from './bookingForm';

/**
 * Raw Sanity document representation for the Booking Hero singleton (`_type: 'bookingHero'`).
 */
export interface SanityBookingHero extends SanityDocument {
  _type: 'bookingHero';
  eyebrow?: string;
  title?: string;
  description?: string;
}

/**
 * Clean frontend representation for the Booking Hero component.
 */
export interface BookingHeroContent {
  eyebrow?: string;
  title: string;
  description: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'downpayment_pending' | 'paid' | 'waived';
export type PaymentProvider = 'dragonpay' | 'paypal';

/**
 * Supabase Database Record for `public.bookings`.
 */
export interface BookingRecord {
  id: string;
  booking_reference: string;
  service_id: string;
  service_slug: string;
  service_title: string;
  category_slug: string;
  category_title: string;
  selected_add_ons: SelectedAddOn[];
  client_full_name: string;
  client_email: string;
  client_phone: string | null;
  company_name: string | null;
  event_country: string;
  event_country_name: string | null;
  event_date: string;
  is_holiday_date: boolean;
  holiday_name: string | null;
  venue_city: string;
  venue_address: string | null;
  special_notes: string | null;
  payment_enabled: boolean;
  payment_provider: PaymentProvider | null;
  payment_status: PaymentStatus;
  status: BookingStatus;
  rejection_reason?: string | null;
  admin_notes?: string | null;
  decision_by?: string | null;
  decision_at?: string | null;
  is_archived?: boolean;
  cancelled_at?: string | null;
  email_verified_at: string;
  created_at: string;
  updated_at: string;
}

/**
 * Filter parameters for querying bookings in admin views.
 */
export interface AdminBookingFilters {
  status?: BookingStatus | 'all';
  search?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Payload for updating booking details by an administrator.
 */
export interface AdminUpdateBookingPayload {
  client_full_name?: string;
  client_email?: string;
  client_phone?: string | null;
  company_name?: string | null;
  event_date?: string;
  venue_city?: string;
  venue_address?: string | null;
  special_notes?: string | null;
  admin_notes?: string | null;
}

/**
 * Action payload sent to `/api/booking`.
 */
export interface BookingApiRequest {
  action: 'send_preview_email' | 'confirm_booking';
  formData: BookingFormData;
  verifiedEmail?: string;
}

/**
 * Response structure returned by `/api/booking`.
 */
export interface BookingApiResponse {
  success: boolean;
  bookingReference?: string;
  message?: string;
  error?: string;
}
