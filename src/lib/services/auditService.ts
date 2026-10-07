// =============================================================================
// lib/services/auditService.ts — Centralized Audit Logging Service
//
// Records all administrative and security actions into public.admin_audit_logs.
// Executes server-side via isolated admin client to guarantee an immutable log.
// =============================================================================

import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import type { AdminAuditAction } from '@/types/admin-auth';

export interface LogAuditParams {
  actorUserId?: string | null;
  actorEmail?: string | null;
  action: AdminAuditAction | string;
  targetResource: string;
  details?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function logAuditEvent(params: LogAuditParams): Promise<void> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from('admin_audit_logs').insert({
      actor_user_id: params.actorUserId || null,
      actor_email: params.actorEmail || null,
      action: params.action,
      target_resource: params.targetResource,
      details: params.details || {},
      ip_address: params.ipAddress || null,
      user_agent: params.userAgent || null,
    });

    if (error) {
      console.error('[auditService] Failed to record audit log:', error.message);
    }
  } catch (err) {
    console.error('[auditService] Unexpected audit error:', err);
  }
}
