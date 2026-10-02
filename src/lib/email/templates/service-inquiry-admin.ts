import type { ServiceInquiryFormData } from '@/lib/schemas/serviceInquiry';
import { renderBaseEmailLayout } from './layouts/base';
import { renderDataTable } from './blocks/dataTable';
import { renderBlockquote } from './blocks/blockquote';

/**
 * Builds email template for Admin notification when a client submits a Service Card Inquiry.
 * Attaches client details, user message, and complete service specifications (category, inclusions, add-ons).
 */
export function buildServiceInquiryAdminEmail(payload: ServiceInquiryFormData): { subject: string; html: string } {
  const subject = `Service Inquiry: ${payload.serviceTitle} — ${payload.clientName}`;

  const clientDataRows = [
    { label: 'Client Name', value: payload.clientName },
    {
      label: 'Email',
      value: `<a href="mailto:${escapeHtml(payload.clientEmail)}" style="color: #3A4F1C; text-decoration: underline;">${escapeHtml(payload.clientEmail)}</a>`,
      isHtml: true,
    },
    { label: 'Contact Phone', value: payload.clientPhone || 'Not provided' },
    { label: 'Address / Location', value: payload.clientAddress || 'Not provided' },
  ];

  const serviceDataRows = [
    { label: 'Service Package', value: payload.serviceTitle },
    { label: 'Category', value: payload.categoryTitle },
    { label: 'Service Tier / Type', value: payload.serviceType || 'Standard Service' },
  ];

  const clientDataTableHtml = renderDataTable(clientDataRows);
  const serviceDataTableHtml = renderDataTable(serviceDataRows);
  const blockquoteHtml = renderBlockquote(payload.message);

  const inclusionsHtml = payload.defaultInclusions && payload.defaultInclusions.length > 0
    ? `<ul style="margin: 4px 0 16px 0; padding-left: 20px; font-size: 13px; color: #3A4F1C; line-height: 1.5;">
        ${payload.defaultInclusions.map((inc) => `<li>${escapeHtml(inc)}</li>`).join('')}
       </ul>`
    : '<p style="font-size: 13px; color: #3A4F1C; font-style: italic;">Standard package inclusions apply.</p>';

  const addOnsHtml = payload.availableAddOns && payload.availableAddOns.length > 0
    ? `<ul style="margin: 4px 0 16px 0; padding-left: 20px; font-size: 13px; color: #BC6F07; line-height: 1.5;">
        ${payload.availableAddOns.map((addon) => `<li>${escapeHtml(addon)}</li>`).join('')}
       </ul>`
    : '<p style="font-size: 13px; color: #666; font-style: italic;">No specific add-ons listed for this service item.</p>';

  const contentHtml = `
    <p style="margin: 0 0 16px 0; font-size: 14px; color: #3A4F1C;">
      A client has requested an inquiry for <strong>${escapeHtml(payload.serviceTitle)}</strong> via the Service Catalog card.
      Please review the client contact info and service specs below:
    </p>

    <h3 style="margin: 16px 0 8px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #3A4F1C; border-bottom: 1px solid #3A4F1C/20; padding-bottom: 4px;">
      Client Details
    </h3>
    ${clientDataTableHtml}

    <p style="margin: 16px 0 4px 0; font-weight: 600; color: #3A4F1C;">Inquiry Message / Notes:</p>
    ${blockquoteHtml}

    <h3 style="margin: 24px 0 8px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #3A4F1C; border-bottom: 1px solid #3A4F1C/20; padding-bottom: 4px;">
      Target Service Details
    </h3>
    ${serviceDataTableHtml}

    <p style="margin: 12px 0 4px 0; font-weight: 600; color: #3A4F1C; font-size: 13px;">Package Inclusions:</p>
    ${inclusionsHtml}

    <p style="margin: 12px 0 4px 0; font-weight: 600; color: #3A4F1C; font-size: 13px;">Available Optional Add-Ons:</p>
    ${addOnsHtml}
  `.trim();

  const html = renderBaseEmailLayout({
    sectionLabel: 'SERVICE CARD INQUIRY',
    title: 'New Service Inquiry Received',
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
