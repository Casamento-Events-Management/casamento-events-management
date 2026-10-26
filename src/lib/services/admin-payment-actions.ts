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
  type SetAgreedTotalInput,
  type ManualPaymentInput,
  type RefundPaymentInput,
  type ResendReceiptInput,
} from '@/lib/schemas/payment';
import {
  buildPaymentClientReceiptEmail,
  buildBookingClientAgreedTotalEmail,
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
    let query = supabase
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
      `,
        { count: 'exact' }
      )
      .order('paid_at', { ascending: false });

    // Status filter
    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'refunded') {
        query = query.eq('is_refunded', true);
      } else {
        query = query.eq('status', filters.status);
      }
    }

    // Payment method filter
    if (filters.method && filters.method !== 'all') {
      query = query.eq('payment_method', filters.method);
    }

    // Date range filters
    if (filters.startDate) {
      query = query.gte('paid_at', `${filters.startDate}T00:00:00.000Z`);
    }
    if (filters.endDate) {
      query = query.lte('paid_at', `${filters.endDate}T23:59:59.999Z`);
    }

    // Search query
    if (filters.search && filters.search.trim().length > 0) {
      const q = filters.search.trim();
      query = query.or(
        `payment_number.ilike.%${q}%,receipt_number.ilike.%${q}%,booking_reference.ilike.%${q}%`
      );
    }

    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) throw error;

    // Fetch balances for the returned payments' bookings to provide context
    const bookingIds = Array.from(new Set((data || []).map((p) => p.booking_id)));
    const balanceMap = new Map<string, number | null>();

    if (bookingIds.length > 0) {
      const { data: allBookingsPayments } = await supabase
        .from('payments')
        .select('booking_id, amount_centavos, refund_amount_centavos')
        .in('booking_id', bookingIds)
        .eq('status', 'paid');

      const paidMap = new Map<string, number>();
      for (const p of allBookingsPayments || []) {
        const cur = paidMap.get(p.booking_id) || 0;
        const net = (p.amount_centavos || 0) - (p.refund_amount_centavos || 0);
        paidMap.set(p.booking_id, cur + (net > 0 ? net : 0));
      }

      for (const row of data || []) {
        const agreed = row.booking?.agreed_total_centavos;
        if (agreed !== null && agreed !== undefined) {
          const totalPaid = paidMap.get(row.booking_id) || 0;
          balanceMap.set(row.booking_id, Math.max(0, agreed - totalPaid));
        } else {
          balanceMap.set(row.booking_id, null);
        }
      }
    }

    const extendedPayments: ExtendedPaymentRecord[] = (data || []).map((row) => ({
      ...row,
      booking: row.booking
        ? {
            ...row.booking,
            remaining_balance_centavos: balanceMap.get(row.booking_id) ?? null,
          }
        : undefined,
    }));

    return {
      success: true,
      payments: extendedPayments,
      totalCount: count ?? 0,
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
      .select('id, booking_reference, client_full_name, client_email, service_title, event_date, agreed_total_centavos, payment_status')
      .eq('is_archived', false)
      .neq('status', 'cancelled')
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
      .select('id, booking_reference, client_full_name, client_email, service_title, event_date, agreed_total_centavos')
      .eq('id', input.bookingId)
      .single();

    if (bErr || !booking) {
      return { success: false, error: 'Selected booking not found.' };
    }

    // 2. Generate identifiers
    const paymentNumber = await generatePaymentNumber();
    const receiptNumber = await generateReceiptNumber();
    const amountCentavos = pesosToCentavos(input.amountPesos);

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
      .select('id, booking_reference, client_full_name, client_email, service_title, event_date, agreed_total_centavos')
      .eq('id', input.bookingId)
      .single();

    if (bErr || !booking) {
      return { success: false, error: 'Selected booking not found.' };
    }

    const newAgreedCentavos = pesosToCentavos(input.agreedTotalPesos);

    // 2. Update booking
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

    // 3. Query total paid to compute balance
    const { data: payments } = await supabase
      .from('payments')
      .select('amount_centavos, refund_amount_centavos')
      .eq('booking_id', booking.id)
      .eq('status', 'paid');

    const totalPaidCentavos = (payments || []).reduce((acc, p) => {
      const net = (p.amount_centavos || 0) - (p.refund_amount_centavos || 0);
      return acc + (net > 0 ? net : 0);
    }, 0);

    const remainingCentavos = Math.max(0, newAgreedCentavos - totalPaidCentavos);

    // 4. Update payment_status on booking automatically
    const newPaymentStatus =
      totalPaidCentavos >= newAgreedCentavos
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
      category: 'Payment',
      action: 'Set Agreed Total',
      severity: 'Info',
      outcome: 'Success',
      summary: `${adminData.profile.full_name} set agreed total for ${booking.booking_reference} to ${formatPesos(newAgreedCentavos)}`,
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

    revalidatePath('/admin/payments');
    revalidatePath('/admin/bookings');

    return { success: true };
  } catch (err) {
    console.error('[refundPaymentAction Exception]:', err);
    return { success: false, error: 'Failed to record refund.' };
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
    let query = supabase
      .from('payments')
      .select(
        `
        payment_number,
        receipt_number,
        booking_reference,
        payment_method,
        amount_centavos,
        currency,
        status,
        paid_at,
        is_refunded,
        refund_amount_centavos,
        refund_reason,
        notes,
        booking:bookings!booking_id (
          service_title,
          client_full_name,
          client_email,
          event_date
        )
      `
      )
      .order('paid_at', { ascending: false })
      .limit(2000);

    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'refunded') {
        query = query.eq('is_refunded', true);
      } else {
        query = query.eq('status', filters.status);
      }
    }

    if (filters.method && filters.method !== 'all') {
      query = query.eq('payment_method', filters.method);
    }

    if (filters.startDate) {
      query = query.gte('paid_at', `${filters.startDate}T00:00:00.000Z`);
    }
    if (filters.endDate) {
      query = query.lte('paid_at', `${filters.endDate}T23:59:59.999Z`);
    }

    const { data, error } = await query;
    if (error) throw error;

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

    const escapeCsv = (val: unknown): string => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = (data || []).map((p) => {
      const b = (Array.isArray(p.booking) ? p.booking[0] : p.booking) as {
        service_title?: string;
        client_full_name?: string;
        client_email?: string;
        event_date?: string;
      } | null;

      return [
        escapeCsv(p.payment_number),
        escapeCsv(p.receipt_number || 'N/A'),
        escapeCsv(p.booking_reference),
        escapeCsv(b?.client_full_name || 'N/A'),
        escapeCsv(b?.client_email || 'N/A'),
        escapeCsv(b?.service_title || 'N/A'),
        escapeCsv(b?.event_date || 'N/A'),
        escapeCsv(p.payment_method),
        escapeCsv((p.amount_centavos / 100).toFixed(2)),
        escapeCsv(p.status),
        escapeCsv(new Date(p.paid_at).toISOString()),
        escapeCsv(p.is_refunded ? 'Yes' : 'No'),
        escapeCsv(p.refund_amount_centavos ? (p.refund_amount_centavos / 100).toFixed(2) : '0.00'),
        escapeCsv(p.refund_reason || ''),
        escapeCsv(p.notes || ''),
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');
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
