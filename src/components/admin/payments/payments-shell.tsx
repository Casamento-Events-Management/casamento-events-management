'use client';

// =============================================================================
// components/admin/payments/payments-shell.tsx — Main Payments Dashboard Shell
// =============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, FileText, RefreshCw } from 'lucide-react';
import { PaymentsStatsGrid } from './payments-stats-grid';
import { PaymentsFilterBar } from './payments-filter-bar';
import { PaymentsTable } from './payments-table';
import { RecordPaymentModal } from './modals/record-payment-modal';
import { SetAgreedTotalModal } from './modals/set-agreed-total-modal';
import { PaymentInspectorModal } from './modals/payment-inspector-modal';
import { ProofViewerModal } from './modals/proof-viewer-modal';
import { RefundPaymentModal } from './modals/refund-payment-modal';
import { ResendReceiptModal } from './modals/resend-receipt-modal';
import {
  fetchPaymentsAction,
  fetchPaymentStatsAction,
  exportPaymentsCsvAction,
  type ExtendedPaymentRecord,
} from '@/lib/services/admin-payment-actions';
import type { FinancialTotalsSummary } from '@/types/payment';

export function PaymentsShell() {
  // Statistics State
  const [stats, setStats] = useState<FinancialTotalsSummary | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  // Table & Filter State
  const [payments, setPayments] = useState<ExtendedPaymentRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isPaymentsLoading, setIsPaymentsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Export State
  const [isExporting, setIsExporting] = useState(false);

  // Modals State
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isAgreedModalOpen, setIsAgreedModalOpen] = useState(false);
  const [inspectPayment, setInspectPayment] = useState<ExtendedPaymentRecord | null>(null);
  const [proofPayment, setProofPayment] = useState<ExtendedPaymentRecord | null>(null);
  const [refundPayment, setRefundPayment] = useState<ExtendedPaymentRecord | null>(null);
  const [resendPayment, setResendPayment] = useState<ExtendedPaymentRecord | null>(null);

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
      alert(res.error || 'Failed to export CSV file.');
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
          <p className="mt-0.5 text-xs text-stone-500 font-light">
            Record manual payments, monitor booking balances, issue receipts, and track revenue.
          </p>
        </div>

        {/* Primary Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAgreedModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 shadow-xs transition cursor-pointer"
          >
            <FileText className="h-3.5 w-3.5 text-[#3A4F1C]" />
            <span>Agreed Total</span>
          </button>

          <button
            onClick={() => setIsRecordModalOpen(true)}
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
        }}
        statusFilter={statusFilter}
        onStatusChange={(s) => {
          setStatusFilter(s);
          setCurrentPage(1);
        }}
        methodFilter={methodFilter}
        onMethodChange={(m) => {
          setMethodFilter(m);
          setCurrentPage(1);
        }}
        dateFilter={dateFilter}
        onDateFilterChange={(d) => {
          setDateFilter(d);
          setCurrentPage(1);
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
        onPageChange={setCurrentPage}
        onPageSizeChange={(sz) => {
          setPageSize(sz);
          setCurrentPage(1);
        }}
        onInspectPayment={setInspectPayment}
        onViewProof={setProofPayment}
        onRefundPayment={setRefundPayment}
        onResendReceipt={setResendPayment}
        isLoading={isPaymentsLoading}
      />

      {/* 5. Modals */}
      <RecordPaymentModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onSuccess={() => {
          loadStats();
          loadPayments();
        }}
      />

      <SetAgreedTotalModal
        isOpen={isAgreedModalOpen}
        onClose={() => setIsAgreedModalOpen(false)}
        onSuccess={() => {
          loadStats();
          loadPayments();
        }}
      />

      <PaymentInspectorModal
        payment={inspectPayment}
        isOpen={Boolean(inspectPayment)}
        onClose={() => setInspectPayment(null)}
        onViewProof={(p) => setProofPayment(p)}
        onRefund={(p) => setRefundPayment(p)}
        onResendReceipt={(p) => setResendPayment(p)}
      />

      <ProofViewerModal
        payment={proofPayment}
        isOpen={Boolean(proofPayment)}
        onClose={() => setProofPayment(null)}
      />

      <RefundPaymentModal
        key={refundPayment?.id || 'refund-modal'}
        payment={refundPayment}
        isOpen={Boolean(refundPayment)}
        onClose={() => setRefundPayment(null)}
        onSuccess={() => {
          loadStats();
          loadPayments();
        }}
      />

      <ResendReceiptModal
        key={resendPayment?.id || 'resend-modal'}
        payment={resendPayment}
        isOpen={Boolean(resendPayment)}
        onClose={() => setResendPayment(null)}
        onSuccess={() => {
          loadPayments();
        }}
      />
    </div>
  );
}
