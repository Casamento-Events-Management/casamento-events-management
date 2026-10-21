// =============================================================================
// lib/services/admin-feedback-service.ts — Server Service & Actions for Feedback Review
// =============================================================================

'use server';

import { revalidateTag, revalidatePath } from 'next/cache';
import { client } from '@/sanity/lib/client';
import { getCurrentActiveAdmin } from '@/lib/services/adminProfileService';
import { logAudit } from '@/lib/services/auditService';
import { sendClientApprovalConfirmationEmail } from '@/lib/services/feedbackService';
import type { OverviewPendingFeedback } from '@/types/admin-overview';

/**
 * Returns an authenticated Sanity write client using server-isolated SANITY_API_WRITE_TOKEN.
 */
function getAuthenticatedSanityClient() {
  const writeToken = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN;
  if (!writeToken) {
    throw new Error('SANITY_API_WRITE_TOKEN is not configured on the server.');
  }

  return client.withConfig({
    token: writeToken,
    useCdn: false,
  });
}

const GROQ_PENDING_FEEDBACKS = `
  *[_type == "clientFeedback" && status == "pending"] | order(submittedAt desc, _createdAt desc)[0...15] {
    _id,
    name,
    email,
    eventType,
    rating,
    message,
    submittedAt,
    _createdAt,
    photo {
      "url": asset->url
    }
  }
`;

interface SanityPendingFeedbackRaw {
  _id: string;
  name: string;
  email: string;
  eventType: string;
  rating?: number;
  message: string;
  submittedAt?: string;
  _createdAt: string;
  photo?: { url?: string } | null;
}

/**
 * Fetches pending client feedbacks from Sanity CMS.
 * Server-only helper (never exposed to browser bundles).
 */
export async function fetchPendingFeedbacks(): Promise<OverviewPendingFeedback[]> {
  try {
    const sanityClient = getAuthenticatedSanityClient();
    const rawItems = await sanityClient.fetch<SanityPendingFeedbackRaw[]>(
      GROQ_PENDING_FEEDBACKS,
      {},
      { cache: 'no-store' }
    );

    if (!Array.isArray(rawItems)) {
      return [];
    }

    return rawItems.map((item) => ({
      id: item._id,
      name: item.name || 'Anonymous Client',
      email: item.email || '',
      eventType: item.eventType || 'Event',
      rating: typeof item.rating === 'number' ? item.rating : 5,
      message: item.message || '',
      submittedAt: item.submittedAt || item._createdAt,
      photoUrl: item.photo?.url || null,
    }));
  } catch (err) {
    console.error('[admin-feedback-service] Failed to fetch pending feedbacks from Sanity:', err);
    return [];
  }
}

/**
 * Server Action: Fetches pending feedbacks for client-side overview polling.
 * Enforces admin authorization.
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

  const feedbacks = await fetchPendingFeedbacks();
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

  try {
    const sanityClient = getAuthenticatedSanityClient();

    // 1. Fetch document metadata for email and audit
    const existingDoc = await sanityClient.getDocument<SanityPendingFeedbackRaw>(feedbackId);
    if (!existingDoc) {
      return { success: false, error: 'Feedback document not found in CMS.' };
    }

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
      entityRef: existingDoc.email || feedbackId,
      metadata: {
        documentId: feedbackId,
        clientName: existingDoc.name,
        eventType: existingDoc.eventType,
        rating: existingDoc.rating,
      },
    });

    // 5. Send approval email to client if email exists
    if (existingDoc.email) {
      void sendClientApprovalConfirmationEmail(
        existingDoc.email,
        existingDoc.name,
        existingDoc.eventType || 'Event'
      );
    }

    return { success: true };
  } catch (err) {
    console.error('[admin-feedback-service Approve Error]:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to approve feedback in Sanity.',
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

  try {
    const sanityClient = getAuthenticatedSanityClient();

    const existingDoc = await sanityClient.getDocument<SanityPendingFeedbackRaw>(feedbackId);
    if (!existingDoc) {
      return { success: false, error: 'Feedback document not found in CMS.' };
    }

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
      entityRef: existingDoc.email || feedbackId,
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
      error: err instanceof Error ? err.message : 'Failed to reject feedback in Sanity.',
    };
  }
}
