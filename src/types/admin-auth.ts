// =============================================================================
// types/admin-auth.ts — Admin Authentication & Authorization Types
// =============================================================================

export type AdminRole = 'super_admin' | 'admin';

export interface AdminProfile {
    id: string;
    user_id: string;
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
    | 'admin.profile_activated';

export interface AdminAuditLog {
    id: string;
    actor_user_id: string | null;
    actor_email: string | null;
    action: AdminAuditAction | string;
    target_resource: string;
    details: Record<string, unknown>;
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
