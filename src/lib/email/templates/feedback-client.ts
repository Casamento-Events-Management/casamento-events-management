import { renderBaseEmailLayout } from './layouts/base';
import { renderCtaButton } from './blocks/ctaButton';

export interface ClientFeedbackPostedPayload {
  email: string;
  name?: string;
  eventType?: string;
}

/**
 * Builds email template for Client notification when their feedback is posted on the site.
 * NOTE: Never mention any review, moderation, or approval process to the client.
 */
export function buildFeedbackClientPostedEmail(payload: ClientFeedbackPostedPayload): { subject: string; html: string } {
  const clientName = payload.name || 'Valued Client';
  const eventType = payload.eventType || 'Event';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://casamentoevents.com';
  const feedbackPageUrl = `${siteUrl.replace(/\/$/, '')}/articles/feedback`;

  const subject = `Your Feedback Is Now on Our Website — Casamento Events`;

  const ctaButtonHtml = renderCtaButton('See Your Feedback on Our Website →', feedbackPageUrl);

  const contentHtml = `
    <p style="margin: 0 0 16px 0;">
      Hi ${escapeHtml(clientName)},
    </p>
    <p style="margin: 0 0 16px 0;">
      We are grateful you shared your experience with us.
      Your feedback about your <strong>${escapeHtml(eventType)}</strong> is now featured on the Casamento Events website.
    </p>
    <p style="margin: 0 0 20px 0;">
      It means a great deal to us, and we hope it helps others feel confident when planning their next event.
      Thank you for your trust in Casamento Events.
    </p>
    ${ctaButtonHtml}
  `.trim();

  const html = renderBaseEmailLayout({
    sectionLabel: 'THANK YOU',
    title: 'Your Feedback Is Live',
    contentHtml,
    isAdminNotification: false,
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
