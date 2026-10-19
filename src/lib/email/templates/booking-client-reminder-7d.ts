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
 * Builds email template sent to client 7 days before their scheduled event (or immediately for short-notice bookings).
 */
export function buildBookingClientReminderEmail(
  booking: BookingRecord,
  daysLeft: number
): { subject: string; html: string } {
  const urgencyText = daysLeft <= 1 ? 'is approaching very soon' : `is in ${daysLeft} days`;
  const subject = `Upcoming Event Reminder: ${booking.service_title} [${booking.booking_reference}]`;

  const addOnsDisplay =
    booking.selected_add_ons && booking.selected_add_ons.length > 0
      ? booking.selected_add_ons.map((a) => a.title).join(', ')
      : 'None';

  const dataTableHtml = renderDataTable([
    { label: 'Booking Reference', value: `<strong>${booking.booking_reference}</strong>`, isHtml: true },
    { label: 'Event Service', value: `${booking.service_title} (${booking.category_title})` },
    { label: 'Event Date', value: `<strong style="color: #3A4F1C; font-size: 15px;">${booking.event_date}</strong>`, isHtml: true },
    { label: 'Days Remaining', value: `<strong style="color: #BC6F07;">${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}</strong>`, isHtml: true },
    { label: 'Venue Location', value: `${booking.venue_city}${booking.venue_address ? `, ${booking.venue_address}` : ''}${booking.event_country_name ? ` (${booking.event_country_name})` : ''}` },
    { label: 'Add-ons Arranged', value: addOnsDisplay },
  ]);

  const contentHtml = `
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #3A4F1C; line-height: 1.6;">
      Dear ${escapeHtml(booking.client_full_name)},
    </p>

    <p style="margin: 0 0 16px 0; font-size: 14px; color: #3A4F1C; line-height: 1.6;">
      This is a friendly reminder from Casamento Events that your upcoming event for <strong>${escapeHtml(booking.service_title)}</strong> ${urgencyText} on <strong>${escapeHtml(booking.event_date)}</strong>.
    </p>

    <p style="margin: 0 0 16px 0; font-size: 14px; color: #3A4F1C; line-height: 1.6;">
      Our coordination and production team is finalizing preparations to ensure everything runs smoothly. Please review your event schedule summary below:
    </p>

    ${dataTableHtml}

    <p style="margin: 24px 0 0 0; font-size: 13px; color: #666; line-height: 1.5;">
      If there are any last-minute adjustments, vendor coordination points, or schedule timing updates, please reply directly to this email to let us know.
    </p>
  `;

  const html = renderBaseEmailLayout({
    sectionLabel: 'Upcoming Event',
    title: 'Your Event is Approaching',
    contentHtml,
    isAdminNotification: false,
  });

  return { subject, html };
}
