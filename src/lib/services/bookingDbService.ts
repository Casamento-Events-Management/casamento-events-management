// =============================================================================
// bookingDbService.ts — Booking Persistence & Email Dispatch Service
// =============================================================================

import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import type { BookingFormData } from '@/types/bookingForm';
import type { BookingRecord } from '@/types/booking';
import { isPaymentEnabled, parseContactEmailRecipients, parseContactEmailCC } from '@/lib/utils/envUtils';
import {
  buildBookingClientPreviewEmail,
  buildBookingAdminNotificationEmail,
  buildBookingClientConfirmationEmail,
} from '@/lib/email';

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
 */
export async function sendBookingPreviewEmail(
  formData: BookingFormData
): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        '[bookingDbService] RESEND_API_KEY not configured. Mocking preview email delivery to:',
        formData.clientEmail
      );
    }
    return { success: true };
  }

  try {
    const { subject, html } = buildBookingClientPreviewEmail(formData);

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
      return { success: false, error: data.message || 'Failed to dispatch verification email.' };
    }

    return { success: true };
  } catch (err) {
    console.error('[bookingDbService Preview Error]:', err);
    return { success: false, error: 'Internal server error while dispatching preview email.' };
  }
}

/**
 * Persists the confirmed booking to Supabase and dispatches receipts to client & Casamento team.
 */
export async function confirmAndSaveBooking(
  formData: BookingFormData,
  verifiedEmail?: string
): Promise<{ success: boolean; bookingReference?: string; error?: string }> {
  const clientEmail = (verifiedEmail || formData.clientEmail).trim().toLowerCase();
  const bookingReference = generateBookingReference();
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
    payment_status: 'unpaid',
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

  // 1. Client Confirmation Receipt (with Casamento team CC'd for shared email thread)
  try {
    const clientEmailData = buildBookingClientConfirmationEmail(formData, bookingReference);
    const combinedCC = [...teamRecipients, ...(teamCC || [])];

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: `Casamento Events <${process.env.CONTACT_EMAIL_FROM || 'onboarding@resend.dev'}>`,
        to: [formData.clientEmail],
        cc: combinedCC.length > 0 ? combinedCC : undefined,
        reply_to: combinedCC[0] || process.env.CONTACT_EMAIL_FROM,
        subject: clientEmailData.subject,
        html: clientEmailData.html,
      }),
    });
  } catch (clientErr) {
    console.error('[bookingDbService Client Email Error]:', clientErr);
  }

  // 2. Admin Team Detailed Briefing Sheet
  try {
    const adminEmailData = buildBookingAdminNotificationEmail(formData, bookingReference);

    await fetch('https://api.resend.com/emails', {
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
  } catch (adminErr) {
    console.error('[bookingDbService Admin Email Error]:', adminErr);
  }
}
