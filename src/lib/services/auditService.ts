// =============================================================================
// lib/services/auditService.ts — Centralized Audit Logging Service
//
// Records all administrative, operational, and security events into public.audit_logs.
// Executes server-side via isolated admin client to guarantee an append-only log.
// =============================================================================

import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import type {
  AuditCategory,
  AuditSeverity,
  AuditOutcome,
  AuditActorType,
  AdminAuditAction,
} from '@/types/admin-auth';

export interface LogAuditOptions {
  actorUserId?: string | null;
  actorCode?: string | null;
  actorName?: string | null;
  actorEmail?: string | null;
  actorType?: AuditActorType;
  category: AuditCategory;
  action: string;
  severity?: AuditSeverity;
  outcome?: AuditOutcome;
  summary: string;
  entityType?: string | null;
  entityId?: string | null;
  entityRef?: string | null;
  changes?: Record<string, { old: unknown; new: unknown }>;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface LogAuditParams {
  actorUserId?: string | null;
  actorEmail?: string | null;
  action: AdminAuditAction | string;
  targetResource?: string;
  details?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Main append-only audit logger.
 * Writes directly to public.audit_logs.
 */
export async function logAudit(options: LogAuditOptions): Promise<void> {
  try {
    const supabase = createAdminClient();

    let actorCode = options.actorCode || 'SYS-000';
    let actorName = options.actorName || 'System';
    let actorEmail = options.actorEmail || null;
    let actorType: AuditActorType = options.actorType || (options.actorUserId ? 'admin' : 'system');

    // If actorUserId is present but actorCode/name were not provided, resolve from admin_profiles
    if (options.actorUserId && (!options.actorCode || !options.actorName)) {
      const { data: profile } = await supabase
        .from('admin_profiles')
        .select('user_code, full_name, email')
        .eq('user_id', options.actorUserId)
        .maybeSingle();

      if (profile) {
        actorCode = profile.user_code || actorCode;
        actorName = profile.full_name || actorName;
        actorEmail = profile.email || actorEmail;
        actorType = 'admin';
      }
    }

    const { error } = await supabase.from('audit_logs').insert({
      actor_user_id: options.actorUserId || null,
      actor_code: actorCode,
      actor_name: actorName,
      actor_email: actorEmail,
      actor_type: actorType,
      category: options.category,
      action: options.action,
      severity: options.severity || 'Info',
      outcome: options.outcome || 'Success',
      summary: options.summary,
      entity_type: options.entityType || null,
      entity_id: options.entityId || null,
      entity_ref: options.entityRef || null,
      changes: options.changes || {},
      metadata: options.metadata || {},
      ip_address: options.ipAddress || null,
      user_agent: options.userAgent || null,
    });

    if (error) {
      console.error('[auditService] Failed to record audit log:', error.message);
    }
  } catch (err) {
    console.error('[auditService] Unexpected audit logger error:', err);
  }
}

/**
 * Backward-compatible wrapper for existing logAuditEvent callers.
 * Translates legacy params into structured audit log entries.
 */
export async function logAuditEvent(params: LogAuditParams): Promise<void> {
  let category: AuditCategory = 'System';
  let severity: AuditSeverity = 'Info';
  let outcome: AuditOutcome = 'Success';
  const actionStr = String(params.action);

  if (actionStr.startsWith('auth.')) {
    category = 'Authentication';
    if (actionStr.includes('failed') || actionStr.includes('blocked')) {
      severity = actionStr.includes('blocked') ? 'Critical' : 'Warning';
      outcome = 'Failure';
    }
  } else if (actionStr.startsWith('admin.')) {
    category = 'Team';
    if (actionStr.includes('deactivated')) {
      severity = 'Warning';
    }
  } else if (actionStr.startsWith('booking.')) {
    category = 'Booking';
  } else if (actionStr.startsWith('export.')) {
    category = 'Security';
  }

  const summary = `${params.actorEmail || 'System'} executed ${actionStr}${
    params.targetResource ? ` on ${params.targetResource}` : ''
  }`;

  await logAudit({
    actorUserId: params.actorUserId,
    actorEmail: params.actorEmail,
    action: actionStr,
    category,
    severity,
    outcome,
    summary,
    entityType: params.targetResource || null,
    metadata: params.details || {},
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });
}
