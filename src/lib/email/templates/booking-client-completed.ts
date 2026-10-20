import type { BookingRecord } from '@/types/booking';
import { renderBaseEmailLayout } from './layouts/base';
import { renderDataTable } from './blocks/dataTable';
import { renderCtaButton } from './blocks/ctaButton';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Builds email template sent to client when their event is completed/concluded.
 * Written in a natural, heartfelt human voice.
 */
export function buildBookingClientCompletedEmail(
  booking: BookingRecord,
  customNote?: string
): { subject: string; html: string } {
  const subject = `Thank you from Casamento Events! [${booking.booking_reference}]`;

  const dataTableHtml = renderDataTable([
    { label: 'Booking Reference', value: `<strong>${booking.booking_reference}</strong>`, isHtml: true },
    { label: 'Service', value: `${booking.service_title} (${booking.category_title})` },
    { label: 'Event Date', value: booking.event_date },
    { label: 'Venue', value: `${booking.venue_city}${booking.event_country_name ? `, ${booking.event_country_name}` : ''}` },
  ]);

  const customMessageBlock = customNote && customNote.trim().length > 0
    ? `
      <div style="margin: 20px 0; padding: 16px 20px; background-color: #FAF6ED; border-left: 4px solid #3A4F1C; border-radius: 6px;">
        <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #3A4F1C; text-transform: uppercase; letter-spacing: 0.05em;">
          A Note from Your Coordinator:
        </p>
        <p style="margin: 0; font-size: 14px; color: #2B3817; line-height: 1.6; white-space: pre-wrap;">
          ${escapeHtml(customNote.trim())}
        </p>
      </div>
    `
    : '';

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://casamentoevents.com';
  const feedbackUrl = `${siteUrl.replace(/\/$/, '')}/articles/feedback`;
  const ctaButtonHtml = renderCtaButton('Share Your Feedback with Us →', feedbackUrl);

  const contentHtml = `
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #2B3817; line-height: 1.6;">
      Hi ${escapeHtml(booking.client_full_name)},
    </p>

    <p style="margin: 0 0 16px 0; font-size: 14px; color: #2B3817; line-height: 1.6;">
      Now that the music has wrapped up and the day has settled, everyone on our team at Casamento Events wanted to send our warmest thanks.
    </p>

    <p style="margin: 0 0 16px 0; font-size: 14px; color: #2B3817; line-height: 1.6;">
      It was an absolute joy helping bring your <strong>${escapeHtml(booking.service_title)}</strong> to life. We pour our hearts into coordinating every single detail, and we truly hope the event was everything you envisioned and more.
    </p>

    ${dataTableHtml}
    ${customMessageBlock}

    <p style="margin: 20px 0 16px 0; font-size: 14px; color: #2B3817; line-height: 1.6;">
      Whenever you catch your breath, we would love to hear how your day went. If you ever have a few minutes to <a href="${feedbackUrl}" target="_blank" rel="noopener noreferrer" style="color: #3A4F1C; font-weight: 600; text-decoration: underline;">share your feedback with us</a> or send over a favorite photo, it would brighten our whole team&rsquo;s day.
    </p>

    ${ctaButtonHtml}

    <p style="margin: 20px 0 0 0; font-size: 14px; color: #2B3817; line-height: 1.6;">
      Thank you again for trusting us with your event. Wishing you nothing but happiness and wonderful memories ahead!
    </p>

    <p style="margin: 24px 0 0 0; font-size: 14px; color: #3A4F1C; font-weight: 600; line-height: 1.5;">
      Warmly,<br />
      The Casamento Events Team
    </p>
  `;

  const html = renderBaseEmailLayout({
    title: 'Thank You from Casamento Events',
    sectionLabel: 'Celebration Complete',
    contentHtml,
    isAdminNotification: false,
  });

  return { subject, html };
}
