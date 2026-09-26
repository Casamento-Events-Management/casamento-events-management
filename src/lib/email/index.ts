/**
 * Casamento Events Modular Email System — Public API
 */

export { renderBaseEmailLayout } from './templates/layouts/base';
export type { BaseEmailLayoutOptions } from './templates/layouts/base';

export { renderDivider } from './templates/blocks/divider';
export { renderCtaButton } from './templates/blocks/ctaButton';
export { renderBlockquote } from './templates/blocks/blockquote';
export { renderDataTable } from './templates/blocks/dataTable';
export type { DataTableRow } from './templates/blocks/dataTable';

export { buildContactAdminEmail } from './templates/contact-admin';
export { buildFeedbackAdminEmail } from './templates/feedback-admin';
export { buildFeedbackClientPostedEmail } from './templates/feedback-client';
export type { ClientFeedbackPostedPayload } from './templates/feedback-client';
