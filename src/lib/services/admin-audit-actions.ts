// =============================================================================
// lib/services/admin-audit-actions.ts — Server Actions for Audit Log Operations
//
// Governs alert acknowledgment and audit export logging.
// Strictly requires verified active admin session.
// =============================================================================

'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentActiveAdmin } from '@/lib/services/adminProfileService';
import { logAudit } from '@/lib/services/auditService';

interface ActionResponse {
  success: boolean;
  error?: string;
  message?: string;
}

/**
 * Server Action: Acknowledges a Warning or Critical audit log entry.
 * Inserts a record into public.audit_log_acknowledgments without mutating the immutable audit_logs table.
 */
export async function acknowledgeAuditLogAction(
  auditLogId: string,
  note?: string
): Promise<ActionResponse> {
  const currentAdmin = await getCurrentActiveAdmin();
  if (!currentAdmin) {
    return { success: false, error: 'Unauthorized. Admin session required.' };
  }
  if (currentAdmin.profile.role === 'staff') {
    return { success: false, error: 'Forbidden: Staff viewer accounts cannot access audit logs.' };
  }

  if (!auditLogId) {
    return { success: false, error: 'Audit log identifier is required.' };
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('audit_log_acknowledgments')
      .insert({
        audit_log_id: auditLogId,
        acknowledged_by: currentAdmin.user.id,
        note: note ? note.trim() : null,
      });

    if (error) {
      console.error('[acknowledgeAuditLogAction Error]:', error);
      return { success: false, error: 'Failed to record acknowledgment: ' + error.message };
    }

    // Also record an audit entry that this log was acknowledged
    await logAudit({
      actorUserId: currentAdmin.user.id,
      actorCode: currentAdmin.profile.user_code || 'ADM-001',
      actorName: currentAdmin.profile.full_name,
      actorEmail: currentAdmin.user.email,
      actorType: 'admin',
      category: 'Security',
      action: 'Acknowledge',
      severity: 'Info',
      outcome: 'Success',
      summary: `Admin ${currentAdmin.profile.full_name} acknowledged audit alert (${auditLogId.substring(0, 8)})`,
      entityType: 'audit_log',
      entityId: auditLogId,
      metadata: { note: note || null },
    });

    revalidatePath('/admin/audit');
    return {
      success: true,
      message: 'Alert acknowledged successfully.',
    };
  } catch (err) {
    console.error('[acknowledgeAuditLogAction Exception]:', err);
    return { success: false, error: 'Internal server error while acknowledging alert.' };
  }
}

/**
 * Server Action: Records an export event into public.audit_logs.
 * Ensures data governance compliance whenever staff downloads audit logs.
 */
export async function recordExportAuditAction(
  rowCount: number,
  format: 'csv' | 'json',
  appliedFilters: Record<string, unknown>
): Promise<ActionResponse> {
  const currentAdmin = await getCurrentActiveAdmin();
  if (!currentAdmin) {
    return { success: false, error: 'Unauthorized. Admin session required.' };
  }

  try {
    await logAudit({
      actorUserId: currentAdmin.user.id,
      actorCode: currentAdmin.profile.user_code || 'ADM-001',
      actorName: currentAdmin.profile.full_name,
      actorEmail: currentAdmin.user.email,
      actorType: 'admin',
      category: 'Security',
      action: 'Export',
      severity: 'Info',
      outcome: 'Success',
      summary: `Admin ${currentAdmin.profile.full_name} exported ${rowCount} audit log entries (${format.toUpperCase()})`,
      entityType: 'export',
      metadata: {
        format,
        rowCount,
        appliedFilters,
      },
    });

    return { success: true };
  } catch (err) {
    console.error('[recordExportAuditAction Exception]:', err);
    return { success: false, error: 'Failed to record export audit entry.' };
  }
}
