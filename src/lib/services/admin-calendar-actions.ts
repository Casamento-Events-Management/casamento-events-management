// =============================================================================
// admin-calendar-actions.ts — Server Actions for Calendar Events & Tasks
// =============================================================================

'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentActiveAdmin } from '@/lib/services/adminProfileService';
import type { BookingRecord, EventTask } from '@/types/booking';
import { checkCountryHoliday } from '@/lib/utils/holidayUtils';
import { logAudit } from '@/lib/services/auditService';
import {
  buildBookingClientRescheduledEmail,
  buildBookingClientCancelledEmail,
} from '@/lib/email';
import { triggerImmediateReminderIfApplicable } from '@/lib/services/event-reminder-service';
import { parseContactEmailRecipients, parseContactEmailCC } from '@/lib/utils/envUtils';

/**
 * Dispatches an email to the client using Resend.
 */
async function sendClientEmail(
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
      console.log('[calendarActions] Mocking email delivery for:', bookingRef, 'to:', clientEmail);
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
      console.error('[calendarActions Resend Error]:', data);
      return { success: false, error: data.message || 'Failed to dispatch email' };
    }

    return { success: true };
  } catch (err) {
    console.error('[calendarActions Resend Exception]:', err);
    return { success: false, error: 'Email service exception' };
  }
}

/**
 * Reschedules a booked event, updating event_date and holiday status.
 * Optionally emails client and immediately checks the 7-day reminder trigger.
 */
export async function rescheduleEventAction(params: {
  bookingId: string;
  newDate: string;
  reason?: string;
  notifyClient: boolean;
}): Promise<{ success: boolean; error?: string; booking?: BookingRecord }> {
  const adminData = await getCurrentActiveAdmin();
  if (!adminData) {
    return { success: false, error: 'Unauthorized: Active admin session required.' };
  }

  const supabase = await createClient();

  // Fetch current booking
  const { data: currentBooking, error: fetchErr } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', params.bookingId)
    .single();

  if (fetchErr || !currentBooking) {
    return { success: false, error: 'Booking reservation not found.' };
  }

  const oldDate = currentBooking.event_date;
  const newDate = params.newDate;

  // Calculate country-aware holiday status for the new date
  const holidayCheck = checkCountryHoliday(newDate, currentBooking.event_country || 'PH');
  const now = new Date().toISOString();

  // Update booking record
  const { data: updatedBooking, error: updateErr } = await supabase
    .from('bookings')
    .update({
      event_date: newDate,
      rescheduled_from_date: oldDate,
      is_holiday_date: holidayCheck.isHoliday,
      holiday_name: holidayCheck.name || null,
      reminder_7d_sent_at: null, // Reset reminder tracking for new date
      updated_at: now,
    })
    .eq('id', params.bookingId)
    .select('*')
    .single();

  if (updateErr || !updatedBooking) {
    console.error('[rescheduleEventAction Error]:', updateErr);
    return { success: false, error: 'Failed to update event schedule.' };
  }

  // Audit trail
  await logAudit({
    actorUserId: adminData.user.id,
    actorCode: adminData.profile.user_code,
    actorName: adminData.profile.full_name,
    actorEmail: adminData.user.email,
    actorType: 'admin',
    category: 'Booking',
    action: 'Reschedule',
    severity: 'Warning',
    outcome: 'Success',
    summary: `${adminData.profile.full_name} rescheduled ${currentBooking.booking_reference} from ${oldDate} to ${newDate}`,
    entityType: 'booking',
    entityId: currentBooking.id,
    entityRef: currentBooking.booking_reference,
    changes: {
      event_date: { old: oldDate, new: newDate },
    },
    metadata: {
      reason: params.reason || 'No reason specified',
      notifyClient: params.notifyClient,
    },
  });

  // Client Email Notification
  if (params.notifyClient && currentBooking.client_email) {
    const emailData = buildBookingClientRescheduledEmail(
      updatedBooking as BookingRecord,
      oldDate,
      newDate,
      params.reason
    );
    await sendClientEmail(
      currentBooking.client_email,
      emailData.subject,
      emailData.html,
      currentBooking.booking_reference
    );
  }

  // Check if new date has <= 7 days left; if so, trigger 7-day reminder notice immediately
  await triggerImmediateReminderIfApplicable(updatedBooking as BookingRecord);

  revalidatePath('/admin/bookings');
  return { success: true, booking: updatedBooking as BookingRecord };
}

/**
 * Soft deletes an event (marks as cancelled and archived).
 * Keeps row in database to preserve audit trail and client references.
 */
export async function cancelEventAction(params: {
  bookingId: string;
  cancellationReason: string;
  notifyClient: boolean;
}): Promise<{ success: boolean; error?: string; booking?: BookingRecord }> {
  const adminData = await getCurrentActiveAdmin();
  if (!adminData) {
    return { success: false, error: 'Unauthorized: Active admin session required.' };
  }

  if (!params.cancellationReason || params.cancellationReason.trim().length === 0) {
    return { success: false, error: 'Cancellation reason is required.' };
  }

  const supabase = await createClient();

  const { data: currentBooking, error: fetchErr } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', params.bookingId)
    .single();

  if (fetchErr || !currentBooking) {
    return { success: false, error: 'Booking reservation not found.' };
  }

  const now = new Date().toISOString();

  // Perform soft deletion: set status = 'cancelled', is_archived = true
  const { data: updatedBooking, error: updateErr } = await supabase
    .from('bookings')
    .update({
      status: 'cancelled',
      is_archived: true,
      cancelled_at: now,
      cancellation_reason: params.cancellationReason.trim(),
      cancelled_by: adminData.user.id,
      updated_at: now,
    })
    .eq('id', params.bookingId)
    .select('*')
    .single();

  if (updateErr || !updatedBooking) {
    console.error('[cancelEventAction Error]:', updateErr);
    return { success: false, error: 'Failed to cancel event reservation.' };
  }

  // Audit trail
  await logAudit({
    actorUserId: adminData.user.id,
    actorCode: adminData.profile.user_code,
    actorName: adminData.profile.full_name,
    actorEmail: adminData.user.email,
    actorType: 'admin',
    category: 'Booking',
    action: 'Cancel',
    severity: 'Critical',
    outcome: 'Success',
    summary: `${adminData.profile.full_name} soft-deleted and cancelled event ${currentBooking.booking_reference}`,
    entityType: 'booking',
    entityId: currentBooking.id,
    entityRef: currentBooking.booking_reference,
    metadata: {
      cancellationReason: params.cancellationReason.trim(),
      notifyClient: params.notifyClient,
    },
  });

  // Client Email Notification
  if (params.notifyClient && currentBooking.client_email) {
    const emailData = buildBookingClientCancelledEmail(
      updatedBooking as BookingRecord,
      params.cancellationReason.trim()
    );
    await sendClientEmail(
      currentBooking.client_email,
      emailData.subject,
      emailData.html,
      currentBooking.booking_reference
    );
  }

  revalidatePath('/admin/bookings');
  return { success: true, booking: updatedBooking as BookingRecord };
}

/**
 * Fetches all tasks assigned to a specific event.
 */
export async function getEventTasksAction(
  bookingId: string
): Promise<{ success: boolean; error?: string; tasks?: EventTask[] }> {
  const adminData = await getCurrentActiveAdmin();
  if (!adminData) {
    return { success: false, error: 'Unauthorized: Active admin session required.' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('event_tasks')
    .select('*')
    .eq('booking_id', bookingId)
    .order('is_done', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[getEventTasksAction Error]:', error);
    return { success: false, error: 'Failed to load event tasks.' };
  }

  return { success: true, tasks: (data || []) as EventTask[] };
}

/**
 * Retrieves active team members for task mention and assignment.
 */
export async function getTeamMembersAction(): Promise<{
  id: string;
  name: string;
  email: string;
  role: string;
}[]> {
  const adminData = await getCurrentActiveAdmin();
  if (!adminData) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from('admin_profiles')
    .select('user_id, full_name, email, role')
    .eq('is_active', true)
    .order('full_name', { ascending: true });

  return (data || []).map((m) => ({
    id: m.user_id,
    name: m.full_name,
    email: m.email,
    role: m.role,
  }));
}

/**
 * Creates a new task for an event.
 */
export async function createEventTaskAction(params: {
  bookingId: string;
  title: string;
  assignee_name?: string;
  assignee_id?: string;
  due_date?: string;
  due_time?: string;
}): Promise<{ success: boolean; error?: string; task?: EventTask }> {
  const adminData = await getCurrentActiveAdmin();
  if (!adminData) {
    return { success: false, error: 'Unauthorized: Active admin session required.' };
  }

  if (!params.title || params.title.trim().length === 0) {
    return { success: false, error: 'Task title is required.' };
  }

  const supabase = await createClient();
  const now = new Date().toISOString();

  const insertPayload: Record<string, unknown> = {
    booking_id: params.bookingId,
    title: params.title.trim(),
    assignee_name: params.assignee_name?.trim() || null,
    assignee_id: params.assignee_id || null,
    due_date: params.due_date || null,
    is_done: false,
    created_by: adminData.user.id,
    created_at: now,
    updated_at: now,
  };

  if (params.due_time) {
    insertPayload.due_time = params.due_time;
  }

  let { data, error } = await supabase
    .from('event_tasks')
    .insert(insertPayload)
    .select('*')
    .single();

  // If due_time column does not exist yet on Supabase DB, fallback without due_time
  if (error && error.message.includes('due_time')) {
    delete insertPayload.due_time;
    const retry = await supabase
      .from('event_tasks')
      .insert(insertPayload)
      .select('*')
      .single();
    data = retry.data;
    error = retry.error;
  }

  if (error || !data) {
    console.error('[createEventTaskAction Error]:', error);
    return { success: false, error: 'Failed to create task.' };
  }

  revalidatePath('/admin/bookings');
  return { success: true, task: data as EventTask };
}

/**
 * Toggles a task completion state.
 */
export async function toggleEventTaskAction(params: {
  taskId: string;
  isDone: boolean;
}): Promise<{ success: boolean; error?: string }> {
  const adminData = await getCurrentActiveAdmin();
  if (!adminData) {
    return { success: false, error: 'Unauthorized: Active admin session required.' };
  }

  const supabase = await createClient();
  const now = new Date().toISOString();

  const { error } = await supabase
    .from('event_tasks')
    .update({
      is_done: params.isDone,
      completed_at: params.isDone ? now : null,
      updated_at: now,
    })
    .eq('id', params.taskId);

  if (error) {
    console.error('[toggleEventTaskAction Error]:', error);
    return { success: false, error: 'Failed to update task state.' };
  }

  revalidatePath('/admin/bookings');
  return { success: true };
}

/**
 * Deletes an event task.
 */
export async function deleteEventTaskAction(
  taskId: string
): Promise<{ success: boolean; error?: string }> {
  const adminData = await getCurrentActiveAdmin();
  if (!adminData) {
    return { success: false, error: 'Unauthorized: Active admin session required.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('event_tasks').delete().eq('id', taskId);

  if (error) {
    console.error('[deleteEventTaskAction Error]:', error);
    return { success: false, error: 'Failed to delete task.' };
  }

  revalidatePath('/admin/bookings');
  return { success: true };
}
