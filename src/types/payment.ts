// =============================================================================
// types/payment.ts — Payment & Billing Domain Types
// =============================================================================

/**
 * Extensible payment methods governed by the application layer.
 * Adding a new method here requires ZERO database migrations.
 */
export const PAYMENT_METHODS = [
  'cash',
  'bank_transfer',
  'gcash',
  'maya',
  'dragonpay',
  'paypal',
  'other',
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number] | string;

export type PaymentType = 'manual' | 'online';

export type PaymentRecordStatus = 
  | 'pending' 
  | 'paid' 
  | 'failed' 
  | 'cancelled' 
  | 'refunded';

/**
 * Channel-specific metadata stored in channel_details JSONB
 */
export interface BankTransferDetails {
  bankName: string;
  accountName?: string;
  accountNumberLast4?: string;
  referenceNumber?: string;
}

export interface EWalletDetails {
  walletProvider: 'gcash' | 'maya' | string;
  accountName?: string;
  mobileNumberLast4?: string;
  referenceNumber?: string;
}

export interface CashPaymentDetails {
  receivedBy: string;
  location?: string;
}

export type PaymentChannelDetails = 
  | BankTransferDetails 
  | EWalletDetails 
  | CashPaymentDetails 
  | Record<string, unknown>;

/**
 * Optional metadata when an admin uploads a payment proof file
 */
export interface PaymentProofAttachment {
  path: string;
  name: string;
  sizeBytes?: number;
  mimeType?: string;
}

/**
 * Supabase Database Record for `public.payments`.
 * Proof attachments and receipt paths are strictly optional (nullable).
 */
export interface PaymentRecord {
  id: string;
  booking_id: string;
  booking_reference: string;
  payment_number: string;
  receipt_number: string | null;
  payment_type: PaymentType;
  payment_method: PaymentMethod;
  channel_details: PaymentChannelDetails;
  amount_centavos: number;
  currency: string;
  status: PaymentRecordStatus;
  paid_at: string;
  recorded_by: string | null;
  notes: string | null;
  
  // Optional Proof Attachment
  proof_attachment_path: string | null;
  proof_attachment_name: string | null;
  proof_attachment_size_bytes: number | null;
  proof_attachment_mime_type: string | null;
  
  // Optional Receipt Reference
  receipt_pdf_path: string | null;
  receipt_sent_at: string | null;
  receipt_sent_to: string | null;
  
  // Refund Fields
  is_refunded: boolean;
  refund_amount_centavos: number | null;
  refund_reason: string | null;
  refunded_at: string | null;
  refunded_by: string | null;
  
  // Online Gateway Fields
  online_provider: 'dragonpay' | 'paypal' | null;
  provider_txn_id: string | null;
  provider_ref: string | null;
  provider_payer_email: string | null;
  raw_webhook_payload?: Record<string, unknown> | null;
  
  created_at: string;
  updated_at: string;
}

/**
 * Representation from `public.v_booking_financials`.
 */
export interface BookingFinancialRecord {
  booking_id: string;
  booking_reference: string;
  client_full_name: string;
  client_email: string;
  service_title: string;
  event_date: string;
  booking_status: string;
  payment_status: string;
  agreed_total_centavos: number | null;
  agreed_total_currency: string;
  total_paid_centavos: number;
  payment_count: number;
  remaining_balance_centavos: number | null;
  derived_payment_status: 'unpaid' | 'partially_paid' | 'paid';
  last_payment_at: string | null;
}

/**
 * Dashboard High-Level Totals (Monthly & Outstanding)
 */
export interface FinancialTotalsSummary {
  totalCollectedThisMonthCentavos: number;
  totalOutstandingAcrossBookingsCentavos: number;
  totalPaymentsRecordedThisMonth: number;
  unpaidBookingsCount: number;
  partiallyPaidBookingsCount: number;
  fullyPaidBookingsCount: number;
}
