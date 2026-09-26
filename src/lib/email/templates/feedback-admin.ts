import type { FeedbackFormData } from '@/lib/schemas/feedback';
import { renderBaseEmailLayout } from './layouts/base';
import { renderDataTable } from './blocks/dataTable';
import { renderBlockquote } from './blocks/blockquote';
import { renderCtaButton } from './blocks/ctaButton';

/**
 * Builds email template for Admin notification when a new client feedback is submitted.
 */
export function buildFeedbackAdminEmail(payload: FeedbackFormData): { subject: string; html: string } {
  const subject = `Feedback Pending Review — ${payload.name} (${payload.eventType})`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://casamentoevents.com';
  const studioUrl = `${siteUrl.replace(/\/$/, '')}/studio`;

  const starRating = '★'.repeat(payload.rating) + '☆'.repeat(5 - payload.rating);

  const dataTableHtml = renderDataTable([
    { label: 'Client Name', value: payload.name },
    {
      label: 'Email',
      value: `<a href="mailto:${escapeHtml(payload.email)}" style="color: #3A4F1C; text-decoration: underline;">${escapeHtml(payload.email)}</a>`,
      isHtml: true,
    },
    { label: 'Phone', value: payload.phone || 'Not provided' },
    { label: 'Event Type', value: payload.eventType },
    { label: 'Rating', value: `${starRating} (${payload.rating}/5)` },
  ]);

  const blockquoteHtml = renderBlockquote(payload.message);
  const ctaButtonHtml = renderCtaButton('Open Sanity Studio →', studioUrl);

  const contentHtml = `
    <p style="margin: 0 0 16px 0;">
      A client has submitted feedback through the Casamento Events website.
      The submission is currently pending review. Please log in to Sanity Studio to review it.
    </p>
    ${dataTableHtml}
    <p style="margin: 16px 0 4px 0; font-weight: 600;">Feedback Message:</p>
    ${blockquoteHtml}
    ${ctaButtonHtml}
  `.trim();

  const html = renderBaseEmailLayout({
    sectionLabel: 'FEEDBACK MODERATION',
    title: 'A Submission Is Awaiting Your Review',
    contentHtml,
    isAdminNotification: true,
  });

  return { subject, html };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
