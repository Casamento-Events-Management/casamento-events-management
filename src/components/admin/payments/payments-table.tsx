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
} from 'lucide-react';
import { formatPesos } from '@/lib/utils/currencyUtils';
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
  payments: ExtendedPaymentRecord[];
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
  onSendInvoice,
  onViewBookingDetails,
  onRecordPaymentForBooking,
  isLoading = false,
}: PaymentsTableProps) {
  // Set of booking IDs whose subrows are expanded
  const [expandedBookingIds, setExpandedBookingIds] = useState<Set<string>>(new Set());
  const [openKebabId, setOpenKebabId] = useState<string | null>(null);

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
          payments: [],
        });
      }

      const entry = map.get(bId)!;
      // Only add actual payment records to the timeline (skip synthetic pending rows)
      if (!p.id.startsWith('pending-')) {
        entry.payments.push(p);
      }
    }

    return Array.from(map.values());
  }, [payments]);

  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(totalCount, currentPage * pageSize);

  const formatMethodName = (method: string) => {
    switch (method) {
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
    const balance = b.remainingBalanceCentavos;

    if (agreed === null || agreed <= 0) {
      return (
        <span className="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-medium text-stone-600">
          Undeclared
        </span>
      );
    }

    if (balance === 0) {
      return (
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
          Paid
        </span>
      );
    }

    if (balance !== null && balance < agreed) {
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

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[#3A4F1C]/15 bg-white p-8 text-center space-y-3">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#3A4F1C] border-t-transparent" />
        <p className="text-xs text-stone-500 font-medium">Loading payments ledger...</p>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="rounded-2xl border border-[#3A4F1C]/15 bg-white p-12 text-center space-y-2">
        <p className="text-sm font-semibold text-[#2B3817]">No payment records found</p>
        <p className="text-xs text-stone-500">Try adjusting your search criteria or filters.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#3A4F1C]/15 bg-white shadow-xs overflow-hidden">
      {/* 1. Desktop & Tablet Collapsible Accordion Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs text-stone-700 border-collapse">
          <thead>
            <tr className="border-b border-stone-200/80 bg-stone-50/70 text-[11px] font-bold uppercase tracking-wider text-stone-500">
              <th className="py-3.5 px-3 w-10 text-center font-semibold"></th>
              <th className="py-3.5 px-3 font-semibold">Payment #</th>
              <th className="py-3.5 px-3 font-semibold">Client</th>
              <th className="py-3.5 px-3 font-semibold">Booking Ref</th>
              <th className="py-3.5 px-3 font-semibold">Date Agreed</th>
              <th className="py-3.5 px-4 font-semibold text-right">Total Amount</th>
              <th className="py-3.5 px-4 font-semibold text-right">Balance</th>
              <th className="py-3.5 px-3 font-semibold text-center">Status</th>
              <th className="py-3.5 px-4 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {groupedBookings.map((group) => {
              const isExpanded = expandedBookingIds.has(group.bookingId);

              // Sort group payments ascending to compute balance snapshots for each payment
              const sortedAsc = [...group.payments].sort(
                (a, b) => new Date(a.paid_at).getTime() - new Date(b.paid_at).getTime()
              );

              const agreed = group.agreedTotalCentavos || 0;
              let accumulatedPaid = 0;
              const snapshotMap = new Map<string, number>();

              for (const p of sortedAsc) {
                const net = (p.amount_centavos || 0) - (p.refund_amount_centavos || 0);
                accumulatedPaid += net > 0 ? net : 0;
                snapshotMap.set(p.id, Math.max(0, agreed - accumulatedPaid));
              }

              // Display timeline newest first
              const displayTimeline = sortedAsc.slice().reverse();

              return (
                <React.Fragment key={group.bookingId}>
                  {/* Primary Row */}
                  <tr className="hover:bg-stone-50/60 transition group cursor-pointer">
                    {/* Expand/Collapse Dropdown Toggle (⌄) */}
                    <td
                      onClick={() => toggleExpand(group.bookingId)}
                      className="py-3 px-3 text-center text-stone-400 hover:text-stone-700 cursor-pointer"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-[#3A4F1C] inline-block" />
                      ) : (
                        <ChevronRight className="h-4 w-4 inline-block" />
                      )}
                    </td>

                    {/* Payment # */}
                    <td
                      onClick={() => toggleExpand(group.bookingId)}
                      className="py-3 px-3 font-mono font-bold text-[#2B3817]"
                    >
                      {group.latestPaymentNumber}
                    </td>

                    {/* Client Name */}
                    <td
                      onClick={() => toggleExpand(group.bookingId)}
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
                          onClick={() => onViewBookingDetails(group.bookingReference)}
                          className="font-mono text-xs font-semibold text-[#3A4F1C] hover:underline cursor-pointer"
                          title="Inspect Booking Details"
                        >
                          {group.bookingReference}
                        </button>
                        <Link
                          href={`/admin/bookings?date=${group.eventDate}&bookingId=${group.bookingId}&modal=inspect`}
                          title={`Open in Bookings Tab (${group.eventDate})`}
                          className="text-stone-400 hover:text-[#3A4F1C] transition cursor-pointer p-0.5 rounded hover:bg-stone-100"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    </td>

                    {/* Date Agreed */}
                    <td
                      onClick={() => toggleExpand(group.bookingId)}
                      className="py-3 px-3 text-stone-600 whitespace-nowrap"
                    >
                      {group.declaredDate
                        ? new Date(group.declaredDate).toLocaleDateString('en-PH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                        : '—'}
                    </td>

                    {/* Total Amount */}
                    <td
                      onClick={() => toggleExpand(group.bookingId)}
                      className="py-3 px-4 text-right font-bold text-stone-800 whitespace-nowrap"
                    >
                      {formatPesos(group.agreedTotalCentavos)}
                    </td>

                    {/* Balance */}
                    <td
                      onClick={() => toggleExpand(group.bookingId)}
                      className="py-3 px-4 text-right whitespace-nowrap text-amber-800 font-bold"
                    >
                      {formatPesos(group.remainingBalanceCentavos)}
                    </td>

                    {/* Status */}
                    <td
                      onClick={() => toggleExpand(group.bookingId)}
                      className="py-3 px-3 text-center whitespace-nowrap"
                    >
                      {renderBookingStatusBadge(group)}
                    </td>

                    {/* Header Actions (Send Payment Invoice, View Booking) */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="relative inline-flex items-center gap-1">
                        <button
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
                              Payment Timeline ({group.payments.length})
                            </span>
                          </div>

                          {group.payments.length === 0 ? (
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
                            <div className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-xs">
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
                                  {displayTimeline.map((p) => {
                                    const snapshot = snapshotMap.get(p.id);
                                    return (
                                      <tr key={p.id} className="hover:bg-stone-50/60">
                                        <td className="py-2 px-3 font-mono font-medium text-[#2B3817] text-[11px]">
                                          <button
                                            type="button"
                                            onClick={() => onInspectPayment(p)}
                                            className="hover:underline hover:text-[#3A4F1C] cursor-pointer text-left font-mono font-medium"
                                            title="Inspect payment details"
                                          >
                                            {p.payment_number}
                                          </button>
                                        </td>
                                        <td className="py-2 px-3 capitalize text-[11px]">
                                          {formatMethodName(p.payment_method)}
                                        </td>
                                        <td className="py-2 px-3 text-stone-600 whitespace-nowrap text-[11px]">
                                          {new Date(p.paid_at).toLocaleDateString('en-PH', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                          })}
                                        </td>
                                        <td className="py-2 px-3 text-right font-bold text-emerald-800 whitespace-nowrap text-[11px]">
                                          {formatPesos(p.amount_centavos)}
                                        </td>
                                        <td className="py-2 px-3 text-right text-stone-600 whitespace-nowrap text-[11px]">
                                          {snapshot !== undefined ? formatPesos(snapshot) : '—'}
                                        </td>
                                        <td className="py-2 px-3 text-center whitespace-nowrap">
                                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 capitalize">
                                            {p.status}
                                          </span>
                                        </td>
                                        <td className="py-2 px-3 text-center whitespace-nowrap">
                                          <div className="flex items-center justify-center gap-1.5">
                                            {p.proof_attachment_path ? (
                                              <button
                                                type="button"
                                                onClick={() => onViewProof(p)}
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
                                          {!p.is_refunded && p.status === 'paid' ? (
                                            <button
                                              type="button"
                                              onClick={() => onRefundPayment(p)}
                                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold text-[10px] cursor-pointer"
                                            >
                                              <RotateCcw className="h-3 w-3 text-rose-600" />
                                              <span>Refund</span>
                                            </button>
                                          ) : p.is_refunded ? (
                                            <span className="text-[10px] text-rose-600 font-semibold">Refunded</span>
                                          ) : (
                                            <span className="text-stone-300 text-[10px]">—</span>
                                          )}
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
            })}
          </tbody>
        </table>
      </div>

      {/* 2. Mobile Card Ledger View (< 768px) with reduced typography */}
      <div className="block md:hidden divide-y divide-stone-100">
        {groupedBookings.map((group) => {
          const isExpanded = expandedBookingIds.has(group.bookingId);
          return (
            <div key={group.bookingId} className="p-3 space-y-2 text-stone-700">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-[#2B3817] truncate max-w-[180px]">
                  {group.latestPaymentNumber}
                </span>
                {renderBookingStatusBadge(group)}
              </div>

              <div className="text-[11px] text-stone-800 font-medium">
                <p className="truncate">{group.clientFullName}</p>
                <p className="text-[10px] text-stone-500 font-normal">
                  {group.serviceTitle} ·{' '}
                  <button
                    type="button"
                    onClick={() => onViewBookingDetails(group.bookingReference)}
                    className="text-[#3A4F1C] underline font-mono cursor-pointer"
                    title="Inspect Booking Details"
                  >
                    {group.bookingReference}
                  </button>
                  <Link
                    href={`/admin/bookings?date=${group.eventDate}&bookingId=${group.bookingId}&modal=inspect`}
                    className="inline-flex text-stone-400 hover:text-[#3A4F1C] ml-1 align-middle"
                    title={`Open in Bookings Tab (${group.eventDate})`}
                  >
                    <ExternalLink className="h-2.5 w-2.5 inline" />
                  </Link>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] py-1 border-y border-stone-100">
                <div>
                  <span className="text-[9px] uppercase font-bold text-stone-400 block">Total Amount</span>
                  <span className="font-bold text-stone-800">{formatPesos(group.agreedTotalCentavos)}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-stone-400 block">Balance</span>
                  <span className="font-bold text-amber-800">{formatPesos(group.remainingBalanceCentavos)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-stone-500 pt-0.5">
                <button
                  type="button"
                  onClick={() => toggleExpand(group.bookingId)}
                  className="inline-flex items-center gap-1 font-semibold text-[#3A4F1C] cursor-pointer"
                >
                  {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  <span>Timeline ({group.payments.length})</span>
                </button>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      onSendInvoice({
                        bookingId: group.bookingId,
                        bookingReference: group.bookingReference,
                        clientFullName: group.clientFullName,
                        clientEmail: group.clientEmail,
                        serviceTitle: group.serviceTitle,
                        agreedTotalCentavos: group.agreedTotalCentavos,
                        remainingBalanceCentavos: group.remainingBalanceCentavos,
                      })
                    }
                    disabled={(group.remainingBalanceCentavos || 0) <= 0}
                    className="px-2 py-0.5 bg-stone-100 rounded-md text-stone-700 font-semibold hover:bg-stone-200 cursor-pointer text-[10px] disabled:opacity-40"
                  >
                    Send Invoice
                  </button>
                </div>
              </div>

              {/* Mobile Timeline Accordion */}
              {isExpanded && (
                <div className="mt-2 p-2.5 bg-stone-50 rounded-xl space-y-2 border border-stone-200/80">
                  {group.payments.length === 0 ? (
                    <div
                      onClick={() => onRecordPaymentForBooking(group.bookingId)}
                      className="p-3 bg-white rounded-lg border border-dashed border-stone-300 text-center cursor-pointer"
                    >
                      <p className="text-[10px] font-semibold text-[#2B3817]">No payments recorded yet</p>
                      <p className="text-[9px] text-stone-400 mt-0.5">+ Tap to Record Payment</p>
                    </div>
                  ) : (
                    group.payments.map((p) => (
                      <div key={p.id} className="p-2 bg-white rounded-lg border border-stone-100 space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <button
                            type="button"
                            onClick={() => onInspectPayment(p)}
                            className="font-mono font-bold text-[#2B3817] hover:underline cursor-pointer"
                            title="Inspect payment details"
                          >
                            {p.payment_number}
                          </button>
                          <span className="font-bold text-emerald-800">{formatPesos(p.amount_centavos)}</span>
                        </div>
                        <div className="flex items-center justify-between text-[9px] text-stone-400">
                          <span>{formatMethodName(p.payment_method)} · {new Date(p.paid_at).toLocaleDateString()}</span>
                          {!p.is_refunded && p.status === 'paid' && (
                            <button
                              type="button"
                              onClick={() => onRefundPayment(p)}
                              className="text-rose-600 font-semibold cursor-pointer underline"
                            >
                              Refund
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-stone-50/70 border-t border-stone-200/80 text-xs text-stone-600">
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
