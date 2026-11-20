// =============================================================================
// lib/services/admin-feedback-queries.ts — Server-Only Feedback Queries
//
// Strictly isolated with `server-only` (NOT a 'use server' Server Action module)
// so these privileged Sanity + Supabase queries can never be invoked directly
// over HTTP by unauthenticated clients.
// =============================================================================

import 'server-only';
import { client } from '@/sanity/lib/client';
import { createAdminClient } from '@/lib/supabase/admin';
import type { OverviewPendingFeedback } from '@/types/admin-overview';

export function getAuthenticatedSanityClient() {
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

export interface SanityPendingFeedbackRaw {
  _id: string;
  name: string;
  email?: string;
  eventType: string;
  rating?: number;
  message: string;
  submittedAt?: string;
  _createdAt: string;
  photo?: { url?: string } | null;
}

/**
 * Resolves private client contact emails from RLS-protected Supabase storage
 * for a list of Sanity feedback document IDs (gracefully returns empty map if
 * migration 014 is not yet applied).
 */
export async function resolveFeedbackContactEmails(
  documentIds: string[]
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (documentIds.length === 0) return map;

  try {
    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin
      .from('client_feedback_contacts')
      .select('sanity_document_id, client_email')
      .in('sanity_document_id', documentIds);

    if (!error && Array.isArray(data)) {
      for (const row of data) {
        if (row.sanity_document_id && row.client_email) {
          map.set(row.sanity_document_id, row.client_email);
        }
      }
    }
  } catch {
    // Graceful fallback for environments before migration 014 is applied
  }

  return map;
}

/**
 * Fetches pending client feedbacks from Sanity CMS and enriches private emails
 * from Supabase `public.client_feedback_contacts`.
 * Callers MUST verify admin operator authorization prior to invoking.
 */
export async function fetchPendingFeedbacksInternal(): Promise<OverviewPendingFeedback[]> {
  try {
    const sanityClient = getAuthenticatedSanityClient();
    const rawItems = await sanityClient.fetch<SanityPendingFeedbackRaw[]>(
      GROQ_PENDING_FEEDBACKS,
      {},
      { cache: 'no-store' }
    );

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return [];
    }

    const emailMap = await resolveFeedbackContactEmails(rawItems.map((i) => i._id));

    return rawItems.map((item) => ({
      id: item._id,
      name: item.name || 'Anonymous Client',
      email: emailMap.get(item._id) || item.email || '',
      eventType: item.eventType || 'Event',
      rating: typeof item.rating === 'number' ? item.rating : 5,
      message: item.message || '',
      submittedAt: item.submittedAt || item._createdAt,
      photoUrl: item.photo?.url || null,
    }));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown Sanity query error';
    console.error('[admin-feedback-queries] Failed to fetch pending feedbacks from Sanity:', message);
    return [];
  }
}
