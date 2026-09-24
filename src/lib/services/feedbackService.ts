import { client } from '@/sanity/lib/client';
import { clientFeedbackMockItems } from '@/data/clientFeedbackMock';
import { parseFeedbackEmailRecipients } from '@/lib/utils/envUtils';
import type { ClientFeedback } from '@/types';
import type { FeedbackFormData } from '@/lib/schemas/feedback';

// GROQ Queries — Lean projection for public website display (excludes email, phone, adminNote)
export const GROQ_APPROVED_FEEDBACKS = `
  *[_type == "clientFeedback" && status == "approved"] | order(priority desc, submittedAt desc) {
    _id, _type, _createdAt, _updatedAt, _rev,
    name,
    eventType,
    rating,
    message,
    photo {
      "asset": { "_ref": asset._ref, "_type": "reference", "url": asset->url },
      alt
    },
    submittedAt,
    isFeatured,
    priority
  }
`;

export const GROQ_FEATURED_FEEDBACKS = `
  *[_type == "clientFeedback" && status == "approved" && isFeatured == true] | order(priority desc, submittedAt desc) {
    _id, _type, _createdAt, _updatedAt, _rev,
    name,
    eventType,
    rating,
    message,
    photo {
      "asset": { "_ref": asset._ref, "_type": "reference", "url": asset->url },
      alt
    },
    submittedAt,
    isFeatured,
    priority
  }
`;

export const GROQ_ALL_APPROVED_FEEDBACKS_PAGINATED = `
  *[_type == "clientFeedback" && status == "approved"] | order(priority desc, submittedAt desc) [$start...$end] {
    _id, _type, _createdAt, _updatedAt, _rev,
    name,
    eventType,
    rating,
    message,
    photo {
      "asset": { "_ref": asset._ref, "_type": "reference", "url": asset->url },
      alt
    },
    submittedAt,
    isFeatured,
    priority
  }
`;

export const GROQ_APPROVED_FEEDBACKS_COUNT = `
  count(*[_type == "clientFeedback" && status == "approved"])
`;

/**
 * Fetch featured approved client feedbacks for the Articles hub page slider.
 * Uses ISR tag-based caching (`tags: ['clientFeedback']`, revalidate: 3600).
 * Falls back to mock items if fetch fails or no featured items found.
 */
export async function getFeaturedFeedbacks(): Promise<ClientFeedback[]> {
  try {
    const data = await client.fetch<ClientFeedback[]>(
      GROQ_FEATURED_FEEDBACKS,
      {},
      { next: { revalidate: 3600, tags: ['clientFeedback'] } }
    );
    if (data && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn('[feedbackService] Failed to fetch featured client feedbacks:', err);
  }

  // Fallback: Return all approved or mock items if no featured flag is set yet
  const allApproved = await getApprovedFeedbacks();
  const featured = allApproved.filter((item) => item.isFeatured);
  return featured.length > 0 ? featured : allApproved;
}

/**
 * Fetch all approved client feedbacks from Sanity for public display.
 */
export async function getApprovedFeedbacks(): Promise<ClientFeedback[]> {
  try {
    const data = await client.fetch<ClientFeedback[]>(
      GROQ_APPROVED_FEEDBACKS,
      {},
      { next: { revalidate: 3600, tags: ['clientFeedback'] } }
    );
    if (data && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn('[feedbackService] Failed to fetch approved client feedbacks:', err);
  }

  return clientFeedbackMockItems;
}

/**
 * Get total count of approved client feedbacks.
 */
export async function getApprovedFeedbacksCount(): Promise<number> {
  try {
    const count = await client.fetch<number>(
      GROQ_APPROVED_FEEDBACKS_COUNT,
      {},
      { next: { revalidate: 3600, tags: ['clientFeedback'] } }
    );
    if (typeof count === 'number' && count > 0) {
      return count;
    }
  } catch (err) {
    console.warn('[feedbackService] Failed to fetch approved client feedbacks count:', err);
  }

  return clientFeedbackMockItems.length;
}

/**
 * Fetch a page of approved client feedbacks for `/articles/feedback` paginated views.
 */
export async function getApprovedFeedbacksPage(
  page: number,
  pageSize = 12
): Promise<ClientFeedback[]> {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  try {
    const data = await client.fetch<ClientFeedback[]>(
      GROQ_ALL_APPROVED_FEEDBACKS_PAGINATED,
      { start, end },
      { next: { revalidate: 3600, tags: ['clientFeedback'] } }
    );
    if (data && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn(`[feedbackService] Failed to fetch feedback page ${page}:`, err);
  }

  // Fallback slicing mock items
  return clientFeedbackMockItems.slice(start, end);
}

/**
 * Calculate aggregate rating for JSON-LD dynamic schema injection.
 */
export async function getAggregateRating(): Promise<{ average: number; count: number }> {
  const feedbacks = await getApprovedFeedbacks();
  if (!feedbacks || feedbacks.length === 0) {
    return { average: 5.0, count: 0 };
  }

  const sum = feedbacks.reduce((acc, f) => acc + (f.rating || 5), 0);
  const average = Number((sum / feedbacks.length).toFixed(1));
  return { average, count: feedbacks.length };
}

/**
 * Sends an email notification to all configured Casamento team members when a new feedback is submitted.
 */
export async function sendAdminFeedbackNotificationEmail(
  payload: FeedbackFormData
): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const recipients = parseFeedbackEmailRecipients();

  if (recipients.length === 0) {
    console.warn('[feedbackService] No feedback email recipients configured. Skipping notification.');
    return { success: true };
  }

  if (!apiKey) {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        '[feedbackService] RESEND_API_KEY not set. Mocking admin email dispatch to:',
        recipients,
        payload
      );
    }
    return { success: true };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: `Casamento Feedback System <${process.env.CONTACT_EMAIL_FROM || 'onboarding@resend.dev'}>`,
        to: recipients,
        reply_to: payload.email,
        subject: `New Client Feedback Pending Review (${payload.eventType}) - ${payload.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 24px; color: #3A4F1C; background-color: #F7F3E8;">
            <h2 style="color: #3A4F1C; border-bottom: 2px solid #BC6F07; padding-bottom: 8px; margin-top: 0;">
              ⏳ New Client Feedback Pending Review
            </h2>
            <p>A new client feedback has been submitted on the Casamento Events website and requires your review in Sanity Studio.</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr><td style="padding: 6px 0; font-weight: bold;">Client Name:</td><td>${payload.name}</td></tr>
              <tr><td style="padding: 6px 0; font-weight: bold;">Email:</td><td><a href="mailto:${payload.email}">${payload.email}</a></td></tr>
              <tr><td style="padding: 6px 0; font-weight: bold;">Phone:</td><td>${payload.phone || 'N/A'}</td></tr>
              <tr><td style="padding: 6px 0; font-weight: bold;">Event Type:</td><td>${payload.eventType}</td></tr>
              <tr><td style="padding: 6px 0; font-weight: bold;">Rating:</td><td>${'★'.repeat(payload.rating)} (${payload.rating}/5)</td></tr>
            </table>

            <p style="font-weight: bold; margin-bottom: 4px;">Feedback Message:</p>
            <blockquote style="background: #EFEAD8; padding: 14px; border-left: 4px solid #BC6F07; margin: 0; font-style: italic;">
              "${payload.message.replace(/\n/g, '<br />')}"
            </blockquote>

            <div style="margin-top: 24px; padding: 16px; background-color: #3A4F1C; color: #F7F3E8; border-radius: 6px; text-align: center;">
              <p style="margin: 0 0 8px 0;">Log into Sanity Studio to approve or reject this feedback:</p>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/studio" style="color: #BC6F07; font-weight: bold; text-decoration: underline;">
                Open Sanity Studio →
              </a>
            </div>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const errData = await res.json();
      console.error('[feedbackService Resend Error]:', errData);
      return { success: false, error: errData.message || 'Failed to dispatch email.' };
    }

    return { success: true };
  } catch (err) {
    console.error('[feedbackService Admin Email Error]:', err);
    return { success: false, error: 'Internal error dispatching admin notification email.' };
  }
}

/**
 * Sends a confirmation email to the client when their feedback has been approved by the Casamento team.
 */
export async function sendClientApprovalConfirmationEmail(
  clientEmail: string,
  clientName: string,
  eventType: string
): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!clientEmail) return { success: false, error: 'Client email is missing.' };

  if (!apiKey) {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[feedbackService] RESEND_API_KEY not set. Mocking client approval email to ${clientEmail}`
      );
    }
    return { success: true };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: `Casamento Events <${process.env.CONTACT_EMAIL_FROM || 'onboarding@resend.dev'}>`,
        to: [clientEmail],
        subject: `Your Feedback is Now Live! - Casamento Events`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 24px; color: #3A4F1C; background-color: #F7F3E8;">
            <h2 style="color: #3A4F1C; border-bottom: 2px solid #BC6F07; padding-bottom: 8px; margin-top: 0;">
              ✨ Thank You, ${clientName}!
            </h2>
            <p>We are delighted to let you know that your feedback regarding your <strong>${eventType}</strong> experience with Casamento Events has been approved and posted on our website!</p>
            <p>Your kind words mean the world to our team and help other couples and clients discover our luxury event planning services.</p>
            
            <div style="margin: 24px 0; text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/articles" style="display: inline-block; background-color: #3A4F1C; color: #F7F3E8; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                View Your Feedback on Our Articles Page →
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #BC6F07; margin-top: 24px;" />
            <p style="font-size: 12px; color: #3A4F1C; opacity: 0.7;">
              Casamento Events Management — Crafting Unforgettable Moments.
            </p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const errData = await res.json();
      console.error('[feedbackService Client Approval Email Error]:', errData);
      return { success: false, error: errData.message || 'Failed to send client confirmation email.' };
    }

    return { success: true };
  } catch (err) {
    console.error('[feedbackService Client Approval Email Error]:', err);
    return { success: false, error: 'Internal error dispatching client confirmation email.' };
  }
}
