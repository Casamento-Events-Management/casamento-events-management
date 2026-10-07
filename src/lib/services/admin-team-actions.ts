// =============================================================================
// lib/services/admin-team-actions.ts — Server Actions for Team Administration
//
// Governs staff invites, activation toggles, role updates, and deletions.
// All actions require Super Admin authorization and generate immutable audit logs.
// Uses Supabase generateLink + Resend API to bypass Supabase built-in rate limits.
// =============================================================================

'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { getCurrentActiveAdmin } from '@/lib/services/adminProfileService';
import { logAuditEvent } from '@/lib/services/auditService';
import {
  inviteStaffSchema,
  toggleStaffStatusSchema,
  updateStaffRoleSchema,
  type InviteStaffInput,
  type ToggleStaffStatusInput,
  type UpdateStaffRoleInput,
} from '@/lib/schemas/admin-team';
import type { AdminProfile } from '@/types/admin-auth';

interface ActionResponse {
  success: boolean;
  error?: string;
  message?: string;
  inviteLink?: string;
}

/**
 * Dispatches a branded invitation email via Resend API directly.
 */
async function sendInviteEmail(
  toEmail: string,
  fullName: string,
  inviteUrl: string
): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[sendInviteEmail] RESEND_API_KEY not configured. Skipping email dispatch.');
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
              <p style="color: #BC6F07; margin: 4px 0 0 0; font-size: 11px; font-weight: 600; text-transform: uppercase;">Staff Management Portal</p>
            </td>
          </tr>
          <tr>
            <td style="color: #2B3817; font-size: 14px; line-height: 1.6;">
              <p>Hello <strong>${fullName}</strong>,</p>
              <p>You have been invited to join the <strong>Casamento Events Management Portal</strong> as an administrator.</p>
              <p>Please click the button below to accept your invitation and set up your account password:</p>
              <div style="text-align: center; margin: 28px 0;">
                <a href="${inviteUrl}" style="background-color: #3A4F1C; color: #FFFFFF; padding: 12px 28px; text-decoration: none; font-size: 13px; font-weight: 600; border-radius: 8px; display: inline-block;">Accept Invitation & Set Password</a>
              </div>
              <p style="font-size: 11px; color: #666; border-top: 1px solid #F0ECE1; padding-top: 16px;">
                If the button above does not work, copy and paste this link into your browser:<br/>
                <span style="color: #BC6F07; word-break: break-all;">${inviteUrl}</span>
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
        subject: 'Invitation to Join Casamento Admin Portal',
        html,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      console.warn('[sendInviteEmail Resend Warning]:', data);
      return { success: false, error: data.message || 'Resend delivery rejected.' };
    }

    return { success: true };
  } catch (err) {
    console.error('[sendInviteEmail Error]:', err);
    return { success: false, error: 'Network error during Resend dispatch.' };
  }
}

/**
 * Retrieves all registered admin profiles for the team directory.
 */
export async function getStaffMembers(): Promise<AdminProfile[]> {
  const currentAdmin = await getCurrentActiveAdmin();
  if (!currentAdmin) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('admin_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.error('[getStaffMembers Error]:', error);
    return [];
  }

  return data as AdminProfile[];
}

/**
 * Server Action: Invite a new staff member.
 * Generates an auth invitation link via Admin API and dispatches directly via Resend,
 * bypassing Supabase's built-in 3 emails/hour rate limiter.
 */
export async function inviteStaffAction(input: InviteStaffInput): Promise<ActionResponse> {
  const currentAdmin = await getCurrentActiveAdmin();
  if (!currentAdmin || currentAdmin.profile.role !== 'super_admin') {
    return { success: false, error: 'Unauthorized. Super Admin permissions required.' };
  }

  const parsed = inviteStaffSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid input data.',
    };
  }

  const { email, fullName, role } = parsed.data;
  const supabaseAdmin = createAdminClient();

  // Check if profile already exists in admin_profiles
  const { data: existingProfile } = await supabaseAdmin
    .from('admin_profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existingProfile) {
    return {
      success: false,
      error: 'An administrator account with this email address already exists.',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://casamentoevents.com';
  const redirectTo = `${siteUrl}/auth/callback?next=/admin/reset-password`;

  // 1. Generate invitation token & link without hitting Supabase built-in email rate limits
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'invite',
    email,
    options: {
      redirectTo,
      data: { full_name: fullName },
    },
  });

  if (linkError || !linkData.user || !linkData.properties?.action_link) {
    console.error('[inviteStaffAction generateLink Error]:', linkError);
    return {
      success: false,
      error: linkError?.message || 'Failed to generate invitation link.',
    };
  }

  const inviteLink = linkData.properties.action_link;

  // 2. Provision admin profile linked to the new auth user
  const { error: profileError } = await supabaseAdmin.from('admin_profiles').insert({
    user_id: linkData.user.id,
    email,
    full_name: fullName,
    role,
    is_active: true,
  });

  if (profileError) {
    console.error('[inviteStaffAction Profile Error]:', profileError);
    return {
      success: false,
      error: 'Failed to record administrator profile.',
    };
  }

  // 3. Dispatch the email via Resend API directly
  await sendInviteEmail(email, fullName, inviteLink);

  // 4. Record audit event
  await logAuditEvent({
    actorUserId: currentAdmin.user.id,
    actorEmail: currentAdmin.user.email,
    action: 'admin.profile_created',
    targetResource: 'admin_profiles',
    details: { invitedUserId: linkData.user.id, email, fullName, role },
  });

  revalidatePath('/admin/team');
  return {
    success: true,
    message: `Invitation generated successfully for ${email}.`,
    inviteLink,
  };
}

/**
 * Server Action: Toggle active status (Instant Deactivation / Reactivation).
 */
export async function toggleStaffStatusAction(
  input: ToggleStaffStatusInput
): Promise<ActionResponse> {
  const currentAdmin = await getCurrentActiveAdmin();
  if (!currentAdmin || currentAdmin.profile.role !== 'super_admin') {
    return { success: false, error: 'Unauthorized. Super Admin permissions required.' };
  }

  const parsed = toggleStaffStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: 'Invalid input parameters.' };
  }

  const { userId, isActive } = parsed.data;

  // Safeguard: Prevent self-deactivation
  if (userId === currentAdmin.user.id) {
    return { success: false, error: 'You cannot deactivate your own administrative account.' };
  }

  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin
    .from('admin_profiles')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('user_id', userId);

  if (error) {
    console.error('[toggleStaffStatusAction Error]:', error);
    return { success: false, error: 'Failed to update account status.' };
  }

  await logAuditEvent({
    actorUserId: currentAdmin.user.id,
    actorEmail: currentAdmin.user.email,
    action: isActive ? 'admin.profile_activated' : 'admin.profile_deactivated',
    targetResource: 'admin_profiles',
    details: { targetUserId: userId, newStatus: isActive },
  });

  revalidatePath('/admin/team');
  return {
    success: true,
    message: `Account status successfully set to ${isActive ? 'Active' : 'Deactivated'}.`,
  };
}

/**
 * Server Action: Update staff role (Admin <-> Super Admin).
 */
export async function updateStaffRoleAction(input: UpdateStaffRoleInput): Promise<ActionResponse> {
  const currentAdmin = await getCurrentActiveAdmin();
  if (!currentAdmin || currentAdmin.profile.role !== 'super_admin') {
    return { success: false, error: 'Unauthorized. Super Admin permissions required.' };
  }

  const parsed = updateStaffRoleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: 'Invalid input parameters.' };
  }

  const { userId, role } = parsed.data;

  // Safeguard: Prevent self-demotion
  if (userId === currentAdmin.user.id && role !== 'super_admin') {
    return { success: false, error: 'You cannot demote yourself from Super Administrator.' };
  }

  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin
    .from('admin_profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('user_id', userId);

  if (error) {
    console.error('[updateStaffRoleAction Error]:', error);
    return { success: false, error: 'Failed to update staff role.' };
  }

  await logAuditEvent({
    actorUserId: currentAdmin.user.id,
    actorEmail: currentAdmin.user.email,
    action: 'admin.profile_updated',
    targetResource: 'admin_profiles',
    details: { targetUserId: userId, newRole: role },
  });

  revalidatePath('/admin/team');
  return {
    success: true,
    message: `Staff role successfully updated to ${role === 'super_admin' ? 'Super Admin' : 'Admin'}.`,
  };
}

/**
 * Server Action: Resend invitation link to a pending staff member.
 */
export async function resendInviteAction(userId: string): Promise<ActionResponse> {
  const currentAdmin = await getCurrentActiveAdmin();
  if (!currentAdmin || currentAdmin.profile.role !== 'super_admin') {
    return { success: false, error: 'Unauthorized. Super Admin permissions required.' };
  }

  const supabaseAdmin = createAdminClient();
  const { data: profile } = await supabaseAdmin
    .from('admin_profiles')
    .select('email, full_name')
    .eq('user_id', userId)
    .single();

  if (!profile) {
    return { success: false, error: 'Administrator profile not found.' };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://casamentoevents.com';
  const redirectTo = `${siteUrl}/auth/callback?next=/admin/reset-password`;

  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'invite',
    email: profile.email,
    options: {
      redirectTo,
      data: { full_name: profile.full_name },
    },
  });

  if (linkError || !linkData.properties?.action_link) {
    return { success: false, error: linkError?.message || 'Failed to re-generate invitation link.' };
  }

  const inviteLink = linkData.properties.action_link;

  await sendInviteEmail(profile.email, profile.full_name, inviteLink);

  await logAuditEvent({
    actorUserId: currentAdmin.user.id,
    actorEmail: currentAdmin.user.email,
    action: 'admin.profile_updated',
    targetResource: 'admin_profiles',
    details: { targetUserId: userId, resendInvite: true },
  });

  return {
    success: true,
    message: `Invitation re-dispatched to ${profile.email}.`,
    inviteLink,
  };
}

/**
 * Server Action: Permanently remove staff member and revoke account.
 */
export async function removeStaffAction(userId: string): Promise<ActionResponse> {
  const currentAdmin = await getCurrentActiveAdmin();
  if (!currentAdmin || currentAdmin.profile.role !== 'super_admin') {
    return { success: false, error: 'Unauthorized. Super Admin permissions required.' };
  }

  // Safeguard: Prevent self-deletion
  if (userId === currentAdmin.user.id) {
    return { success: false, error: 'You cannot delete your own administrative account.' };
  }

  const supabaseAdmin = createAdminClient();

  // Deleting user from auth.users cascades to admin_profiles
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) {
    console.error('[removeStaffAction Error]:', error);
    return { success: false, error: 'Failed to revoke staff account.' };
  }

  await logAuditEvent({
    actorUserId: currentAdmin.user.id,
    actorEmail: currentAdmin.user.email,
    action: 'admin.profile_deactivated',
    targetResource: 'admin_profiles',
    details: { deletedUserId: userId },
  });

  revalidatePath('/admin/team');
  return {
    success: true,
    message: 'Staff account successfully removed.',
  };
}
