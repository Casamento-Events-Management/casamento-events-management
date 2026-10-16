// =============================================================================
// lib/services/admin-booking-actions.ts — Server Actions for Booking Decisions
// =============================================================================

'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentActiveAdmin } from '@/lib/services/adminProfileService';
import { logAudit } from '@/lib/services/auditService';
import {
  buildBookingClientAcceptedEmail,
  buildBookingClientRejectedEmail,
  buildBookingClientUpdatedEmail,
} from '@/lib/email';
import { parseContactEmailRecipients, parseContactEmailCC } from '@/lib/utils/envUtils';
import type { BookingRecord, AdminUpdateBookingPayload } from '@/types/booking';

const updateBookingSchema = z.object({
  client_full_name: z.string().min(1, 'Client full name is required').optional(),
  client_email: z.string().email('Valid email is required').optional(),
  client_phone: z.string().nullable().optional(),
  company_name: z.string().nullable().optional(),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
  venue_city: z.string().min(1, 'Venue city is required').optional(),
  venue_address: z.string().nullable().optional(),
  special_notes: z.string().nullable().optional(),
  admin_notes: z.string().nullable().optional(),
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
