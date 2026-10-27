'use client';

// =============================================================================
// components/admin/payments/payments-filter-bar.tsx — Filter & Action Bar
// =============================================================================

import React, { useRef, useState, useEffect } from 'react';
import {
  Search,
  Download,
  X,
  ChevronDown,
  RotateCcw,
  Calendar,
} from 'lucide-react';
import { PAYMENT_METHODS } from '@/types/payment';

interface PaymentsFilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusChange: (val: string) => void;
  methodFilter: string;
  onMethodChange: (val: string) => void;
  dateFilter: string;
  onDateFilterChange: (val: string) => void;
  startDate?: string;
  endDate?: string;
  onCustomDateChange: (start: string, end: string) => void;
  onExportCsv: () => void;
  isExporting?: boolean;
}

export function PaymentsFilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  methodFilter,
  onMethodChange,
  dateFilter,
  onDateFilterChange,
  startDate = '',
  endDate = '',
  onCustomDateChange,
  onExportCsv,
  isExporting = false,
}: PaymentsFilterBarProps) {
  const [activeDropdown, setActiveDropdown] = useState<'status' | 'method' | 'date' | null>(null);
  const filterGroupRef = useRef<HTMLDivElement>(null);

  // Local state for custom date range picker inputs
  const [customStart, setCustomStart] = useState(startDate);
  const [customEnd, setCustomEnd] = useState(endDate);
  const [prevProps, setPrevProps] = useState({ startDate, endDate });

  if (prevProps.startDate !== startDate || prevProps.endDate !== endDate) {
    setPrevProps({ startDate, endDate });
    setCustomStart(startDate);
    setCustomEnd(endDate);
  }

  // Close dropdown on outside click or escape key
  useEffect(() => {
    if (!activeDropdown) return;

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(`[data-filter-dropdown="${activeDropdown}"]`)) {
        setActiveDropdown(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeDropdown]);

  const isAllStatus = !statusFilter || statusFilter === 'all' || statusFilter === 'all status';
  const isAllMethod = !methodFilter || methodFilter === 'all' || methodFilter === 'all payment';
  const isAllDate = (!dateFilter || dateFilter === 'all' || dateFilter === 'all date') && !startDate && !endDate;

  const hasActiveFilters =
    !isAllStatus || !isAllMethod || !isAllDate || searchQuery.trim().length > 0;

  const handleResetFilters = () => {
    onSearchChange('');
    onStatusChange('all');
    onMethodChange('all');
    onDateFilterChange('all');
    onCustomDateChange('', '');
    setCustomStart('');
    setCustomEnd('');
    setActiveDropdown(null);
  };

  const getStatusLabel = (val: string) => {
    if (!val || val === 'all' || val === 'all status') return 'All Status';
    if (val === 'paid') return 'Paid';
    if (val === 'partially_paid') return 'Partially Paid';
    if (val === 'refunded') return 'Refunded';
    if (val === 'unpaid') return 'Unpaid';
    if (val === 'undeclared') return 'Undeclared';
    return val;
  };

  const getMethodLabel = (val: string) => {
    if (!val || val === 'all' || val === 'all payment') return 'All Payment';
    if (val === 'bank_transfer') return 'Bank Transfer';
    if (val === 'gcash') return 'GCash';
    if (val === 'maya') return 'Maya';
    if (val === 'cash') return 'Cash';
    if (val === 'dragonpay') return 'Dragonpay';
    if (val === 'paypal') return 'PayPal';
    return val;
  };

  const getDateLabel = (val: string) => {
    if (val === 'custom' || (startDate && endDate)) {
      if (startDate && endDate) {
        return `${startDate} to ${endDate}`;
      }
      return 'Custom Range';
    }
    if (!val || val === 'all' || val === 'all date') return 'All Date';
    if (val === 'this_month') return 'This Month';
    if (val === 'last_month') return 'Last Month';
    if (val === 'last_30_days') return 'Last 30 Days';
    return val;
  };

  const handleApplyCustomRange = (e: React.FormEvent) => {
    e.preventDefault();
    if (customStart && customEnd) {
      onCustomDateChange(customStart, customEnd);
      setActiveDropdown(null);
    }
  };

  return (
    <div
      className="p-3.5 sm:p-5 border-b border-[#3A4F1C]/15 bg-white flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 relative z-30"
    >
      {/* Left: Search input */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by Payment #, Receipt #, Client name, Booking ref..."
          className="w-full pl-9 pr-8 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#3A4F1C] focus:bg-white text-stone-800 placeholder-stone-400 transition"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
            title="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Middle: Icon-based compact dropdowns */}
      <div ref={filterGroupRef} className="flex flex-wrap items-center gap-2">
        {/* Reset button (visible only when active filters exist) */}
        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-stone-500 hover:text-stone-800 transition cursor-pointer"
            title="Reset filters"
          >
            <RotateCcw className="h-3 w-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}

        {/* Status Dropdown */}
        <div className="relative" data-filter-dropdown="status">
          <button
            type="button"
            onClick={() => setActiveDropdown(activeDropdown === 'status' ? null : 'status')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition cursor-pointer ${
              !isAllStatus
                ? 'bg-[#3A4F1C]/10 border-[#3A4F1C]/30 text-[#2B3817]'
                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <ChevronDown
              className={`h-3 w-3 text-stone-400 ml-0.5 transition-transform duration-150 ${
                activeDropdown === 'status' ? 'rotate-180' : ''
              }`}
            />
            <span>{getStatusLabel(statusFilter)}</span>
          </button>

          {activeDropdown === 'status' && (
            <div className="absolute left-0 mt-1.5 w-44 rounded-xl border border-stone-200 bg-white py-1 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
              {[
                { id: 'all', label: 'All' },
                { id: 'paid', label: 'Paid' },
                { id: 'partially_paid', label: 'Partially Paid' },
                { id: 'refunded', label: 'Refunded' },
                { id: 'unpaid', label: 'Unpaid' },
                { id: 'undeclared', label: 'Undeclared' },
              ].map((opt) => {
                const isSelected = opt.id === 'all' ? isAllStatus : statusFilter === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      onStatusChange(opt.id);
                      setActiveDropdown(null);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-stone-50 transition cursor-pointer ${
                      isSelected
                        ? 'font-semibold text-[#2B3817] bg-[#3A4F1C]/5'
                        : 'text-stone-700'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-[#3A4F1C]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Method Dropdown */}
        <div className="relative" data-filter-dropdown="method">
          <button
            type="button"
            onClick={() => setActiveDropdown(activeDropdown === 'method' ? null : 'method')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition cursor-pointer ${
              !isAllMethod
                ? 'bg-[#3A4F1C]/10 border-[#3A4F1C]/30 text-[#2B3817]'
                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <ChevronDown
              className={`h-3 w-3 text-stone-400 ml-0.5 transition-transform duration-150 ${
                activeDropdown === 'method' ? 'rotate-180' : ''
              }`}
            />
            <span>{getMethodLabel(methodFilter)}</span>
          </button>

          {activeDropdown === 'method' && (
            <div className="absolute left-0 mt-1.5 w-44 rounded-xl border border-stone-200 bg-white py-1 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => {
                  onMethodChange('all');
                  setActiveDropdown(null);
                }}
                className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-stone-50 transition cursor-pointer ${
                  isAllMethod
                    ? 'font-semibold text-[#2B3817] bg-[#3A4F1C]/5'
                    : 'text-stone-700'
                }`}
              >
                <span>All</span>
                {isAllMethod && <span className="h-1.5 w-1.5 rounded-full bg-[#3A4F1C]" />}
              </button>
              {PAYMENT_METHODS.map((method) => {
                const isSelected = methodFilter === method;
                return (
                  <button
                    key={method}
                    onClick={() => {
                      onMethodChange(method);
                      setActiveDropdown(null);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-stone-50 transition cursor-pointer ${
                      isSelected
                        ? 'font-semibold text-[#2B3817] bg-[#3A4F1C]/5'
                        : 'text-stone-700'
                    }`}
                  >
                    <span className="capitalize">{method.replace('_', ' ')}</span>
                    {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-[#3A4F1C]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Date Dropdown */}
        <div className="relative" data-filter-dropdown="date">
          <button
            type="button"
            onClick={() => setActiveDropdown(activeDropdown === 'date' ? null : 'date')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition cursor-pointer ${
              !isAllDate
                ? 'bg-[#3A4F1C]/10 border-[#3A4F1C]/30 text-[#2B3817]'
                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <ChevronDown
              className={`h-3 w-3 text-stone-400 ml-0.5 transition-transform duration-150 ${
                activeDropdown === 'date' ? 'rotate-180' : ''
              }`}
            />
            <span className="max-w-[140px] sm:max-w-[180px] truncate">{getDateLabel(dateFilter)}</span>
          </button>

          {activeDropdown === 'date' && (
            <div className="absolute right-0 sm:left-auto sm:right-0 mt-1.5 w-64 sm:w-72 rounded-2xl border border-stone-200 bg-white p-2.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="space-y-0.5 mb-2">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'this_month', label: 'This Month' },
                  { id: 'last_month', label: 'Last Month' },
                  { id: 'last_30_days', label: 'Last 30 Days' },
                ].map((opt) => {
                  const isSelected = opt.id === 'all' ? isAllDate : dateFilter === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        onDateFilterChange(opt.id);
                        onCustomDateChange('', '');
                        setCustomStart('');
                        setCustomEnd('');
                        setActiveDropdown(null);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs rounded-lg flex items-center justify-between hover:bg-stone-50 transition cursor-pointer ${
                        isSelected
                          ? 'font-semibold text-[#2B3817] bg-[#3A4F1C]/5'
                          : 'text-stone-700'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-[#3A4F1C]" />}
                    </button>
                  );
                })}
              </div>

              {/* Custom Date Range Section */}
              <div className="pt-2.5 border-t border-stone-100">
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2 px-1">
                  <Calendar className="h-3 w-3 text-stone-400" />
                  <span>Custom Date Range</span>
                </div>
                <form onSubmit={handleApplyCustomRange} className="space-y-2 px-1">
                  <div>
                    <label className="text-[10px] text-stone-500 font-medium block mb-0.5">Start Date</label>
                    <input
                      type="date"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-[#3A4F1C] focus:bg-white transition"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-500 font-medium block mb-0.5">End Date</label>
                    <input
                      type="date"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-[#3A4F1C] focus:bg-white transition"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={!customStart || !customEnd}
                      className="flex-1 px-3 py-1.5 bg-[#3A4F1C] hover:bg-[#2B3817] text-white text-xs font-semibold rounded-lg shadow-xs transition disabled:opacity-40 cursor-pointer"
                    >
                      Apply Range
                    </button>
                    {(startDate || endDate) && (
                      <button
                        type="button"
                        onClick={() => {
                          onCustomDateChange('', '');
                          setCustomStart('');
                          setCustomEnd('');
                          onDateFilterChange('all');
                          setActiveDropdown(null);
                        }}
                        className="px-2.5 py-1.5 text-xs text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Right: CSV Button */}
        <div className="flex items-center">
          <button
            onClick={onExportCsv}
            disabled={isExporting}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 transition cursor-pointer disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5 text-stone-600" />
            <span>{isExporting ? 'Exporting...' : 'CSV'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
