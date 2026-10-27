'use client';

// =============================================================================
// components/admin/payments/payments-table.tsx — Collapsible Accordion Ledger
// =============================================================================

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Paperclip,
  RotateCcw,
  Send,
  ExternalLink,
  ChevronLeft,
  FileText,
  Eye,
  Pencil,
  Edit3,
  Archive,
} from 'lucide-react';
import { formatPesos } from '@/lib/utils/currencyUtils';
import { formatPaymentDateTime } from '@/lib/utils/dateUtils';
import type { ExtendedPaymentRecord } from '@/lib/services/admin-payment-actions';

export interface GroupedBookingPayment {
  bookingId: string;
  bookingReference: string;
  clientFullName: string;
  clientEmail: string;
  serviceTitle: string;
  eventDate: string;
  agreedTotalCentavos: number | null;
  remainingBalanceCentavos: number | null;
  declaredDate: string | null;
  latestPaymentNumber: string;
  latestPayment: ExtendedPaymentRecord | null;
  payments: ExtendedPaymentRecord[];
}

export interface TimelineEntry {
  id: string;
  paymentNumber: string;
  method: string;
  date: string;
  sortTime: number;
  amountCentavos: number;
  isRefund: boolean;
  snapshotCentavos: number | null;
  status: 'paid' | 'partially_refunded' | 'refunded' | 'pending' | 'failed' | 'cancelled';
  proofAttachmentPath?: string | null;
  rawPayment: ExtendedPaymentRecord;
  remainingRefundableCentavos: number;
}

interface PaymentsTableProps {
  payments: ExtendedPaymentRecord[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onInspectPayment: (payment: ExtendedPaymentRecord) => void;
  onViewProof: (payment: ExtendedPaymentRecord) => void;
  onRefundPayment: (payment: ExtendedPaymentRecord) => void;
  onUpdatePayment: (payment: ExtendedPaymentRecord) => void;
  onArchivePayment: (payment: ExtendedPaymentRecord) => void;
  onArchiveBooking: (booking: GroupedBookingPayment) => void;
  onSetAgreedTotal: (bookingId: string) => void;
  onSendInvoice: (booking: {
    bookingId: string;
    bookingReference: string;
    clientFullName: string;
    clientEmail: string;
    serviceTitle: string;
    agreedTotalCentavos: number | null;
    remainingBalanceCentavos: number | null;
  }) => void;
  onViewBookingDetails: (bookingReference: string) => void;
  onRecordPaymentForBooking: (bookingId: string) => void;
  isLoading?: boolean;
}

export function PaymentsTable({
  payments,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onInspectPayment,
  onViewProof,
  onRefundPayment,
  onUpdatePayment,
  onArchivePayment,
  onArchiveBooking,
  onSetAgreedTotal,
  onSendInvoice,
  onViewBookingDetails,
  onRecordPaymentForBooking,
  isLoading = false,
}: PaymentsTableProps) {
  // Set of booking IDs whose subrows are expanded
  const [expandedBookingIds, setExpandedBookingIds] = useState<Set<string>>(new Set());
  const [openKebabId, setOpenKebabId] = useState<string | null>(null);
  const [openPaymentKebabId, setOpenPaymentKebabId] = useState<string | null>(null);

  const toggleExpand = (bookingId: string) => {
    setExpandedBookingIds((prev) => {
      const next = new Set(prev);
      if (next.has(bookingId)) {
        next.delete(bookingId);
      } else {
        next.add(bookingId);
      }
      return next;
    });
  };

  // Group incoming payments by booking_id to form primary contract rows
  const groupedBookings = useMemo(() => {
    const map = new Map<string, GroupedBookingPayment>();

    for (const p of payments) {
      if (p.status === 'cancelled') continue;
      const b = p.booking as { is_archived?: boolean; status?: string } | undefined;
      if (b?.is_archived || b?.status === 'cancelled') continue;

      const bId = p.booking_id;
      if (!map.has(bId)) {
        map.set(bId, {
          bookingId: bId,
          bookingReference: p.booking_reference,
          clientFullName: p.booking?.client_full_name || 'Client',
          clientEmail: p.booking?.client_email || '',
          serviceTitle: p.booking?.service_title || 'Service',
          eventDate: p.booking?.event_date || '—',
          agreedTotalCentavos: p.booking?.agreed_total_centavos ?? null,
          remainingBalanceCentavos: p.booking?.remaining_balance_centavos ?? null,
          declaredDate: p.created_at || p.paid_at || null,
          latestPaymentNumber: p.payment_number,
          latestPayment: p.id.startsWith('pending-') ? null : p,
          payments: [],
        });
      }

      const entry = map.get(bId)!;
      // Only add actual payment records to the timeline (skip synthetic pending rows)
      if (!p.id.startsWith('pending-')) {
        entry.payments.push(p);
        if (!entry.latestPayment) {
          entry.latestPayment = p;
        }
        entry.latestPaymentNumber = p.payment_number;
      }
    }

    return Array.from(map.values());
  }, [payments]);

  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const startItem = totalCount === 0 || groupedBookings.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = totalCount === 0 ? 0 : Math.min(totalCount, (currentPage - 1) * pageSize + groupedBookings.length);

  const formatMethodName = (method: string) => {
    switch (method) {
      case 'refund':
        return 'Refund';
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'gcash':
        return 'GCash';
      case 'maya':
        return 'Maya';
      case 'cash':
        return 'Cash';
      case 'dragonpay':
        return 'Dragonpay';
      case 'paypal':
        return 'PayPal';
      case 'pending':
        return 'Awaiting Payment';
      default:
        return method;
    }
  };

  const renderBookingStatusBadge = (b: GroupedBookingPayment) => {
    const agreed = b.agreedTotalCentavos;
    const hasRefunded = b.payments.some((p) => p.is_refunded || p.status === 'refunded');

    const totalNetPaid = b.payments.reduce((acc, p) => {
      if (p.status !== 'paid') return acc;
      const net = (p.amount_centavos || 0) - (p.refund_amount_centavos || 0);
      return acc + (net > 0 ? net : 0);
    }, 0);

    if (agreed === null || agreed <= 0) {
      if (totalNetPaid > 0) {
        return (
          <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200">
            Partially Paid
          </span>
        );
      }
      return (
        <span className="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-medium text-stone-600 border border-stone-200">
          Undeclared
        </span>
      );
    }

    if (hasRefunded && totalNetPaid === 0) {
      return (
        <span className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-0.5 text-[11px] font-semibold text-purple-700 border border-purple-200">
          Refunded
        </span>
      );
    }

    if (totalNetPaid >= agreed) {
      return (
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
          Paid
        </span>
      );
    }

    if (totalNetPaid > 0) {
      return (
        <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200">
          Partially Paid
        </span>
      );
    }

    return (
      <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-200">
        Unpaid
      </span>
    );
  };

  const renderTransactionStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Paid
          </span>
        );
      case 'partially_refunded':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Partially Refunded
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            Refunded
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            Pending
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Failed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-600 border border-stone-200">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-600 border border-stone-200 capitalize">
            {status}
          </span>
        );
    }
  };

  return (
    <div>
      {/* 1. Collapsible Accordion Table with Scroll-X (Audit Trail Table Layout) */}
      <div className="overflow-x-auto">
        <table className="min-w-[1050px] w-full text-left text-xs text-stone-700 border-collapse">
          <thead>
            <tr className="border-b border-[#3A4F1C]/15 bg-[#F7F3E8] text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#2B3817]/70">
              <th className="py-3 px-3 w-10 text-center font-semibold"></th>
              <th className="py-3 px-3 font-semibold">Payment #</th>
              <th className="py-3 px-3 font-semibold">Client</th>
              <th className="py-3 px-3 font-semibold">Booking Ref</th>
              <th className="py-3 px-3 font-semibold">Date Agreed</th>
              <th className="py-3 px-4 font-semibold text-right">Total Amount</th>
              <th className="py-3 px-4 font-semibold text-right">Balance</th>
              <th className="py-3 px-3 font-semibold text-center">Status</th>
              <th className="py-3 px-4 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3A4F1C]/10 font-sans">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="py-16 text-center text-[#2B3817]/60">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#3A4F1C] border-t-transparent mb-2" />
                  <p className="text-xs text-stone-500 font-medium">Loading payments ledger...</p>
                </td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-16 text-center text-[#2B3817]/60">
                  <p className="font-semibold text-xs text-[#2B3817]">No payment records match the current filters.</p>
                  <p className="text-[11px] text-[#2B3817]/60 mt-0.5">Adjust filter presets or search terms above.</p>
                </td>
              </tr>
            ) : (
              groupedBookings.map((group) => {
              const isExpanded = expandedBookingIds.has(group.bookingId);

              // Extract all valid payment and refund transactions for this booking
              const rawPayments = group.payments.filter((p) => !p.id.startsWith('pending-'));

              const explicitRefundPayments = rawPayments.filter(
                (p) => p.status === 'refunded' || p.payment_method === 'refund' || p.payment_number.startsWith('REF-')
              );

              const regularPayments = rawPayments.filter(
                (p) => !(p.status === 'refunded' || p.payment_method === 'refund' || p.payment_number.startsWith('REF-'))
              );

              // Helper: Resolve true chronological time for ordering events,
              // prioritizing action timestamps (created_at / refunded_at) over midnight datepicker strings
              const getSortTime = (
                paymentDateStr?: string | null,
                actionTimeStr?: string | null
              ): number => {
                const pTime = paymentDateStr ? new Date(paymentDateStr).getTime() : 0;
                const aTime = actionTimeStr ? new Date(actionTimeStr).getTime() : 0;

                if (!pTime && !aTime) return 0;
                if (!pTime) return aTime;
                if (!aTime) return pTime;

                const pDate = new Date(paymentDateStr!);
                const isMidnight =
                  (pDate.getUTCHours() === 0 && pDate.getUTCMinutes() === 0 && pDate.getUTCSeconds() === 0) ||
                  (pDate.getHours() === 0 && pDate.getMinutes() === 0 && pDate.getSeconds() === 0);

                const aDate = new Date(actionTimeStr!);
                const isSameDay =
                  pDate.getUTCFullYear() === aDate.getUTCFullYear() &&
                  pDate.getUTCMonth() === aDate.getUTCMonth() &&
                  pDate.getUTCDate() === aDate.getUTCDate();

                if (isMidnight || isSameDay) {
                  return aTime;
                }

                return pTime;
              };

              const timelineEvents: TimelineEntry[] = [];

              // 1. Add explicit refund rows from DB
              for (const ref of explicitRefundPayments) {
                const sortTime = getSortTime(ref.paid_at, ref.refunded_at || ref.created_at);
                const isPaidAtMidnight =
                  ref.paid_at &&
                  ((new Date(ref.paid_at).getUTCHours() === 0 && new Date(ref.paid_at).getUTCMinutes() === 0) ||
                    (new Date(ref.paid_at).getHours() === 0 && new Date(ref.paid_at).getMinutes() === 0));

                const eventDate = ref.refunded_at || (!isPaidAtMidnight && ref.paid_at ? ref.paid_at : ref.created_at) || ref.paid_at;

                timelineEvents.push({
                  id: ref.id,
                  paymentNumber: ref.payment_number,
                  method: 'refund',
                  date: eventDate,
                  sortTime,
                  amountCentavos: ref.amount_centavos,
                  isRefund: true,
                  snapshotCentavos: null,
                  status: 'refunded',
                  proofAttachmentPath: ref.proof_attachment_path,
                  rawPayment: ref,
                  remainingRefundableCentavos: 0,
                });
              }

              // 2. Add regular payments (and synthesize refund rows for historical records)
              for (const p of regularPayments) {
                const refundedCentavos = p.refund_amount_centavos || 0;
                const remainingRefundable = Math.max(0, p.amount_centavos - refundedCentavos);
                const sortTime = getSortTime(p.paid_at, p.created_at);

                const isPaidAtMidnight =
                  p.paid_at &&
                  ((new Date(p.paid_at).getUTCHours() === 0 && new Date(p.paid_at).getUTCMinutes() === 0) ||
                    (new Date(p.paid_at).getHours() === 0 && new Date(p.paid_at).getMinutes() === 0));

                const eventDate = (!isPaidAtMidnight && p.paid_at) ? p.paid_at : (p.created_at || p.paid_at);

                let entryStatus: TimelineEntry['status'] = 'paid';
                if (p.status === 'failed' || p.status === 'cancelled' || p.status === 'pending') {
                  entryStatus = p.status;
                } else if (p.is_refunded) {
                  entryStatus = refundedCentavos >= p.amount_centavos ? 'refunded' : 'partially_refunded';
                }

                timelineEvents.push({
                  id: p.id,
                  paymentNumber: p.payment_number,
                  method: p.payment_method,
                  date: eventDate,
                  sortTime,
                  amountCentavos: p.amount_centavos,
                  isRefund: false,
                  snapshotCentavos: null,
                  status: entryStatus,
                  proofAttachmentPath: p.proof_attachment_path,
                  rawPayment: p,
                  remainingRefundableCentavos: remainingRefundable,
                });

                // Synthesize refund row if this payment was refunded without a separate DB row
                if (p.is_refunded && refundedCentavos > 0) {
                  const hasMatchingExplicitRefund = explicitRefundPayments.some((r) => {
                    const details = r.channel_details as { original_payment_id?: string; original_payment_number?: string } | undefined;
                    return (
                      details?.original_payment_id === p.id ||
                      details?.original_payment_number === p.payment_number ||
                      r.notes?.includes(p.payment_number)
                    );
                  });

                  if (!hasMatchingExplicitRefund) {
                    const refundTime = p.refunded_at
                      ? new Date(p.refunded_at).getTime()
                      : p.updated_at
                      ? new Date(p.updated_at).getTime()
                      : sortTime + 1;

                    timelineEvents.push({
                      id: `synth-ref-${p.id}`,
                      paymentNumber: `REF-${p.payment_number.replace(/^PAY-?/i, '')}`,
                      method: 'refund',
                      date: p.refunded_at || p.updated_at || p.created_at || p.paid_at,
                      sortTime: refundTime,
                      amountCentavos: refundedCentavos,
                      isRefund: true,
                      snapshotCentavos: null,
                      status: 'refunded',
                      proofAttachmentPath: null,
                      rawPayment: p,
                      remainingRefundableCentavos: 0,
                    });
                  }
                }
              }

              // 3. Sort ascending chronologically by sortTime to compute running balance snapshot accurately
              timelineEvents.sort((a, b) => a.sortTime - b.sortTime);

              const agreed = group.agreedTotalCentavos;
              let runningBalance = agreed;

              for (const event of timelineEvents) {
                if (agreed === null || agreed <= 0) {
                  event.snapshotCentavos = null;
                  continue;
                }

                if (runningBalance === null) {
                  runningBalance = agreed;
                }

                if (event.isRefund) {
                  // Refund increases the outstanding balance
                  runningBalance = Math.min(agreed, runningBalance + event.amountCentavos);
                  event.snapshotCentavos = runningBalance;
                } else if (event.status === 'paid' || event.status === 'partially_refunded' || event.status === 'refunded') {
                  // Verified payment decreases the outstanding balance
                  runningBalance = Math.max(0, runningBalance - event.amountCentavos);
                  event.snapshotCentavos = runningBalance;
                } else {
                  // Pending / failed does not alter balance snapshot
                  event.snapshotCentavos = runningBalance;
                }
              }

              // Display newest transactions first
              const displayTimeline = timelineEvents.slice().reverse();

              return (
                <React.Fragment key={group.bookingId}>
                  {/* Primary Row: Clicking any part of the row opens/closes collapsible */}
                  <tr
                    onClick={() => toggleExpand(group.bookingId)}
                    className="hover:bg-stone-50/60 transition group cursor-pointer select-none"
                  >
                    {/* Expand/Collapse Dropdown Toggle (⌄) */}
                    <td className="py-3 px-3 text-center text-stone-400 group-hover:text-stone-700">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-[#3A4F1C] inline-block" />
                      ) : (
                        <ChevronRight className="h-4 w-4 inline-block" />
                      )}
                    </td>

                    {/* Payment # */}
                    <td className="py-3 px-3 font-mono font-bold text-[#2B3817]">
                      {group.latestPaymentNumber}
                    </td>

                    {/* Client Name */}
                    <td
                      className="py-3 px-3 font-medium text-stone-900 max-w-[160px] truncate"
                      title={group.clientFullName}
                    >
                      {group.clientFullName}
                    </td>

                    {/* Booking Ref: Click opens Booking Detail Inspector Modal */}
                    <td className="py-3 px-3">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewBookingDetails(group.bookingReference);
                          }}
                          className="font-mono text-xs font-semibold text-[#3A4F1C] hover:underline cursor-pointer"
                          title="Inspect Booking Details"
                        >
                          {group.bookingReference}
                        </button>
                        <Link
                          href={`/admin/bookings?date=${group.eventDate}&bookingId=${group.bookingId}&modal=inspect`}
                          onClick={(e) => e.stopPropagation()}
                          title={`Open in Bookings Tab (${group.eventDate})`}
                          className="text-stone-400 hover:text-[#3A4F1C] transition cursor-pointer p-0.5 rounded hover:bg-stone-100"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    </td>

                    {/* Date Agreed */}
                    <td className="py-3 px-3 text-stone-600 whitespace-nowrap">
                      {group.declaredDate
                        ? formatPaymentDateTime(group.declaredDate)
                        : '—'}
                    </td>

                    {/* Total Amount */}
                    <td className="py-3 px-4 text-right font-bold text-stone-800 whitespace-nowrap">
                      {formatPesos(group.agreedTotalCentavos)}
                    </td>

                    {/* Balance */}
                    <td className="py-3 px-4 text-right whitespace-nowrap text-amber-800 font-bold">
                      {formatPesos(group.remainingBalanceCentavos)}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {renderBookingStatusBadge(group)}
                    </td>

                    {/* Header Actions (Inspect Payment, Send Payment Invoice, View Booking) */}
                    <td
                      onClick={(e) => e.stopPropagation()}
                      className="py-3 px-4 text-center whitespace-nowrap"
                    >
                      <div className="relative inline-flex items-center gap-1">
                        {/* Eye icon: Inspect Payment Details */}
                        {group.latestPayment ? (
                          <button
                            type="button"
                            onClick={() => onInspectPayment(group.latestPayment!)}
                            className="p-1.5 text-stone-500 hover:text-[#3A4F1C] hover:bg-stone-100 rounded-lg transition cursor-pointer"
                            title="Inspect Payment Details"
                          >
                            <Eye className="h-4 w-4 text-[#3A4F1C]" />
                          </button>
                        ) : (
                          <span
                            className="p-1.5 text-stone-300 cursor-not-allowed"
                            title="No payments recorded yet"
                          >
                            <Eye className="h-4 w-4" />
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            setOpenKebabId(openKebabId === group.bookingId ? null : group.bookingId)
                          }
                          className="p-1.5 text-stone-500 hover:text-[#2B3817] hover:bg-stone-100 rounded-lg transition cursor-pointer"
                          title="Actions"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {openKebabId === group.bookingId && (
                          <div
                            className="absolute right-0 mt-1 w-52 rounded-xl border border-stone-200 bg-white py-1 shadow-xl z-30 animate-in fade-in zoom-in-95 duration-100 text-left"
                            onMouseLeave={() => setOpenKebabId(null)}
                          >
                            {group.latestPayment && (
                              <button
                                onClick={() => {
                                  onInspectPayment(group.latestPayment!);
                                  setOpenKebabId(null);
                                }}
                                className="w-full px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Eye className="h-3.5 w-3.5 text-[#3A4F1C]" />
                                <span>Inspect Payment Details</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                onSetAgreedTotal(group.bookingId);
                                setOpenKebabId(null);
                              }}
                              className="w-full px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Edit3 className="h-3.5 w-3.5 text-[#3A4F1C]" />
                              <span>Update Agreed Total</span>
                            </button>

                            <button
                              onClick={() => {
                                onSendInvoice({
                                  bookingId: group.bookingId,
                                  bookingReference: group.bookingReference,
                                  clientFullName: group.clientFullName,
                                  clientEmail: group.clientEmail,
                                  serviceTitle: group.serviceTitle,
                                  agreedTotalCentavos: group.agreedTotalCentavos,
                                  remainingBalanceCentavos: group.remainingBalanceCentavos,
                                });
                                setOpenKebabId(null);
                              }}
                              disabled={(group.remainingBalanceCentavos || 0) <= 0}
                              className="w-full px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer disabled:opacity-40"
                            >
                              <Send className="h-3.5 w-3.5 text-blue-600" />
                              <span>Send Payment Invoice</span>
                            </button>

                            <button
                              onClick={() => {
                                onViewBookingDetails(group.bookingReference);
                                setOpenKebabId(null);
                              }}
                              className="w-full px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                            >
                              <FileText className="h-3.5 w-3.5 text-[#3A4F1C]" />
                              <span>Inspect Booking Details</span>
                            </button>

                            <Link
                              href={`/admin/bookings?date=${group.eventDate}&bookingId=${group.bookingId}&modal=inspect`}
                              onClick={() => setOpenKebabId(null)}
                              className="w-full px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                            >
                              <ExternalLink className="h-3.5 w-3.5 text-[#3A4F1C]" />
                              <span>Open in Bookings Tab</span>
                            </Link>

                            <div className="my-1 border-t border-stone-100" />

                            <button
                              onClick={() => {
                                onArchiveBooking(group);
                                setOpenKebabId(null);
                              }}
                              className="w-full px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Archive className="h-3.5 w-3.5 text-rose-600" />
                              <span>Archive Booking</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Subrow (Collapsible Timeline) */}
                  {isExpanded && (
                    <tr className="bg-[#F7F3E8]/40 border-y border-stone-200/60">
                      <td colSpan={9} className="py-3 px-4 sm:px-8">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                              Payment Timeline
                            </span>
                          </div>

                          {group.payments.length === 0 ? (
                            (() => {
                              const hasAgreedTotal = Boolean(
                                group.agreedTotalCentavos && group.agreedTotalCentavos > 0
                              );

                              return hasAgreedTotal ? (
                                <div
                                  onClick={() => onRecordPaymentForBooking(group.bookingId)}
                                  className="p-4 rounded-xl border border-dashed border-stone-300 hover:border-[#3A4F1C] bg-white/70 hover:bg-white text-center cursor-pointer transition"
                                >
                                  <p className="text-xs font-semibold text-[#2B3817]">
                                    No payments recorded yet for this booking.
                                  </p>
                                  <p className="text-[11px] text-stone-500 mt-0.5">
                                    Click to record a payment for {group.clientFullName} [{group.bookingReference}].
                                  </p>
                                </div>
                              ) : (
                                <div
                                  onClick={() => onSetAgreedTotal(group.bookingId)}
                                  className="p-4 rounded-xl border border-dashed border-amber-300 hover:border-[#BC6F07] bg-amber-50/60 hover:bg-amber-50 text-center cursor-pointer transition"
                                >
                                  <p className="text-xs font-semibold text-[#BC6F07]">
                                    No agreed contract total declared yet.
                                  </p>
                                  <p className="text-[11px] text-stone-600 mt-0.5">
                                    Click to declare the agreed contract total before recording payments for {group.clientFullName} [{group.bookingReference}].
                                  </p>
                                </div>
                              );
                            })()
                          ) : (
                            <div className="rounded-xl border border-stone-200 bg-white overflow-visible shadow-xs">
                              <table className="w-full text-left text-xs text-stone-700 border-collapse">
                                <thead className="bg-stone-50/80 border-b border-stone-100 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                                  <tr>
                                    <th className="py-2 px-3">Payment #</th>
                                    <th className="py-2 px-3">Method</th>
                                    <th className="py-2 px-3">Date</th>
                                    <th className="py-2 px-3 text-right">Amount</th>
                                    <th className="py-2 px-3 text-right">Bal Snapshot</th>
                                    <th className="py-2 px-3 text-center">Status</th>
                                    <th className="py-2 px-3 text-center">Files</th>
                                    <th className="py-2 px-3 text-right">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                  {displayTimeline.map((item) => {
                                    return (
                                      <tr key={item.id} className="hover:bg-stone-50/60 transition">
                                        <td className="py-2 px-3 font-mono font-medium text-[11px] whitespace-nowrap">
                                          {item.isRefund ? (
                                            <span className="inline-flex items-center gap-1.5 text-purple-700 font-semibold">
                                              <span>{item.paymentNumber}</span>
                                            </span>
                                          ) : (
                                            <span className="text-[#2B3817]">{item.paymentNumber}</span>
                                          )}
                                        </td>
                                        <td className="py-2 px-3 capitalize text-[11px] whitespace-nowrap">
                                          {item.isRefund ? (
                                            <span className="text-purple-700 font-medium">Refund</span>
                                          ) : (
                                            formatMethodName(item.method)
                                          )}
                                        </td>
                                        <td className="py-2 px-3 text-stone-600 whitespace-nowrap text-[11px]">
                                          {formatPaymentDateTime(item.date)}
                                        </td>
                                        <td className="py-2 px-3 text-right font-bold whitespace-nowrap text-[11px] font-mono">
                                          {item.isRefund ? (
                                            <span className="text-purple-700">-{formatPesos(item.amountCentavos)}</span>
                                          ) : (
                                            <span className="text-emerald-800">+{formatPesos(item.amountCentavos)}</span>
                                          )}
                                        </td>
                                        <td className="py-2 px-3 text-right text-stone-600 whitespace-nowrap text-[11px] font-mono">
                                          {item.snapshotCentavos !== null ? formatPesos(item.snapshotCentavos) : '—'}
                                        </td>
                                        <td className="py-2 px-3 text-center whitespace-nowrap">
                                          {renderTransactionStatusBadge(item.status)}
                                        </td>
                                        <td className="py-2 px-3 text-center whitespace-nowrap">
                                          <div className="flex items-center justify-center gap-1.5">
                                            {item.proofAttachmentPath ? (
                                              <button
                                                type="button"
                                                onClick={() => onViewProof(item.rawPayment)}
                                                className="text-stone-600 hover:text-[#3A4F1C] p-1 rounded-sm hover:bg-stone-100 cursor-pointer"
                                                title="View Proof"
                                              >
                                                <Paperclip className="h-3 w-3 text-emerald-700" />
                                              </button>
                                            ) : (
                                              <span className="text-stone-300 text-[10px]">—</span>
                                            )}
                                          </div>
                                        </td>
                                        <td className="py-2 px-3 text-right whitespace-nowrap">
                                          <div className="relative inline-flex items-center justify-end">
                                            <button
                                              type="button"
                                              onClick={() =>
                                                setOpenPaymentKebabId(openPaymentKebabId === item.id ? null : item.id)
                                              }
                                              className="p-1 text-stone-500 hover:text-[#2B3817] hover:bg-stone-100 rounded-lg transition cursor-pointer"
                                              title="Payment Actions"
                                            >
                                              <MoreVertical className="h-4 w-4" />
                                            </button>

                                            {openPaymentKebabId === item.id && (
                                              <div
                                                className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-stone-200 bg-white py-1 shadow-xl z-40 animate-in fade-in zoom-in-95 duration-100 text-left"
                                                onMouseLeave={() => setOpenPaymentKebabId(null)}
                                              >
                                                {item.isRefund ? (
                                                  <div className="px-3 py-1.5 text-xs text-purple-700 flex items-center gap-2 bg-purple-50/50 font-medium">
                                                    <RotateCcw className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                                                    <span>Refund Record</span>
                                                  </div>
                                                ) : (
                                                  <>
                                                    {item.rawPayment.status !== 'cancelled' && (
                                                      <button
                                                        type="button"
                                                        onClick={() => {
                                                          onUpdatePayment(item.rawPayment);
                                                          setOpenPaymentKebabId(null);
                                                        }}
                                                        className="w-full px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                                                      >
                                                        <Pencil className="h-3.5 w-3.5 text-stone-500 shrink-0" />
                                                        <span>Edit Payment</span>
                                                      </button>
                                                    )}

                                                    {item.remainingRefundableCentavos > 0 ? (
                                                      <button
                                                        type="button"
                                                        onClick={() => {
                                                          onRefundPayment(item.rawPayment);
                                                          setOpenPaymentKebabId(null);
                                                        }}
                                                        className="w-full px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                                                      >
                                                        <RotateCcw className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                                                        <span>
                                                          Refund ({formatPesos(item.remainingRefundableCentavos)})
                                                        </span>
                                                      </button>
                                                    ) : (
                                                      <div className="px-3 py-1.5 text-xs text-rose-600 flex items-center gap-2 font-medium bg-rose-50/50">
                                                        <RotateCcw className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                                                        <span>Fully Refunded</span>
                                                      </div>
                                                    )}

                                                    {item.rawPayment.status !== 'cancelled' ? (
                                                      <button
                                                        type="button"
                                                        onClick={() => {
                                                          onArchivePayment(item.rawPayment);
                                                          setOpenPaymentKebabId(null);
                                                        }}
                                                        className="w-full px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50 flex items-center gap-2 cursor-pointer border-t border-stone-100"
                                                      >
                                                        <Archive className="h-3.5 w-3.5 text-rose-600" />
                                                        <span>Archive Payment</span>
                                                      </button>
                                                    ) : (
                                                      <div className="px-3 py-1.5 text-xs text-stone-400 italic">
                                                        Payment Archived
                                                      </div>
                                                    )}
                                                  </>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            }))}
          </tbody>
        </table>
      </div>

      {/* 2. Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-[#F7F3E8]/60 border-t border-[#3A4F1C]/15 text-xs text-stone-600">
        <div>
          Showing <span className="font-semibold text-stone-800">{startItem}</span> to{' '}
          <span className="font-semibold text-stone-800">{endItem}</span> of{' '}
          <span className="font-semibold text-stone-800">{totalCount}</span> items
        </div>

        <div className="flex items-center gap-3">
          {/* Limit / Page size selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-stone-500">Show:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-white border border-stone-200 rounded-md px-2 py-1 text-xs font-medium text-stone-700 focus:outline-hidden cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          {/* Page controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-1 rounded-md border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="px-2 py-1 font-semibold text-stone-800">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-1 rounded-md border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
