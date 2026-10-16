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
 * Builds email template sent to client when their booking request is accepted.
 */
export function buildBookingClientAcceptedEmail(
  booking: BookingRecord,
  adminMessage?: string
): { subject: string; html: string } {
  const subject = `Booking Confirmed: ${booking.service_title} [${booking.booking_reference}]`;

  const addOnsDisplay =
    booking.selected_add_ons && booking.selected_add_ons.length > 0
      ? booking.selected_add_ons.map((a) => a.title).join(', ')
      : 'None selected';

  const dataTableHtml = renderDataTable([
    { label: 'Booking Reference', value: `<strong>${booking.booking_reference}</strong>`, isHtml: true },
    { label: 'Confirmed Service', value: `${booking.service_title} (${booking.category_title})` },
    { label: 'Add-ons', value: addOnsDisplay },
    { label: 'Confirmed Event Date', value: `<strong>${booking.event_date}</strong>`, isHtml: true },
    { label: 'Venue Location', value: `${booking.venue_city}${booking.venue_address ? `, ${booking.venue_address}` : ''}` },
    ...(booking.special_notes ? [{ label: 'Special Notes', value: booking.special_notes }] : []),
  ]);

  const customMessageBlock = adminMessage
    ? `
      <div style="margin: 20px 0; padding: 16px; background-color: #F7F3E8; border-left: 4px solid #BC6F07; border-radius: 4px;">
        <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #BC6F07; text-transform: uppercase; letter-spacing: 0.05em;">
          A note from our team:
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
      Great news! We have reviewed and officially confirmed your booking request for <strong>${escapeHtml(booking.service_title)}</strong> on <strong>${escapeHtml(booking.event_date)}</strong>.
    </p>

    <p style="margin: 0 0 16px 0; font-size: 14px; color: #3A4F1C; line-height: 1.6;">
      Your booking reference is: <span style="font-size: 16px; font-weight: 700; color: #3A4F1C; letter-spacing: 0.05em;">${booking.booking_reference}</span>
    </p>

    ${customMessageBlock}

    ${dataTableHtml}

    <div style="margin: 24px 0 16px 0; padding: 18px; background-color: #EFEAD8; border-left: 4px solid #3A4F1C; border-radius: 4px;">
      <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #3A4F1C; text-transform: uppercase; letter-spacing: 0.05em;">
        What happens next?
      </p>
      <p style="margin: 0 0 10px 0; font-size: 13px; color: #3A4F1C; line-height: 1.6;">
        Our team will get in touch with you to schedule our concept alignment meeting and walk through the initial event preparations.
      </p>
      <p style="margin: 0; font-size: 13px; color: #3A4F1C; line-height: 1.6;">
        If you have any questions before then, feel free to reply directly to this email or call our office.
      </p>
    </div>

    <p style="margin: 20px 0 0 0; font-size: 14px; color: #3A4F1C; line-height: 1.6;">
      Warm regards,<br />
      <strong>Casamento Events Management</strong>
    </p>
  `.trim();

  const html = renderBaseEmailLayout({
    sectionLabel: 'BOOKING CONFIRMED',
    title: 'Your Event is Confirmed',
    contentHtml,
    isAdminNotification: false,
  });

  return { subject, html };
}
