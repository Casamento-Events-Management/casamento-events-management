// =============================================================================
// types/admin-auth.ts — Admin Authentication & Authorization Types
// =============================================================================

export type AdminRole = 'super_admin' | 'admin';

export interface AdminProfile {
    id: string;
    user_id: string;
    user_code?: string;
    email: string;
    full_name: string;
    role: AdminRole;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export type AdminAuditAction =
    | 'auth.login.success'
    | 'auth.login.failed'
    | 'auth.login.inactive_blocked'
    | 'auth.login.bot_blocked'
    | 'auth.logout'
    | 'auth.password_reset_request'
    | 'auth.password_reset_success'
    | 'admin.profile_created'
    | 'admin.profile_updated'
    | 'admin.profile_deactivated'
    | 'admin.profile_activated'
    | 'booking.created'
    | 'booking.updated'
    | 'booking.deleted'
    | 'email.preview_sent'
    | 'email.confirmation_sent'
    | 'email.bounced'
    | 'export.created';

export type AuditCategory =
    | 'Booking'
    | 'Payment'
    | 'Team'
    | 'Authentication'
    | 'Feedback'
    | 'Article'
    | 'Security'
    | 'System';

export type AuditSeverity = 'Info' | 'Warning' | 'Critical';
export type AuditOutcome = 'Success' | 'Failure' | 'Blocked' | 'Pending';
export type AuditActorType = 'admin' | 'client' | 'webhook' | 'system' | 'db_direct';

export interface AuditLogAcknowledgment {
    id: string;
    audit_log_id: string;
    acknowledged_by: string;
    acknowledged_at: string;
    note?: string | null;
    acknowledger_profile?: {
        full_name: string;
        user_code?: string;
        email: string;
    } | null;
}

export interface AuditLogEntry {
    id: string;
    created_at: string;
    actor_user_id: string | null;
    actor_code: string;
    actor_name: string;
    actor_email: string | null;
    actor_type: AuditActorType;
    category: AuditCategory;
    action: string;
    severity: AuditSeverity;
    outcome: AuditOutcome;
    summary: string;
    entity_type: string | null;
    entity_id: string | null;
    entity_ref: string | null;
    changes: Record<string, { old: unknown; new: unknown }>;
    metadata: Record<string, unknown>;
    ip_address: string | null;
    user_agent: string | null;
    audit_log_acknowledgments?: AuditLogAcknowledgment[] | AuditLogAcknowledgment | null;
}

// Backward compatible interface for existing references
export interface AdminAuditLog {
    id: string;
    actor_user_id: string | null;
    actor_email: string | null;
    action: AdminAuditAction | string;
    target_resource?: string;
    details?: Record<string, unknown>;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
}

export interface AuthActionResult {
    success: boolean;
    error?: string;
    message?: string;
    redirectUrl?: string;
}

