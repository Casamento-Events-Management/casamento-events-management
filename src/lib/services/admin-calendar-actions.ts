// =============================================================================
// admin-calendar-actions.ts — Server Actions for Calendar Events & Tasks
// =============================================================================

'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentActiveAdmin } from '@/lib/services/adminProfileService';
import type { BookingRecord, EventTask, CompleteBookingInput, ReopenBookingInput } from '@/types/booking';
import { checkCountryHoliday } from '@/lib/utils/holidayUtils';
import { logAudit } from '@/lib/services/auditService';
import {
  buildBookingClientRescheduledEmail,
  buildBookingClientCancelledEmail,
  buildBookingClientCompletedEmail,
  buildTaskAssignmentMemberEmail,
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
 * Dispatches a task assignment notification email to an admin team member using Resend.
 */
async function sendAdminTaskAssignmentEmail(
  memberEmail: string,
  subject: string,
  html: string,
  bookingRef: string
): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[taskAssignment] Mocking email delivery for:', bookingRef, 'to member:', memberEmail);
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
        to: [memberEmail],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      console.error('[sendAdminTaskAssignmentEmail Resend Error]:', data);
      return { success: false, error: data.message || 'Failed to dispatch task assignment email' };
    }

    return { success: true };
  } catch (err) {
    console.error('[sendAdminTaskAssignmentEmail Error]:', err);
    return { success: false, error: 'Network error sending task assignment email.' };
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
  if (adminData.profile.role === 'staff') {
    return { success: false, error: 'Forbidden: Staff viewer accounts cannot reschedule events.' };
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
  if (adminData.profile.role === 'staff') {
    return { success: false, error: 'Forbidden: Staff viewer accounts cannot cancel events.' };
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
 * Concludes an event and marks it as completed.
 * Authority: Admin operators only ('super_admin' or 'admin'). Staff accounts are rejected.
 */
export async function completeEventAction(params: CompleteBookingInput): Promise<{
  success: boolean;
  error?: string;
  booking?: BookingRecord;
}> {
  const adminData = await getCurrentActiveAdmin();
  if (!adminData) {
    return { success: false, error: 'Unauthorized: Active admin session required.' };
  }
  if (adminData.profile.role === 'staff') {
    return { success: false, error: 'Forbidden: Staff viewer accounts cannot Event Completeds.' };
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

  if (currentBooking.status === 'completed') {
    return { success: false, error: 'This event has already been marked as completed.' };
  }

  const now = new Date().toISOString();

  // If requested, auto-complete any remaining uncancelled tasks for this event
  if (params.autoCompletePendingTasks) {
    const { error: taskErr } = await supabase
      .from('event_tasks')
      .update({
        is_done: true,
        completed_at: now,
        updated_at: now,
      })
      .eq('booking_id', params.bookingId)
      .eq('is_done', false)
      .eq('is_cancelled', false);

    if (taskErr) {
      console.warn('[completeEventAction] Failed to auto-complete tasks:', taskErr);
    }
  }

  // Update booking record: status = 'completed', completed_at = now, completed_by, completion_notes
  const { data: updatedBooking, error: updateErr } = await supabase
    .from('bookings')
    .update({
      status: 'completed',
      completed_at: now,
      completed_by: adminData.user.id,
      completion_notes: params.completionNotes?.trim() || null,
      updated_at: now,
    })
    .eq('id', params.bookingId)
    .select('*')
    .single();

  if (updateErr || !updatedBooking) {
    console.error('[completeEventAction Error]:', updateErr);
    return { success: false, error: 'Failed to Event Completed.' };
  }

  // Audit trail logging
  await logAudit({
    actorUserId: adminData.user.id,
    actorCode: adminData.profile.user_code,
    actorName: adminData.profile.full_name,
    actorEmail: adminData.user.email,
    actorType: 'admin',
    category: 'Booking',
    action: 'Complete',
    severity: 'Info',
    outcome: 'Success',
    summary: `${adminData.profile.full_name} marked event ${currentBooking.booking_reference} as completed`,
    entityType: 'booking',
    entityId: currentBooking.id,
    entityRef: currentBooking.booking_reference,
    metadata: {
      completionNotes: params.completionNotes?.trim() || null,
      autoCompletePendingTasks: Boolean(params.autoCompletePendingTasks),
      notifyClient: Boolean(params.notifyClient),
    },
  });

  // Client Thank You Email Notification
  if (params.notifyClient && currentBooking.client_email) {
    const emailData = buildBookingClientCompletedEmail(
      updatedBooking as BookingRecord,
      params.clientThankYouMessage?.trim()
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
 * Reopens a mistakenly completed event back to 'confirmed' status.
 * Authority: Admin operators ('super_admin' or 'admin').
 */
export async function reopenEventAction(params: ReopenBookingInput): Promise<{
  success: boolean;
  error?: string;
  booking?: BookingRecord;
}> {
  const adminData = await getCurrentActiveAdmin();
  if (!adminData) {
    return { success: false, error: 'Unauthorized: Active admin session required.' };
  }
  if (adminData.profile.role === 'staff') {
    return { success: false, error: 'Forbidden: Staff viewer accounts cannot reopen events.' };
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

  if (currentBooking.status !== 'completed') {
    return { success: false, error: 'Only completed events can be reopened.' };
  }

  const now = new Date().toISOString();

  const { data: updatedBooking, error: updateErr } = await supabase
    .from('bookings')
    .update({
      status: 'confirmed',
      completed_at: null,
      completed_by: null,
      updated_at: now,
    })
    .eq('id', params.bookingId)
    .select('*')
    .single();

  if (updateErr || !updatedBooking) {
    console.error('[reopenEventAction Error]:', updateErr);
    return { success: false, error: 'Failed to reopen event.' };
  }

  // Audit trail logging
  await logAudit({
    actorUserId: adminData.user.id,
    actorCode: adminData.profile.user_code,
    actorName: adminData.profile.full_name,
    actorEmail: adminData.user.email,
    actorType: 'admin',
    category: 'Booking',
    action: 'Update',
    severity: 'Info',
    outcome: 'Success',
    summary: `${adminData.profile.full_name} reopened completed event ${currentBooking.booking_reference} back to confirmed`,
    entityType: 'booking',
    entityId: currentBooking.id,
    entityRef: currentBooking.booking_reference,
    metadata: {
      reason: params.reason?.trim() || null,
    },
  });

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
    .neq('is_cancelled', true)
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
  assignee_ids?: string[];
  assignee_names?: string[];
  due_date?: string;
  due_time?: string;
}): Promise<{ success: boolean; error?: string; task?: EventTask }> {
  const adminData = await getCurrentActiveAdmin();
  if (!adminData) {
    return { success: false, error: 'Unauthorized: Active admin session required.' };
  }
  if (adminData.profile.role === 'staff') {
    return { success: false, error: 'Forbidden: Staff viewer accounts cannot create event tasks.' };
  }

  if (!params.title || params.title.trim().length === 0) {
    return { success: false, error: 'Task title is required.' };
  }

  const supabase = await createClient();
  const now = new Date().toISOString();

  const assigneeIds = params.assignee_ids || (params.assignee_id ? [params.assignee_id] : []);
  const assigneeNames = params.assignee_names || (params.assignee_name ? [params.assignee_name] : []);

  const insertPayload: Record<string, unknown> = {
    booking_id: params.bookingId,
    title: params.title.trim(),
    assignee_ids: assigneeIds,
    assignee_names: assigneeNames,
    assignee_id: assigneeIds[0] || null,
    assignee_name: assigneeNames[0] || null,
    due_date: params.due_date || null,
    is_done: false,
    is_cancelled: false,
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

  // Fallback if schema migration pending
  if (error && (error.message.includes('due_time') || error.message.includes('assignee_ids'))) {
    const fallbackPayload = { ...insertPayload };
    delete fallbackPayload.due_time;
    delete fallbackPayload.assignee_ids;
    delete fallbackPayload.assignee_names;
    delete fallbackPayload.is_cancelled;
    const retry = await supabase
      .from('event_tasks')
      .insert(fallbackPayload)
      .select('*')
      .single();
    data = retry.data;
    error = retry.error;
  }

  if (error || !data) {
    console.error('[createEventTaskAction Error]:', error);
    return { success: false, error: 'Failed to create task.' };
  }

  // Audit trail for Task Create
  logAudit({
    actorUserId: adminData.user.id,
    actorCode: adminData.profile.user_code,
    actorName: adminData.profile.full_name,
    actorEmail: adminData.user.email,
    actorType: 'admin',
    category: 'Booking',
    action: 'Create',
    severity: 'Info',
    outcome: 'Success',
    summary: `${adminData.profile.full_name} created task "${params.title}" with ${assigneeNames.length} assignee(s)`,
    entityType: 'event_task',
    entityId: data.id,
    metadata: {
      bookingId: params.bookingId,
      assigneeNames,
      dueDate: params.due_date,
    },
  }).catch(() => { });

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

  if (adminData.profile.role === 'staff') {
    const { data: task } = await supabase
      .from('event_tasks')
      .select('assignee_id, assignee_ids')
      .eq('id', params.taskId)
      .single();
    const isAssigned =
      task &&
      (task.assignee_id === adminData.user.id ||
        (Array.isArray(task.assignee_ids) && task.assignee_ids.includes(adminData.user.id)));
    if (!isAssigned) {
      return { success: false, error: 'Forbidden: Staff can only complete tasks assigned to them.' };
    }
  }
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
  if (adminData.profile.role === 'staff') {
    return { success: false, error: 'Forbidden: Staff viewer accounts cannot delete tasks.' };
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

/**
 * Dispatches consolidated batch email notifications to team members for assigned event tasks.
 * When an admin assigns new tasks, all tasks for that member on this event (both previous
 * and newly assigned) are summed up and fired at once in a single email per member.
 */
export async function sendBatchTaskAssignmentEmailsAction(params: {
  bookingId: string;
  newTaskIds?: string[];
}): Promise<{ success: boolean; sentCount: number; error?: string }> {
  const adminData = await getCurrentActiveAdmin();
  if (!adminData) {
    return { success: false, sentCount: 0, error: 'Unauthorized: Active admin session required.' };
  }
  if (adminData.profile.role === 'staff') {
    return { success: false, sentCount: 0, error: 'Forbidden: Staff viewer accounts cannot send task emails.' };
  }

  const supabase = await createClient();

  // 1. Fetch booking record
  const { data: booking, error: bErr } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', params.bookingId)
    .single();

  if (bErr || !booking) {
    return { success: false, sentCount: 0, error: 'Booking not found.' };
  }

  // 2. Fetch ALL tasks for this booking to enable consolidating previous + new tasks
  const { data: allRawTasks, error: tErr } = await supabase
    .from('event_tasks')
    .select('*')
    .eq('booking_id', params.bookingId)
    .order('created_at', { ascending: true });

  if (tErr || !allRawTasks || allRawTasks.length === 0) {
    return { success: true, sentCount: 0 };
  }

  const allTasks = allRawTasks as EventTask[];

  // 3. Fetch active admin profiles to resolve emails
  const { data: profiles } = await supabase
    .from('admin_profiles')
    .select('user_id, full_name, email, role')
    .eq('is_active', true);

  const activeProfiles = profiles || [];

  const getProfilesForTask = (task: EventTask): typeof activeProfiles => {
    const matches: typeof activeProfiles = [];
    if (task.assignee_ids && task.assignee_ids.length > 0) {
      for (const uid of task.assignee_ids) {
        const p = activeProfiles.find((ap) => ap.user_id === uid);
        if (p && !matches.some((m) => m.user_id === p.user_id)) {
          matches.push(p);
        }
      }
    }
    if (matches.length === 0 && task.assignee_id) {
      const p = activeProfiles.find((ap) => ap.user_id === task.assignee_id);
      if (p) matches.push(p);
    }
    if (matches.length === 0 && task.assignee_name) {
      const clean = task.assignee_name.replace(/^@/, '').trim().toLowerCase();
      const p = activeProfiles.find(
        (ap) =>
          ap.full_name.toLowerCase() === clean ||
          ap.email.toLowerCase() === clean ||
          ap.full_name.toLowerCase().includes(clean)
      );
      if (p) matches.push(p);
    }
    return matches;
  };

  const newTaskIdSet = new Set(params.newTaskIds || []);

  // 4. Group all tasks by member email, tracking which tasks are new vs previous
  interface MemberTaskGroup {
    memberName: string;
    memberEmail: string;
    allTasks: EventTask[];
    newTasks: EventTask[];
  }

  const memberMap = new Map<string, MemberTaskGroup>();

  for (const task of allTasks) {
    const matchedProfiles = getProfilesForTask(task);
    if (matchedProfiles.length === 0) continue;

    for (const profile of matchedProfiles) {
      if (!profile.email) continue;

      const emailKey = profile.email.toLowerCase().trim();
      let group = memberMap.get(emailKey);
      if (!group) {
        group = {
          memberName: profile.full_name,
          memberEmail: profile.email,
          allTasks: [],
          newTasks: [],
        };
        memberMap.set(emailKey, group);
      }

      group.allTasks.push(task);

      // Is this task newly assigned in this session or not yet notified?
      const isNew = newTaskIdSet.size > 0
        ? newTaskIdSet.has(task.id)
        : !task.notified_at;

      if (isNew) {
        group.newTasks.push(task);
      }
    }
  }

  // Filter only members who have at least ONE new task assigned in this round
  const groupsToNotify = Array.from(memberMap.values()).filter(
    (g) => g.newTasks.length > 0
  );

  if (groupsToNotify.length === 0) {
    return { success: true, sentCount: 0 };
  }

  let sentCount = 0;
  const now = new Date().toISOString();

  // 5. Fire exactly ONE email per member containing their summed tasks (both previous and new)
  for (const group of groupsToNotify) {
    const currentNewIds = new Set(group.newTasks.map((t) => t.id));

    const emailData = buildTaskAssignmentMemberEmail({
      booking: booking as BookingRecord,
      memberName: group.memberName,
      assignedBy: adminData.profile.full_name,
      tasks: group.allTasks.map((t) => ({
        title: t.title,
        due_date: t.due_date,
        due_time: t.due_time,
        is_new: currentNewIds.has(t.id),
        is_done: t.is_done,
      })),
    });

    const sendRes = await sendAdminTaskAssignmentEmail(
      group.memberEmail,
      emailData.subject,
      emailData.html,
      booking.booking_reference
    );

    if (sendRes.success) {
      sentCount++;

      // Mark tasks as notified in DB
      try {
        await supabase
          .from('event_tasks')
          .update({ notified_at: now })
          .in('id', group.allTasks.map((t) => t.id));
      } catch (err) {
        console.warn('[sendBatchTaskAssignmentEmailsAction]: notified_at column update skipped', err);
      }

      // Record in audit log
      await logAudit({
        actorUserId: adminData.user.id,
        actorCode: adminData.profile.user_code,
        actorName: adminData.profile.full_name,
        actorEmail: adminData.user.email,
        actorType: 'admin',
        category: 'Booking',
        action: 'Task Assignment Notification',
        severity: 'Info',
        outcome: 'Success',
        summary: `${adminData.profile.full_name} sent consolidated task notification to ${group.memberName} (${group.memberEmail}) with ${group.allTasks.length} task(s) (${group.newTasks.length} new) for ${booking.booking_reference}`,
        entityType: 'booking',
        entityId: booking.id,
        entityRef: booking.booking_reference,
        metadata: {
          recipientEmail: group.memberEmail,
          totalTaskCount: group.allTasks.length,
          newTaskCount: group.newTasks.length,
          allTaskTitles: group.allTasks.map((t) => t.title),
        },
      });
    }
  }

  return { success: true, sentCount };
}

