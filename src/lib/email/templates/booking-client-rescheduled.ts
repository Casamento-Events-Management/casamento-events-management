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
 * Builds email template sent to client when their event date has been rescheduled.
 */
export function buildBookingClientRescheduledEmail(
  booking: BookingRecord,
  oldDate: string,
  newDate: string,
  rescheduleReason?: string
): { subject: string; html: string } {
  const subject = `Event Rescheduled: ${booking.service_title} [${booking.booking_reference}]`;

  const dataTableHtml = renderDataTable([
    { label: 'Booking Reference', value: `<strong>${booking.booking_reference}</strong>`, isHtml: true },
    { label: 'Confirmed Service', value: `${booking.service_title} (${booking.category_title})` },
    { label: 'Previous Date', value: `<span style="text-decoration: line-through; color: #888;">${oldDate}</span>`, isHtml: true },
    { label: 'New Event Date', value: `<strong style="color: #3A4F1C; font-size: 15px;">${newDate}</strong>`, isHtml: true },
    { label: 'Venue Location', value: `${booking.venue_city}${booking.event_country_name ? `, ${booking.event_country_name}` : ''}` },
  ]);

  const customMessageBlock = rescheduleReason
    ? `
      <div style="margin: 20px 0; padding: 16px; background-color: #F7F3E8; border-left: 4px solid #BC6F07; border-radius: 4px;">
        <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #BC6F07; text-transform: uppercase; letter-spacing: 0.05em;">
          Reason / Note from our team:
        </p>
        <p style="margin: 0; font-size: 14px; color: #3A4F1C; line-height: 1.6; white-space: pre-wrap;">
          ${escapeHtml(rescheduleReason)}
        </p>
      </div>
    `
    : '';

  const contentHtml = `
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #3A4F1C; line-height: 1.6;">
      Dear ${escapeHtml(booking.client_full_name)},
    </p>

    <p style="margin: 0 0 16px 0; font-size: 14px; color: #3A4F1C; line-height: 1.6;">
      Please be advised that your event date for <strong>${escapeHtml(booking.service_title)}</strong> has been rescheduled to <strong>${escapeHtml(newDate)}</strong>.
    </p>

    <p style="margin: 0 0 16px 0; font-size: 14px; color: #3A4F1C; line-height: 1.6;">
      Below are your updated event schedule details:
    </p>

    ${dataTableHtml}
    ${customMessageBlock}

    <p style="margin: 24px 0 0 0; font-size: 13px; color: #666; line-height: 1.5;">
      If you have questions regarding this schedule update, please reply directly to this email or contact our coordination team.
    </p>
  `;

  const html = renderBaseEmailLayout({
    sectionLabel: 'Schedule Update',
    title: 'Event Rescheduled',
    contentHtml,
    isAdminNotification: false,
  });

  return { subject, html };
}
