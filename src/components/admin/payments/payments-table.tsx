'use client';

// =============================================================================
// components/admin/payments/payments-table.tsx — Separated Data Columns Ledger
// =============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Eye,
  MoreVertical,
  Paperclip,
  FileText,
  RotateCcw,
  Send,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { formatPesos } from '@/lib/utils/currencyUtils';
import type { ExtendedPaymentRecord } from '@/lib/services/admin-payment-actions';

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
  onResendReceipt: (payment: ExtendedPaymentRecord) => void;
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
  onResendReceipt,
  isLoading = false,
}: PaymentsTableProps) {
  const [openKebabId, setOpenKebabId] = useState<string | null>(null);

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
      default:
        return method;
    }
  };

  const renderStatusBadge = (p: ExtendedPaymentRecord) => {
    if (p.is_refunded) {
      return (
        <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-200">
          Refunded
        </span>
      );
    }
    if (p.status === 'paid') {
      return (
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
          Paid
        </span>
      );
    }
    if (p.status === 'pending') {
      return (
        <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200">
          Pending
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-medium text-stone-600">
        {p.status}
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
      {/* 1. Desktop & Tablet Table View (Separated Columns) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs text-stone-700 border-collapse">
          <thead>
            <tr className="border-b border-stone-200/80 bg-stone-50/70 text-[11px] font-bold uppercase tracking-wider text-stone-500">
              <th className="py-3.5 px-4 font-semibold">Payment #</th>
              <th className="py-3.5 px-3 font-semibold">Method</th>
              <th className="py-3.5 px-4 font-semibold">Client Name</th>
              <th className="py-3.5 px-3 font-semibold">Booking Ref</th>
              <th className="py-3.5 px-3 font-semibold">Date Paid</th>
              <th className="py-3.5 px-4 font-semibold text-right">Amount</th>
              <th className="py-3.5 px-4 font-semibold text-right">Balance</th>
              <th className="py-3.5 px-3 font-semibold text-center">Status</th>
              <th className="py-3.5 px-3 font-semibold text-center">Files</th>
              <th className="py-3.5 px-4 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-stone-50/60 transition">
                {/* 1. Payment # */}
                <td className="py-3 px-4 font-mono font-bold text-[#2B3817]">
                  {p.payment_number}
                </td>

                {/* 2. Method */}
                <td className="py-3 px-3">
                  <span className="inline-block px-2 py-0.5 bg-stone-100 rounded-md text-[11px] font-medium text-stone-700">
                    {formatMethodName(p.payment_method)}
                  </span>
                </td>

                {/* 3. Client Name */}
                <td className="py-3 px-4 font-medium text-stone-900 max-w-[160px] truncate" title={p.booking?.client_full_name}>
                  {p.booking?.client_full_name || '—'}
                </td>

                {/* 4. Booking Ref */}
                <td className="py-3 px-3">
                  <Link
                    href={`/admin/bookings?search=${p.booking_reference}`}
                    className="font-mono text-xs font-semibold text-[#3A4F1C] hover:underline"
                    title="View booking"
                  >
                    {p.booking_reference}
                  </Link>
                </td>

                {/* 5. Date Paid */}
                <td className="py-3 px-3 text-stone-600 whitespace-nowrap">
                  {new Date(p.paid_at).toLocaleDateString('en-PH', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </td>

                {/* 6. Amount */}
                <td className="py-3 px-4 text-right font-bold text-emerald-800 whitespace-nowrap">
                  {formatPesos(p.amount_centavos)}
                </td>

                {/* 7. Balance */}
                <td className="py-3 px-4 text-right whitespace-nowrap text-stone-700 font-medium">
                  {p.booking?.remaining_balance_centavos !== null && p.booking?.remaining_balance_centavos !== undefined
                    ? formatPesos(p.booking.remaining_balance_centavos)
                    : '—'}
                </td>

                {/* 8. Status */}
                <td className="py-3 px-3 text-center whitespace-nowrap">
                  {renderStatusBadge(p)}
                </td>

                {/* 9. Attachments / Files */}
                <td className="py-3 px-3 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1.5 text-stone-400">
                    {p.proof_attachment_path ? (
                      <button
                        onClick={() => onViewProof(p)}
                        className="text-stone-700 hover:text-[#3A4F1C] p-1 rounded-sm hover:bg-stone-100 transition cursor-pointer"
                        title="View Proof of Payment"
                      >
                        <Paperclip className="h-3.5 w-3.5 text-emerald-700" />
                      </button>
                    ) : (
                      <span className="text-stone-300 text-xs">—</span>
                    )}

                    {p.receipt_sent_at ? (
                      <span title={`Receipt sent on ${new Date(p.receipt_sent_at).toLocaleDateString()}`}>
                        <FileText className="h-3.5 w-3.5 text-amber-700" />
                      </span>
                    ) : null}
                  </div>
                </td>

                {/* 10. Actions */}
                <td className="py-3 px-4 text-center whitespace-nowrap">
                  <div className="relative inline-flex items-center gap-1">
                    {/* Quick View Button */}
                    <button
                      onClick={() => onInspectPayment(p)}
                      className="p-1.5 text-stone-500 hover:text-[#2B3817] hover:bg-stone-100 rounded-lg transition cursor-pointer"
                      title="Quick View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    {/* Kebab Action Menu */}
                    <div className="relative">
                      <button
                        onClick={() => setOpenKebabId(openKebabId === p.id ? null : p.id)}
                        className="p-1.5 text-stone-500 hover:text-[#2B3817] hover:bg-stone-100 rounded-lg transition cursor-pointer"
                        title="More Actions"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {openKebabId === p.id && (
                        <div
                          className="absolute right-0 mt-1 w-44 rounded-xl border border-stone-200 bg-white py-1 shadow-xl z-30 animate-in fade-in zoom-in-95 duration-100 text-left"
                          onMouseLeave={() => setOpenKebabId(null)}
                        >
                          <button
                            onClick={() => {
                              onInspectPayment(p);
                              setOpenKebabId(null);
                            }}
                            className="w-full px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5 text-stone-500" />
                            <span>View Details</span>
                          </button>

                          {p.proof_attachment_path && (
                            <button
                              onClick={() => {
                                onViewProof(p);
                                setOpenKebabId(null);
                              }}
                              className="w-full px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Paperclip className="h-3.5 w-3.5 text-emerald-600" />
                              <span>View Proof</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              onResendReceipt(p);
                              setOpenKebabId(null);
                            }}
                            className="w-full px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Send className="h-3.5 w-3.5 text-blue-600" />
                            <span>Resend Receipt</span>
                          </button>

                          {!p.is_refunded && p.status === 'paid' && (
                            <button
                              onClick={() => {
                                onRefundPayment(p);
                                setOpenKebabId(null);
                              }}
                              className="w-full px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                            >
                              <RotateCcw className="h-3.5 w-3.5 text-rose-600" />
                              <span>Record Refund</span>
                            </button>
                          )}

                          <div className="my-1 border-t border-stone-100" />

                          <Link
                            href={`/admin/bookings?search=${p.booking_reference}`}
                            className="w-full px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                          >
                            <ExternalLink className="h-3.5 w-3.5 text-stone-400" />
                            <span>View Booking</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 2. Mobile Card Ledger View (< 768px) */}
      <div className="block md:hidden divide-y divide-stone-100">
        {payments.map((p) => (
          <div key={p.id} className="p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-sm text-[#2B3817]">{p.payment_number}</span>
              {renderStatusBadge(p)}
            </div>

            <div className="text-xs text-stone-800 font-medium">
              <p className="truncate">{p.booking?.client_full_name || 'Client'}</p>
              <p className="text-[11px] text-stone-500 font-normal">
                {p.booking?.service_title} ·{' '}
                <Link href={`/admin/bookings?search=${p.booking_reference}`} className="text-[#3A4F1C] underline font-mono">
                  {p.booking_reference}
                </Link>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs py-1.5 border-y border-stone-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Amount Paid</span>
                <span className="font-bold text-emerald-800">{formatPesos(p.amount_centavos)}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Balance Remaining</span>
                <span className="font-medium text-stone-700">
                  {p.booking?.remaining_balance_centavos !== null && p.booking?.remaining_balance_centavos !== undefined
                    ? formatPesos(p.booking.remaining_balance_centavos)
                    : '—'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
              <span>{formatMethodName(p.payment_method)} · {new Date(p.paid_at).toLocaleDateString()}</span>
              <div className="flex items-center gap-2">
                {p.proof_attachment_path && (
                  <button
                    onClick={() => onViewProof(p)}
                    className="text-emerald-700 hover:underline flex items-center gap-0.5 cursor-pointer font-medium"
                  >
                    <Paperclip className="h-3 w-3" />
                    <span>Proof</span>
                  </button>
                )}
                <button
                  onClick={() => onInspectPayment(p)}
                  className="px-2.5 py-1 bg-stone-100 rounded-md text-stone-700 font-semibold hover:bg-stone-200 cursor-pointer"
                >
                  Inspect
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-stone-50/70 border-t border-stone-200/80 text-xs text-stone-600">
        <div>
          Showing <span className="font-semibold text-stone-800">{startItem}</span> to{' '}
          <span className="font-semibold text-stone-800">{endItem}</span> of{' '}
          <span className="font-semibold text-stone-800">{totalCount}</span> payments
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
