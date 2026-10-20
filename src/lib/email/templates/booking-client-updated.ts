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
 * Builds email template sent to client when their booking details have been updated by admin.
 */
export function buildBookingClientUpdatedEmail(
  booking: BookingRecord,
  adminMessage?: string
): { subject: string; html: string } {
  const subject = `Updated Details for Your Booking: ${booking.service_title} [${booking.booking_reference}]`;

  const addOnsDisplay =
    booking.selected_add_ons && booking.selected_add_ons.length > 0
      ? booking.selected_add_ons.map((a) => a.title).join(', ')
      : 'None selected';

  const dataTableHtml = renderDataTable([
    { label: 'Booking Reference', value: `<strong>${booking.booking_reference}</strong>`, isHtml: true },
    { label: 'Service', value: `${booking.service_title} (${booking.category_title})` },
    { label: 'Add-ons', value: addOnsDisplay },
    { label: 'Event Date', value: `<strong>${booking.event_date}</strong>`, isHtml: true },
    { label: 'Venue Location', value: `${booking.venue_city}${booking.venue_address ? `, ${booking.venue_address}` : ''}` },
    ...(booking.special_notes ? [{ label: 'Special Notes', value: booking.special_notes }] : []),
  ]);

  const customMessageBlock = adminMessage
    ? `
      <div style="margin: 20px 0; padding: 16px; background-color: #F7F3E8; border-left: 4px solid #BC6F07; border-radius: 4px;">
        <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #BC6F07; text-transform: uppercase; letter-spacing: 0.05em;">
          Note regarding this update:
        </p>
        <p style="margin: 0; font-size: 14px; color: #3A4F1C; line-height: 1.6; white-space: pre-wrap;">
          ${escapeHtml(adminMessage)}
        </p>
      </div>
    `
    : '';

  const contentHtml = `
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #3A4F1C; line-height: 1.6;">
      Dear ${escapeHtml(booking.client_full_name)},
    </p>

    <p style="margin: 0 0 16px 0; font-size: 14px; color: #3A4F1C; line-height: 1.6;">
      This email is to confirm that the details for your booking (Reference: <strong>${escapeHtml(booking.booking_reference)}</strong>) have been updated.
    </p>

    ${customMessageBlock}

    <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #3A4F1C;">
      Here is your updated booking summary:
    </p>

    ${dataTableHtml}

    <div style="margin: 24px 0 16px 0; padding: 18px; background-color: #EFEAD8; border-radius: 4px;">
      <p style="margin: 0; font-size: 13px; color: #3A4F1C; line-height: 1.6;">
        If any of these details look incorrect or if you have any questions, please reply directly to this email or contact your assigned event coordinator.
      </p>
    </div>

    <p style="margin: 20px 0 0 0; font-size: 14px; color: #3A4F1C; line-height: 1.6;">
      Warm regards,<br />
      <strong>Casamento Events Management Team</strong>
    </p>
  `.trim();

  const html = renderBaseEmailLayout({
    sectionLabel: 'BOOKING DETAILS UPDATED',
    title: 'Your Booking Details Have Been Updated',
    contentHtml,
    isAdminNotification: false,
  });

  return { subject, html };
}
