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
export type PaymentStatus = 'unpaid' | 'downpayment_pending' | 'partially_paid' | 'paid' | 'refunded' | 'waived';
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
  agreed_total_centavos?: number | null;
  agreed_total_currency?: string;
  agreed_total_set_at?: string | null;
  agreed_total_set_by?: string | null;
  agreed_total_notes?: string | null;
  rejection_reason?: string | null;
  admin_notes?: string | null;
  decision_by?: string | null;
  decision_at?: string | null;
  is_archived?: boolean;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
  cancelled_by?: string | null;
  completed_at?: string | null;
  completed_by?: string | null;
  completion_notes?: string | null;
  reminder_7d_sent_at?: string | null;
  rescheduled_from_date?: string | null;
  email_verified_at: string;
  created_at: string;
  updated_at: string;
}

/**
 * Task item associated with a specific event.
 */
export interface EventTask {
  id: string;
  booking_id: string;
  title: string;
  assignee_name?: string | null;
  assignee_id?: string | null;
  assignee_ids?: string[];
  assignee_names?: string[];
  due_date?: string | null;
  due_time?: string | null;
  notified_at?: string | null;
  is_done: boolean;
  completed_at?: string | null;
  is_cancelled?: boolean;
  cancelled_at?: string | null;
  cancelled_by?: string | null;
  cancellation_reason?: string | null;
  created_by?: string | null;
  creator_name?: string | null;
  created_at: string;
  updated_at: string;
  booking?: {
    id: string;
    booking_reference: string;
    service_title: string;
    event_date: string;
    client_full_name: string;
    venue_city: string;
    status: string;
  };
}

/**
 * In-dashboard notification for administrators.
 */
export interface AdminNotification {
  id: string;
  booking_id?: string | null;
  type: 'reminder_7d' | 'event_rescheduled' | 'event_cancelled' | 'task_due' | string;
  title: string;
  message: string;
  is_read: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
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
  event_country?: string;
  event_country_name?: string | null;
  event_date?: string;
  venue_city?: string;
  venue_address?: string | null;
  special_notes?: string | null;
  admin_notes?: string | null;
}

/**
 * Payload for manually creating a new event/booking from the admin portal.
 */
export interface AdminCreateBookingInput {
  client_full_name: string;
  client_email: string;
  client_phone?: string | null;
  company_name?: string | null;
  service_title: string;
  category_title: string;
  add_ons_text?: string | null;
  event_country?: string;
  event_country_name?: string | null;
  event_date: string;
  venue_city: string;
  venue_address?: string | null;
  special_notes?: string | null;
  admin_notes?: string | null;
  status?: BookingStatus;
  agreed_total_pesos?: number | null;
  agreed_total_notes?: string | null;
  send_agreed_total_email?: boolean;
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

/**
 * Payload for marking an event completed/done.
 */
export interface CompleteBookingInput {
  bookingId: string;
  completionNotes?: string;
  autoCompletePendingTasks?: boolean;
  notifyClient?: boolean;
  clientThankYouMessage?: string;
}

/**
 * Payload for reopening a mistakenly completed event.
 */
export interface ReopenBookingInput {
  bookingId: string;
  reason?: string;
}
