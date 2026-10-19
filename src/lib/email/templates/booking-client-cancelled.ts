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
 * Builds email template sent to client when their event booking is cancelled.
 */
export function buildBookingClientCancelledEmail(
  booking: BookingRecord,
  cancellationReason?: string
): { subject: string; html: string } {
  const subject = `Event Notice: ${booking.service_title} [${booking.booking_reference}] Cancelled`;

  const dataTableHtml = renderDataTable([
    { label: 'Booking Reference', value: `<strong>${booking.booking_reference}</strong>`, isHtml: true },
    { label: 'Service', value: `${booking.service_title} (${booking.category_title})` },
    { label: 'Original Event Date', value: booking.event_date },
    { label: 'Venue Location', value: `${booking.venue_city}${booking.event_country_name ? `, ${booking.event_country_name}` : ''}` },
  ]);

  const customMessageBlock = cancellationReason
    ? `
      <div style="margin: 20px 0; padding: 16px; background-color: #FEF2F2; border-left: 4px solid #DC2626; border-radius: 4px;">
        <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #DC2626; text-transform: uppercase; letter-spacing: 0.05em;">
          Cancellation Reason:
        </p>
        <p style="margin: 0; font-size: 14px; color: #7F1D1D; line-height: 1.6; white-space: pre-wrap;">
          ${escapeHtml(cancellationReason)}
        </p>
      </div>
    `
    : '';

  const contentHtml = `
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #3A4F1C; line-height: 1.6;">
      Dear ${escapeHtml(booking.client_full_name)},
    </p>

    <p style="margin: 0 0 16px 0; font-size: 14px; color: #3A4F1C; line-height: 1.6;">
      We are writing to confirm that the event reservation for <strong>${escapeHtml(booking.service_title)}</strong> originally scheduled for <strong>${escapeHtml(booking.event_date)}</strong> has been marked as cancelled.
    </p>

    ${dataTableHtml}
    ${customMessageBlock}

    <p style="margin: 24px 0 0 0; font-size: 13px; color: #666; line-height: 1.5;">
      If this was done in error or if you wish to inquire about booking another date, please feel free to reach out to us directly.
    </p>
  `;

  const html = renderBaseEmailLayout({
    sectionLabel: 'Reservation Notice',
    title: 'Event Booking Cancelled',
    contentHtml,
    isAdminNotification: false,
  });

  return { subject, html };
}
