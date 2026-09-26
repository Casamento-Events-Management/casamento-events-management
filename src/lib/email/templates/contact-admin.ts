import type { ContactFormData } from '@/lib/schemas/contact';
import { renderBaseEmailLayout } from './layouts/base';
import { renderDataTable } from './blocks/dataTable';
import { renderBlockquote } from './blocks/blockquote';

/**
 * Builds email template for Admin notification when a new contact inquiry is submitted.
 */
export function buildContactAdminEmail(payload: ContactFormData): { subject: string; html: string } {
  const subject = `New Website Inquiry — ${payload.name}`;

  const dataTableHtml = renderDataTable([
    { label: 'Name', value: payload.name },
    {
      label: 'Email',
      value: `<a href="mailto:${escapeHtml(payload.email)}" style="color: #3A4F1C; text-decoration: underline;">${escapeHtml(payload.email)}</a>`,
      isHtml: true,
    },
  ]);

  const blockquoteHtml = renderBlockquote(payload.message);

  const contentHtml = `
    <p style="margin: 0 0 16px 0;">
      A visitor has submitted an inquiry through the Casamento Events website contact form.
      Please review the details below and follow up at your earliest convenience.
    </p>
    ${dataTableHtml}
    <p style="margin: 16px 0 4px 0; font-weight: 600;">Message Content:</p>
    ${blockquoteHtml}
  `.trim();

  const html = renderBaseEmailLayout({
    sectionLabel: 'CONTACT FORM SUBMISSION',
    title: 'A New Inquiry Has Been Received',
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
