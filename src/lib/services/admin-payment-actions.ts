// =============================================================================
// lib/services/admin-payment-actions.ts — Server Actions for Payment Management
// =============================================================================

'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentActiveAdmin } from '@/lib/services/adminProfileService';
import { logAudit } from '@/lib/services/auditService';
import {
  setAgreedTotalSchema,
  manualPaymentSchema,
  refundPaymentSchema,
  resendReceiptSchema,
  sendPaymentInvoiceSchema,
  updatePaymentSchema,
  archivePaymentSchema,
  archiveBookingSchema,
  type SetAgreedTotalInput,
  type ManualPaymentInput,
  type RefundPaymentInput,
  type ResendReceiptInput,
  type SendPaymentInvoiceInput,
  type UpdatePaymentInput,
  type ArchivePaymentInput,
  type ArchiveBookingInput,
} from '@/lib/schemas/payment';
import {
  buildPaymentClientReceiptEmail,
  buildBookingClientAgreedTotalEmail,
  buildPaymentClientInvoiceEmail,
} from '@/lib/email';
import { parseContactEmailRecipients, parseContactEmailCC } from '@/lib/utils/envUtils';
import { pesosToCentavos, formatPesos } from '@/lib/utils/currencyUtils';
import type {
  PaymentRecord,
  FinancialTotalsSummary,
} from '@/types/payment';

/**
 * Generates an unguessable payment reference: PAY-YYYY-XXXXX
 */
export async function generatePaymentNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return `PAY-${year}-${randomSuffix}`;
}

/**
 * Generates a client-facing receipt reference: CSM-RCPT-YYYY-XXXXX
 */
export async function generateReceiptNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return `CSM-RCPT-${year}-${randomSuffix}`;
}

/**
 * Dispatches an email via Resend to the client with Casamento team CC'd.
 */
async function dispatchClientEmail(
  clientEmail: string,
  subject: string,
  html: string,
  entityRef: string
): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const teamRecipients = parseContactEmailRecipients();
  const teamCC = parseContactEmailCC();

  if (!apiKey) {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        '[adminPaymentActions] RESEND_API_KEY not configured. Mocking email delivery for:',
        entityRef,
        'to:',
        clientEmail
      );
    }
    return { success: true };
  }

  const clientClean = clientEmail.trim().toLowerCase();
  const combinedCC = [...teamRecipients, ...(teamCC || [])]
    .map((e) => e.trim())
    .filter((e) => e.length > 0 && e.toLowerCase() !== clientClean);

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: `Casamento Events <${process.env.CONTACT_EMAIL_FROM || 'onboarding@resend.dev'}>`,
        to: [clientEmail],
        cc: combinedCC.length > 0 ? combinedCC : undefined,
        reply_to: teamRecipients[0] || process.env.CONTACT_EMAIL_FROM,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      console.error('[adminPaymentActions Resend Error]:', data);
      return { success: false, error: data.message || 'Failed to dispatch email' };
    }

    return { success: true };
  } catch (err) {
    console.error('[adminPaymentActions Email Exception]:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Email service failure' };
  }
}

/**
 * Fetches dashboard financial statistics summary.
 */
export async function fetchPaymentStatsAction(): Promise<{
  success: boolean;
  stats?: FinancialTotalsSummary;
  error?: string;
}> {
  const adminData = await getCurrentActiveAdmin();
  if (!adminData || adminData.profile.role === 'staff') {
    return { success: false, error: 'Unauthorized: Admin operator access required' };
  }

  const supabase = createAdminClient();

  try {
    // 1. Current month date bounds
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();

    // 2. Query payments recorded in current month
    const { data: monthPayments, error: monthError } = await supabase
      .from('payments')
      .select('amount_centavos, refund_amount_centavos, status')
      .eq('status', 'paid')
      .gte('paid_at', startOfMonth)
      .lte('paid_at', endOfMonth);

    if (monthError) throw monthError;

    const totalCollectedThisMonthCentavos = (monthPayments || []).reduce((acc, p) => {
      const net = (p.amount_centavos || 0) - (p.refund_amount_centavos || 0);
      return acc + (net > 0 ? net : 0);
    }, 0);

    const totalPaymentsRecordedThisMonth = (monthPayments || []).length;

    // 3. Query all non-cancelled, non-archived bookings for balance & billing health
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, payment_status, agreed_total_centavos, status, is_archived')
      .eq('is_archived', false)
      .neq('status', 'cancelled');

    if (bookingsError) throw bookingsError;

    // 4. Query total paid per booking to compute actual outstanding balance
    const { data: allPaidPayments, error: allPaidError } = await supabase
      .from('payments')
      .select('booking_id, amount_centavos, refund_amount_centavos')
      .eq('status', 'paid');

    if (allPaidError) throw allPaidError;

    const paidByBooking = new Map<string, number>();
    for (const p of allPaidPayments || []) {
      const current = paidByBooking.get(p.booking_id) || 0;
      const net = (p.amount_centavos || 0) - (p.refund_amount_centavos || 0);
      paidByBooking.set(p.booking_id, current + (net > 0 ? net : 0));
    }

    let totalOutstandingAcrossBookingsCentavos = 0;
    let unpaidBookingsCount = 0;
    let partiallyPaidBookingsCount = 0;
    let fullyPaidBookingsCount = 0;

    for (const b of bookingsData || []) {
      const agreed = b.agreed_total_centavos;
      const paid = paidByBooking.get(b.id) || 0;

      if (agreed !== null && agreed !== undefined && agreed > 0) {
        const remaining = Math.max(0, agreed - paid);
        totalOutstandingAcrossBookingsCentavos += remaining;

        if (remaining === 0) {
          fullyPaidBookingsCount++;
        } else if (paid > 0) {
          partiallyPaidBookingsCount++;
        } else {
          unpaidBookingsCount++;
        }
      } else {
        // No agreed total set yet
        if (paid > 0) {
          partiallyPaidBookingsCount++;
        } else {
          unpaidBookingsCount++;
        }
      }
    }

    return {
      success: true,
      stats: {
        totalCollectedThisMonthCentavos,
        totalOutstandingAcrossBookingsCentavos,
        totalPaymentsRecordedThisMonth,
        unpaidBookingsCount,
        partiallyPaidBookingsCount,
        fullyPaidBookingsCount,
      },
    };
  } catch (err) {
    console.error('[fetchPaymentStatsAction Error]:', err);
    return { success: false, error: 'Failed to calculate payment summary statistics.' };
  }
}

export interface PaymentListFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  method?: string;
  startDate?: string;
  endDate?: string;
}

export interface ExtendedPaymentRecord extends PaymentRecord {
  booking?: {
    service_title: string;
    client_full_name: string;
    client_email: string;
    event_date: string;
    agreed_total_centavos: number | null;
    remaining_balance_centavos: number | null;
    is_archived?: boolean;
    status?: string;
  };
}

/**
 * Fetches paginated payment records matching active filters.
 */
export async function fetchPaymentsAction(filters: PaymentListFilters): Promise<{
  success: boolean;
  payments?: ExtendedPaymentRecord[];
  totalCount?: number;
  error?: string;
}> {
  const adminData = await getCurrentActiveAdmin();
  if (!adminData || adminData.profile.role === 'staff') {
    return { success: false, error: 'Unauthorized: Admin operator access required' };
  }

  const supabase = createAdminClient();
  const page = Math.max(1, filters.page || 1);
  const pageSize = Math.min(100, Math.max(5, filters.pageSize || 10));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    // 1. Fetch active bookings (non-cancelled, non-archived)
    const bookingsQuery = supabase
      .from('bookings')
      .select('id, booking_reference, client_full_name, client_email, service_title, event_date, agreed_total_centavos, agreed_total_currency, agreed_total_set_at, payment_status, status, created_at, is_archived')
      .eq('is_archived', false)
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false });

    // 2. Fetch non-cancelled payments
    const paymentsQuery = supabase
      .from('payments')
      .select('*')
      .neq('status', 'cancelled')
      .order('paid_at', { ascending: false });

    const [{ data: rawBookings, error: bErr }, { data: rawPayments, error: pErr }] = await Promise.all([
      bookingsQuery,
      paymentsQuery,
    ]);

    if (bErr) throw bErr;
    if (pErr) throw pErr;

    const bookings = rawBookings || [];
    const payments = rawPayments || [];

    // Map payments by booking_id
    const paymentsByBooking = new Map<string, PaymentRecord[]>();
    for (const p of payments) {
      if (!paymentsByBooking.has(p.booking_id)) {
        paymentsByBooking.set(p.booking_id, []);
      }
      paymentsByBooking.get(p.booking_id)!.push(p);
    }

    interface EvaluatedBooking {
      booking: (typeof bookings)[0];
      status: 'paid' | 'partially_paid' | 'refunded' | 'unpaid' | 'undeclared';
      totalPaidCentavos: number;
      remainingBalanceCentavos: number | null;
      matchingPayments: PaymentRecord[];
      latestDate: string;
      cleanReference: string;
      syntheticPaymentNumber: string;
    }

    const searchLower = filters.search?.trim().toLowerCase();
    const evaluatedList: EvaluatedBooking[] = [];

    for (const b of bookings) {
      const bPayments = paymentsByBooking.get(b.id) || [];
      const agreed = b.agreed_total_centavos;

      // Net paid from successful payments
      const totalPaidCentavos = bPayments.reduce((acc, p) => {
        if (p.status !== 'paid') return acc;
        const net = (p.amount_centavos || 0) - (p.refund_amount_centavos || 0);
        return acc + (net > 0 ? net : 0);
      }, 0);

      const hasRefundedPayment = bPayments.some((p) => p.is_refunded);
      const remainingBalanceCentavos = agreed !== null && agreed !== undefined && agreed > 0 ? Math.max(0, agreed - totalPaidCentavos) : null;

      // Determine booking payment status:
      // 'paid' | 'partially_paid' | 'refunded' | 'unpaid' | 'undeclared'
      let derivedStatus: 'paid' | 'partially_paid' | 'refunded' | 'unpaid' | 'undeclared';
      if (b.payment_status === 'refunded' || (hasRefundedPayment && totalPaidCentavos === 0)) {
        derivedStatus = 'refunded';
      } else if (agreed === null || agreed === undefined || agreed <= 0) {
        derivedStatus = 'undeclared';
      } else if (totalPaidCentavos === 0) {
        derivedStatus = 'unpaid';
      } else if (totalPaidCentavos >= agreed) {
        derivedStatus = 'paid';
      } else {
        derivedStatus = 'partially_paid';
      }

      // Check status filter
      if (filters.status && filters.status !== 'all') {
        if (derivedStatus !== filters.status) {
          continue;
        }
      }

      // Filter payments by method if method filter active
      let filteredPayments = bPayments;
      if (filters.method && filters.method !== 'all') {
        filteredPayments = bPayments.filter((p) => p.payment_method === filters.method);
        // If method is specified and booking has no payments matching this method, skip
        if (filteredPayments.length === 0) {
          continue;
        }
      }

      // Check date range filter (start / end)
      if (filters.startDate || filters.endDate) {
        const startTs = filters.startDate ? new Date(`${filters.startDate}T00:00:00.000Z`).getTime() : -Infinity;
        const endTs = filters.endDate ? new Date(`${filters.endDate}T23:59:59.999Z`).getTime() : Infinity;

        // If booking has payments, filter payments within range
        if (bPayments.length > 0) {
          filteredPayments = filteredPayments.filter((p) => {
            const pTs = new Date(p.paid_at).getTime();
            return pTs >= startTs && pTs <= endTs;
          });
          // If no payments fall in date range, check if booking created_at falls in range
          if (filteredPayments.length === 0) {
            const bTs = new Date(b.created_at).getTime();
            if (bTs < startTs || bTs > endTs) {
              continue;
            }
          }
        } else {
          // Booking with no payments: check created_at or agreed_total_set_at
          const bTs = new Date(b.agreed_total_set_at || b.created_at).getTime();
          if (bTs < startTs || bTs > endTs) {
            continue;
          }
        }
      }

      // Clean reference without 'CAS'
      const cleanRef = b.booking_reference.replace(/^CAS-?/i, '');
      const statusPrefix = derivedStatus.toUpperCase();
      const syntheticNumber = `${statusPrefix}-${cleanRef}`;

      // Check search query filter
      if (searchLower) {
        const matchesBooking =
          b.booking_reference.toLowerCase().includes(searchLower) ||
          cleanRef.toLowerCase().includes(searchLower) ||
          syntheticNumber.toLowerCase().includes(searchLower) ||
          b.client_full_name.toLowerCase().includes(searchLower) ||
          b.client_email.toLowerCase().includes(searchLower) ||
          b.service_title.toLowerCase().includes(searchLower);

        const matchesAnyPayment = bPayments.some(
          (p) =>
            p.payment_number.toLowerCase().includes(searchLower) ||
            (p.receipt_number && p.receipt_number.toLowerCase().includes(searchLower))
        );

        if (!matchesBooking && !matchesAnyPayment) {
          continue;
        }
      }

      // Latest date for sorting
      const latestPaymentDate = bPayments[0]?.paid_at;
      const latestDate = latestPaymentDate || b.agreed_total_set_at || b.created_at;

      evaluatedList.push({
        booking: b,
        status: derivedStatus,
        totalPaidCentavos,
        remainingBalanceCentavos,
        matchingPayments: filteredPayments,
        latestDate,
        cleanReference: cleanRef,
        syntheticPaymentNumber: syntheticNumber,
      });
    }

    // Sort evaluated bookings by latestDate descending
    evaluatedList.sort((a, b) => new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime());

    const totalCount = evaluatedList.length;
    const paginatedBookings = evaluatedList.slice(from, to + 1);

    // Build the extended payment records to return
    const paginatedEntries: ExtendedPaymentRecord[] = [];

    for (const item of paginatedBookings) {
      const b = item.booking;
      const bookingInfo = {
        service_title: b.service_title,
        client_full_name: b.client_full_name,
        client_email: b.client_email,
        event_date: b.event_date,
        agreed_total_centavos: b.agreed_total_centavos,
        remaining_balance_centavos: item.remainingBalanceCentavos,
        is_archived: b.is_archived,
        status: b.status,
      };

      if (item.matchingPayments.length > 0) {
        // Has actual payments
        for (const p of item.matchingPayments) {
          paginatedEntries.push({
            ...p,
            booking: bookingInfo,
          });
        }
      } else {
        // Synthetic row representing the booking contract in the ledger
        paginatedEntries.push({
          id: `pending-${b.id}`,
          booking_id: b.id,
          booking_reference: b.booking_reference,
          payment_number: item.syntheticPaymentNumber,
          receipt_number: null,
          payment_type: 'manual',
          payment_method: 'pending',
          channel_details: {},
          amount_centavos: item.remainingBalanceCentavos ?? 0,
          currency: b.agreed_total_currency || 'PHP',
          status: 'pending',
          paid_at: b.agreed_total_set_at || b.created_at,
          recorded_by: null,
          notes: b.agreed_total_centavos === null ? 'Agreed total not declared yet' : `${item.status.replace('_', ' ')} booking`,
          proof_attachment_path: null,
          proof_attachment_name: null,
          proof_attachment_size_bytes: null,
          proof_attachment_mime_type: null,
          receipt_pdf_path: null,
          receipt_sent_at: null,
          receipt_sent_to: null,
          is_refunded: item.status === 'refunded',
          refund_amount_centavos: null,
          refund_reason: null,
          refunded_at: null,
          refunded_by: null,
          online_provider: null,
          provider_txn_id: null,
          provider_ref: null,
          provider_payer_email: null,
          created_at: b.created_at,
          updated_at: b.created_at,
          booking: bookingInfo,
        });
      }
    }

    return {
      success: true,
      payments: paginatedEntries,
      totalCount,
    };
  } catch (err) {
    console.error('[fetchPaymentsAction Error]:', err);
    return { success: false, error: 'Failed to retrieve payment records.' };
  }
}

/**
 * Searches active bookings for combobox selection when creating a payment or setting agreed total.
 */
export async function searchBookingsForPaymentAction(searchQuery?: string): Promise<{
  success: boolean;
  bookings?: Array<{
    id: string;
    booking_reference: string;
    client_full_name: string;
    client_email: string;
    service_title: string;
    event_date: string;
    agreed_total_centavos: number | null;
    total_paid_centavos: number;
    remaining_balance_centavos: number | null;
    payment_status: string;
    status: string;
  }>;
  error?: string;
}> {
  const adminData = await getCurrentActiveAdmin();
  if (!adminData || adminData.profile.role === 'staff') {
    return { success: false, error: 'Unauthorized: Admin operator access required' };
  }

  const supabase = createAdminClient();

  try {
    let query = supabase
      .from('bookings')
      .select('id, booking_reference, client_full_name, client_email, service_title, event_date, agreed_total_centavos, payment_status, status')
      .eq('is_archived', false)
      .not('status', 'in', '("cancelled","completed")')
      .order('event_date', { ascending: false })
      .limit(30);

    if (searchQuery && searchQuery.trim().length > 0) {
      const q = searchQuery.trim();
      query = query.or(
        `booking_reference.ilike.%${q}%,client_full_name.ilike.%${q}%,client_email.ilike.%${q}%,service_title.ilike.%${q}%`
      );
    }

    const { data: bookings, error: bookingsErr } = await query;
    if (bookingsErr) throw bookingsErr;

    if (!bookings || bookings.length === 0) {
      return { success: true, bookings: [] };
    }

    const bookingIds = bookings.map((b) => b.id);
    const { data: payments } = await supabase
      .from('payments')
      .select('booking_id, amount_centavos, refund_amount_centavos')
      .in('booking_id', bookingIds)
      .eq('status', 'paid');

    const paidMap = new Map<string, number>();
    for (const p of payments || []) {
      const cur = paidMap.get(p.booking_id) || 0;
      const net = (p.amount_centavos || 0) - (p.refund_amount_centavos || 0);
      paidMap.set(p.booking_id, cur + (net > 0 ? net : 0));
    }

    const results = bookings.map((b) => {
      const totalPaid = paidMap.get(b.id) || 0;
      const agreed = b.agreed_total_centavos;
      const remaining = agreed !== null && agreed !== undefined ? Math.max(0, agreed - totalPaid) : null;
      return {
        id: b.id,
        booking_reference: b.booking_reference,
        client_full_name: b.client_full_name,
        client_email: b.client_email,
        service_title: b.service_title,
        event_date: b.event_date,
        agreed_total_centavos: agreed,
        total_paid_centavos: totalPaid,
        remaining_balance_centavos: remaining,
        payment_status: b.payment_status,
        status: b.status,
      };
    });

    return { success: true, bookings: results };
  } catch (err) {
    console.error('[searchBookingsForPaymentAction Error]:', err);
    return { success: false, error: 'Failed to search bookings.' };
  }
}

/**
 * Records a manual payment entry.
 */
export async function recordManualPaymentAction(rawInput: ManualPaymentInput): Promise<{
  success: boolean;
  paymentId?: string;
  paymentNumber?: string;
  receiptNumber?: string;
  error?: string;
}> {
  const adminData = await getCurrentActiveAdmin();
  if (!adminData || adminData.profile.role === 'staff') {
    return { success: false, error: 'Unauthorized: Operator privileges required' };
  }

  const parsed = manualPaymentSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Invalid input data' };
  }

  const input = parsed.data;
  const supabase = createAdminClient();

  try {
    // 1. Fetch booking record
    const { data: booking, error: bErr } = await supabase
      .from('bookings')
      .select('id, booking_reference, client_full_name, client_email, service_title, event_date, agreed_total_centavos, status')
      .eq('id', input.bookingId)
      .single();

    if (bErr || !booking) {
      return { success: false, error: 'Selected booking not found.' };
    }

    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return {
        success: false,
        error: `Cannot record payment for an event that is already ${booking.status}.`,
      };
    }

    if (!booking.agreed_total_centavos || booking.agreed_total_centavos <= 0) {
      return {
        success: false,
        error: 'Cannot record payment: No agreed total has been declared for this booking yet.',
      };
    }

    const amountCentavos = pesosToCentavos(input.amountPesos);

    if (amountCentavos > booking.agreed_total_centavos) {
      return {
        success: false,
        error: `Payment amount (${formatPesos(amountCentavos)}) cannot exceed the declared contract total (${formatPesos(booking.agreed_total_centavos)}).`,
      };
    }

    // Query existing paid payments to compute remaining balance
    const { data: existingPayments } = await supabase
      .from('payments')
      .select('amount_centavos, refund_amount_centavos')
      .eq('booking_id', booking.id)
      .eq('status', 'paid');

    const totalPaidBeforeCentavos = (existingPayments || []).reduce((acc, p) => {
      const net = (p.amount_centavos || 0) - (p.refund_amount_centavos || 0);
      return acc + (net > 0 ? net : 0);
    }, 0);

    const remainingBeforeCentavos = Math.max(0, booking.agreed_total_centavos - totalPaidBeforeCentavos);

    if (remainingBeforeCentavos <= 0) {
      return {
        success: false,
        error: 'Cannot record payment: This booking is already fully paid.',
      };
    }

    if (amountCentavos > remainingBeforeCentavos) {
      return {
        success: false,
        error: `Payment amount (${formatPesos(amountCentavos)}) cannot exceed the remaining balance (${formatPesos(remainingBeforeCentavos)}).`,
      };
    }

    // 2. Generate identifiers
    const paymentNumber = await generatePaymentNumber();
    const receiptNumber = await generateReceiptNumber();

    // 3. Insert payment record
    const insertPayload = {
      booking_id: booking.id,
      booking_reference: booking.booking_reference,
      payment_number: paymentNumber,
      receipt_number: receiptNumber,
      payment_type: 'manual',
      payment_method: input.paymentMethod,
      channel_details: input.channelDetails || {},
      amount_centavos: amountCentavos,
      currency: 'PHP',
      status: 'paid',
      paid_at: input.paidAt ? new Date(input.paidAt).toISOString() : new Date().toISOString(),
      recorded_by: adminData.user.id,
      notes: input.notes?.trim() || null,
      proof_attachment_path: input.proofAttachment?.path || null,
      proof_attachment_name: input.proofAttachment?.name || null,
      proof_attachment_size_bytes: input.proofAttachment?.sizeBytes || null,
      proof_attachment_mime_type: input.proofAttachment?.mimeType || null,
      receipt_sent_at: input.sendReceiptEmail ? new Date().toISOString() : null,
      receipt_sent_to: input.sendReceiptEmail ? booking.client_email : null,
    };

    const { data: paymentRecord, error: pErr } = await supabase
      .from('payments')
      .insert(insertPayload)
      .select('id')
      .single();

    if (pErr) throw pErr;

    // 4. Calculate updated balance for email
    const { data: allPayments } = await supabase
      .from('payments')
      .select('amount_centavos, refund_amount_centavos')
      .eq('booking_id', booking.id)
      .eq('status', 'paid');

    const totalPaidCentavos = (allPayments || []).reduce((acc, p) => {
      const net = (p.amount_centavos || 0) - (p.refund_amount_centavos || 0);
      return acc + (net > 0 ? net : 0);
    }, 0);

    const agreed = booking.agreed_total_centavos;
    const remainingCentavos = agreed !== null && agreed !== undefined ? Math.max(0, agreed - totalPaidCentavos) : null;
    const isFullyPaid = agreed !== null && agreed !== undefined && remainingCentavos === 0;

    // 5. Send acknowledgment email if selected
    if (input.sendReceiptEmail) {
      const { subject, html } = buildPaymentClientReceiptEmail({
        clientFullName: booking.client_full_name,
        clientEmail: booking.client_email,
        bookingReference: booking.booking_reference,
        serviceTitle: booking.service_title,
        eventDate: booking.event_date,
        paymentNumber,
        receiptNumber,
        amountFormatted: formatPesos(amountCentavos),
        paymentMethod: input.paymentMethod,
        paidAtFormatted: new Date(insertPayload.paid_at).toLocaleDateString('en-PH', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        agreedTotalFormatted: formatPesos(agreed),
        remainingBalanceFormatted: formatPesos(remainingCentavos),
        isFullyPaid,
        notes: input.notes,
      });

      await dispatchClientEmail(booking.client_email, subject, html, paymentNumber);
    }

    // Record audit trail
    await logAudit({
      actorUserId: adminData.user.id,
      actorCode: adminData.profile.user_code,
      actorName: adminData.profile.full_name,
      actorEmail: adminData.profile.email,
      actorType: 'admin',
      category: 'Payment',
      action: 'Record Payment',
      severity: 'Info',
      outcome: 'Success',
      summary: `${adminData.profile.full_name} (${adminData.profile.user_code}) recorded payment ${paymentNumber} (${formatPesos(amountCentavos)}) for booking ${booking.booking_reference}.`,
      entityType: 'payment',
      entityId: paymentRecord.id,
      entityRef: paymentNumber,
      changes: {
        amount_centavos: { old: null, new: amountCentavos },
        payment_method: { old: null, new: input.paymentMethod },
      },
      metadata: {
        booking_reference: booking.booking_reference,
        client_name: booking.client_full_name,
        payment_method: input.paymentMethod,
        channel_details: input.channelDetails,
        receipt_number: receiptNumber,
      },
    });

    revalidatePath('/admin/payments');
    revalidatePath('/admin/bookings');

    return {
      success: true,
      paymentId: paymentRecord.id,
      paymentNumber,
      receiptNumber,
    };
  } catch (err) {
    console.error('[recordManualPaymentAction Exception]:', err);
    return { success: false, error: 'Database exception occurred while recording payment.' };
  }
}

/**
 * Sets or updates the agreed contract total for a booking.
 */
export async function setAgreedTotalAction(rawInput: SetAgreedTotalInput): Promise<{
  success: boolean;
  error?: string;
}> {
  const adminData = await getCurrentActiveAdmin();
  if (!adminData || adminData.profile.role === 'staff') {
    return { success: false, error: 'Unauthorized: Operator privileges required' };
  }

  const parsed = setAgreedTotalSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Invalid input data' };
  }

  const input = parsed.data;
  const supabase = createAdminClient();

  try {
    // 1. Fetch booking
    const { data: booking, error: bErr } = await supabase
      .from('bookings')
      .select('id, booking_reference, client_full_name, client_email, service_title, event_date, agreed_total_centavos, status')
      .eq('id', input.bookingId)
      .single();

    if (bErr || !booking) {
      return { success: false, error: 'Selected booking not found.' };
    }

    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return {
        success: false,
        error: `Cannot set or update agreed total for an event that is already ${booking.status}.`,
      };
    }

    const newAgreedCentavos = pesosToCentavos(input.agreedTotalPesos);

    // 2. Query total paid to ensure new agreed total is not less than already paid
    const { data: payments } = await supabase
      .from('payments')
      .select('amount_centavos, refund_amount_centavos')
      .eq('booking_id', booking.id)
      .eq('status', 'paid');

    const totalPaidCentavos = (payments || []).reduce((acc, p) => {
      const net = (p.amount_centavos || 0) - (p.refund_amount_centavos || 0);
      return acc + (net > 0 ? net : 0);
    }, 0);

    if (totalPaidCentavos > 0 && newAgreedCentavos < totalPaidCentavos) {
      return {
        success: false,
        error: `Agreed total (${formatPesos(newAgreedCentavos)}) cannot be less than total amount already paid (${formatPesos(totalPaidCentavos)}).`,
      };
    }

    // 3. Update booking
    const { error: updateErr } = await supabase
      .from('bookings')
      .update({
        agreed_total_centavos: newAgreedCentavos,
        agreed_total_currency: input.currency || 'PHP',
        agreed_total_set_at: new Date().toISOString(),
        agreed_total_set_by: adminData.user.id,
        agreed_total_notes: input.notes?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', booking.id);

    if (updateErr) throw updateErr;

    const remainingCentavos = Math.max(0, newAgreedCentavos - totalPaidCentavos);

    // 4. Update payment_status on booking automatically
    const newPaymentStatus =
      !newAgreedCentavos || newAgreedCentavos <= 0
        ? 'undeclared'
        : totalPaidCentavos >= newAgreedCentavos
          ? 'paid'
          : totalPaidCentavos > 0
            ? 'partially_paid'
            : 'unpaid';

    await supabase
      .from('bookings')
      .update({ payment_status: newPaymentStatus })
      .eq('id', booking.id);

    // 5. Audit Log
    await logAudit({
      actorUserId: adminData.user.id,
      actorCode: adminData.profile.user_code,
      actorName: adminData.profile.full_name,
      actorEmail: adminData.profile.email,
      actorType: 'admin',
      category: 'Payment',
      action: 'Set Agreed Total',
      severity: 'Info',
      outcome: 'Success',
      summary: `${adminData.profile.full_name} (${adminData.profile.user_code}) set agreed total for ${booking.booking_reference} to ${formatPesos(newAgreedCentavos)}`,
      entityType: 'booking',
      entityId: booking.id,
      entityRef: booking.booking_reference,
      changes: {
        agreed_total_centavos: {
          old: booking.agreed_total_centavos,
          new: newAgreedCentavos,
        },
      },
    });

    // 6. Optional email to client
    if (input.sendEmailToClient) {
      const { subject, html } = buildBookingClientAgreedTotalEmail({
        clientFullName: booking.client_full_name,
        clientEmail: booking.client_email,
        bookingReference: booking.booking_reference,
        serviceTitle: booking.service_title,
        eventDate: booking.event_date,
        agreedTotalFormatted: formatPesos(newAgreedCentavos),
        totalPaidFormatted: formatPesos(totalPaidCentavos),
        remainingBalanceFormatted: formatPesos(remainingCentavos),
        notes: input.notes,
      });

      await dispatchClientEmail(booking.client_email, subject, html, booking.booking_reference);
    }

    revalidatePath('/admin/payments');
    revalidatePath('/admin/bookings');

    return { success: true };
  } catch (err) {
    console.error('[setAgreedTotalAction Exception]:', err);
    return { success: false, error: 'Database exception while setting agreed total.' };
  }
}

/**
 * Marks a payment as refunded (partial or full) with an explanatory reason.
 */
export async function refundPaymentAction(rawInput: RefundPaymentInput): Promise<{
  success: boolean;
  error?: string;
}> {
  const adminData = await getCurrentActiveAdmin();
  if (!adminData || adminData.profile.role === 'staff') {
    return { success: false, error: 'Unauthorized: Operator privileges required' };
  }

  const parsed = refundPaymentSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Invalid input data' };
  }

  const input = parsed.data;
  const supabase = createAdminClient();

  try {
    const { data: payment, error: pErr } = await supabase
      .from('payments')
      .select('id, booking_id, booking_reference, amount_centavos, is_refunded, payment_number')
      .eq('id', input.paymentId)
      .single();

    if (pErr || !payment) {
      return { success: false, error: 'Payment record not found.' };
    }

    const refundCentavos = pesosToCentavos(input.refundAmountPesos);
    if (refundCentavos > payment.amount_centavos) {
      return {
        success: false,
        error: `Refund amount cannot exceed payment amount (${formatPesos(payment.amount_centavos)})`,
      };
    }

    const { error: updateErr } = await supabase
      .from('payments')
      .update({
        is_refunded: true,
        refund_amount_centavos: refundCentavos,
        refund_reason: input.refundReason.trim(),
        refunded_at: new Date().toISOString(),
        refunded_by: adminData.user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id);

    if (updateErr) throw updateErr;

    // Record audit trail
    await logAudit({
      actorUserId: adminData.user.id,
      actorCode: adminData.profile.user_code,
      actorName: adminData.profile.full_name,
      actorEmail: adminData.profile.email,
      actorType: 'admin',
      category: 'Payment',
      action: 'Refund Payment',
      severity: 'Warning',
      outcome: 'Success',
      summary: `${adminData.profile.full_name} (${adminData.profile.user_code}) recorded refund of ${formatPesos(refundCentavos)} for payment ${payment.payment_number}. Reason: ${input.refundReason.trim()}`,
      entityType: 'payment',
      entityId: payment.id,
      entityRef: payment.payment_number,
      changes: {
        is_refunded: { old: false, new: true },
        refund_amount_centavos: { old: null, new: refundCentavos },
      },
      metadata: {
        booking_reference: payment.booking_reference,
        refund_reason: input.refundReason.trim(),
      },
    });

    revalidatePath('/admin/payments');
    revalidatePath('/admin/bookings');

    return { success: true };
  } catch (err) {
    console.error('[refundPaymentAction Exception]:', err);
    return { success: false, error: 'Failed to refund.' };
  }
}

/**
 * Resends payment acknowledgment email to client.
 */
export async function resendReceiptAction(rawInput: ResendReceiptInput): Promise<{
  success: boolean;
  error?: string;
}> {
  const adminData = await getCurrentActiveAdmin();
  if (!adminData || adminData.profile.role === 'staff') {
    return { success: false, error: 'Unauthorized: Operator privileges required' };
  }

  const parsed = resendReceiptSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Invalid input data' };
  }

  const input = parsed.data;
  const supabase = createAdminClient();

  try {
    const { data: payment, error: pErr } = await supabase
      .from('payments')
      .select(
        `
        *,
        booking:bookings!booking_id (
          service_title,
          client_full_name,
          client_email,
          event_date,
          agreed_total_centavos
        )
      `
      )
      .eq('id', input.paymentId)
      .single();

    if (pErr || !payment || !payment.booking) {
      return { success: false, error: 'Payment or associated booking not found.' };
    }

    const targetEmail = input.recipientEmail || payment.booking.client_email;

    // Calculate remaining balance
    const { data: allPayments } = await supabase
      .from('payments')
      .select('amount_centavos, refund_amount_centavos')
      .eq('booking_id', payment.booking_id)
      .eq('status', 'paid');

    const totalPaid = (allPayments || []).reduce((acc, p) => {
      const net = (p.amount_centavos || 0) - (p.refund_amount_centavos || 0);
      return acc + (net > 0 ? net : 0);
    }, 0);

    const agreed = payment.booking.agreed_total_centavos;
    const remaining = agreed !== null && agreed !== undefined ? Math.max(0, agreed - totalPaid) : null;
    const isFullyPaid = agreed !== null && agreed !== undefined && remaining === 0;

    const receiptNum = payment.receipt_number || payment.payment_number;

    const { subject, html } = buildPaymentClientReceiptEmail({
      clientFullName: payment.booking.client_full_name,
      clientEmail: targetEmail,
      bookingReference: payment.booking_reference,
      serviceTitle: payment.booking.service_title,
      eventDate: payment.booking.event_date,
      paymentNumber: payment.payment_number,
      receiptNumber: receiptNum,
      amountFormatted: formatPesos(payment.amount_centavos),
      paymentMethod: payment.payment_method,
      paidAtFormatted: new Date(payment.paid_at).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      agreedTotalFormatted: formatPesos(agreed),
      remainingBalanceFormatted: formatPesos(remaining),
      isFullyPaid,
      notes: payment.notes,
    });

    const sendRes = await dispatchClientEmail(targetEmail, subject, html, receiptNum);
    if (!sendRes.success) {
      return { success: false, error: sendRes.error || 'Failed to dispatch email' };
    }

    // Update receipt_sent_at
    await supabase
      .from('payments')
      .update({
        receipt_sent_at: new Date().toISOString(),
        receipt_sent_to: targetEmail,
      })
      .eq('id', payment.id);

    // Audit Log
    await logAudit({
      category: 'Payment',
      action: 'Resend Receipt',
      severity: 'Info',
      outcome: 'Success',
      summary: `${adminData.profile.full_name} resent receipt ${receiptNum} to ${targetEmail}`,
      entityType: 'payment',
      entityId: payment.id,
      entityRef: payment.payment_number,
    });

    return { success: true };
  } catch (err) {
    console.error('[resendReceiptAction Exception]:', err);
    return { success: false, error: 'Failed to resend payment receipt.' };
  }
}

/**
 * Dispatches a payment invoice email to the client for their outstanding balance or installment.
 */
export async function sendPaymentInvoiceAction(rawInput: SendPaymentInvoiceInput): Promise<{
  success: boolean;
  invoiceNumber?: string;
  error?: string;
}> {
  const adminData = await getCurrentActiveAdmin();
  if (!adminData || adminData.profile.role === 'staff') {
    return { success: false, error: 'Unauthorized: Operator privileges required' };
  }

  const parsed = sendPaymentInvoiceSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Invalid input data' };
  }

  const input = parsed.data;
  const supabase = createAdminClient();

  try {
    // 1. Fetch booking
    const { data: booking, error: bErr } = await supabase
      .from('bookings')
      .select('id, booking_reference, client_full_name, client_email, service_title, event_date, agreed_total_centavos, status')
      .eq('id', input.bookingId)
      .single();

    if (bErr || !booking) {
      return { success: false, error: 'Booking record not found.' };
    }

    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return { success: false, error: `Cannot send invoice for an event that is ${booking.status}.` };
    }

    // 2. Query total paid to compute current balance
    const { data: allPayments } = await supabase
      .from('payments')
      .select('amount_centavos, refund_amount_centavos')
      .eq('booking_id', booking.id)
      .eq('status', 'paid');

    const totalPaidCentavos = (allPayments || []).reduce((acc, p) => {
      const net = (p.amount_centavos || 0) - (p.refund_amount_centavos || 0);
      return acc + (net > 0 ? net : 0);
    }, 0);

    const agreedCentavos = booking.agreed_total_centavos || 0;
    const balanceCentavos = Math.max(0, agreedCentavos - totalPaidCentavos);
    const requestedInvoiceCentavos = pesosToCentavos(input.invoiceAmountPesos);

    if (agreedCentavos <= 0) {
      return { success: false, error: 'Cannot send invoice without a declared Agreed Contract Total.' };
    }

    if (balanceCentavos <= 0) {
      return { success: false, error: 'This booking has already been fully paid. Outstanding balance is ₱0.00.' };
    }

    if (requestedInvoiceCentavos > balanceCentavos) {
      return {
        success: false,
        error: `Requested invoice amount (${formatPesos(requestedInvoiceCentavos)}) cannot exceed the outstanding balance of ${formatPesos(balanceCentavos)}.`,
      };
    }

    // 3. Generate invoice reference: CSM-INV-YYYY-XXXXX
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const invoiceNumber = `CSM-INV-${year}-${randomSuffix}`;

    const targetEmail = input.recipientEmail.trim().toLowerCase();

    // 4. Build and dispatch email
    const { subject, html } = buildPaymentClientInvoiceEmail({
      clientFullName: booking.client_full_name,
      clientEmail: targetEmail,
      bookingReference: booking.booking_reference,
      serviceTitle: booking.service_title,
      eventDate: booking.event_date,
      invoiceNumber,
      invoiceAmountFormatted: formatPesos(requestedInvoiceCentavos),
      totalAgreedFormatted: formatPesos(agreedCentavos),
      remainingBalanceFormatted: formatPesos(balanceCentavos),
      dueDateFormatted: input.dueDate
        ? new Date(input.dueDate).toLocaleDateString('en-PH', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
        : undefined,
      customNotes: input.customNotes?.trim() || undefined,
    });

    const sendRes = await dispatchClientEmail(targetEmail, subject, html, invoiceNumber);
    if (!sendRes.success) {
      return { success: false, error: sendRes.error || 'Failed to dispatch invoice email' };
    }

    // 5. Audit Log
    await logAudit({
      category: 'Payment',
      action: 'Send Invoice',
      severity: 'Info',
      outcome: 'Success',
      summary: `${adminData.profile.full_name} sent invoice ${invoiceNumber} (${formatPesos(requestedInvoiceCentavos)}) for ${booking.booking_reference} to ${targetEmail}`,
      entityType: 'booking',
      entityId: booking.id,
      entityRef: booking.booking_reference,
      metadata: {
        invoiceNumber,
        requestedInvoiceCentavos,
        balanceCentavos,
        targetEmail,
      },
    });

    return { success: true, invoiceNumber };
  } catch (err) {
    console.error('[sendPaymentInvoiceAction Exception]:', err);
    return { success: false, error: 'Failed to dispatch payment invoice.' };
  }
}

/**
 * Generates a short-lived (1-hour) signed URL for private proof attachments.
 */
export async function getProofSignedUrlAction(storagePath: string): Promise<{
  success: boolean;
  signedUrl?: string;
  error?: string;
}> {
  const adminData = await getCurrentActiveAdmin();
  if (!adminData || adminData.profile.role === 'staff') {
    return { success: false, error: 'Unauthorized: Operator privileges required' };
  }

  if (!storagePath || storagePath.trim().length === 0) {
    return { success: false, error: 'Storage path is required' };
  }

  const supabase = createAdminClient();

  try {
    const { data, error } = await supabase.storage
      .from('payment-proofs')
      .createSignedUrl(storagePath, 3600); // 1-hour TTL

    if (error || !data?.signedUrl) {
      throw error || new Error('Failed to generate signed URL');
    }

    return { success: true, signedUrl: data.signedUrl };
  } catch (err) {
    console.error('[getProofSignedUrlAction Error]:', err);
    return { success: false, error: 'Could not access private attachment.' };
  }
}

/**
 * Exports payments matching active filters to CSV format.
 */
export async function exportPaymentsCsvAction(filters: PaymentListFilters): Promise<{
  success: boolean;
  csvContent?: string;
  filename?: string;
  error?: string;
}> {
  const adminData = await getCurrentActiveAdmin();
  if (!adminData || adminData.profile.role === 'staff') {
    return { success: false, error: 'Unauthorized: Operator privileges required' };
  }

  const supabase = createAdminClient();

  try {
    // 1. Fetch active bookings (non-cancelled, non-archived)
    const bookingsQuery = supabase
      .from('bookings')
      .select('id, booking_reference, client_full_name, client_email, service_title, event_date, agreed_total_centavos, agreed_total_currency, agreed_total_set_at, payment_status, status, created_at, is_archived')
      .eq('is_archived', false)
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false });

    // 2. Fetch non-cancelled payments
    const paymentsQuery = supabase
      .from('payments')
      .select('*')
      .neq('status', 'cancelled')
      .order('paid_at', { ascending: false });

    const [{ data: rawBookings, error: bErr }, { data: rawPayments, error: pErr }] = await Promise.all([
      bookingsQuery,
      paymentsQuery,
    ]);

    if (bErr) throw bErr;
    if (pErr) throw pErr;

    const bookings = rawBookings || [];
    const payments = rawPayments || [];

    const paymentsByBooking = new Map<string, typeof payments>();
    for (const p of payments) {
      if (!paymentsByBooking.has(p.booking_id)) {
        paymentsByBooking.set(p.booking_id, []);
      }
      paymentsByBooking.get(p.booking_id)!.push(p);
    }

    const searchLower = filters.search?.trim().toLowerCase();
    const csvExportRows: string[] = [];

    const escapeCsv = (val: unknown): string => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    for (const b of bookings) {
      const bPayments = paymentsByBooking.get(b.id) || [];
      const agreed = b.agreed_total_centavos;

      const totalPaidCentavos = bPayments.reduce((acc, p) => {
        if (p.status !== 'paid') return acc;
        const net = (p.amount_centavos || 0) - (p.refund_amount_centavos || 0);
        return acc + (net > 0 ? net : 0);
      }, 0);

      const hasRefundedPayment = bPayments.some((p) => p.is_refunded);
      const remainingBalanceCentavos = agreed !== null && agreed !== undefined && agreed > 0 ? Math.max(0, agreed - totalPaidCentavos) : null;

      let derivedStatus: 'paid' | 'partially_paid' | 'refunded' | 'unpaid' | 'undeclared';
      if (b.payment_status === 'refunded' || (hasRefundedPayment && totalPaidCentavos === 0)) {
        derivedStatus = 'refunded';
      } else if (agreed === null || agreed === undefined || agreed <= 0) {
        derivedStatus = 'undeclared';
      } else if (totalPaidCentavos === 0) {
        derivedStatus = 'unpaid';
      } else if (totalPaidCentavos >= agreed) {
        derivedStatus = 'paid';
      } else {
        derivedStatus = 'partially_paid';
      }

      if (filters.status && filters.status !== 'all') {
        if (derivedStatus !== filters.status) {
          continue;
        }
      }

      let filteredPayments = bPayments;
      if (filters.method && filters.method !== 'all') {
        filteredPayments = bPayments.filter((p) => p.payment_method === filters.method);
        if (filteredPayments.length === 0) {
          continue;
        }
      }

      if (filters.startDate || filters.endDate) {
        const startTs = filters.startDate ? new Date(`${filters.startDate}T00:00:00.000Z`).getTime() : -Infinity;
        const endTs = filters.endDate ? new Date(`${filters.endDate}T23:59:59.999Z`).getTime() : Infinity;

        if (bPayments.length > 0) {
          filteredPayments = filteredPayments.filter((p) => {
            const pTs = new Date(p.paid_at).getTime();
            return pTs >= startTs && pTs <= endTs;
          });
          if (filteredPayments.length === 0) {
            const bTs = new Date(b.created_at).getTime();
            if (bTs < startTs || bTs > endTs) {
              continue;
            }
          }
        } else {
          const bTs = new Date(b.agreed_total_set_at || b.created_at).getTime();
          if (bTs < startTs || bTs > endTs) {
            continue;
          }
        }
      }

      const cleanRef = b.booking_reference.replace(/^CAS-?/i, '');
      const statusPrefix = derivedStatus.toUpperCase();
      const syntheticNumber = `${statusPrefix}-${cleanRef}`;

      if (searchLower) {
        const matchesBooking =
          b.booking_reference.toLowerCase().includes(searchLower) ||
          cleanRef.toLowerCase().includes(searchLower) ||
          syntheticNumber.toLowerCase().includes(searchLower) ||
          b.client_full_name.toLowerCase().includes(searchLower) ||
          b.client_email.toLowerCase().includes(searchLower) ||
          b.service_title.toLowerCase().includes(searchLower);

        const matchesAnyPayment = bPayments.some(
          (p) =>
            p.payment_number.toLowerCase().includes(searchLower) ||
            (p.receipt_number && p.receipt_number.toLowerCase().includes(searchLower))
        );

        if (!matchesBooking && !matchesAnyPayment) {
          continue;
        }
      }

      if (filteredPayments.length > 0) {
        for (const p of filteredPayments) {
          csvExportRows.push(
            [
              escapeCsv(p.payment_number),
              escapeCsv(p.receipt_number || 'N/A'),
              escapeCsv(b.booking_reference),
              escapeCsv(b.client_full_name),
              escapeCsv(b.client_email),
              escapeCsv(b.service_title),
              escapeCsv(b.event_date),
              escapeCsv(p.payment_method),
              escapeCsv((p.amount_centavos / 100).toFixed(2)),
              escapeCsv(p.status),
              escapeCsv(new Date(p.paid_at).toISOString()),
              escapeCsv(p.is_refunded ? 'Yes' : 'No'),
              escapeCsv(p.refund_amount_centavos ? (p.refund_amount_centavos / 100).toFixed(2) : '0.00'),
              escapeCsv(p.refund_reason || ''),
              escapeCsv(p.notes || ''),
            ].join(',')
          );
        }
      } else {
        csvExportRows.push(
          [
            escapeCsv(syntheticNumber),
            escapeCsv('N/A'),
            escapeCsv(b.booking_reference),
            escapeCsv(b.client_full_name),
            escapeCsv(b.client_email),
            escapeCsv(b.service_title),
            escapeCsv(b.event_date),
            escapeCsv('pending'),
            escapeCsv(remainingBalanceCentavos !== null ? (remainingBalanceCentavos / 100).toFixed(2) : '0.00'),
            escapeCsv(derivedStatus),
            escapeCsv(new Date(b.agreed_total_set_at || b.created_at).toISOString()),
            escapeCsv(derivedStatus === 'refunded' ? 'Yes' : 'No'),
            escapeCsv('0.00'),
            escapeCsv(''),
            escapeCsv(agreed === null ? 'Agreed total not declared yet' : `${derivedStatus.replace('_', ' ')} booking`),
          ].join(',')
        );
      }
    }

    // Build RFC 4180 CSV
    const headers = [
      'Payment Number',
      'Receipt Number',
      'Booking Reference',
      'Client Name',
      'Client Email',
      'Service',
      'Event Date',
      'Payment Method',
      'Amount (PHP)',
      'Status',
      'Date Paid',
      'Refunded',
      'Refund Amount (PHP)',
      'Refund Reason',
      'Notes',
    ];

    const csvContent = [headers.join(','), ...csvExportRows].join('\r\n');
    const today = new Date().toISOString().split('T')[0];
    const filename = `casamento_payments_${today}.csv`;

    return {
      success: true,
      csvContent,
      filename,
    };
  } catch (err) {
    console.error('[exportPaymentsCsvAction Exception]:', err);
    return { success: false, error: 'Failed to export payment CSV records.' };
  }
}

/**
 * Updates an existing payment record (amount, method, date, channel details, notes, proof).
 * Restricted strictly to admins and superadmins.
 */
export async function updatePaymentAction(rawInput: UpdatePaymentInput): Promise<{
  success: boolean;
  error?: string;
}> {
  const adminData = await getCurrentActiveAdmin();
  if (!adminData || (adminData.profile.role !== 'admin' && adminData.profile.role !== 'super_admin')) {
    return { success: false, error: 'Unauthorized: Only Admins and Super Admins can update payments.' };
  }

  const parsed = updatePaymentSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Invalid input data' };
  }

  const input = parsed.data;
  const supabase = createAdminClient();

  try {
    // 1. Fetch target payment and its booking
    const { data: existingPayment, error: fetchErr } = await supabase
      .from('payments')
      .select('*, booking:bookings!booking_id(id, booking_reference, client_full_name, agreed_total_centavos, status)')
      .eq('id', input.paymentId)
      .single();

    if (fetchErr || !existingPayment) {
      return { success: false, error: 'Payment record not found.' };
    }

    if (existingPayment.status === 'cancelled') {
      return { success: false, error: 'Cannot update an archived/cancelled payment.' };
    }

    const booking = (Array.isArray(existingPayment.booking) ? existingPayment.booking[0] : existingPayment.booking) as {
      id: string;
      booking_reference: string;
      client_full_name: string;
      agreed_total_centavos: number | null;
      status: string;
    } | null;

    if (!booking) {
      return { success: false, error: 'Associated booking reservation not found.' };
    }

    const newAmountCentavos = pesosToCentavos(input.amountPesos);

    // 2. Validate arithmetic against agreed total
    if (booking.agreed_total_centavos && booking.agreed_total_centavos > 0) {
      // Query other paid payments for this booking
      const { data: otherPayments } = await supabase
        .from('payments')
        .select('id, amount_centavos, refund_amount_centavos')
        .eq('booking_id', booking.id)
        .eq('status', 'paid')
        .neq('id', existingPayment.id);

      const totalPaidOtherCentavos = (otherPayments || []).reduce((acc, p) => {
        const net = (p.amount_centavos || 0) - (p.refund_amount_centavos || 0);
        return acc + (net > 0 ? net : 0);
      }, 0);

      const netNewAmountCentavos = existingPayment.is_refunded
        ? Math.max(0, newAmountCentavos - (existingPayment.refund_amount_centavos || 0))
        : newAmountCentavos;

      if (totalPaidOtherCentavos + netNewAmountCentavos > booking.agreed_total_centavos) {
        const maxAllowed = Math.max(0, booking.agreed_total_centavos - totalPaidOtherCentavos);
        return {
          success: false,
          error: `Updated amount (${formatPesos(newAmountCentavos)}) exceeds the remaining allowable contract total. Maximum allowable for this entry is ${formatPesos(maxAllowed)}.`,
        };
      }
    }

    // 3. Prepare updates
    const updates: Record<string, unknown> = {
      amount_centavos: newAmountCentavos,
      payment_method: input.paymentMethod,
      channel_details: input.channelDetails || {},
      paid_at: input.paidAt ? new Date(input.paidAt).toISOString() : existingPayment.paid_at,
      notes: input.notes?.trim() || null,
      updated_at: new Date().toISOString(),
    };

    if (input.proofAttachment !== undefined) {
      if (input.proofAttachment) {
        updates.proof_attachment_path = input.proofAttachment.path;
        updates.proof_attachment_name = input.proofAttachment.name;
        updates.proof_attachment_size_bytes = input.proofAttachment.sizeBytes || null;
        updates.proof_attachment_mime_type = input.proofAttachment.mimeType || null;
      } else {
        updates.proof_attachment_path = null;
        updates.proof_attachment_name = null;
        updates.proof_attachment_size_bytes = null;
        updates.proof_attachment_mime_type = null;
      }
    }

    const { error: updateErr } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', existingPayment.id);

    if (updateErr) throw updateErr;

    // 4. Audit Log
    await logAudit({
      actorUserId: adminData.user.id,
      actorCode: adminData.profile.user_code,
      actorName: adminData.profile.full_name,
      actorEmail: adminData.profile.email,
      actorType: 'admin',
      category: 'Payment',
      action: 'Payment Updated',
      severity: 'Info',
      outcome: 'Success',
      summary: `${adminData.profile.full_name} (${adminData.profile.user_code}) updated payment ${existingPayment.payment_number} (${formatPesos(existingPayment.amount_centavos)} -> ${formatPesos(newAmountCentavos)}) for booking ${existingPayment.booking_reference}.`,
      entityType: 'payment',
      entityId: existingPayment.id,
      entityRef: existingPayment.payment_number,
      changes: {
        amount_centavos: { old: existingPayment.amount_centavos, new: newAmountCentavos },
        payment_method: { old: existingPayment.payment_method, new: input.paymentMethod },
        paid_at: { old: existingPayment.paid_at, new: updates.paid_at },
        notes: { old: existingPayment.notes, new: updates.notes },
      },
      metadata: {
        booking_reference: existingPayment.booking_reference,
        payment_number: existingPayment.payment_number,
        client_name: booking.client_full_name,
        channel_details: input.channelDetails,
      },
    });

    revalidatePath('/admin/payments');
    revalidatePath('/admin/bookings');

    return { success: true };
  } catch (err) {
    console.error('[updatePaymentAction Exception]:', err);
    return { success: false, error: 'Database exception occurred while updating payment.' };
  }
}

/**
 * Archives/cancels a payment record.
 * Restricted strictly to admins and superadmins.
 */
export async function archivePaymentAction(rawInput: ArchivePaymentInput): Promise<{
  success: boolean;
  error?: string;
}> {
  const adminData = await getCurrentActiveAdmin();
  if (!adminData || (adminData.profile.role !== 'admin' && adminData.profile.role !== 'super_admin')) {
    return { success: false, error: 'Unauthorized: Only Admins and Super Admins can archive payments.' };
  }

  const parsed = archivePaymentSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Invalid input data' };
  }

  const input = parsed.data;
  const supabase = createAdminClient();

  try {
    const { data: payment, error: pErr } = await supabase
      .from('payments')
      .select('id, booking_id, booking_reference, payment_number, amount_centavos, status, notes')
      .eq('id', input.paymentId)
      .single();

    if (pErr || !payment) {
      return { success: false, error: 'Payment record not found.' };
    }

    if (payment.status === 'cancelled') {
      return { success: false, error: 'Payment is already archived/cancelled.' };
    }

    const { error: updateErr } = await supabase
      .from('payments')
      .update({
        status: 'cancelled',
        notes: payment.notes
          ? `${payment.notes} [Archived by ${adminData.profile.full_name}: ${input.reason.trim()}]`
          : `[Archived by ${adminData.profile.full_name}: ${input.reason.trim()}]`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id);

    if (updateErr) throw updateErr;

    // Audit Log
    await logAudit({
      actorUserId: adminData.user.id,
      actorCode: adminData.profile.user_code,
      actorName: adminData.profile.full_name,
      actorEmail: adminData.profile.email,
      actorType: 'admin',
      category: 'Payment',
      action: 'Payment Archived',
      severity: 'Warning',
      outcome: 'Success',
      summary: `${adminData.profile.full_name} (${adminData.profile.user_code}) archived payment ${payment.payment_number} (${formatPesos(payment.amount_centavos)}) for booking ${payment.booking_reference}. Reason: ${input.reason.trim()}`,
      entityType: 'payment',
      entityId: payment.id,
      entityRef: payment.payment_number,
      changes: {
        status: { old: payment.status, new: 'cancelled' },
      },
      metadata: {
        archive_reason: input.reason.trim(),
        previous_amount_centavos: payment.amount_centavos,
        booking_reference: payment.booking_reference,
      },
    });

    revalidatePath('/admin/payments');
    revalidatePath('/admin/bookings');

    return { success: true };
  } catch (err) {
    console.error('[archivePaymentAction Exception]:', err);
    return { success: false, error: 'Database exception occurred while archiving payment.' };
  }
}

/**
 * Archives a booking reservation directly from the Payments ledger.
 * Soft-deletes from active financial tracking by setting is_archived = true.
 * Restricted strictly to admins and superadmins.
 */
export async function archiveBookingAction(rawInput: ArchiveBookingInput): Promise<{
  success: boolean;
  error?: string;
}> {
  const adminData = await getCurrentActiveAdmin();
  if (!adminData || (adminData.profile.role !== 'admin' && adminData.profile.role !== 'super_admin')) {
    return { success: false, error: 'Unauthorized: Only Admins and Super Admins can archive bookings.' };
  }

  const parsed = archiveBookingSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Invalid input data' };
  }

  const input = parsed.data;
  const supabase = createAdminClient();

  try {
    const { data: booking, error: bErr } = await supabase
      .from('bookings')
      .select('id, booking_reference, client_full_name, status, is_archived, agreed_total_centavos')
      .eq('id', input.bookingId)
      .single();

    if (bErr || !booking) {
      return { success: false, error: 'Booking reservation not found.' };
    }

    if (booking.is_archived) {
      return { success: false, error: 'This booking is already archived.' };
    }

    const now = new Date().toISOString();
    const { error: updateErr } = await supabase
      .from('bookings')
      .update({
        is_archived: true,
        cancellation_reason: input.reason.trim(),
        cancelled_at: now,
        cancelled_by: adminData.user.id,
        updated_at: now,
      })
      .eq('id', booking.id);

    if (updateErr) throw updateErr;

    // Audit Log
    await logAudit({
      actorUserId: adminData.user.id,
      actorCode: adminData.profile.user_code,
      actorName: adminData.profile.full_name,
      actorEmail: adminData.profile.email,
      actorType: 'admin',
      category: 'Booking',
      action: 'Booking Archived',
      severity: 'Warning',
      outcome: 'Success',
      summary: `${adminData.profile.full_name} (${adminData.profile.user_code}) archived booking ${booking.booking_reference} (${booking.client_full_name}) from Payments. Reason: ${input.reason.trim()}`,
      entityType: 'booking',
      entityId: booking.id,
      entityRef: booking.booking_reference,
      changes: {
        is_archived: { old: false, new: true },
      },
      metadata: {
        archive_reason: input.reason.trim(),
        client_name: booking.client_full_name,
        booking_status: booking.status,
        agreed_total_centavos: booking.agreed_total_centavos,
      },
    });

    revalidatePath('/admin/payments');
    revalidatePath('/admin/bookings');

    return { success: true };
  } catch (err) {
    console.error('[archiveBookingAction Exception]:', err);
    return { success: false, error: 'Database exception occurred while archiving booking.' };
  }
}

/**
 * Fetches the current payment balance snapshot for a specific booking.
 */
export async function getBookingBalanceAction(bookingId: string): Promise<{
  success: boolean;
  agreedTotalCentavos?: number | null;
  totalPaidCentavos?: number;
  remainingBalanceCentavos?: number | null;
  paymentStatus?: string;
  error?: string;
}> {
  const adminData = await getCurrentActiveAdmin();
  if (!adminData) {
    return { success: false, error: 'Unauthorized: Active admin session required.' };
  }

  const supabase = createAdminClient();

  try {
    const { data: booking, error: bookingErr } = await supabase
      .from('bookings')
      .select('id, agreed_total_centavos, payment_status')
      .eq('id', bookingId)
      .single();

    if (bookingErr || !booking) {
      return { success: false, error: 'Booking not found.' };
    }

    const { data: payments, error: paymentsErr } = await supabase
      .from('payments')
      .select('amount_centavos, refund_amount_centavos')
      .eq('booking_id', bookingId)
      .eq('status', 'paid');

    if (paymentsErr) throw paymentsErr;

    const totalPaidCentavos = (payments || []).reduce((acc, p) => {
      const net = (p.amount_centavos || 0) - (p.refund_amount_centavos || 0);
      return acc + (net > 0 ? net : 0);
    }, 0);

    const agreed = booking.agreed_total_centavos;
    const remainingBalanceCentavos =
      agreed !== null && agreed !== undefined
        ? Math.max(0, agreed - totalPaidCentavos)
        : null;

    return {
      success: true,
      agreedTotalCentavos: agreed,
      totalPaidCentavos,
      remainingBalanceCentavos,
      paymentStatus: booking.payment_status,
    };
  } catch (err) {
    console.error('[getBookingBalanceAction Exception]:', err);
    return { success: false, error: 'Failed to retrieve booking financial balance.' };
  }
}

