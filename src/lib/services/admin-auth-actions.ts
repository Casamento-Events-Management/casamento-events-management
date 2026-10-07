// =============================================================================
// lib/services/admin-auth-actions.ts — Server Actions for Admin Authentication
//
// Consolidates all admin auth mutations (login, logout, password resets).
// Enforces Zod validation, reCAPTCHA v3 bot checking, and immutable audit logs.
// =============================================================================

'use server';

import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { getAdminProfileById } from '@/lib/services/adminProfileService';
import { logAuditEvent } from '@/lib/services/auditService';
import { verifyRecaptchaToken } from '@/lib/services/recaptchaService';
import {
  adminLoginSchema,
  adminForgotPasswordSchema,
  adminResetPasswordSchema,
  type AdminLoginInput,
  type AdminForgotPasswordInput,
  type AdminResetPasswordInput,
} from '@/lib/schemas/admin-auth';
import type { AuthActionResult } from '@/types/admin-auth';

/**
 * Extracts request metadata (IP address and User-Agent) for security audit logging.
 */
async function getRequestMetadata(): Promise<{ ip: string | null; userAgent: string | null }> {
  try {
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : realIp;
    const userAgent = headersList.get('user-agent');
    return { ip: ip || null, userAgent: userAgent || null };
  } catch {
    return { ip: null, userAgent: null };
  }
}

/**
 * Server Action: Admin Login
 */
export async function loginAdminAction(input: AdminLoginInput): Promise<AuthActionResult> {
  const { ip, userAgent } = await getRequestMetadata();

  // 1. Zod Validation
  const parsed = adminLoginSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please enter a valid email and password.',
    };
  }

  const { email, password, recaptchaToken, returnUrl } = parsed.data;

  // 2. Anti-bot Verification
  if (recaptchaToken) {
    const recaptchaResult = await verifyRecaptchaToken(recaptchaToken, 'admin_login');
    if (!recaptchaResult.success) {
      await logAuditEvent({
        actorEmail: email,
        action: 'auth.login.bot_blocked',
        targetResource: 'auth',
        details: { score: recaptchaResult.score, error: recaptchaResult.error },
        ipAddress: ip,
        userAgent,
      });
      return {
        success: false,
        error: 'Security verification failed. Please try again.',
      };
    }
  }

  // 3. Supabase Auth Verification
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    await logAuditEvent({
      actorEmail: email,
      action: 'auth.login.failed',
      targetResource: 'auth',
      details: { reason: authError?.message || 'Invalid credentials' },
      ipAddress: ip,
      userAgent,
    });
    // Mask specific error to prevent account enumeration
    return {
      success: false,
      error: 'Invalid email or password.',
    };
  }

  const user = authData.user;

  // 4. Authorization & Active Profile Verification
  const profile = await getAdminProfileById(user.id);

  if (!profile || !profile.is_active) {
    // Immediately invalidate the authenticated session
    await supabase.auth.signOut();

    await logAuditEvent({
      actorUserId: user.id,
      actorEmail: user.email,
      action: 'auth.login.inactive_blocked',
      targetResource: 'admin_profiles',
      details: { hasProfile: !!profile, isActive: profile?.is_active ?? false },
      ipAddress: ip,
      userAgent,
    });

    return {
      success: false,
      error: 'Access denied. Account is inactive or not provisioned as an admin.',
    };
  }

  // 5. Audit Success & Return Redirect
  await logAuditEvent({
    actorUserId: user.id,
    actorEmail: user.email,
    action: 'auth.login.success',
    targetResource: 'auth',
    details: { role: profile.role },
    ipAddress: ip,
    userAgent,
  });

  const destination = returnUrl && returnUrl.startsWith('/admin') ? returnUrl : '/admin/dashboard';

  return {
    success: true,
    redirectUrl: destination,
  };
}

/**
 * Server Action: Admin Logout
 */
export async function logoutAdminAction(): Promise<AuthActionResult> {
  const { ip, userAgent } = await getRequestMetadata();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.auth.signOut();

  if (user) {
    await logAuditEvent({
      actorUserId: user.id,
      actorEmail: user.email,
      action: 'auth.logout',
      targetResource: 'auth',
      ipAddress: ip,
      userAgent,
    });
  }

  return {
    success: true,
    redirectUrl: '/admin/login',
  };
}

/**
 * Server Action: Request Password Reset
 */
export async function requestPasswordResetAction(
  input: AdminForgotPasswordInput
): Promise<AuthActionResult> {
  const { ip, userAgent } = await getRequestMetadata();

  const parsed = adminForgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please provide a valid email address.',
    };
  }

  const { email, recaptchaToken } = parsed.data;

  if (recaptchaToken) {
    const recaptchaResult = await verifyRecaptchaToken(recaptchaToken, 'admin_forgot_password');
    if (!recaptchaResult.success) {
      return {
        success: false,
        error: 'Security verification failed. Please try again.',
      };
    }
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://casamentoevents.com';
  const redirectTo = `${siteUrl}/admin/reset-password`;

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  await logAuditEvent({
    actorEmail: email,
    action: 'auth.password_reset_request',
    targetResource: 'auth',
    ipAddress: ip,
    userAgent,
  });

  // Always return identical success message to prevent user enumeration
  return {
    success: true,
    message: 'If an authorized admin account exists with this email, a reset link has been dispatched.',
  };
}

/**
 * Server Action: Update Password
 */
export async function updatePasswordAction(
  input: AdminResetPasswordInput
): Promise<AuthActionResult> {
  const { ip, userAgent } = await getRequestMetadata();

  const parsed = adminResetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid password format.',
    };
  }

  const { password } = parsed.data;
  const supabase = await createClient();

  const {
    data: { user },
    error: updateError,
  } = await supabase.auth.updateUser({
    password,
  });

  if (updateError || !user) {
    return {
      success: false,
      error: updateError?.message || 'Failed to update password. Session may have expired.',
    };
  }

  await logAuditEvent({
    actorUserId: user.id,
    actorEmail: user.email,
    action: 'auth.password_reset_success',
    targetResource: 'auth',
    ipAddress: ip,
    userAgent,
  });

  return {
    success: true,
    message: 'Password successfully updated. You may now access the dashboard.',
    redirectUrl: '/admin/dashboard',
  };
}
