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
export { buildServiceInquiryAdminEmail } from './templates/service-inquiry-admin';
export { buildFeedbackAdminEmail } from './templates/feedback-admin';
export { buildFeedbackClientPostedEmail } from './templates/feedback-client';
export type { ClientFeedbackPostedPayload } from './templates/feedback-client';

export { buildBookingClientPreviewEmail } from './templates/booking-client-preview';
export { buildBookingAdminNotificationEmail } from './templates/booking-admin-notification';
export { buildBookingClientConfirmationEmail } from './templates/booking-client-confirmation';
export { buildBookingClientAcceptedEmail } from './templates/booking-client-accepted';
export { buildBookingClientRejectedEmail } from './templates/booking-client-rejected';
export { buildBookingClientUpdatedEmail } from './templates/booking-client-updated';
export { buildBookingClientRescheduledEmail } from './templates/booking-client-rescheduled';
export { buildBookingClientCancelledEmail } from './templates/booking-client-cancelled';
export { buildBookingClientCompletedEmail } from './templates/booking-client-completed';
export { buildBookingClientReminderEmail } from './templates/booking-client-reminder-7d';
export { buildBookingAdminReminderEmail } from './templates/booking-admin-reminder-7d';
export { buildTaskAssignmentMemberEmail } from './templates/task-assignment-member';
export type { TaskAssignmentItem, TaskAssignmentEmailParams } from './templates/task-assignment-member';

export { buildPaymentClientReceiptEmail } from './templates/payment-client-receipt';
export type { PaymentClientReceiptPayload } from './templates/payment-client-receipt';

export { buildPaymentClientInvoiceEmail } from './templates/payment-client-invoice';
export type { PaymentClientInvoicePayload } from './templates/payment-client-invoice';

export { buildBookingClientAgreedTotalEmail } from './templates/booking-client-agreed-total';
export type { BookingClientAgreedTotalPayload } from './templates/booking-client-agreed-total';

