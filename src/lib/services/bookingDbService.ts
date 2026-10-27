// =============================================================================
// bookingDbService.ts — Booking Persistence & Email Dispatch Service
// =============================================================================

import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import type { BookingFormData } from '@/types/bookingForm';
import { isPaymentEnabled, parseContactEmailRecipients, parseContactEmailCC } from '@/lib/utils/envUtils';
import {
  buildBookingClientPreviewEmail,
  buildBookingAdminNotificationEmail,
  buildBookingClientConfirmationEmail,
} from '@/lib/email';
import { logAudit } from '@/lib/services/auditService';

const UNAMBIGUOUS_CHARS = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

/**
 * Generates a human-friendly, collision-resistant booking reference.
 * Format: CAS-YYYYMM-XXXX (e.g. CAS-202610-8K4P)
 */
export function generateBookingReference(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');

  let randomCode = '';
  const randomBytes = crypto.randomBytes(4);
  for (let i = 0; i < 4; i++) {
    randomCode += UNAMBIGUOUS_CHARS[randomBytes[i] % UNAMBIGUOUS_CHARS.length];
  }

  return `CAS-${year}${month}-${randomCode}`;
}

/**
 * Sends an instant preview email exclusively to the client during email validation.
 * Includes the generated booking reference and next steps.
 */
export async function sendBookingPreviewEmail(
  formData: BookingFormData,
  existingReference?: string
): Promise<{ success: boolean; bookingReference: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const bookingReference = existingReference || generateBookingReference();

  if (!apiKey) {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        '[bookingDbService] RESEND_API_KEY not configured. Mocking preview email delivery for:',
        bookingReference,
        'to:',
        formData.clientEmail
      );
    }
    return { success: true, bookingReference };
  }

  try {
    const { subject, html } = buildBookingClientPreviewEmail(formData, bookingReference);

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: `Casamento Events <${process.env.CONTACT_EMAIL_FROM || 'onboarding@resend.dev'}>`,
        to: [formData.clientEmail],
        reply_to: process.env.CONTACT_EMAIL_FROM || 'onboarding@resend.dev',
        subject,
        html,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('[bookingDbService Preview Resend Error]:', data);
      await logAudit({
        category: 'Booking',
        action: 'Email Preview Failed',
        severity: 'Warning',
        outcome: 'Failure',
        summary: `Failed to dispatch preview email to ${formData.clientEmail} for ${bookingReference}`,
        entityType: 'booking',
        entityRef: bookingReference,
        metadata: { error: data.message || 'Resend API error' },
      });
      return {
        success: false,
        bookingReference,
        error: data.message || 'Failed to dispatch verification email.',
      };
    }

    await logAudit({
      category: 'Booking',
      action: 'Email Preview Dispatched',
      severity: 'Info',
      outcome: 'Success',
      summary: `Verification preview email dispatched to ${formData.clientEmail} for ${bookingReference}`,
      entityType: 'booking',
      entityRef: bookingReference,
      metadata: { email: formData.clientEmail },
    });

    return { success: true, bookingReference };
  } catch (err) {
    console.error('[bookingDbService Preview Error]:', err);
    await logAudit({
      category: 'Booking',
      action: 'Email Preview Exception',
      severity: 'Critical',
      outcome: 'Failure',
      summary: `Exception while sending preview email to ${formData.clientEmail} for ${bookingReference}`,
      entityType: 'booking',
      entityRef: bookingReference,
    });
    return {
      success: false,
      bookingReference,
      error: 'Internal server error while sending preview email.',
    };
  }
}

/**
 * Persists the confirmed booking to Supabase and dispatches receipts to client & Casamento team.
 */
export async function confirmAndSaveBooking(
  formData: BookingFormData,
  verifiedEmail?: string,
  existingReference?: string
): Promise<{ success: boolean; bookingReference?: string; error?: string }> {
  const clientEmail = (verifiedEmail || formData.clientEmail).trim().toLowerCase();
  const bookingReference = existingReference || generateBookingReference();
  const paymentActive = isPaymentEnabled();

  const supabase = createAdminClient();

  const insertPayload = {
    booking_reference: bookingReference,
    service_id: formData.serviceId,
    service_slug: formData.serviceSlug,
    service_title: formData.serviceTitle,
    category_slug: formData.categorySlug,
    category_title: formData.categoryTitle,
    selected_add_ons: formData.selectedAddOns || [],
    client_full_name: formData.clientFullName.trim(),
    client_email: clientEmail,
    client_phone: formData.clientPhone ? formData.clientPhone.trim() : null,
    company_name: formData.companyName ? formData.companyName.trim() : null,
    event_country: formData.eventCountry || 'PH',
    event_country_name: formData.eventCountryName || 'Philippines',
    event_date: formData.eventDate,
    is_holiday_date: Boolean(formData.isHolidayDate),
    holiday_name: formData.holidayName || null,
    venue_city: formData.venueCity.trim(),
    venue_address: formData.venueAddress ? formData.venueAddress.trim() : null,
    special_notes: formData.specialNotes ? formData.specialNotes.trim() : null,
    payment_enabled: paymentActive,
    payment_provider: paymentActive ? formData.paymentProvider : null,
    payment_status: 'undeclared',
    status: 'pending',
    email_verified_at: new Date().toISOString(),
  };

  try {
    const { error: dbError } = await supabase
      .from('bookings')
      .insert(insertPayload);

    if (dbError) {
      console.error('[bookingDbService Supabase Insert Error]:', dbError);
      return { success: false, error: 'Failed to record reservation in database.' };
    }
  } catch (err) {
    console.error('[bookingDbService DB Exception]:', err);
    return { success: false, error: 'Database service exception.' };
  }

  // Dispatch confirmation emails in parallel
  await dispatchOfficialBookingEmails(
    { ...formData, clientEmail },
    bookingReference
  );

  return {
    success: true,
    bookingReference,
  };
}

/**
 * Dispatches the official booking confirmation receipt to the client (with Casamento team CC'd)
 * and the administrative briefing sheet to the Casamento internal team.
 */
async function dispatchOfficialBookingEmails(
  formData: BookingFormData,
  bookingReference: string
) {
  const apiKey = process.env.RESEND_API_KEY;
  const teamRecipients = parseContactEmailRecipients();
  const teamCC = parseContactEmailCC();

  if (!apiKey) {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        '[bookingDbService] RESEND_API_KEY not configured. Mocking official booking emails for:',
        bookingReference,
        { toClient: formData.clientEmail, teamRecipients, teamCC }
      );
    }
    return;
  }

  const clientClean = formData.clientEmail.trim().toLowerCase();

  // Filter out the client email from CC list to prevent Resend 422 ("cannot CC the same address as to")
  const combinedCC = [...teamRecipients, ...(teamCC || [])]
    .map((e) => e.trim())
    .filter((e) => e.length > 0 && e.toLowerCase() !== clientClean);

  // 1. Client Confirmation Receipt (with Casamento team CC'd on the same thread)
  try {
    const clientEmailData = buildBookingClientConfirmationEmail(formData, bookingReference);

    const clientRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: `Casamento Events <${process.env.CONTACT_EMAIL_FROM || 'onboarding@resend.dev'}>`,
        to: [formData.clientEmail],
        cc: combinedCC.length > 0 ? combinedCC : undefined,
        reply_to: teamRecipients[0] || process.env.CONTACT_EMAIL_FROM,
        subject: clientEmailData.subject,
        html: clientEmailData.html,
      }),
    });

    if (!clientRes.ok) {
      const errData = await clientRes.json();
      console.error('[bookingDbService Client Email Resend Error]:', errData);
      await logAudit({
        category: 'Booking',
        action: 'Email Confirmation Failed',
        severity: 'Warning',
        outcome: 'Failure',
        summary: `Failed to dispatch confirmation email to client ${formData.clientEmail} for ${bookingReference}`,
        entityType: 'booking',
        entityRef: bookingReference,
        metadata: { error: errData.message || 'Resend error' },
      });
    } else {
      await logAudit({
        category: 'Booking',
        action: 'Email Confirmation Dispatched',
        severity: 'Info',
        outcome: 'Success',
        summary: `Booking confirmation receipt dispatched to ${formData.clientEmail} for ${bookingReference}`,
        entityType: 'booking',
        entityRef: bookingReference,
        metadata: { to: formData.clientEmail },
      });
    }
  } catch (clientErr) {
    console.error('[bookingDbService Client Email Error]:', clientErr);
  }

  // 2. Admin Team Detailed Briefing Sheet
  try {
    const adminEmailData = buildBookingAdminNotificationEmail(formData, bookingReference);

    const adminRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: `Casamento Events Portal <${process.env.CONTACT_EMAIL_FROM || 'onboarding@resend.dev'}>`,
        to: teamRecipients,
        cc: teamCC,
        reply_to: formData.clientEmail,
        subject: adminEmailData.subject,
        html: adminEmailData.html,
      }),
    });

    if (!adminRes.ok) {
      const errData = await adminRes.json();
      console.error('[bookingDbService Admin Email Resend Error]:', errData);
    } else {
      await logAudit({
        category: 'Booking',
        action: 'Admin Briefing Dispatched',
        severity: 'Info',
        outcome: 'Success',
        summary: `Admin briefing sheet dispatched to team recipients for ${bookingReference}`,
        entityType: 'booking',
        entityRef: bookingReference,
      });
    }
  } catch (adminErr) {
    console.error('[bookingDbService Admin Email Error]:', adminErr);
  }
}
