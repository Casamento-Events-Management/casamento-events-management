// =============================================================================
// event-reminder-service.ts — Automated 7-Day Event Reminders & Notification Engine
// =============================================================================

import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import type { BookingRecord } from '@/types/booking';
import { parseContactEmailRecipients, parseContactEmailCC } from '@/lib/utils/envUtils';
import { buildBookingClientReminderEmail, buildBookingAdminReminderEmail } from '@/lib/email';
import { logAudit } from '@/lib/services/auditService';
import { calculateDaysRemaining } from '@/lib/utils/dateUtils';

/**
 * Dispatches an email via Resend to the specified recipient.
 */
async function sendEmail(
  to: string[],
  subject: string,
  html: string,
  cc?: string[]
): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const teamRecipients = parseContactEmailRecipients();

  if (!apiKey) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[eventReminderService] RESEND_API_KEY missing. Mocked email:', { to, subject });
    }
    return { success: true };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: `Casamento Events <${process.env.CONTACT_EMAIL_FROM || 'onboarding@resend.dev'}>`,
        to,
        cc: cc && cc.length > 0 ? cc : undefined,
        reply_to: teamRecipients[0] || process.env.CONTACT_EMAIL_FROM,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      console.error('[eventReminderService Resend Error]:', data);
      return { success: false, error: data.message || 'Failed to dispatch email' };
    }

    return { success: true };
  } catch (err) {
    console.error('[eventReminderService Resend Exception]:', err);
    return { success: false, error: 'Email service exception' };
  }
}

/**
 * Dispatches the reminder notice for a confirmed booking:
 * 1. Emails client.
 * 2. Emails Casamento team.
 * 3. Creates in-dashboard admin notification.
 * 4. Sets reminder_7d_sent_at to prevent duplicate notifications.
 */
export async function dispatchReminderNoticeForBooking(
  booking: BookingRecord,
  daysLeft: number
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();
  const teamRecipients = parseContactEmailRecipients();
  const teamCC = parseContactEmailCC();

  // 1. Client Email
  const clientEmailData = buildBookingClientReminderEmail(booking, daysLeft);
  await sendEmail([booking.client_email], clientEmailData.subject, clientEmailData.html);

  // 2. Admin Team Email
  if (teamRecipients.length > 0) {
    const adminEmailData = buildBookingAdminReminderEmail(booking, daysLeft);
    await sendEmail(teamRecipients, adminEmailData.subject, adminEmailData.html, teamCC);
  }

  // 3. Create in-dashboard admin notification
  await supabase.from('admin_notifications').insert({
    booking_id: booking.id,
    type: 'reminder_7d',
    title: `Event in ${daysLeft} ${daysLeft === 1 ? 'Day' : 'Days'}`,
    message: `Event ${booking.booking_reference} (${booking.service_title}) for ${booking.client_full_name} is scheduled on ${booking.event_date}.`,
    metadata: {
      daysLeft,
      eventDate: booking.event_date,
      serviceTitle: booking.service_title,
    },
  });

  // 4. Update booking with reminder_7d_sent_at to guarantee zero duplicates
  const now = new Date().toISOString();
  await supabase
    .from('bookings')
    .update({
      reminder_7d_sent_at: now,
      updated_at: now,
    })
    .eq('id', booking.id);

  // 5. Record Audit Trail
  await logAudit({
    actorUserId: null,
    actorCode: 'SYS-REMINDER',
    actorName: 'Automated Reminder Engine',
    actorEmail: null,
    actorType: 'system',
    category: 'Booking',
    action: 'Reminder Notice Dispatched',
    severity: 'Info',
    outcome: 'Success',
    summary: `7-Day reminder dispatched to ${booking.client_email} and team for ${booking.booking_reference}`,
    entityType: 'booking',
    entityId: booking.id,
    entityRef: booking.booking_reference,
    metadata: {
      daysLeft,
      eventDate: booking.event_date,
    },
  });

  return { success: true };
}

/**
 * Daily check: queries confirmed events reaching the 7-day threshold and dispatches notices.
 * Executed once daily by the scheduled cron endpoint.
 */
export async function checkAndDispatch7DayReminders(): Promise<{
  processedCount: number;
  errors: string[];
}> {
  const supabase = createAdminClient();

  // Query confirmed events that are not archived and haven't had their 7-day reminder sent yet
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('status', 'confirmed')
    .eq('is_archived', false)
    .is('reminder_7d_sent_at', null);

  if (error || !bookings) {
    console.error('[eventReminderService] Failed to query bookings:', error);
    return { processedCount: 0, errors: [error?.message || 'Database query error'] };
  }

  let processedCount = 0;
  const errors: string[] = [];

  for (const item of bookings) {
    const booking = item as BookingRecord;
    const daysLeft = calculateDaysRemaining(booking.event_date);

    // Target events that are 7 days away or less (between 0 and 7 days)
    if (daysLeft >= 0 && daysLeft <= 7) {
      try {
        await dispatchReminderNoticeForBooking(booking, daysLeft);
        processedCount++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown reminder dispatch error';
        errors.push(`Booking ${booking.booking_reference}: ${msg}`);
      }
    }
  }

  return { processedCount, errors };
}

/**
 * Triggers an immediate reminder check when a booking is confirmed or rescheduled with <= 7 days left.
 */
export async function triggerImmediateReminderIfApplicable(
  booking: BookingRecord
): Promise<void> {
  if (booking.status !== 'confirmed' || booking.is_archived || booking.reminder_7d_sent_at) {
    return;
  }

  const daysLeft = calculateDaysRemaining(booking.event_date);
  if (daysLeft >= 0 && daysLeft <= 7) {
    try {
      await dispatchReminderNoticeForBooking(booking, daysLeft);
    } catch (err) {
      console.error('[eventReminderService] Immediate reminder failed for:', booking.booking_reference, err);
    }
  }
}
