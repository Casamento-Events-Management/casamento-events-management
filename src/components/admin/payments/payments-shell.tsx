'use client';

// =============================================================================
// components/admin/payments/payments-shell.tsx — Main Payments Dashboard Shell
// =============================================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, FileText, RefreshCw } from 'lucide-react';
import { syncUrlParams } from '@/lib/utils/urlParamUtils';
import { PaymentsStatsGrid } from './payments-stats-grid';
import { PaymentsFilterBar } from './payments-filter-bar';
import { PaymentsTable } from './payments-table';
import { RecordPaymentModal } from './modals/record-payment-modal';
import { SetAgreedTotalModal } from './modals/set-agreed-total-modal';
import { PaymentInspectorModal } from './modals/payment-inspector-modal';
import { ProofViewerModal } from './modals/proof-viewer-modal';
import { RefundPaymentModal } from './modals/refund-payment-modal';
import {
  SendPaymentInvoiceModal,
  type InvoiceBookingTarget,
} from './modals/send-payment-invoice-modal';
import { BookingDetailInspector } from '../bookings/booking-detail-inspector';
import {
  getBookingByReferenceAction,
  updateBookingDetailsAction,
} from '@/lib/services/admin-booking-actions';
import type { BookingRecord } from '@/types/booking';
import {
  fetchPaymentsAction,
  fetchPaymentStatsAction,
  exportPaymentsCsvAction,
  type ExtendedPaymentRecord,
} from '@/lib/services/admin-payment-actions';
import type { FinancialTotalsSummary } from '@/types/payment';

export function PaymentsShell() {
  const searchParams = useSearchParams();

  // Statistics State
  const [stats, setStats] = useState<FinancialTotalsSummary | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  // Table & Filter State initialized from URL search params
  const [payments, setPayments] = useState<ExtendedPaymentRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isPaymentsLoading, setIsPaymentsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(() => searchParams.get('status') || 'all');
  const [methodFilter, setMethodFilter] = useState(() => searchParams.get('method') || 'all');
  const [dateFilter, setDateFilter] = useState(() => searchParams.get('date') || 'all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(() => {
    const p = parseInt(searchParams.get('page') || '1', 10);
    return isNaN(p) || p < 1 ? 1 : p;
  });
  const [pageSize, setPageSize] = useState(() => {
    const s = parseInt(searchParams.get('pageSize') || '10', 10);
    return isNaN(s) || s < 5 ? 10 : s;
  });

  // Export State
  const [isExporting, setIsExporting] = useState(false);

  // Modals & Action State initialized from URL
  const modalParam = searchParams.get('modal');
  const initialBookingId = searchParams.get('bookingId') || undefined;

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(() => modalParam === 'record');
  const [isAgreedModalOpen, setIsAgreedModalOpen] = useState(() => modalParam === 'agreed');
  const [activeBookingIdForModal, setActiveBookingIdForModal] = useState<string | undefined>(initialBookingId);
  const [inspectPayment, setInspectPayment] = useState<ExtendedPaymentRecord | null>(null);
  const [proofPayment, setProofPayment] = useState<ExtendedPaymentRecord | null>(null);
  const [refundPayment, setRefundPayment] = useState<ExtendedPaymentRecord | null>(null);
  const [invoiceTarget, setInvoiceTarget] = useState<InvoiceBookingTarget | null>(null);

  // Booking Inspector Modal State
  const [inspectingBooking, setInspectingBooking] = useState<BookingRecord | null>(null);
  const inspectingModalRef = useRef<HTMLDivElement>(null);

  // Synchronize state with URL parameters
  const updateUrlParams = useCallback(
    (updates: Record<string, string | null | undefined>) => {
      syncUrlParams(updates);
    },
    []
  );

  const handleCloseInspectingBooking = useCallback(() => {
    setInspectingBooking(null);
    updateUrlParams({ modal: null, bookingRef: null });
  }, [updateUrlParams]);

  // Esc key and body scroll lock for Inspect Booking Modal
  useEffect(() => {
    if (!inspectingBooking) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseInspectingBooking();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [inspectingBooking, handleCloseInspectingBooking]);

  const handleInspectBackdropClick = (e: React.MouseEvent) => {
    if (inspectingModalRef.current && !inspectingModalRef.current.contains(e.target as Node)) {
      handleCloseInspectingBooking();
    }
  };

  // Date range calculation from preset
  const getDateRangeBounds = useCallback(() => {
    const now = new Date();
    if (dateFilter === 'this_month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      return { startDate: start, endDate: end };
    }
    if (dateFilter === 'last_month') {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
      const end = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
      return { startDate: start, endDate: end };
    }
    if (dateFilter === 'last_30_days') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      return { startDate: d.toISOString().split('T')[0], endDate: now.toISOString().split('T')[0] };
    }
    return { startDate: undefined, endDate: undefined };
  }, [dateFilter]);

  // Load stats
  const loadStats = useCallback(async () => {
    setIsStatsLoading(true);
    const res = await fetchPaymentStatsAction();
    if (res.success && res.stats) {
      setStats(res.stats);
    }
    setIsStatsLoading(false);
  }, []);

  // Load payments list
  const loadPayments = useCallback(async () => {
    setIsPaymentsLoading(true);
    const { startDate, endDate } = getDateRangeBounds();

    const res = await fetchPaymentsAction({
      page: currentPage,
      pageSize,
      search: searchQuery,
      status: statusFilter,
      method: methodFilter,
      startDate,
      endDate,
    });

    if (res.success && res.payments) {
      setPayments(res.payments);
      setTotalCount(res.totalCount || 0);
    }
    setIsPaymentsLoading(false);
  }, [currentPage, pageSize, searchQuery, statusFilter, methodFilter, getDateRangeBounds]);

  // Initial load
  useEffect(() => {
    let active = true;
    fetchPaymentStatsAction().then((res) => {
      if (active && res.success && res.stats) {
        setStats(res.stats);
        setIsStatsLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Debounced payments load on filter change
  useEffect(() => {
    const timer = setTimeout(() => {
      loadPayments();
    }, 250);
    return () => clearTimeout(timer);
  }, [loadPayments]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([loadStats(), loadPayments()]);
    setIsRefreshing(false);
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    const { startDate, endDate } = getDateRangeBounds();

    const res = await exportPaymentsCsvAction({
      search: searchQuery,
      status: statusFilter,
      method: methodFilter,
      startDate,
      endDate,
    });

    if (res.success && res.csvContent) {
      const blob = new Blob([res.csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', res.filename || 'casamento_payments.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      alert(res.error || 'Failed to CSV file.');
    }

    setIsExporting(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#2B3817]">
              Billing & Payments
            </h1>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1 text-stone-400 hover:text-stone-700 transition cursor-pointer"
              title="Refresh ledger"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Primary Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setIsAgreedModalOpen(true);
              updateUrlParams({ modal: 'agreed' });
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 shadow-xs transition cursor-pointer"
          >
            <FileText className="h-3.5 w-3.5 text-[#3A4F1C]" />
            <span>Agreed Total</span>
          </button>

          <button
            onClick={() => {
              setIsRecordModalOpen(true);
              updateUrlParams({ modal: 'record' });
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#3A4F1C] hover:bg-[#2B3817] text-white shadow-xs transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* 2. Top Statistics Cards */}
      <PaymentsStatsGrid stats={stats} isLoading={isStatsLoading} />

      {/* 3. Controls & Filter Bar */}
      <PaymentsFilterBar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
          updateUrlParams({ search: q || null, page: '1' });
        }}
        statusFilter={statusFilter}
        onStatusChange={(s) => {
          setStatusFilter(s);
          setCurrentPage(1);
          updateUrlParams({ status: s === 'all' ? null : s, page: '1' });
        }}
        methodFilter={methodFilter}
        onMethodChange={(m) => {
          setMethodFilter(m);
          setCurrentPage(1);
          updateUrlParams({ method: m === 'all' ? null : m, page: '1' });
        }}
        dateFilter={dateFilter}
        onDateFilterChange={(d) => {
          setDateFilter(d);
          setCurrentPage(1);
          updateUrlParams({ date: d === 'all' ? null : d, page: '1' });
        }}
        onExportCsv={handleExportCsv}
        isExporting={isExporting}
      />

      {/* 4. Payment Ledger Table */}
      <PaymentsTable
        payments={payments}
        totalCount={totalCount}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={(p) => {
          setCurrentPage(p);
          updateUrlParams({ page: p > 1 ? String(p) : null });
        }}
        onPageSizeChange={(sz) => {
          setPageSize(sz);
          setCurrentPage(1);
          updateUrlParams({ pageSize: sz !== 10 ? String(sz) : null, page: '1' });
        }}
        onInspectPayment={(p) => {
          setInspectPayment(p);
          updateUrlParams({ modal: 'inspect', paymentId: p.id });
        }}
        onViewProof={(p) => {
          setProofPayment(p);
          updateUrlParams({ modal: 'proof', paymentId: p.id });
        }}
        onRefundPayment={(p) => {
          setRefundPayment(p);
          updateUrlParams({ modal: 'refund', paymentId: p.id });
        }}
        onSendInvoice={(b) => {
          setInvoiceTarget(b);
          updateUrlParams({ modal: 'invoice', bookingId: b.bookingId });
        }}
        onViewBookingDetails={async (bookingRef) => {
          const res = await getBookingByReferenceAction(bookingRef);
          if (res.success && res.booking) {
            setInspectingBooking(res.booking);
            updateUrlParams({ modal: 'booking-detail', bookingRef });
          } else {
            alert(res.error || 'Failed to load booking details');
          }
        }}
        onRecordPaymentForBooking={(bookingId) => {
          setActiveBookingIdForModal(bookingId);
          setIsRecordModalOpen(true);
          updateUrlParams({ modal: 'record', bookingId });
        }}
        isLoading={isPaymentsLoading}
      />

      {/* 5. Modals */}
      <RecordPaymentModal
        isOpen={isRecordModalOpen}
        initialBookingId={activeBookingIdForModal}
        onClose={() => {
          setIsRecordModalOpen(false);
          setActiveBookingIdForModal(undefined);
          updateUrlParams({ modal: null, bookingId: null });
        }}
        onSuccess={() => {
          loadStats();
          loadPayments();
        }}
      />

      <SetAgreedTotalModal
        isOpen={isAgreedModalOpen}
        initialBookingId={activeBookingIdForModal}
        onClose={() => {
          setIsAgreedModalOpen(false);
          setActiveBookingIdForModal(undefined);
          updateUrlParams({ modal: null, bookingId: null });
        }}
        onSuccess={() => {
          loadStats();
          loadPayments();
        }}
      />

      <PaymentInspectorModal
        payment={inspectPayment}
        allBookingPayments={payments.filter(
          (p) => inspectPayment && p.booking_id === inspectPayment.booking_id
        )}
        isOpen={Boolean(inspectPayment)}
        onClose={() => {
          setInspectPayment(null);
          updateUrlParams({ modal: null, paymentId: null });
        }}
        onViewProof={(p) => {
          setProofPayment(p);
          updateUrlParams({ modal: 'proof', paymentId: p.id });
        }}
        onRefund={(p) => {
          setRefundPayment(p);
          updateUrlParams({ modal: 'refund', paymentId: p.id });
        }}
        onSendInvoice={() => {
          if (inspectPayment) {
            setInvoiceTarget({
              bookingId: inspectPayment.booking_id,
              bookingReference: inspectPayment.booking_reference,
              clientFullName: inspectPayment.booking?.client_full_name || 'Client',
              clientEmail: inspectPayment.booking?.client_email || '',
              serviceTitle: inspectPayment.booking?.service_title || 'Service',
              agreedTotalCentavos: inspectPayment.booking?.agreed_total_centavos ?? null,
              remainingBalanceCentavos: inspectPayment.booking?.remaining_balance_centavos ?? null,
            });
            setInspectPayment(null);
            updateUrlParams({ modal: 'invoice', bookingId: inspectPayment.booking_id });
          }
        }}
      />

      <ProofViewerModal
        payment={proofPayment}
        isOpen={Boolean(proofPayment)}
        onClose={() => {
          setProofPayment(null);
          updateUrlParams({ modal: null, paymentId: null });
        }}
      />

      <RefundPaymentModal
        key={refundPayment?.id || 'refund-modal'}
        payment={refundPayment}
        isOpen={Boolean(refundPayment)}
        onClose={() => {
          setRefundPayment(null);
          updateUrlParams({ modal: null, paymentId: null });
        }}
        onSuccess={() => {
          loadStats();
          loadPayments();
        }}
      />

      <SendPaymentInvoiceModal
        key={invoiceTarget?.bookingId || 'send-invoice-modal'}
        booking={invoiceTarget}
        isOpen={Boolean(invoiceTarget)}
        onClose={() => {
          setInvoiceTarget(null);
          updateUrlParams({ modal: null, bookingId: null });
        }}
        onSuccess={() => {
          loadPayments();
        }}
      />

      {/* Booking Detail Inspector Modal (Single-Layer) */}
      {inspectingBooking && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={handleInspectBackdropClick}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
        >
          <div
            ref={inspectingModalRef}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl my-4 max-h-[92vh] overflow-hidden shadow-2xl rounded-2xl"
          >
            <BookingDetailInspector
              booking={inspectingBooking}
              bookingsRedirectUrl={`/admin/bookings?date=${inspectingBooking.event_date}&bookingId=${inspectingBooking.id}&modal=inspect`}
              onAccept={async () => { }}
              onReject={async () => { }}
              onUpdate={async (params) => {
                const res = await updateBookingDetailsAction({
                  bookingId: inspectingBooking.id,
                  updates: params.updates,
                  notifyClient: params.notifyClient,
                  adminMessage: params.adminMessage,
                });
                if (res.success && res.booking) {
                  setInspectingBooking(res.booking);
                  loadPayments();
                }
              }}
              onClose={handleCloseInspectingBooking}
            />
          </div>
        </div>
      )}
    </div>
  );
}
