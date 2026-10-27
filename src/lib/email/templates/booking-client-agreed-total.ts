// =============================================================================
// email/templates/booking-client-agreed-total.ts — Agreed Total Price Notification
// =============================================================================

import { renderBaseEmailLayout } from './layouts/base';
import { renderDataTable } from './blocks/dataTable';

export interface BookingClientAgreedTotalPayload {
  clientFullName: string;
  clientEmail: string;
  bookingReference: string;
  serviceTitle: string;
  eventDate: string;
  agreedTotalFormatted: string;
  totalPaidFormatted: string;
  remainingBalanceFormatted: string;
  notes?: string | null;
}

/**
 * Builds email template notifying client of their agreed contract total.
 * Clear, concise, and professional tone.
 */
export function buildBookingClientAgreedTotalEmail(
  payload: BookingClientAgreedTotalPayload
): { subject: string; html: string } {
  const subject = `Event Contract Pricing: ${payload.bookingReference} (${payload.serviceTitle})`;

  const dataRows: Array<{ label: string; value: string; isHtml?: boolean }> = [
    { label: 'Booking Reference', value: `<strong>${escapeHtml(payload.bookingReference)}</strong>`, isHtml: true },
    { label: 'Event Service', value: escapeHtml(payload.serviceTitle) },
    { label: 'Event Date', value: escapeHtml(payload.eventDate) },
    { label: 'Agreed Contract Total', value: `<span style="font-size: 16px; font-weight: 700; color: #2B3817;">${escapeHtml(payload.agreedTotalFormatted)}</span>`, isHtml: true },
    { label: 'Amount Paid to Date', value: escapeHtml(payload.totalPaidFormatted) },
    { label: 'Outstanding Balance', value: `<strong>${escapeHtml(payload.remainingBalanceFormatted)}</strong>`, isHtml: true },
  ];

  if (payload.notes) {
    dataRows.push({ label: 'Scope / Notes', value: escapeHtml(payload.notes) });
  }

  const dataTableHtml = renderDataTable(dataRows);

  const contentHtml = `
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #3A4F1C; line-height: 1.6;">
      Dear ${escapeHtml(payload.clientFullName)},
    </p>

    <p style="margin: 0 0 16px 0; font-size: 14px; color: #3A4F1C; line-height: 1.6;">
      Following our consultation regarding your event arrangements, we have updated your official agreed contract total for booking <strong>${escapeHtml(payload.bookingReference)}</strong>.
    </p>

    ${dataTableHtml}

    <div style="margin: 20px 0; padding: 14px 18px; background-color: #EFEAD8; border-left: 4px solid #3A4F1C; border-radius: 4px;">
      <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 700; color: #3A4F1C; text-transform: uppercase;">
        Payment Instructions
      </p>
      <p style="margin: 0; font-size: 13px; color: #3A4F1C; line-height: 1.6;">
        Payments can be made via bank transfer, cash, or e-wallet as discussed with your coordinator. Whenever you make a transfer, please send us the deposit slip or reference number so we can promptly issue your acknowledgment receipt.
      </p>
    </div>

    <p style="margin: 20px 0 0 0; font-size: 14px; color: #3A4F1C; line-height: 1.6;">
      Warm regards,<br />
      <strong>Casamento Events Management Team</strong>
    </p>
  `.trim();

  const html = renderBaseEmailLayout({
    sectionLabel: 'CONTRACT PRICING UPDATE',
    title: 'Agreed Event Contract Total',
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
