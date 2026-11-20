// =============================================================================
// lib/services/admin-feedback-service.ts — Server Actions for Feedback Review
//
// Every exported function in this 'use server' module strictly enforces
// authenticated admin operator (admin / super_admin) authorization.
// =============================================================================

'use server';

import { revalidateTag, revalidatePath } from 'next/cache';
import { getCurrentActiveAdmin } from '@/lib/services/adminProfileService';
import { logAudit } from '@/lib/services/auditService';
import { sendClientApprovalConfirmationEmail } from '@/lib/services/feedbackService';
import {
  fetchPendingFeedbacksInternal,
  getAuthenticatedSanityClient,
  resolveFeedbackContactEmails,
  type SanityPendingFeedbackRaw,
} from '@/lib/services/admin-feedback-queries';
import type { OverviewPendingFeedback } from '@/types/admin-overview';

/**
 * Server Action: Fetches pending feedbacks for client-side overview polling.
 * Enforces admin operator authorization.
 */
export async function getPendingFeedbacksAction(): Promise<{
  success: boolean;
  feedbacks?: OverviewPendingFeedback[];
  error?: string;
}> {
  const adminData = await getCurrentActiveAdmin();
  if (!adminData) {
    return { success: false, error: 'Unauthorized: Active admin session required.' };
  }

  if (adminData.profile.role === 'staff') {
    return { success: false, error: 'Forbidden: Staff cannot access feedback reviews.' };
  }

  const feedbacks = await fetchPendingFeedbacksInternal();
  return { success: true, feedbacks };
}

/**
 * Server Action: Approves a pending feedback item in Sanity CMS.
 * Dispatches client confirmation email, logs audit trail, and revalidates cache.
 */
export async function approveFeedbackAction(feedbackId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const adminData = await getCurrentActiveAdmin();
  if (!adminData) {
    return { success: false, error: 'Unauthorized: Active admin session required.' };
  }

  if (adminData.profile.role === 'staff') {
    return { success: false, error: 'Forbidden: Only Admins can approve feedbacks.' };
  }

  if (!feedbackId || typeof feedbackId !== 'string') {
    return { success: false, error: 'Invalid feedback identifier.' };
  }

  try {
    const sanityClient = getAuthenticatedSanityClient();

    // 1. Fetch document metadata for email and audit
    const existingDoc = await sanityClient.getDocument<SanityPendingFeedbackRaw>(feedbackId);
    if (!existingDoc) {
      return { success: false, error: 'Feedback document not found in CMS.' };
    }

    const emailMap = await resolveFeedbackContactEmails([feedbackId]);
    const resolvedEmail = emailMap.get(feedbackId) || existingDoc.email || '';

    // 2. Patch status in Sanity
    await sanityClient
      .patch(feedbackId)
      .set({
        status: 'approved',
        approvedAt: new Date().toISOString(),
        approvedBy: adminData.profile.full_name,
      })
      .commit();

    // 3. Revalidate ISR cache tags
    try {
      revalidateTag('clientFeedback', 'max');
      revalidatePath('/articles/feedback');
      revalidatePath('/articles');
    } catch (revErr) {
      console.warn('[admin-feedback-service] Cache revalidation notice:', revErr);
    }

    // 4. Log Audit Trail
    void logAudit({
      category: 'Feedback',
      action: 'Feedback Approved',
      severity: 'Info',
      outcome: 'Success',
      summary: `Feedback approved for ${existingDoc.name} (${existingDoc.eventType || 'Event'})`,
      actorType: 'admin',
      actorCode: adminData.profile.role.toUpperCase(),
      actorName: adminData.profile.full_name,
      actorEmail: adminData.profile.email,
      entityType: 'clientFeedback',
      entityId: feedbackId,
      entityRef: resolvedEmail || feedbackId,
      metadata: {
        documentId: feedbackId,
        clientName: existingDoc.name,
        eventType: existingDoc.eventType,
        rating: existingDoc.rating,
      },
    });

    // 5. Send approval email to client if email exists
    if (resolvedEmail) {
      void sendClientApprovalConfirmationEmail(
        resolvedEmail,
        existingDoc.name,
        existingDoc.eventType || 'Event'
      );
    }

    return { success: true };
  } catch (err) {
    console.error('[admin-feedback-service Approve Error]:', err);
    return {
      success: false,
      error: 'Failed to approve feedback in CMS.',
    };
  }
}

/**
 * Server Action: Rejects a pending feedback item in Sanity CMS.
 */
export async function rejectFeedbackAction(feedbackId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const adminData = await getCurrentActiveAdmin();
  if (!adminData) {
    return { success: false, error: 'Unauthorized: Active admin session required.' };
  }

  if (adminData.profile.role === 'staff') {
    return { success: false, error: 'Forbidden: Only Admins can reject feedbacks.' };
  }

  if (!feedbackId || typeof feedbackId !== 'string') {
    return { success: false, error: 'Invalid feedback identifier.' };
  }

  try {
    const sanityClient = getAuthenticatedSanityClient();

    const existingDoc = await sanityClient.getDocument<SanityPendingFeedbackRaw>(feedbackId);
    if (!existingDoc) {
      return { success: false, error: 'Feedback document not found in CMS.' };
    }

    const emailMap = await resolveFeedbackContactEmails([feedbackId]);
    const resolvedEmail = emailMap.get(feedbackId) || existingDoc.email || '';

    // Patch status to 'rejected'
    await sanityClient
      .patch(feedbackId)
      .set({
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
        rejectedBy: adminData.profile.full_name,
      })
      .commit();

    try {
      revalidateTag('clientFeedback', 'max');
    } catch (revErr) {
      console.warn('[admin-feedback-service] Cache revalidation notice:', revErr);
    }

    // Log Audit Trail
    void logAudit({
      category: 'Feedback',
      action: 'Feedback Rejected',
      severity: 'Warning',
      outcome: 'Success',
      summary: `Feedback rejected for ${existingDoc.name} (${existingDoc.eventType || 'Event'})`,
      actorType: 'admin',
      actorCode: adminData.profile.role.toUpperCase(),
      actorName: adminData.profile.full_name,
      actorEmail: adminData.profile.email,
      entityType: 'clientFeedback',
      entityId: feedbackId,
      entityRef: resolvedEmail || feedbackId,
      metadata: {
        documentId: feedbackId,
        clientName: existingDoc.name,
        eventType: existingDoc.eventType,
      },
    });

    return { success: true };
  } catch (err) {
    console.error('[admin-feedback-service Reject Error]:', err);
    return {
      success: false,
      error: 'Failed to reject feedback in CMS.',
    };
  }
}
