// =============================================================================
// lib/services/admin-auth-actions.ts — Server Actions for Admin Authentication
//
// Consolidates all admin auth mutations (login, logout, password resets).
// Enforces Zod validation, reCAPTCHA v3 bot checking, and immutable audit logs.
// =============================================================================

'use server';

import { cookies, headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAdminProfileById, getCurrentActiveAdmin } from '@/lib/services/adminProfileService';
import { logAuditEvent } from '@/lib/services/auditService';
import { verifyRecaptchaToken } from '@/lib/services/recaptchaService';
import {
  escapeHtml,
  getTrustedSiteUrl,
  isSafeAdminRedirectPath,
} from '@/lib/utils/securityUtils';
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
 * Resolves the canonical trusted base URL of the application.
 * Never trusts raw incoming `Host` or `X-Forwarded-Host` headers for security-sensitive links.
 */
function getBaseSiteUrl(): string {
  return getTrustedSiteUrl();
}

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

  // 2. Anti-bot Verification (unconditional — cannot be bypassed by omitting recaptchaToken)
  const recaptchaResult = await verifyRecaptchaToken(recaptchaToken || '', 'admin_login');
  if (!recaptchaResult.success) {
    await logAuditEvent({
      actorEmail: email,
      action: 'Login Bot Blocked',
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

  // 3. Supabase Auth Verification
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    await logAuditEvent({
      actorEmail: email,
      action: 'Login Failed',
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
      action: 'Inactive Account Blocked',
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
    action: 'Admin Login',
    targetResource: 'auth',
    details: { role: profile.role },
    ipAddress: ip,
    userAgent,
  });

  const destination = isSafeAdminRedirectPath(returnUrl) ? returnUrl : '/admin/dashboard';

  return {
    success: true,
    redirectUrl: destination,
  };
}

/**
 * Server Action: Admin Logout
 * Revokes all active sessions globally in Supabase Auth and forcefully purges
 * all Supabase auth cookies from the HTTP response.
 */
export async function logoutAdminAction(): Promise<AuthActionResult> {
  const { ip, userAgent } = await getRequestMetadata();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error: signOutError } = await supabase.auth.signOut({ scope: 'global' });
  if (signOutError) {
    console.error('[logoutAdminAction signOut Error]:', signOutError.message);
  }

  // Defense-in-depth: explicitly expire all Supabase auth cookies even if upstream signOut errored
  try {
    const cookieStore = await cookies();
    const isProd = process.env.NODE_ENV === 'production';
    for (const cookie of cookieStore.getAll()) {
      if (cookie.name.startsWith('sb-')) {
        cookieStore.set(cookie.name, '', {
          path: '/',
          maxAge: 0,
          sameSite: 'lax',
          secure: isProd,
        });
      }
    }
  } catch (cookieErr) {
    console.error('[logoutAdminAction Cookie Clear Error]:', cookieErr);
  }

  if (user) {
    await logAuditEvent({
      actorUserId: user.id,
      actorEmail: user.email,
      action: 'Admin Logout',
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
/**
 * Dispatches a branded password reset email via Resend API directly.
 */
async function sendPasswordResetEmail(
  toEmail: string,
  fullName: string,
  resetUrl: string
): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[sendPasswordResetEmail] RESEND_API_KEY not configured. Skipping email dispatch.');
    return { success: true };
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F7F3E8; margin: 0; padding: 40px 20px;">
        <table align="center" width="100%" style="max-width: 520px; background-color: #FFFFFF; border: 1px solid #EFEAD8; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <h2 style="color: #2B3817; margin: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 2px;">Casamento Events</h2>
              <p style="color: #BC6F07; margin: 4px 0 0 0; font-size: 11px; font-weight: 600; text-transform: uppercase;">Admin Portal Security</p>
            </td>
          </tr>
          <tr>
            <td style="color: #2B3817; font-size: 14px; line-height: 1.6;">
              <p>Hello <strong>${escapeHtml(fullName)}</strong>,</p>
              <p>We received a request to reset the password for your <strong>Casamento Events Admin</strong> account.</p>
              <p>Click the button below to choose a new password. This link is valid for 1 hour:</p>
              <div style="text-align: center; margin: 28px 0;">
                <a href="${escapeHtml(resetUrl)}" style="background-color: #3A4F1C; color: #FFFFFF; padding: 12px 28px; text-decoration: none; font-size: 13px; font-weight: 600; border-radius: 8px; display: inline-block;">Reset Password</a>
              </div>
              <p style="font-size: 11px; color: #666; border-top: 1px solid #F0ECE1; padding-top: 16px;">
                If you did not request a password reset, please ignore this email or notify the administrative team.<br/><br/>
                If the button above does not work, copy and paste this link into your browser:<br/>
                <span style="color: #BC6F07; word-break: break-all;">${escapeHtml(resetUrl)}</span>
              </p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: `Casamento Events <${process.env.CONTACT_EMAIL_FROM || 'hello@casamentoevents.com'}>`,
        to: [toEmail],
        subject: 'Reset Your Casamento Admin Password',
        html,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      console.warn('[sendPasswordResetEmail Resend Warning]:', data);
      return { success: false, error: data.message || 'Resend delivery rejected.' };
    }

    return { success: true };
  } catch (err) {
    console.error('[sendPasswordResetEmail Error]:', err);
    return { success: false, error: 'Network error during Resend dispatch.' };
  }
}

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

  // Unconditional anti-bot verification
  const recaptchaResult = await verifyRecaptchaToken(recaptchaToken || '', 'admin_forgot_password');
  if (!recaptchaResult.success) {
    return {
      success: false,
      error: 'Security verification failed. Please try again.',
    };
  }

  const supabaseAdmin = createAdminClient();

  // Verify email belongs to an active administrator
  const { data: adminProfile } = await supabaseAdmin
    .from('admin_profiles')
    .select('id, full_name, is_active')
    .eq('email', email)
    .maybeSingle();

  if (adminProfile && adminProfile.is_active) {
    const siteUrl = getBaseSiteUrl();
    const redirectTo = `${siteUrl}/auth/callback?next=/admin/reset-password`;

    // Generate recovery link with token_hash (bypasses Supabase built-in email rate limits)
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo,
      },
    });

    if (linkError) {
      console.error('[requestPasswordResetAction generateLink Error]:', linkError.message);
    } else if (linkData?.properties) {
      const tokenHash = linkData.properties.hashed_token;
      const verificationType = linkData.properties.verification_type || 'recovery';
      const directResetLink = tokenHash
        ? `${siteUrl}/auth/callback?token_hash=${tokenHash}&type=${verificationType}&next=/admin/reset-password`
        : linkData.properties.action_link || `${siteUrl}/admin/login`;

      const emailResult = await sendPasswordResetEmail(
        email,
        adminProfile.full_name || 'Administrator',
        directResetLink
      );

      if (!emailResult.success) {
        console.warn('[requestPasswordResetAction Resend Notice]:', emailResult.error);
      }
    }

    await logAuditEvent({
      actorUserId: adminProfile.id,
      actorEmail: email,
      action: 'Password Reset Request',
      targetResource: 'auth',
      ipAddress: ip,
      userAgent,
    });
  } else {
    // Audit attempt for unknown/inactive email to prevent user enumeration
    await logAuditEvent({
      actorEmail: email,
      action: 'Password Reset Request Unmatched',
      targetResource: 'auth',
      ipAddress: ip,
      userAgent,
    });
  }

  // Always return identical success message to prevent user enumeration
  return {
    success: true,
    message: 'If an authorized admin account exists with this email, a reset link has been sent.',
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

  // Require an active administrative profile before permitting password changes
  const activeAdmin = await getCurrentActiveAdmin();
  if (!activeAdmin) {
    return {
      success: false,
      error: 'Unauthorized: An active administrative session is required to update your password.',
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

  // Revoke all other active sessions on other devices after a password change
  const { error: revokeError } = await supabase.auth.signOut({ scope: 'others' });
  if (revokeError) {
    console.warn('[updatePasswordAction Revoke Other Sessions Warning]:', revokeError.message);
  }

  await logAuditEvent({
    actorUserId: user.id,
    actorEmail: user.email,
    action: 'Admin Password Reset',
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
