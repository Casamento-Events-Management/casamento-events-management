import type { BookingFormData } from '@/types/bookingForm';
import { renderBaseEmailLayout } from './layouts/base';
import { renderDataTable } from './blocks/dataTable';

/**
 * Builds email template for client confirmation receipt with professional, human-written tone.
 * Note: Casamento team is CC'd on this email dispatch to create a single shared conversation thread.
 */
export function buildBookingClientConfirmationEmail(
  payload: BookingFormData,
  bookingReference: string
): { subject: string; html: string } {
  const subject = `Booking Request Acknowledged: ${payload.serviceTitle} [${bookingReference}]`;

  const addOnsDisplay =
    payload.selectedAddOns && payload.selectedAddOns.length > 0
      ? payload.selectedAddOns.map((a) => a.title).join(', ')
      : 'None selected';

  const dataTableHtml = renderDataTable([
    { label: 'Booking Reference', value: `<strong>${bookingReference}</strong>`, isHtml: true },
    { label: 'Selected Service', value: `${payload.serviceTitle} (${payload.categoryTitle})` },
    { label: 'Optional Add-ons', value: addOnsDisplay },
    { label: 'Target Event Date', value: `${payload.eventDate}${payload.isHolidayDate && payload.holidayName ? ` [Holiday: ${payload.holidayName}]` : ''}` },
    { label: 'Target Location', value: `${payload.venueCity}${payload.venueAddress ? `, ${payload.venueAddress}` : ''} (${payload.eventCountryName || payload.eventCountry})` },
    ...(payload.specialNotes ? [{ label: 'Special Notes', value: payload.specialNotes }] : []),
  ]);

  const contentHtml = `
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #3A4F1C; line-height: 1.6;">
      Dear ${escapeHtml(payload.clientFullName)},
    </p>

    <p style="margin: 0 0 16px 0; font-size: 14px; color: #3A4F1C; line-height: 1.6;">
      Thank you for choosing Casamento Events Management. We have received your booking reservation request for <strong>${escapeHtml(payload.serviceTitle)}</strong> on <strong>${escapeHtml(payload.eventDate)}</strong> in <strong>${escapeHtml(payload.venueCity)}</strong>.
    </p>

    <p style="margin: 0 0 16px 0; font-size: 14px; color: #3A4F1C; line-height: 1.6;">
      Your official reference number is: <span style="font-size: 16px; font-weight: 700; color: #BC6F07; letter-spacing: 0.05em;">${bookingReference}</span>
    </p>

    ${dataTableHtml}

    <div style="margin: 24px 0 16px 0; padding: 18px; background-color: #EFEAD8; border-left: 4px solid #3A4F1C; border-radius: 4px;">
      <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #3A4F1C; text-transform: uppercase; letter-spacing: 0.05em;">
        Next Steps
      </p>
      <p style="margin: 0 0 10px 0; font-size: 13px; color: #3A4F1C; line-height: 1.6;">
        Our event coordination team has received your details and is currently processing it. A member of our team will reach out to you within 24 to 48 business hours to discuss your event itinerary and finalize arrangements.
      </p>
      <p style="margin: 0; font-size: 13px; color: #3A4F1C; line-height: 1.6;">
        If you have any questions or need to make adjustments to your event details, you may reply directly to this email to speak with our coordination desk.
      </p>
    </div>

    <p style="margin: 20px 0 0 0; font-size: 14px; color: #3A4F1C; line-height: 1.6;">
      Warm regards,<br />
      <strong>Casamento Events Management Team</strong>
    </p>
  `.trim();

  const html = renderBaseEmailLayout({
    sectionLabel: 'RESERVATION ACKNOWLEDGMENT',
    title: 'Booking Request Acknowledged',
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
