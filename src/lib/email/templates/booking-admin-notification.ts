import type { BookingFormData } from '@/types/bookingForm';
import { renderBaseEmailLayout } from './layouts/base';
import { renderDataTable } from './blocks/dataTable';
import { renderCtaButton } from './blocks/ctaButton';

/**
 * Builds email template for Casamento Admin team when a client verifies their email and finalizes booking.
 */
export function buildBookingAdminNotificationEmail(
  payload: BookingFormData,
  bookingReference: string
): { subject: string; html: string } {
  const subject = `New Booking Request [${bookingReference}] - ${payload.clientFullName}`;

  const addOnsDisplay =
    payload.selectedAddOns && payload.selectedAddOns.length > 0
      ? payload.selectedAddOns.map((a) => a.title).join(', ')
      : 'None selected';

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://casamentoevents.com';
  const dashboardUrl = `${siteUrl}/admin/dashboard`;

  const dataTableHtml = renderDataTable([
    { label: 'Booking Reference', value: `<strong>${bookingReference}</strong>`, isHtml: true },
    { label: 'Client Full Name', value: payload.clientFullName },
    {
      label: 'Email Address',
      value: `<a href="mailto:${escapeHtml(payload.clientEmail)}" style="color: #3A4F1C; text-decoration: underline;">${escapeHtml(payload.clientEmail)}</a>`,
      isHtml: true,
    },
    { label: 'Contact Phone', value: payload.clientPhone || 'Not provided' },
    ...(payload.companyName ? [{ label: 'Company / Org', value: payload.companyName }] : []),
    { label: 'Selected Service', value: `${payload.serviceTitle} (${payload.categoryTitle})` },
    { label: 'Optional Add-ons', value: addOnsDisplay },
    { label: 'Target Event Date', value: `${payload.eventDate}${payload.isHolidayDate && payload.holidayName ? ` [Holiday: ${payload.holidayName}]` : ''}` },
    { label: 'Target Location', value: `${payload.venueCity}${payload.venueAddress ? `, ${payload.venueAddress}` : ''} (${payload.eventCountryName || payload.eventCountry})` },
    ...(payload.specialNotes ? [{ label: 'Special Notes', value: payload.specialNotes }] : []),
  ]);

  const ctaHtml = renderCtaButton('Open Admin Dashboard', dashboardUrl);

  const contentHtml = `
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #3A4F1C; line-height: 1.6;">
      A client has verified their email and submitted a confirmed booking reservation request through the website.
    </p>

    ${dataTableHtml}

    <div style="margin: 24px 0 8px 0; text-align: center;">
      ${ctaHtml}
    </div>
  `.trim();

  const html = renderBaseEmailLayout({
    sectionLabel: 'NEW BOOKING RESERVATION',
    title: 'New Booking Request Received',
    contentHtml,
    isAdminNotification: true,
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
