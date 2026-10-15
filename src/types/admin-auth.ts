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
    | 'Admin Login'
    | 'Login Failed'
    | 'Login Bot Blocked'
    | 'Inactive Account Blocked'
    | 'Admin Logout'
    | 'Password Reset Request'
    | 'Password Reset Request Unmatched'
    | 'Admin Password Reset'
    | 'Admin Profile Created'
    | 'Admin Profile Updated'
    | 'Admin Profile Deactivated'
    | 'Admin Profile Activated'
    | 'Booking Created'
    | 'Booking Updated'
    | 'Booking Deleted'
    | 'Email Preview Failed'
    | 'Email Preview Dispatched'
    | 'Email Preview Exception'
    | 'Email Confirmation Failed'
    | 'Email Confirmation Dispatched'
    | 'Admin Briefing Dispatched'
    | 'Export Created'
    | 'Contact Form Submission'
    | 'Contact Inquiry Email Failed'
    | 'Service Inquiry'
    | 'Service Inquiry Email Failed'
    | 'Client Feedback Submission'
    | 'Feedback Email Notification'
    | 'Feedback Notification Failed'
    | 'Feedback Approved'
    | 'Feedback Rejected'
    | 'Feedback Pending'
    | 'Feedback Updated'
    | 'Feedback Approval Email'
    | 'Feedback Approval Email Failed'
    | 'Article Vlog Published'
    | 'Article Vlog Deleted'
    | 'Anti-Bot Security Blocked'
    | 'Invalid Webhook Signature'
    | 'System Keepalive Ping'
    | string;

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

