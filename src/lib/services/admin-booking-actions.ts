// =============================================================================
// lib/services/admin-booking-actions.ts — Server Actions for Booking Decisions
// =============================================================================

'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentActiveAdmin } from '@/lib/services/adminProfileService';
import { logAudit } from '@/lib/services/auditService';
import {
  buildBookingClientAcceptedEmail,
  buildBookingClientRejectedEmail,
  buildBookingClientUpdatedEmail,
} from '@/lib/email';
import { parseContactEmailRecipients, parseContactEmailCC } from '@/lib/utils/envUtils';
import { generateBookingReference } from '@/lib/services/bookingDbService';
import { checkCountryHoliday } from '@/lib/utils/holidayUtils';
import type { BookingRecord, AdminUpdateBookingPayload, AdminCreateBookingInput } from '@/types/booking';

const updateBookingSchema = z.object({
  client_full_name: z.string().min(1, 'Client full name is required').optional(),
  client_email: z.string().email('Valid email is required').optional(),
  client_phone: z.string().nullable().optional(),
  company_name: z.string().nullable().optional(),
  event_country: z.string().optional(),
  event_country_name: z.string().nullable().optional(),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
  venue_city: z.string().min(1, 'Target Venue Address is required').optional(),
  venue_address: z.string().nullable().optional(),
  special_notes: z.string().nullable().optional(),
  admin_notes: z.string().nullable().optional(),
});

const createBookingSchema = z.object({
  client_full_name: z.string().min(1, 'Client full name is required'),
  client_email: z.string().email('Valid email is required'),
  client_phone: z.string().nullable().optional(),
  company_name: z.string().nullable().optional(),
  service_title: z.string().min(1, 'Service title is required'),
  category_title: z.string().min(1, 'Category is required'),
  add_ons_text: z.string().nullable().optional(),
  event_country: z.string().default('PH'),
  event_country_name: z.string().nullable().optional(),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  venue_city: z.string().min(1, 'Target Venue Address is required'),
  venue_address: z.string().nullable().optional(),
  special_notes: z.string().nullable().optional(),
  admin_notes: z.string().nullable().optional(),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).default('pending'),
});

/**
 * Dispatches an email via Resend to the client with Casamento team CC'd.
 */
async function dispatchClientEmail(
  clientEmail: string,
  subject: string,
  html: string,
  bookingRef: string
): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const teamRecipients = parseContactEmailRecipients();
  const teamCC = parseContactEmailCC();

  if (!apiKey) {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        '[adminBookingActions] RESEND_API_KEY not configured. Mocking client email delivery for:',
        bookingRef,
        'to:',
        clientEmail
      );
    }
    return { success: true };
  }

  const clientClean = clientEmail.trim().toLowerCase();
  const combinedCC = [...teamRecipients, ...(teamCC || [])]
    .map((e) => e.trim())
    .filter((e) => e.length > 0 && e.toLowerCase() !== clientClean);

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: `Casamento Events <${process.env.CONTACT_EMAIL_FROM || 'onboarding@resend.dev'}>`,
        to: [clientEmail],
        cc: combinedCC.length > 0 ? combinedCC : undefined,
        reply_to: teamRecipients[0] || process.env.CONTACT_EMAIL_FROM,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      console.error('[adminBookingActions Resend Error]:', data);
      return { success: false, error: data.message || 'Failed to dispatch email' };
    }

    return { success: true };
  } catch (err) {
    console.error('[adminBookingActions Resend Exception]:', err);
    return { success: false, error: 'Email service exception' };
  }
}

/**
 * Accepts a booking, setting status to 'confirmed' and optionally notifying the client.
 */
export async function acceptBookingAction(params: {
  bookingId: string;
  notifyClient: boolean;
  adminMessage?: string;
}): Promise<{ success: boolean; error?: string; booking?: BookingRecord }> {
  const adminData = await getCurrentActiveAdmin();
  if (!adminData) {
    return { success: false, error: 'Unauthorized: Active admin session required.' };
  }

  const supabase = await createClient();

  // Fetch current booking
  const { data: currentBooking, error: fetchError } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', params.bookingId)
    .single();

  if (fetchError || !currentBooking) {
    return { success: false, error: 'Booking reservation not found.' };
  }

  const now = new Date().toISOString();
  const { data: updatedBooking, error: updateError } = await supabase
    .from('bookings')
    .update({
      status: 'confirmed',
      decision_at: now,
      decision_by: adminData.user.id,
      updated_at: now,
    })
    .eq('id', params.bookingId)
    .select('*')
    .single();

  if (updateError || !updatedBooking) {
    console.error('[adminBookingActions Accept Error]:', updateError);
    return { success: false, error: 'Failed to update booking status.' };
  }

  // Audit Log
  await logAudit({
    actorUserId: adminData.user.id,
    actorCode: adminData.profile.user_code,
    actorName: adminData.profile.full_name,
    actorEmail: adminData.user.email,
    actorType: 'admin',
    category: 'Booking',
    action: 'Accept',
    severity: 'Info',
    outcome: 'Success',
    summary: `${adminData.profile.full_name} accepted booking ${currentBooking.booking_reference}`,
    entityType: 'booking',
    entityId: currentBooking.id,
    entityRef: currentBooking.booking_reference,
    changes: {
      status: { old: currentBooking.status, new: 'confirmed' },
    },
    metadata: {
      notifyClient: params.notifyClient,
      service: currentBooking.service_title,
      eventDate: currentBooking.event_date,
    },
  });

  // Client Email Dispatch
  if (params.notifyClient) {
    const { subject, html } = buildBookingClientAcceptedEmail(
      updatedBooking as BookingRecord,
      params.adminMessage
    );

    const emailResult = await dispatchClientEmail(
      currentBooking.client_email,
      subject,
      html,
      currentBooking.booking_reference
    );

    if (emailResult.success) {
      await logAudit({
        actorUserId: adminData.user.id,
        actorCode: adminData.profile.user_code,
        actorName: adminData.profile.full_name,
        actorEmail: adminData.user.email,
        actorType: 'admin',
        category: 'Booking',
        action: 'Email Accepted Dispatched',
        severity: 'Info',
        outcome: 'Success',
        summary: `Confirmation acceptance email sent to ${currentBooking.client_email} for ${currentBooking.booking_reference}`,
        entityType: 'booking',
        entityRef: currentBooking.booking_reference,
      });
    }
  }

  revalidatePath('/admin/bookings');
  return { success: true, booking: updatedBooking as BookingRecord };
}

/**
 * Rejects a booking request with a mandatory reason and soft-cancels the reservation.
 */
export async function rejectBookingAction(params: {
  bookingId: string;
  reason: string;
  notifyClient: boolean;
}): Promise<{ success: boolean; error?: string; booking?: BookingRecord }> {
  const adminData = await getCurrentActiveAdmin();
  if (!adminData) {
    return { success: false, error: 'Unauthorized: Active admin session required.' };
  }

  const cleanReason = params.reason.trim();
  if (!cleanReason) {
    return { success: false, error: 'A clear reason for rejection is required.' };
  }

  const supabase = await createClient();

  const { data: currentBooking, error: fetchError } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', params.bookingId)
    .single();

  if (fetchError || !currentBooking) {
    return { success: false, error: 'Booking reservation not found.' };
  }

  const now = new Date().toISOString();
  const { data: updatedBooking, error: updateError } = await supabase
    .from('bookings')
    .update({
      status: 'cancelled',
      rejection_reason: cleanReason,
      cancelled_at: now,
      decision_at: now,
      decision_by: adminData.user.id,
      updated_at: now,
    })
    .eq('id', params.bookingId)
    .select('*')
    .single();

  if (updateError || !updatedBooking) {
    console.error('[adminBookingActions Reject Error]:', updateError);
    return { success: false, error: 'Failed to record booking rejection.' };
  }

  // Audit Log
  await logAudit({
    actorUserId: adminData.user.id,
    actorCode: adminData.profile.user_code,
    actorName: adminData.profile.full_name,
    actorEmail: adminData.user.email,
    actorType: 'admin',
    category: 'Booking',
    action: 'Reject',
    severity: 'Warning',
    outcome: 'Success',
    summary: `${adminData.profile.full_name} rejected booking ${currentBooking.booking_reference} (Reason: ${cleanReason})`,
    entityType: 'booking',
    entityId: currentBooking.id,
    entityRef: currentBooking.booking_reference,
    changes: {
      status: { old: currentBooking.status, new: 'cancelled' },
      rejection_reason: { old: currentBooking.rejection_reason, new: cleanReason },
    },
    metadata: {
      reason: cleanReason,
      notifyClient: params.notifyClient,
    },
  });

  // Client Email Dispatch
  if (params.notifyClient) {
    const { subject, html } = buildBookingClientRejectedEmail(
      updatedBooking as BookingRecord,
      cleanReason
    );

    const emailResult = await dispatchClientEmail(
      currentBooking.client_email,
      subject,
      html,
      currentBooking.booking_reference
    );

    if (emailResult.success) {
      await logAudit({
        actorUserId: adminData.user.id,
        actorCode: adminData.profile.user_code,
        actorName: adminData.profile.full_name,
        actorEmail: adminData.user.email,
        actorType: 'admin',
        category: 'Booking',
        action: 'Email Rejection Dispatched',
        severity: 'Info',
        outcome: 'Success',
        summary: `Rejection notice email sent to ${currentBooking.client_email} for ${currentBooking.booking_reference}`,
        entityType: 'booking',
        entityRef: currentBooking.booking_reference,
      });
    }
  }

  revalidatePath('/admin/bookings');
  return { success: true, booking: updatedBooking as BookingRecord };
}

/**
 * Updates booking details with change detection and optional client notification.
 */
export async function updateBookingDetailsAction(params: {
  bookingId: string;
  updates: AdminUpdateBookingPayload;
  notifyClient: boolean;
  adminMessage?: string;
}): Promise<{ success: boolean; error?: string; booking?: BookingRecord }> {
  const adminData = await getCurrentActiveAdmin();
  if (!adminData) {
    return { success: false, error: 'Unauthorized: Active admin session required.' };
  }

  const parsed = updateBookingSchema.safeParse(params.updates);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Invalid form input.' };
  }

  const supabase = await createClient();

  const { data: currentBooking, error: fetchError } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', params.bookingId)
    .single();

  if (fetchError || !currentBooking) {
    return { success: false, error: 'Booking reservation not found.' };
  }

  // Calculate field diffs
  const changes: Record<string, { old: unknown; new: unknown }> = {};
  const cleanUpdates: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(parsed.data)) {
    if (value !== undefined && value !== (currentBooking as Record<string, unknown>)[key]) {
      changes[key] = {
        old: (currentBooking as Record<string, unknown>)[key],
        new: value,
      };
      cleanUpdates[key] = value;
    }
  }

  if (Object.keys(cleanUpdates).length === 0) {
    return { success: true, booking: currentBooking as BookingRecord };
  }

  // Recalculate holiday status if event date or country changes
  if (cleanUpdates.event_date || cleanUpdates.event_country) {
    const targetDate = (cleanUpdates.event_date as string) || currentBooking.event_date;
    const targetCountry = (cleanUpdates.event_country as string) || currentBooking.event_country || 'PH';
    const holidayCheck = checkCountryHoliday(targetDate, targetCountry);
    cleanUpdates.is_holiday_date = holidayCheck.isHoliday;
    cleanUpdates.holiday_name = holidayCheck.name || null;
  }

  cleanUpdates.updated_at = new Date().toISOString();

  const { data: updatedBooking, error: updateError } = await supabase
    .from('bookings')
    .update(cleanUpdates)
    .eq('id', params.bookingId)
    .select('*')
    .single();

  if (updateError || !updatedBooking) {
    console.error('[adminBookingActions Update Error]:', updateError);
    return { success: false, error: 'Failed to save updated booking details.' };
  }

  // Audit Log
  await logAudit({
    actorUserId: adminData.user.id,
    actorCode: adminData.profile.user_code,
    actorName: adminData.profile.full_name,
    actorEmail: adminData.user.email,
    actorType: 'admin',
    category: 'Booking',
    action: 'Update Details',
    severity: changes.event_date ? 'Warning' : 'Info',
    outcome: 'Success',
    summary: `${adminData.profile.full_name} updated details for ${currentBooking.booking_reference}`,
    entityType: 'booking',
    entityId: currentBooking.id,
    entityRef: currentBooking.booking_reference,
    changes,
    metadata: {
      notifyClient: params.notifyClient,
    },
  });

  // Client Email Dispatch if explicitly requested
  if (params.notifyClient) {
    const targetEmail = (cleanUpdates.client_email as string) || currentBooking.client_email;
    const { subject, html } = buildBookingClientUpdatedEmail(
      updatedBooking as BookingRecord,
      params.adminMessage
    );

    const emailResult = await dispatchClientEmail(
      targetEmail,
      subject,
      html,
      currentBooking.booking_reference
    );

    if (emailResult.success) {
      await logAudit({
        actorUserId: adminData.user.id,
        actorCode: adminData.profile.user_code,
        actorName: adminData.profile.full_name,
        actorEmail: adminData.user.email,
        actorType: 'admin',
        category: 'Booking',
        action: 'Email Update Dispatched',
        severity: 'Info',
        outcome: 'Success',
        summary: `Update notification email sent to ${targetEmail} for ${currentBooking.booking_reference}`,
        entityType: 'booking',
        entityRef: currentBooking.booking_reference,
      });
    }
  }

  revalidatePath('/admin/bookings');
  return { success: true, booking: updatedBooking as BookingRecord };
}

/**
 * Creates a new booking event directly from the admin dashboard.
 */
export async function createBookingAction(
  input: AdminCreateBookingInput
): Promise<{ success: boolean; error?: string; booking?: BookingRecord }> {
  const adminData = await getCurrentActiveAdmin();
  if (!adminData) {
    return { success: false, error: 'Unauthorized: Active admin session required.' };
  }

  const parsed = createBookingSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Invalid form input.' };
  }

  const data = parsed.data;
  const supabaseAdmin = createAdminClient();
  const bookingReference = generateBookingReference();

  const addOnsArray = data.add_ons_text
    ? data.add_ons_text
        .split(/[,;\n]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map((title, idx) => ({ id: `addon-${idx + 1}`, title }))
    : [];

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const now = new Date().toISOString();
  const holidayCheck = checkCountryHoliday(data.event_date, data.event_country || 'PH');

  const insertPayload = {
    booking_reference: bookingReference,
    service_id: `custom-${slugify(data.service_title) || 'event'}`,
    service_slug: slugify(data.service_title) || 'event',
    service_title: data.service_title.trim(),
    category_slug: slugify(data.category_title) || 'custom',
    category_title: data.category_title.trim(),
    selected_add_ons: addOnsArray,
    client_full_name: data.client_full_name.trim(),
    client_email: data.client_email.trim().toLowerCase(),
    client_phone: data.client_phone ? data.client_phone.trim() : null,
    company_name: data.company_name ? data.company_name.trim() : null,
    event_country: data.event_country || 'PH',
    event_country_name: data.event_country_name || (data.event_country === 'PH' ? 'Philippines' : data.event_country),
    event_date: data.event_date,
    is_holiday_date: holidayCheck.isHoliday,
    holiday_name: holidayCheck.name || null,
    venue_city: data.venue_city.trim(),
    venue_address: data.venue_address ? data.venue_address.trim() : null,
    special_notes: data.special_notes ? data.special_notes.trim() : null,
    admin_notes: data.admin_notes ? data.admin_notes.trim() : null,
    status: data.status || 'pending',
    payment_status: 'unpaid',
    payment_enabled: false,
    email_verified_at: now,
    created_at: now,
    updated_at: now,
  };

  const { data: createdBooking, error: insertError } = await supabaseAdmin
    .from('bookings')
    .insert(insertPayload)
    .select('*')
    .single();

  if (insertError || !createdBooking) {
    console.error('[adminBookingActions Create Error]:', insertError);
    return { success: false, error: 'Failed to create booking in database.' };
  }

  await logAudit({
    actorUserId: adminData.user.id,
    actorCode: adminData.profile.user_code,
    actorName: adminData.profile.full_name,
    actorEmail: adminData.user.email,
    actorType: 'admin',
    category: 'Booking',
    action: 'Create',
    severity: 'Info',
    outcome: 'Success',
    summary: `${adminData.profile.full_name} created new event booking ${bookingReference} for ${data.client_full_name}`,
    entityType: 'booking',
    entityId: createdBooking.id,
    entityRef: bookingReference,
    metadata: {
      service: data.service_title,
      eventDate: data.event_date,
      status: data.status,
    },
  });

  revalidatePath('/admin/bookings');
  return { success: true, booking: createdBooking as BookingRecord };
}

/**
 * Fetches the latest authoritative stored data for a specific booking by ID directly from Supabase.
 */
export async function getBookingByIdAction(bookingId: string): Promise<{
  success: boolean;
  error?: string;
  booking?: BookingRecord;
}> {
  const adminData = await getCurrentActiveAdmin();
  if (!adminData) {
    return { success: false, error: 'Unauthorized: Active admin session required.' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  if (error || !data) {
    return { success: false, error: 'Target booking not found.' };
  }

  return { success: true, booking: data as BookingRecord };
}
