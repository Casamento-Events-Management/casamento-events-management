import type { BookingRecord } from '@/types/booking';
import { renderBaseEmailLayout } from './layouts/base';
import { renderDataTable } from './blocks/dataTable';

/**
 * Builds email template sent to Casamento admin team 7 days before an event (or immediately for short-notice bookings).
 */
export function buildBookingAdminReminderEmail(
  booking: BookingRecord,
  daysLeft: number
): { subject: string; html: string } {
  const subject = `[Action Required] Upcoming Event in ${daysLeft} Days: ${booking.service_title} [${booking.booking_reference}]`;

  const addOnsDisplay =
    booking.selected_add_ons && booking.selected_add_ons.length > 0
      ? booking.selected_add_ons.map((a) => a.title).join(', ')
      : 'None';

  const dataTableHtml = renderDataTable([
    { label: 'Booking Reference', value: `<strong>${booking.booking_reference}</strong>`, isHtml: true },
    { label: 'Event Service', value: `${booking.service_title} (${booking.category_title})` },
    { label: 'Event Date', value: `<strong style="color: #3A4F1C; font-size: 15px;">${booking.event_date}</strong>`, isHtml: true },
    { label: 'Days Remaining', value: `<strong style="color: #BC6F07;">${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}</strong>`, isHtml: true },
    { label: 'Client Name', value: booking.client_full_name },
    { label: 'Client Contact', value: `${booking.client_email}${booking.client_phone ? ` • ${booking.client_phone}` : ''}` },
    { label: 'Venue Location', value: `${booking.venue_city}${booking.venue_address ? `, ${booking.venue_address}` : ''}${booking.event_country_name ? ` (${booking.event_country_name})` : ''}` },
    { label: 'Add-ons Selected', value: addOnsDisplay },
    ...(booking.admin_notes ? [{ label: 'Internal Team Notes', value: booking.admin_notes }] : []),
  ]);

  const contentHtml = `
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #3A4F1C; line-height: 1.6;">
      <strong>Team Notice:</strong> The following confirmed event is scheduled in <strong>${daysLeft} days</strong> (${booking.event_date}).
    </p>

    <p style="margin: 0 0 16px 0; font-size: 14px; color: #3A4F1C; line-height: 1.6;">
      Please verify that all vendor allocations, equipment checklists, and assigned event tasks are on track.
    </p>

    ${dataTableHtml}

    <p style="margin: 24px 0 0 0; font-size: 13px; color: #666; line-height: 1.5;">
      You can coordinate event tasks, review client requests, or update the event schedule directly in the admin portal.
    </p>
  `;

  const html = renderBaseEmailLayout({
    sectionLabel: 'Team Schedule Notice',
    title: '7-Day Event Coordination Notice',
    contentHtml,
    isAdminNotification: true,
  });

  return { subject, html };
}
