import type { BookingFormData } from '@/types/bookingForm';
import { renderBaseEmailLayout } from './layouts/base';
import { renderDataTable } from './blocks/dataTable';

/**
 * Builds email template for instant client preview and email delivery verification.
 * Sent only to the client when they click "Book Now" before persisting to DB.
 */
export function buildBookingClientPreviewEmail(payload: BookingFormData): { subject: string; html: string } {
  const subject = `Booking Details Preview: ${payload.serviceTitle} - Casamento Events`;

  const addOnsDisplay =
    payload.selectedAddOns && payload.selectedAddOns.length > 0
      ? payload.selectedAddOns.map((a) => a.title).join(', ')
      : 'None selected';

  const dataTableHtml = renderDataTable([
    { label: 'Client Name', value: payload.clientFullName },
    { label: 'Email Address', value: payload.clientEmail },
    { label: 'Contact Phone', value: payload.clientPhone || 'Not provided' },
    { label: 'Selected Service', value: `${payload.serviceTitle} (${payload.categoryTitle})` },
    { label: 'Optional Add-ons', value: addOnsDisplay },
    { label: 'Event Date', value: `${payload.eventDate}${payload.isHolidayDate && payload.holidayName ? ` [Holiday: ${payload.holidayName}]` : ''}` },
    { label: 'Target Location', value: `${payload.venueCity}${payload.venueAddress ? `, ${payload.venueAddress}` : ''} (${payload.eventCountryName || payload.eventCountry})` },
    ...(payload.specialNotes ? [{ label: 'Special Notes', value: payload.specialNotes }] : []),
  ]);

  const contentHtml = `
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #3A4F1C; line-height: 1.6;">
      Dear ${escapeHtml(payload.clientFullName)},
    </p>
    <p style="margin: 0 0 16px 0; font-size: 14px; color: #3A4F1C; line-height: 1.6;">
      We received a booking reservation request on our website with this email address. Please review your event summary below:
    </p>
    
    ${dataTableHtml}

    <div style="margin: 24px 0 16px 0; padding: 16px; background-color: #EFEAD8; border-left: 4px solid #BC6F07; border-radius: 4px;">
      <p style="margin: 0; font-size: 13px; font-weight: 600; color: #3A4F1C;">
        Please Return to Your Browser
      </p>
      <p style="margin: 6px 0 0 0; font-size: 12px; color: #3A4F1C; opacity: 0.85; line-height: 1.5;">
        To confirm your reservation and alert our coordination team, please return to the Casamento website and click <strong>"Yes, I Received It"</strong> on the verification screen.
      </p>
    </div>

    <p style="margin: 16px 0 0 0; font-size: 12px; color: #3A4F1C; opacity: 0.65; font-style: italic;">
      If you did not initiate this booking request, no further action is required and no reservation will be placed.
    </p>
  `.trim();

  const html = renderBaseEmailLayout({
    sectionLabel: 'EMAIL VERIFICATION & PREVIEW',
    title: 'Booking Details Preview',
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
