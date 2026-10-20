import type { BookingRecord } from '@/types/booking';
import { renderBaseEmailLayout } from './layouts/base';
import { renderDataTable } from './blocks/dataTable';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Builds email template sent to client when their booking request cannot be accommodated.
 */
export function buildBookingClientRejectedEmail(
  booking: BookingRecord,
  rejectionReason: string
): { subject: string; html: string } {
  const subject = `Update Regarding Your Booking Request: ${booking.service_title} [${booking.booking_reference}]`;

  const dataTableHtml = renderDataTable([
    { label: 'Booking Reference', value: `<strong>${booking.booking_reference}</strong>`, isHtml: true },
    { label: 'Requested Service', value: `${booking.service_title} (${booking.category_title})` },
    { label: 'Requested Date', value: booking.event_date },
    { label: 'Location', value: `${booking.venue_city}${booking.venue_address ? `, ${booking.venue_address}` : ''}` },
  ]);

  const contentHtml = `
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #3A4F1C; line-height: 1.6;">
      Dear ${escapeHtml(booking.client_full_name)},
    </p>

    <p style="margin: 0 0 16px 0; font-size: 14px; color: #3A4F1C; line-height: 1.6;">
      Thank you for considering Casamento Events Management for your upcoming event. We appreciate the time you took to share your event details with us.
    </p>

    <p style="margin: 0 0 16px 0; font-size: 14px; color: #3A4F1C; line-height: 1.6;">
      After reviewing our calendar and resource availability, we regret to inform you that we are unable to accept your booking reservation for <strong>${escapeHtml(booking.event_date)}</strong>.
    </p>

    <div style="margin: 20px 0; padding: 16px; background-color: #F7F3E8; border-left: 4px solid #BC6F07; border-radius: 4px;">
      <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #BC6F07; text-transform: uppercase; letter-spacing: 0.05em;">
        Reason for this decision:
      </p>
      <p style="margin: 0; font-size: 14px; color: #3A4F1C; line-height: 1.6; white-space: pre-wrap;">
        ${escapeHtml(rejectionReason)}
      </p>
    </div>

    ${dataTableHtml}

    <div style="margin: 24px 0 16px 0; padding: 18px; background-color: #EFEAD8; border-radius: 4px;">
      <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #3A4F1C; text-transform: uppercase; letter-spacing: 0.05em;">
        Looking for alternatives?
      </p>
      <p style="margin: 0; font-size: 13px; color: #3A4F1C; line-height: 1.6;">
        If you have flexibility with your event schedule or would like to explore other available dates, please feel free to reply directly to this email or contact us. We would be happy to check if another date works for you.
      </p>
    </div>

    <p style="margin: 20px 0 0 0; font-size: 14px; color: #3A4F1C; line-height: 1.6;">
      Sincerely,<br />
      <strong>Casamento Events Management Team</strong>
    </p>
  `.trim();

  const html = renderBaseEmailLayout({
    sectionLabel: 'BOOKING STATUS UPDATE',
    title: 'Booking Request Update',
    contentHtml,
    isAdminNotification: false,
  });

  return { subject, html };
}
