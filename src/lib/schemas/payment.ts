// =============================================================================
// lib/schemas/payment.ts — Zod Validation Schemas for Payment Operations
// =============================================================================

import { z } from 'zod';

/**
 * Validates setting or modifying the agreed contract price for a booking.
 */
export const setAgreedTotalSchema = z.object({
  bookingId: z.string().uuid('Invalid booking identifier'),
  agreedTotalPesos: z
    .number()
    .positive('Agreed total must be greater than zero')
    .max(10_000_000, 'Agreed total exceeds standard operational limit (10,000,000 PHP)'),
  currency: z.string().optional().default('PHP'),
  sendEmailToClient: z.boolean().default(true),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional().nullable(),
});

export type SetAgreedTotalInput = z.input<typeof setAgreedTotalSchema>;

/**
 * Validates manual entry of payment received outside online gateways.
 * Proof attachment and receipt email dispatch are strictly optional.
 */
export const manualPaymentSchema = z.object({
  bookingId: z.string().uuid('Invalid booking identifier'),
  amountPesos: z
    .number()
    .positive('Payment amount must be greater than zero'),
  
  // Freeform payment method string validated by application layer
  paymentMethod: z.string().min(1, 'Payment method is required'),
  
  paidAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?)?/, 'Date must be ISO format or YYYY-MM-DD'),
  
  channelDetails: z.object({
    bankName: z.string().optional(),
    referenceNumber: z.string().optional(),
    senderName: z.string().optional(),
    accountNumberLast4: z.string().optional(),
    notes: z.string().optional(),
  }).default({}),
  
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional().nullable(),
  
  // Optional Proof of Payment (Attachment)
  proofAttachment: z.object({
    path: z.string().min(1, 'Proof file path is required'),
    name: z.string().min(1, 'Proof file name is required'),
    sizeBytes: z.number().positive().optional(),
    mimeType: z.string().optional(),
  }).optional().nullable(),
  
  // Optional Receipt Generation & Dispatch
  sendReceiptEmail: z.boolean().default(false),
});

export type ManualPaymentInput = z.input<typeof manualPaymentSchema>;

/**
 * Validates marking a payment as refunded with an explanatory reason.
 */
export const refundPaymentSchema = z.object({
  paymentId: z.string().uuid('Invalid payment identifier'),
  refundAmountPesos: z
    .number()
    .positive('Refund amount must be greater than zero'),
  refundReason: z
    .string()
    .min(5, 'Please provide an explanatory reason for this refund (minimum 5 characters)')
    .max(300, 'Refund reason cannot exceed 300 characters'),
});

export type RefundPaymentInput = z.infer<typeof refundPaymentSchema>;

/**
 * Validates filter parameters for exporting payments to CSV or Excel.
 */
export const exportPaymentsFilterSchema = z.object({
  status: z.enum(['all', 'paid', 'pending', 'refunded']).optional().default('all'),
  paymentMethod: z.string().optional().default('all'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be YYYY-MM-DD').optional(),
  format: z.enum(['csv', 'xlsx']).default('csv'),
});

export type ExportPaymentsFilterInput = z.infer<typeof exportPaymentsFilterSchema>;

/**
 * Validates requesting a re-send of the payment receipt PDF to the client.
 */
export const resendReceiptSchema = z.object({
  paymentId: z.string().uuid('Invalid payment identifier'),
  recipientEmail: z.string().email('Invalid email address format').optional(),
});

export type ResendReceiptInput = z.infer<typeof resendReceiptSchema>;

/**
 * Validates sending a payment invoice for the balance (or partial installment) to the client.
 */
export const sendPaymentInvoiceSchema = z.object({
  bookingId: z.string().uuid('Invalid booking identifier'),
  invoiceAmountPesos: z.number().positive('Invoice amount must be greater than zero'),
  recipientEmail: z.string().email('Invalid recipient email address format'),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be YYYY-MM-DD').optional().nullable(),
  customNotes: z.string().max(500, 'Custom notes cannot exceed 500 characters').optional().nullable(),
});

export type SendPaymentInvoiceInput = z.input<typeof sendPaymentInvoiceSchema>;

/**
 * Validates updating an existing manual payment record.
 */
export const updatePaymentSchema = z.object({
  paymentId: z.string().uuid('Invalid payment identifier'),
  amountPesos: z.number().positive('Payment amount must be greater than zero'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  paidAt: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?)?/, 'Date must be ISO format or YYYY-MM-DD'),
  channelDetails: z.object({
    bankName: z.string().optional(),
    referenceNumber: z.string().optional(),
    senderName: z.string().optional(),
    accountNumberLast4: z.string().optional(),
    notes: z.string().optional(),
  }).default({}),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional().nullable(),
  proofAttachment: z.object({
    path: z.string().min(1, 'Proof file path is required'),
    name: z.string().min(1, 'Proof file name is required'),
    sizeBytes: z.number().positive().optional(),
    mimeType: z.string().optional(),
  }).optional().nullable(),
});

export type UpdatePaymentInput = z.input<typeof updatePaymentSchema>;

/**
 * Validates archiving/cancelling a payment.
 */
export const archivePaymentSchema = z.object({
  paymentId: z.string().uuid('Invalid payment identifier'),
  reason: z.string().min(3, 'Archive reason is required (minimum 3 characters)').max(300, 'Reason cannot exceed 300 characters'),
});

export type ArchivePaymentInput = z.infer<typeof archivePaymentSchema>;

/**
 * Validates archiving a booking from payments ledger.
 */
export const archiveBookingSchema = z.object({
  bookingId: z.string().uuid('Invalid booking identifier'),
  reason: z.string().min(3, 'Archive reason is required (minimum 3 characters)').max(300, 'Reason cannot exceed 300 characters'),
});

export type ArchiveBookingInput = z.infer<typeof archiveBookingSchema>;

