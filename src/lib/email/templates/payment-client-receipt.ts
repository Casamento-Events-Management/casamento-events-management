// =============================================================================
// email/templates/payment-client-receipt.ts — Client Payment Acknowledgment
// =============================================================================

import { renderBaseEmailLayout } from './layouts/base';
import { renderDataTable } from './blocks/dataTable';

export interface PaymentClientReceiptPayload {
  clientFullName: string;
  clientEmail: string;
  bookingReference: string;
  serviceTitle: string;
  eventDate: string;
  paymentNumber: string;
  receiptNumber: string;
  amountFormatted: string;
  paymentMethod: string;
  paidAtFormatted: string;
  agreedTotalFormatted: string;
  remainingBalanceFormatted: string;
  isFullyPaid: boolean;
  notes?: string | null;
}

/**
 * Builds email template for client payment acknowledgment.
 * Concise, direct, human tone without robotic or exaggerated phrasing.
 */
export function buildPaymentClientReceiptEmail(
  payload: PaymentClientReceiptPayload
): { subject: string; html: string } {
  const subject = `Payment Acknowledgment: ${payload.amountFormatted} received for ${payload.bookingReference}`;

  const dataRows: Array<{ label: string; value: string; isHtml?: boolean }> = [
    { label: 'Receipt Number', value: `<strong>${escapeHtml(payload.receiptNumber)}</strong>`, isHtml: true },
    { label: 'Booking Reference', value: `<strong>${escapeHtml(payload.bookingReference)}</strong>`, isHtml: true },
    { label: 'Event Service', value: escapeHtml(payload.serviceTitle) },
    { label: 'Event Date', value: escapeHtml(payload.eventDate) },
    { label: 'Amount Received', value: `<span style="font-size: 16px; font-weight: 700; color: #2B3817;">${escapeHtml(payload.amountFormatted)}</span>`, isHtml: true },
    { label: 'Payment Method', value: escapeHtml(payload.paymentMethod) },
    { label: 'Date Received', value: escapeHtml(payload.paidAtFormatted) },
  ];

  if (payload.agreedTotalFormatted !== '—') {
    dataRows.push({ label: 'Agreed Contract Total', value: escapeHtml(payload.agreedTotalFormatted) });
    dataRows.push({
      label: 'Remaining Balance',
      value: payload.isFullyPaid
        ? '<strong style="color: #059669;">Fully Paid (₱0.00)</strong>'
        : `<strong>${escapeHtml(payload.remainingBalanceFormatted)}</strong>`,
      isHtml: true,
    });
  }

  if (payload.notes) {
    dataRows.push({ label: 'Payment Notes', value: escapeHtml(payload.notes) });
  }

  const dataTableHtml = renderDataTable(dataRows);

  const statusBoxHtml = payload.isFullyPaid
    ? `
      <div style="margin: 20px 0; padding: 14px 18px; background-color: #ECFDF5; border-left: 4px solid #059669; border-radius: 4px;">
        <p style="margin: 0; font-size: 13px; font-weight: 600; color: #065F46;">
          Your event balance is fully settled. Thank you for completing your payment!
        </p>
      </div>
    `
    : `
      <div style="margin: 20px 0; padding: 14px 18px; background-color: #FEF3C7; border-left: 4px solid #D97706; border-radius: 4px;">
        <p style="margin: 0; font-size: 13px; font-weight: 600; color: #92400E;">
          Outstanding Balance: ${escapeHtml(payload.remainingBalanceFormatted)}. Remaining balance can be settled prior to or on the agreed schedule.
        </p>
      </div>
    `;

  const contentHtml = `
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #3A4F1C; line-height: 1.6;">
      Dear ${escapeHtml(payload.clientFullName)},
    </p>

    <p style="margin: 0 0 16px 0; font-size: 14px; color: #3A4F1C; line-height: 1.6;">
      We have received your payment of <strong>${escapeHtml(payload.amountFormatted)}</strong> for your booking with Casamento Events Management. Below are the details of this transaction for your records:
    </p>

    ${dataTableHtml}

    ${statusBoxHtml}

    <p style="margin: 20px 0 16px 0; font-size: 13px; color: #3A4F1C; line-height: 1.6;">
      Please keep this acknowledgment for your records. If you have questions regarding your account or wish to arrange further payments, simply reply to this email or contact your assigned event coordinator.
    </p>

    <p style="margin: 20px 0 0 0; font-size: 14px; color: #3A4F1C; line-height: 1.6;">
      Warm regards,<br />
      <strong>Casamento Events Management Team</strong>
    </p>
  `.trim();

  const html = renderBaseEmailLayout({
    sectionLabel: 'PAYMENT ACKNOWLEDGMENT',
    title: 'Payment Acknowledgment Receipt',
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
