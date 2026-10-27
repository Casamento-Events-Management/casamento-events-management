// =============================================================================
// lib/email/templates/payment-client-invoice.ts — Client Payment Invoice Template
// =============================================================================

import { renderBaseEmailLayout } from './layouts/base';
import { renderCtaButton } from './blocks/ctaButton';

export interface PaymentClientInvoicePayload {
  clientFullName: string;
  clientEmail: string;
  bookingReference: string;
  serviceTitle: string;
  eventDate: string;
  invoiceNumber: string;
  invoiceAmountFormatted: string;
  totalAgreedFormatted: string;
  remainingBalanceFormatted: string;
  dueDateFormatted?: string;
  customNotes?: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function buildPaymentClientInvoiceEmail(payload: PaymentClientInvoicePayload): {
  subject: string;
  html: string;
} {
  const firstName = payload.clientFullName.split(' ')[0] || payload.clientFullName;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://casamentoevents.com';

  const contentHtml = `
    <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #3A4F1C;">
      Dear ${escapeHtml(firstName)},
    </p>

    <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #3A4F1C;">
      Here is your requested payment invoice for your upcoming event with <strong>Casamento Events Management</strong>.
    </p>

    <div style="background-color: #F7F3E8; border: 1px solid rgba(58,79,28,0.2); border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #2B3817;">
        <tr>
          <td style="padding: 6px 0; color: #666666;">Invoice Reference:</td>
          <td style="padding: 6px 0; font-family: monospace; font-weight: bold; text-align: right;">${escapeHtml(payload.invoiceNumber)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #666666;">Booking Reference:</td>
          <td style="padding: 6px 0; font-family: monospace; font-weight: bold; text-align: right;">${escapeHtml(payload.bookingReference)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #666666;">Service / Event:</td>
          <td style="padding: 6px 0; font-weight: 600; text-align: right;">${escapeHtml(payload.serviceTitle)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #666666;">Target Event Date:</td>
          <td style="padding: 6px 0; font-weight: 600; text-align: right;">${escapeHtml(payload.eventDate)}</td>
        </tr>
        ${
          payload.dueDateFormatted
            ? `
        <tr>
          <td style="padding: 6px 0; color: #666666;">Payment Target Date:</td>
          <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #BC6F07;">${escapeHtml(payload.dueDateFormatted)}</td>
        </tr>
        `
            : ''
        }
        <tr style="border-top: 1px solid rgba(58,79,28,0.15);">
          <td style="padding: 10px 0 4px; color: #666666;">Agreed Contract Total:</td>
          <td style="padding: 10px 0 4px; font-weight: 600; text-align: right;">${escapeHtml(payload.totalAgreedFormatted)}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0 4px; color: #666666;">Outstanding Balance:</td>
          <td style="padding: 4px 0 4px; font-weight: 600; text-align: right; color: #9A3412;">${escapeHtml(payload.remainingBalanceFormatted)}</td>
        </tr>
        <tr style="border-top: 2px solid #3A4F1C;">
          <td style="padding: 12px 0 4px; font-size: 16px; font-weight: bold; color: #2B3817;">Invoice Amount Due:</td>
          <td style="padding: 12px 0 4px; font-size: 20px; font-weight: bold; text-align: right; color: #2B3817;">${escapeHtml(payload.invoiceAmountFormatted)}</td>
        </tr>
      </table>
    </div>

    ${
      payload.customNotes
        ? `
      <div style="background-color: #ffffff; border-left: 3px solid #3A4F1C; padding: 12px 16px; margin-bottom: 24px; font-size: 13px; color: #555555; font-style: italic;">
        &ldquo;${escapeHtml(payload.customNotes)}&rdquo;
      </div>
    `
        : ''
    }

    <p style="margin: 0 0 24px; font-size: 13px; line-height: 1.6; color: #555555;">
      You may remit payment via bank deposit, GCash, or Maya to our official accounts. Please send a copy of your transaction receipt or deposit slip to this email address or through our customer support so our team can record and credit your booking balance.
    </p>

    ${renderCtaButton('View Booking Services', `${siteUrl}/services`)}

    <p style="margin: 20px 0 0 0; font-size: 14px; line-height: 1.6; color: #3A4F1C;">
      Warm regards,<br />
      <strong>The Casamento Events Team</strong>
    </p>
  `.trim();

  const html = renderBaseEmailLayout({
    sectionLabel: 'PAYMENT INVOICE',
    title: `Payment Invoice: ${payload.invoiceNumber}`,
    contentHtml,
    isAdminNotification: false,
  });

  return {
    subject: `Payment Invoice: ${payload.invoiceNumber} [${payload.bookingReference}] — Casamento Events`,
    html,
  };
}
