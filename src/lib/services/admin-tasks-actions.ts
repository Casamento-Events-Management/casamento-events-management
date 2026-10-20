// =============================================================================
// admin-tasks-actions.ts — Server Actions for Tasks Workspace & Role-based CRUD
// =============================================================================

'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentActiveAdmin } from '@/lib/services/adminProfileService';
import type { EventTask } from '@/types/booking';
import { logAudit } from '@/lib/services/auditService';

export type TaskViewFilter = 'assigned_to_me' | 'assigned_by_me' | 'all';

/**
 * Retrieves tasks with their associated event details for the Tasks tab.
 * Enforces role-based visibility:
 * - 'assigned_to_me': Tasks where current admin is in assignee_ids or assignee_id.
 * - 'assigned_by_me': Tasks where current admin is created_by.
 * - 'all': Only accessible by Super Admin; returns all event tasks across the team.
 */
export async function getAdminTasksAction(params: {
  view: TaskViewFilter;
  includeCancelled?: boolean;
}): Promise<{
  success: boolean;
  tasks?: EventTask[];
  error?: string;
  isSuperAdmin?: boolean;
}> {
  const adminData = await getCurrentActiveAdmin();
  if (!adminData) {
    return { success: false, error: 'Unauthorized: Active admin session required.' };
  }

  const isSuperAdmin = adminData.profile.role === 'super_admin';

  if (params.view === 'all' && !isSuperAdmin) {
    return {
      success: false,
      error: 'Forbidden: Only Super Administrators can view team-wide tasks.',
      isSuperAdmin: false,
    };
  }

  const supabase = await createClient();

  // Query tasks joined with bookings
  let query = supabase
    .from('event_tasks')
    .select(`
      *,
      booking:bookings!booking_id (
        id,
        booking_reference,
        service_title,
        event_date,
        client_full_name,
        venue_city,
        status
      )
    `)
    .order('is_done', { ascending: true })
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (!params.includeCancelled) {
    query = query.eq('is_cancelled', false);
  }

  if (params.view === 'assigned_to_me') {
    // Current user in assignee_ids array OR matches legacy assignee_id
    query = query.or(
      `assignee_ids.cs.{${adminData.user.id}},assignee_id.eq.${adminData.user.id}`
    );
  } else if (params.view === 'assigned_by_me') {
    query = query.eq('created_by', adminData.user.id);
  }
  // 'all' view has no user filter (Super Admin only)

  const { data, error } = await query;

  if (error) {
    console.error('[getAdminTasksAction Error]:', error);
    return { success: false, error: 'Failed to load tasks.', isSuperAdmin };
  }

  // Fetch creator names for display
  const creatorIds = Array.from(
    new Set((data || []).map((t) => t.created_by).filter(Boolean))
  ) as string[];

  const creatorMap = new Map<string, string>();
  if (creatorIds.length > 0) {
    const { data: creatorProfiles } = await supabase
      .from('admin_profiles')
      .select('user_id, full_name')
      .in('user_id', creatorIds);

    (creatorProfiles || []).forEach((cp) => {
      creatorMap.set(cp.user_id, cp.full_name);
    });
  }

  const enrichedTasks: EventTask[] = (data || []).map((t) => ({
    ...t,
    creator_name: t.created_by ? creatorMap.get(t.created_by) || 'Admin' : 'System',
  }));

  return { success: true, tasks: enrichedTasks, isSuperAdmin };
}

/**
 * Updates an event task's details.
 * Authority: Only the task creator or a Super Admin can update the task.
 */
export async function updateEventTaskAction(params: {
  taskId: string;
  title: string;
  assignee_ids?: string[];
  assignee_names?: string[];
  due_date?: string | null;
  due_time?: string | null;
}): Promise<{ success: boolean; task?: EventTask; error?: string }> {
  const adminData = await getCurrentActiveAdmin();
  if (!adminData) {
    return { success: false, error: 'Unauthorized: Active admin session required.' };
  }

  if (!params.title || params.title.trim().length === 0) {
    return { success: false, error: 'Task title cannot be empty.' };
  }

  const supabase = await createClient();

  // 1. Fetch current task to verify permissions and construct audit diff
  const { data: currentTask, error: fetchErr } = await supabase
    .from('event_tasks')
    .select(`
      *,
      booking:bookings!booking_id (
        id,
        booking_reference,
        service_title
      )
    `)
    .eq('id', params.taskId)
    .single();

  if (fetchErr || !currentTask) {
    return { success: false, error: 'Task not found.' };
  }

  const isSuperAdmin = adminData.profile.role === 'super_admin';
  const isCreator = currentTask.created_by === adminData.user.id;

  if (!isCreator && !isSuperAdmin) {
    return {
      success: false,
      error: 'Forbidden: Only the task creator or a Super Administrator can update this task.',
    };
  }

  const now = new Date().toISOString();
  const assigneeIds = params.assignee_ids || [];
  const assigneeNames = params.assignee_names || [];

  const updatePayload: Record<string, unknown> = {
    title: params.title.trim(),
    assignee_ids: assigneeIds,
    assignee_names: assigneeNames,
    assignee_id: assigneeIds[0] || null,
    assignee_name: assigneeNames[0] || null,
    due_date: params.due_date || null,
    due_time: params.due_time || null,
    updated_at: now,
  };

  const { data: updatedTask, error: updateErr } = await supabase
    .from('event_tasks')
    .update(updatePayload)
    .eq('id', params.taskId)
    .select('*')
    .single();

  if (updateErr || !updatedTask) {
    console.error('[updateEventTaskAction Error]:', updateErr);
    return { success: false, error: 'Failed to update task.' };
  }

  // 2. Audit Trail
  const bookingRef = currentTask.booking?.booking_reference || 'N/A';
  await logAudit({
    actorUserId: adminData.user.id,
    actorCode: adminData.profile.user_code,
    actorName: adminData.profile.full_name,
    actorEmail: adminData.user.email,
    actorType: 'admin',
    category: 'Booking',
    action: 'Task Update',
    severity: 'Info',
    outcome: 'Success',
    summary: `${adminData.profile.full_name} updated task "${params.title}" for ${bookingRef}`,
    entityType: 'event_task',
    entityId: params.taskId,
    entityRef: bookingRef,
    changes: {
      title: { old: currentTask.title, new: params.title },
      due_date: { old: currentTask.due_date, new: params.due_date },
      due_time: { old: currentTask.due_time, new: params.due_time },
      assignee_names: { old: currentTask.assignee_names, new: assigneeNames },
    },
  });

  revalidatePath('/admin/bookings');
  return { success: true, task: updatedTask as EventTask };
}

/**
 * Toggles an event task's completion state (Done / Incomplete).
 * Authority: Any assigned person, the task creator, or a Super Admin.
 */
export async function toggleTaskDoneAction(params: {
  taskId: string;
  isDone: boolean;
}): Promise<{ success: boolean; task?: EventTask; error?: string }> {
  const adminData = await getCurrentActiveAdmin();
  if (!adminData) {
    return { success: false, error: 'Unauthorized: Active admin session required.' };
  }

  const supabase = await createClient();

  const { data: currentTask, error: fetchErr } = await supabase
    .from('event_tasks')
    .select(`
      *,
      booking:bookings!booking_id (
        id,
        booking_reference,
        service_title
      )
    `)
    .eq('id', params.taskId)
    .single();

  if (fetchErr || !currentTask) {
    return { success: false, error: 'Task not found.' };
  }

  const isSuperAdmin = adminData.profile.role === 'super_admin';
  const isCreator = currentTask.created_by === adminData.user.id;
  const isAssignee =
    (currentTask.assignee_ids && currentTask.assignee_ids.includes(adminData.user.id)) ||
    currentTask.assignee_id === adminData.user.id;

  if (!isAssignee && !isCreator && !isSuperAdmin) {
    return {
      success: false,
      error: 'Forbidden: Only assigned team members, the task creator, or a Super Administrator can mark this task as done.',
    };
  }

  const now = new Date().toISOString();
  const { data: updatedTask, error: updateErr } = await supabase
    .from('event_tasks')
    .update({
      is_done: params.isDone,
      completed_at: params.isDone ? now : null,
      updated_at: now,
    })
    .eq('id', params.taskId)
    .select('*')
    .single();

  if (updateErr || !updatedTask) {
    console.error('[toggleTaskDoneAction Error]:', updateErr);
    return { success: false, error: 'Failed to update task state.' };
  }

  // Audit trail
  const bookingRef = currentTask.booking?.booking_reference || 'N/A';
  await logAudit({
    actorUserId: adminData.user.id,
    actorCode: adminData.profile.user_code,
    actorName: adminData.profile.full_name,
    actorEmail: adminData.user.email,
    actorType: 'admin',
    category: 'Booking',
    action: 'ToggleDone',
    severity: 'Info',
    outcome: 'Success',
    summary: `${adminData.profile.full_name} marked task "${currentTask.title}" as ${params.isDone ? 'completed' : 'pending'} for ${bookingRef}`,
    entityType: 'event_task',
    entityId: params.taskId,
    entityRef: bookingRef,
    changes: {
      is_done: { old: currentTask.is_done, new: params.isDone },
    },
  });

  revalidatePath('/admin/bookings');
  return { success: true, task: updatedTask as EventTask };
}

/**
 * Soft deletes / cancels an event task (flags as cancelled).
 * Authority: Any assigned person, the task creator, or a Super Admin.
 */
export async function cancelEventTaskAction(params: {
  taskId: string;
  reason?: string;
}): Promise<{ success: boolean; error?: string }> {
  const adminData = await getCurrentActiveAdmin();
  if (!adminData) {
    return { success: false, error: 'Unauthorized: Active admin session required.' };
  }

  const supabase = await createClient();

  const { data: currentTask, error: fetchErr } = await supabase
    .from('event_tasks')
    .select(`
      *,
      booking:bookings!booking_id (
        id,
        booking_reference,
        service_title
      )
    `)
    .eq('id', params.taskId)
    .single();

  if (fetchErr || !currentTask) {
    return { success: false, error: 'Task not found.' };
  }

  const isSuperAdmin = adminData.profile.role === 'super_admin';
  const isCreator = currentTask.created_by === adminData.user.id;
  const isAssignee =
    (currentTask.assignee_ids && currentTask.assignee_ids.includes(adminData.user.id)) ||
    currentTask.assignee_id === adminData.user.id;

  if (!isAssignee && !isCreator && !isSuperAdmin) {
    return {
      success: false,
      error: 'Forbidden: Only assigned team members, the task creator, or a Super Administrator can remove/cancel this task.',
    };
  }

  const now = new Date().toISOString();
  const { error: updateErr } = await supabase
    .from('event_tasks')
    .update({
      is_cancelled: true,
      cancelled_at: now,
      cancelled_by: adminData.user.id,
      cancellation_reason: params.reason?.trim() || null,
      updated_at: now,
    })
    .eq('id', params.taskId);

  if (updateErr) {
    console.error('[cancelEventTaskAction Error]:', updateErr);
    return { success: false, error: 'Failed to cancel task.' };
  }

  // Audit trail
  const bookingRef = currentTask.booking?.booking_reference || 'N/A';
  await logAudit({
    actorUserId: adminData.user.id,
    actorCode: adminData.profile.user_code,
    actorName: adminData.profile.full_name,
    actorEmail: adminData.user.email,
    actorType: 'admin',
    category: 'Booking',
    action: 'Task Cancel',
    severity: 'Warning',
    outcome: 'Success',
    summary: `${adminData.profile.full_name} cancelled task "${currentTask.title}" for ${bookingRef}${params.reason ? ` (Reason: ${params.reason})` : ''}`,
    entityType: 'event_task',
    entityId: params.taskId,
    entityRef: bookingRef,
    metadata: {
      reason: params.reason || null,
    },
  });

  revalidatePath('/admin/bookings');
  return { success: true };
}
