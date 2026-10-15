'use client';

// =============================================================================
// components/admin/audit/audit-table.tsx — Administrative Audit Trail Viewer
//
// Direct PostgREST browser polling (Zero Vercel Function Invocations).
// Includes 60s visibility-aware polling, manual refresh button, capped exports,
// 5 icon-based dropdown filters (including activity scope preset), and table scrolling.
// =============================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  RefreshCw,
  Download,
  AlertTriangle,
  FileDiff,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ExternalLink,
  SlidersHorizontal,
  Layers,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  ChevronDown,
  X,
  Check,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { AuditLogEntry } from '@/types/admin-auth';
import { recordExportAuditAction } from '@/lib/services/admin-audit-actions';
import { AuditDiffModal } from './audit-diff-modal';
import { AuditMetadataModal } from './audit-metadata-modal';
import { AuditBookingTimelineModal } from './audit-booking-timeline-modal';

type PresetTab = 'all' | 'needs_attention' | 'bookings' | 'team';
type FilterDropdown = 'preset' | 'category' | 'severity' | 'outcome' | 'date' | 'export' | null;

export function AuditTable() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());

  // Filter States
  const [activeTab, setActiveTab] = useState<PresetTab>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all');

  // Active Icon Dropdown State
  const [openDropdown, setOpenDropdown] = useState<FilterDropdown>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  // Pagination
  const [page, setPage] = useState<number>(1);
  const pageSize = 25;

  // Trigger counter for manual refreshes and polling
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Modals state
  const [diffLog, setDiffLog] = useState<AuditLogEntry | null>(null);
  const [metaLog, setMetaLog] = useState<AuditLogEntry | null>(null);
  const [timelineRef, setTimelineRef] = useState<string | null>(null);

  /**
   * Escape key listener to close modals and dropdowns
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (openDropdown) {
          setOpenDropdown(null);
        } else if (diffLog) {
          setDiffLog(null);
        } else if (metaLog) {
          setMetaLog(null);
        } else if (timelineRef) {
          setTimelineRef(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openDropdown, diffLog, metaLog, timelineRef]);

  /**
   * Click-outside handler to close active filter dropdown
   */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideFilters = dropdownRef.current?.contains(target);
      const insideExport = exportDropdownRef.current?.contains(target);
      if (!insideFilters && !insideExport) {
        setOpenDropdown(null);
      }
    };
    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  /**
   * Fetches audit logs directly from Supabase PostgREST
   */
  useEffect(() => {
    let isCancelled = false;

    async function loadAuditLogs() {
      try {
        const supabase = createClient();
        let query = supabase
          .from('audit_logs')
          .select('*, audit_log_acknowledgments(*)', { count: 'exact' });

        // Apply Preset Tab Filters
        if (activeTab === 'needs_attention') {
          query = query.in('severity', ['Warning', 'Critical']);
        } else if (activeTab === 'bookings') {
          query = query.eq('category', 'Booking');
        } else if (activeTab === 'team') {
          query = query.in('category', ['Team', 'Authentication']);
        }

        // Apply Explicit Filters
        if (categoryFilter !== 'all') {
          query = query.eq('category', categoryFilter);
        }
        if (severityFilter !== 'all') {
          query = query.eq('severity', severityFilter);
        }
        if (outcomeFilter !== 'all') {
          query = query.eq('outcome', outcomeFilter);
        }

        // Date Range Filter
        if (dateRangeFilter === 'today') {
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);
          query = query.gte('created_at', todayStart.toISOString());
        } else if (dateRangeFilter === '7d') {
          const d7 = new Date();
          d7.setDate(d7.getDate() - 7);
          query = query.gte('created_at', d7.toISOString());
        } else if (dateRangeFilter === '30d') {
          const d30 = new Date();
          d30.setDate(d30.getDate() - 30);
          query = query.gte('created_at', d30.toISOString());
        }

        // Free-text Search
        if (searchQuery.trim()) {
          const term = searchQuery.trim();
          query = query.or(
            `summary.ilike.%${term}%,entity_ref.ilike.%${term}%,actor_code.ilike.%${term}%,actor_name.ilike.%${term}%`
          );
        }

        // Pagination & Ordering
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data, count, error } = await query
          .order('created_at', { ascending: false })
          .range(from, to);

        if (!isCancelled) {
          if (error) {
            console.error('[fetchAuditLogs Error]:', error);
          } else {
            let entries = (data as unknown as AuditLogEntry[]) || [];

            // If in "needs_attention" preset, filter out entries that have acknowledgments
            if (activeTab === 'needs_attention') {
              entries = entries.filter((item) => {
                const acks = Array.isArray(item.audit_log_acknowledgments)
                  ? item.audit_log_acknowledgments
                  : item.audit_log_acknowledgments
                  ? [item.audit_log_acknowledgments]
                  : [];
                return acks.length === 0;
              });
            }

            setLogs(entries);
            setTotalCount(count || 0);
            setLastRefreshedAt(new Date());
          }
          setIsLoading(false);
          setIsRefreshing(false);
        }
      } catch (err) {
        console.error('[fetchAuditLogs Exception]:', err);
        if (!isCancelled) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    }

    void loadAuditLogs();

    return () => {
      isCancelled = true;
    };
  }, [
    activeTab,
    categoryFilter,
    severityFilter,
    outcomeFilter,
    dateRangeFilter,
    searchQuery,
    page,
    refreshTrigger,
  ]);

  // Background 60s Polling with Page Visibility API
  useEffect(() => {
    const POLL_INTERVAL_MS = 60000; // 60 seconds

    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        setRefreshTrigger((prev) => prev + 1);
      }
    }, POLL_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setRefreshTrigger((prev) => prev + 1);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setRefreshTrigger((prev) => prev + 1);
  };

  /**
   * Capped Client-side CSV / JSON Export (Max 10,000 rows)
   */
  const handleExport = async (format: 'csv' | 'json') => {
    setIsExporting(true);
    try {
      const supabase = createClient();
      const EXPORT_CAP = 10000;

      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(EXPORT_CAP);

      if (error || !data) {
        alert('Failed to generate export: ' + (error?.message || 'No data'));
        setIsExporting(false);
        return;
      }

      const rows = data as unknown as AuditLogEntry[];

      if (format === 'json') {
        const jsonBlob = new Blob([JSON.stringify(rows, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(jsonBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `casamento-audit-logs-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // CSV Generation
        const headers = [
          'Date Time',
          'User Code',
          'User Name',
          'Email',
          'Actor Type',
          'Category',
          'Action',
          'Severity',
          'Outcome',
          'Summary',
          'Entity Ref',
          'IP Address',
          'User Agent',
        ];

        const escapeCsv = (str: unknown): string => {
          if (str === null || str === undefined) return '""';
          const val = String(str).replace(/"/g, '""');
          return `"${val}"`;
        };

        const csvLines = [headers.join(',')];
        for (const row of rows) {
          csvLines.push(
            [
              escapeCsv(format12Hour(row.created_at)),
              escapeCsv(row.actor_code),
              escapeCsv(row.actor_name),
              escapeCsv(row.actor_email),
              escapeCsv(row.actor_type),
              escapeCsv(row.category),
              escapeCsv(row.action),
              escapeCsv(row.severity),
              escapeCsv(row.outcome),
              escapeCsv(row.summary),
              escapeCsv(row.entity_ref),
              escapeCsv(row.ip_address),
              escapeCsv(row.user_agent),
            ].join(',')
          );
        }

        const csvBlob = new Blob([csvLines.join('\n')], {
          type: 'text/csv;charset=utf-8;',
        });
        const url = URL.createObjectURL(csvBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `casamento-audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }

      // Record export event for audit compliance
      await recordExportAuditAction(rows.length, format, {
        activeTab,
        categoryFilter,
        severityFilter,
        dateRangeFilter,
      });
    } catch (err) {
      console.error('[handleExport Error]:', err);
      alert('Error during export generation.');
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * 12-Hour Clock Formatter (MM/DD/YYYY, hh:mm AM/PM)
   */
  const format12Hour = (dateStr: string): string => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const hasActiveFilters =
    activeTab !== 'all' ||
    categoryFilter !== 'all' ||
    severityFilter !== 'all' ||
    outcomeFilter !== 'all' ||
    dateRangeFilter !== 'all';

  const resetAllFilters = () => {
    setActiveTab('all');
    setCategoryFilter('all');
    setSeverityFilter('all');
    setOutcomeFilter('all');
    setDateRangeFilter('all');
    setPage(1);
    setOpenDropdown(null);
  };

  return (
    <div className="space-y-6">
      {/* =====================================================================
          UNIFIED CARD: Header, Controls, Table & Pagination in One Card
         ===================================================================== */}
      <div className="rounded-2xl border border-[#3A4F1C]/15 bg-white shadow-sm overflow-hidden">
        {/* Top Header & Controls Area */}
        <div className="p-3.5 sm:p-5 space-y-3.5">
          {/* Row 1: Title on the Left, Action Buttons STRICTLY on the Right */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-lg font-serif font-bold text-[#2B3817] sm:text-2xl">
                Audit Trail & Activity Log
              </h1>
              <p className="mt-0.5 text-[11px] sm:text-xs text-[#2B3817]/70">
                Last synced:{' '}
                <span className="font-mono text-[10px] sm:text-[11px] font-semibold text-[#3A4F1C]">
                  {format12Hour(lastRefreshedAt.toISOString())}
                </span>
              </p>
            </div>

            {/* Action Buttons: Pinned to Top-Right across all screen sizes */}
            <div className="shrink-0 flex items-center justify-end gap-1.5 sm:gap-2 ml-auto">
              {/* Manual Refresh Button */}
              <button
                type="button"
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="flex h-8 items-center gap-1.5 rounded-lg border border-[#3A4F1C]/20 bg-white px-2.5 sm:px-3 text-[11px] sm:text-xs font-medium text-[#2B3817] shadow-xs hover:bg-[#3A4F1C]/5 transition disabled:opacity-50 cursor-pointer"
                title="Refresh Activity Now"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-[#3A4F1C]' : ''}`}
                />
                <span className="hidden sm:inline">
                  {isRefreshing ? '...' : ''}
                </span>
              </button>

              {/* Export Options Dropdown Select (Icon Only) */}
              <div ref={exportDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdown(openDropdown === 'export' ? null : 'export')
                  }
                  disabled={isExporting}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#3A4F1C]/20 bg-white text-[#2B3817] shadow-xs hover:bg-[#3A4F1C]/5 transition disabled:opacity-50 cursor-pointer"
                  title="Export options (CSV / JSON)"
                  aria-label="Export options"
                >
                  {isExporting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[#3A4F1C]" />
                  ) : (
                    <Download className="h-3.5 w-3.5 text-[#3A4F1C]" />
                  )}
                </button>

                {openDropdown === 'export' && (
                  <div className="absolute right-0 top-full mt-1.5 z-40 w-36 rounded-xl border border-[#3A4F1C]/20 bg-white p-1.5 shadow-lg animate-fade-in origin-top">
                    <p className="px-2 py-1 text-[10px] font-semibold text-[#2B3817]/50 uppercase tracking-wider">
                      Export Data
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenDropdown(null);
                        void handleExport('csv');
                      }}
                      disabled={isExporting}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-left text-[#2B3817] hover:bg-[#FAF8F2] transition cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5 text-[#3A4F1C]" />
                      <span>Export CSV</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenDropdown(null);
                        void handleExport('json');
                      }}
                      disabled={isExporting}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-left text-[#2B3817] hover:bg-[#FAF8F2] transition cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5 text-[#3A4F1C]" />
                      <span>Export JSON</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Row 2: Search Bar (Left) and 5 Filter Buttons (RIGHT SIDE) in 1 Grid Row (1 grid-x) on iPad / Desktop */}
          <div
            ref={dropdownRef}
            className="grid grid-cols-1 md:grid-cols-[1fr_auto] items-center gap-2 sm:gap-2.5 pt-1"
          >
            {/* Search Input: Dynamic 1fr on Left */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#2B3817]/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search summary, ref (CAS-...), or actor..."
                className="w-full rounded-lg border border-[#3A4F1C]/20 bg-[#FAF8F2] pl-8 sm:pl-9 pr-3 py-1.5 sm:py-2 text-[11px] sm:text-xs text-[#2B3817] placeholder:text-[#2B3817]/40 focus:border-[#3A4F1C] focus:bg-white focus:outline-none"
              />
            </div>

            {/* 5 Filter Icon Buttons + Reset: STRICTLY PINNED AT THE RIGHT SIDE */}
            <div className="flex items-center justify-end gap-1 sm:gap-1.5 md:gap-2 flex-wrap md:flex-nowrap ml-auto shrink-0 w-full md:w-auto">
              {/* Filter 1: Activity View / Presets Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdown(openDropdown === 'preset' ? null : 'preset')
                  }
                  className={`flex items-center gap-1 sm:gap-1.5 rounded-lg border px-2 sm:px-2.5 py-1.5 text-[11px] sm:text-xs font-medium transition cursor-pointer shadow-2xs ${
                    activeTab !== 'all'
                      ? 'border-[#3A4F1C] bg-[#3A4F1C] text-white'
                      : 'border-[#3A4F1C]/20 bg-white text-[#2B3817] hover:bg-[#3A4F1C]/5'
                  }`}
                  title="Activity View Preset"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" />
                  <span className="hidden sm:inline">
                    {activeTab === 'all'
                      ? 'View'
                      : activeTab === 'needs_attention'
                      ? 'Attention'
                      : activeTab === 'bookings'
                      ? 'Bookings'
                      : 'Team'}
                  </span>
                  <ChevronDown className="h-3 w-3 opacity-70 shrink-0" />
                </button>

                {openDropdown === 'preset' && (
                  <div className="absolute left-0 md:left-auto md:right-0 top-full mt-1.5 z-40 w-48 rounded-xl border border-[#3A4F1C]/20 bg-white p-1.5 shadow-lg animate-fade-in origin-top">
                    <p className="px-2 py-1 text-[10px] font-semibold text-[#2B3817]/50 uppercase tracking-wider">
                      Activity Scope
                    </p>
                    {[
                      { key: 'all', label: 'All Activity' },
                      { key: 'needs_attention', label: 'Needs Attention', isAlert: true },
                      { key: 'bookings', label: 'Bookings Only' },
                      { key: 'team', label: 'Team & Auth' },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => {
                          setActiveTab(tab.key as PresetTab);
                          setPage(1);
                          setOpenDropdown(null);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-left transition cursor-pointer ${
                          activeTab === tab.key
                            ? 'bg-[#3A4F1C]/10 font-semibold text-[#3A4F1C]'
                            : 'text-[#2B3817] hover:bg-[#FAF8F2]'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          {tab.isAlert && <AlertTriangle className="h-3 w-3 text-amber-600" />}
                          <span>{tab.label}</span>
                        </span>
                        {activeTab === tab.key && (
                          <Check className="h-3.5 w-3.5 text-[#3A4F1C]" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Filter 2: Category Filter Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdown(openDropdown === 'category' ? null : 'category')
                  }
                  className={`flex items-center gap-1 sm:gap-1.5 rounded-lg border px-2 sm:px-2.5 py-1.5 text-[11px] sm:text-xs font-medium transition cursor-pointer shadow-2xs ${
                    categoryFilter !== 'all'
                      ? 'border-[#3A4F1C] bg-[#3A4F1C] text-white'
                      : 'border-[#3A4F1C]/20 bg-white text-[#2B3817] hover:bg-[#3A4F1C]/5'
                  }`}
                  title="Filter by Category"
                >
                  <Layers className="h-3.5 w-3.5 shrink-0" />
                  <span className="hidden sm:inline">
                    {categoryFilter === 'all' ? 'Category' : categoryFilter}
                  </span>
                  <ChevronDown className="h-3 w-3 opacity-70 shrink-0" />
                </button>

                {openDropdown === 'category' && (
                  <div className="absolute left-0 md:left-auto md:right-0 top-full mt-1.5 z-40 w-48 rounded-xl border border-[#3A4F1C]/20 bg-white p-1.5 shadow-lg animate-fade-in origin-top">
                    <p className="px-2 py-1 text-[10px] font-semibold text-[#2B3817]/50 uppercase tracking-wider">
                      Filter Category
                    </p>
                    {[
                      'all',
                      'Booking',
                      'Team',
                      'Authentication',
                      'Payment',
                      'Security',
                      'System',
                    ].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setCategoryFilter(cat);
                          setPage(1);
                          setOpenDropdown(null);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-left transition cursor-pointer ${
                          categoryFilter === cat
                            ? 'bg-[#3A4F1C]/10 font-semibold text-[#3A4F1C]'
                            : 'text-[#2B3817] hover:bg-[#FAF8F2]'
                        }`}
                      >
                        <span>{cat === 'all' ? 'All Categories' : cat}</span>
                        {categoryFilter === cat && <Check className="h-3.5 w-3.5 text-[#3A4F1C]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Filter 3: Severity Filter Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdown(openDropdown === 'severity' ? null : 'severity')
                  }
                  className={`flex items-center gap-1 sm:gap-1.5 rounded-lg border px-2 sm:px-2.5 py-1.5 text-[11px] sm:text-xs font-medium transition cursor-pointer shadow-2xs ${
                    severityFilter !== 'all'
                      ? 'border-[#3A4F1C] bg-[#3A4F1C] text-white'
                      : 'border-[#3A4F1C]/20 bg-white text-[#2B3817] hover:bg-[#3A4F1C]/5'
                  }`}
                  title="Filter by Severity"
                >
                  <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                  <span className="hidden sm:inline">
                    {severityFilter === 'all' ? 'Severity' : severityFilter}
                  </span>
                  <ChevronDown className="h-3 w-3 opacity-70 shrink-0" />
                </button>

                {openDropdown === 'severity' && (
                  <div className="absolute right-0 top-full mt-1.5 z-40 w-40 rounded-xl border border-[#3A4F1C]/20 bg-white p-1.5 shadow-lg animate-fade-in origin-top">
                    <p className="px-2 py-1 text-[10px] font-semibold text-[#2B3817]/50 uppercase tracking-wider">
                      Filter Severity
                    </p>
                    {['all', 'Info', 'Warning', 'Critical'].map((sev) => (
                      <button
                        key={sev}
                        type="button"
                        onClick={() => {
                          setSeverityFilter(sev);
                          setPage(1);
                          setOpenDropdown(null);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-left transition cursor-pointer ${
                          severityFilter === sev
                            ? 'bg-[#3A4F1C]/10 font-semibold text-[#3A4F1C]'
                            : 'text-[#2B3817] hover:bg-[#FAF8F2]'
                        }`}
                      >
                        <span>{sev === 'all' ? 'All Severities' : sev}</span>
                        {severityFilter === sev && <Check className="h-3.5 w-3.5 text-[#3A4F1C]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Filter 4: Outcome Filter Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdown(openDropdown === 'outcome' ? null : 'outcome')
                  }
                  className={`flex items-center gap-1 sm:gap-1.5 rounded-lg border px-2 sm:px-2.5 py-1.5 text-[11px] sm:text-xs font-medium transition cursor-pointer shadow-2xs ${
                    outcomeFilter !== 'all'
                      ? 'border-[#3A4F1C] bg-[#3A4F1C] text-white'
                      : 'border-[#3A4F1C]/20 bg-white text-[#2B3817] hover:bg-[#3A4F1C]/5'
                  }`}
                  title="Filter by Outcome"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="hidden sm:inline">
                    {outcomeFilter === 'all' ? 'Outcome' : outcomeFilter}
                  </span>
                  <ChevronDown className="h-3 w-3 opacity-70 shrink-0" />
                </button>

                {openDropdown === 'outcome' && (
                  <div className="absolute right-0 top-full mt-1.5 z-40 w-40 rounded-xl border border-[#3A4F1C]/20 bg-white p-1.5 shadow-lg animate-fade-in origin-top">
                    <p className="px-2 py-1 text-[10px] font-semibold text-[#2B3817]/50 uppercase tracking-wider">
                      Filter Outcome
                    </p>
                    {['all', 'Success', 'Failure', 'Blocked'].map((out) => (
                      <button
                        key={out}
                        type="button"
                        onClick={() => {
                          setOutcomeFilter(out);
                          setPage(1);
                          setOpenDropdown(null);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-left transition cursor-pointer ${
                          outcomeFilter === out
                            ? 'bg-[#3A4F1C]/10 font-semibold text-[#3A4F1C]'
                            : 'text-[#2B3817] hover:bg-[#FAF8F2]'
                        }`}
                      >
                        <span>{out === 'all' ? 'All Outcomes' : out}</span>
                        {outcomeFilter === out && <Check className="h-3.5 w-3.5 text-[#3A4F1C]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Filter 5: Date Range Filter Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdown(openDropdown === 'date' ? null : 'date')
                  }
                  className={`flex items-center gap-1 sm:gap-1.5 rounded-lg border px-2 sm:px-2.5 py-1.5 text-[11px] sm:text-xs font-medium transition cursor-pointer shadow-2xs ${
                    dateRangeFilter !== 'all'
                      ? 'border-[#3A4F1C] bg-[#3A4F1C] text-white'
                      : 'border-[#3A4F1C]/20 bg-white text-[#2B3817] hover:bg-[#3A4F1C]/5'
                  }`}
                  title="Filter by Date Range"
                >
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  <span className="hidden sm:inline">
                    {dateRangeFilter === 'all'
                      ? 'Date'
                      : dateRangeFilter === 'today'
                      ? 'Today'
                      : dateRangeFilter === '7d'
                      ? 'Last 7d'
                      : 'Last 30d'}
                  </span>
                  <ChevronDown className="h-3 w-3 opacity-70 shrink-0" />
                </button>

                {openDropdown === 'date' && (
                  <div className="absolute right-0 top-full mt-1.5 z-40 w-44 rounded-xl border border-[#3A4F1C]/20 bg-white p-1.5 shadow-lg animate-fade-in origin-top">
                    <p className="px-2 py-1 text-[10px] font-semibold text-[#2B3817]/50 uppercase tracking-wider">
                      Filter Date Range
                    </p>
                    {[
                      { key: 'all', label: 'All Time' },
                      { key: 'today', label: 'Today' },
                      { key: '7d', label: 'Last 7 Days' },
                      { key: '30d', label: 'Last 30 Days' },
                    ].map((d) => (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => {
                          setDateRangeFilter(d.key);
                          setPage(1);
                          setOpenDropdown(null);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-left transition cursor-pointer ${
                          dateRangeFilter === d.key
                            ? 'bg-[#3A4F1C]/10 font-semibold text-[#3A4F1C]'
                            : 'text-[#2B3817] hover:bg-[#FAF8F2]'
                        }`}
                      >
                        <span>{d.label}</span>
                        {dateRangeFilter === d.key && (
                          <Check className="h-3.5 w-3.5 text-[#3A4F1C]" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Reset All Filters Button */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1.5 text-[11px] font-medium text-red-700 hover:bg-red-100 transition cursor-pointer shrink-0"
                  title="Reset all filters and view"
                >
                  <X className="h-3 w-3" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* =====================================================================
            Log Table Content: Scroll-Y (limit-h) + Scroll-X (increased width)
           ===================================================================== */}
        <div className="border-t border-[#3A4F1C]/15">
          <div className="max-h-[580px] sm:max-h-[640px] overflow-y-auto overflow-x-auto">
            <table className="min-w-[1150px] w-full text-left text-[11px] sm:text-xs">
              <thead className="sticky top-0 z-10 border-b border-[#3A4F1C]/15 bg-[#F7F3E8] text-[#2B3817]/70 uppercase text-[9px] sm:text-[10px] tracking-wider font-semibold shadow-xs">
                <tr>
                  <th className="px-3 sm:px-4 py-2.5 sm:py-3.5">Timestamp</th>
                  <th className="px-2.5 sm:px-3 py-2.5 sm:py-3.5">User Code</th>
                  <th className="px-3 sm:px-4 py-2.5 sm:py-3.5">Actor</th>
                  <th className="px-2.5 sm:px-3 py-2.5 sm:py-3.5">Category</th>
                  <th className="px-2.5 sm:px-3 py-2.5 sm:py-3.5">Action</th>
                  <th className="px-2.5 sm:px-3 py-2.5 sm:py-3.5">Severity</th>
                  <th className="px-2.5 sm:px-3 py-2.5 sm:py-3.5">Outcome</th>
                  <th className="px-4 sm:px-6 py-2.5 sm:py-3.5">Activity Summary</th>
                  <th className="px-3 sm:px-4 py-2.5 sm:py-3.5 text-center">Changes</th>
                  <th className="px-3 sm:px-4 py-2.5 sm:py-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3A4F1C]/10 font-sans">
                {isLoading ? (
                  <tr>
                    <td colSpan={10} className="py-16 text-center text-[#2B3817]/60">
                      <Loader2 className="mx-auto h-7 w-7 animate-spin text-[#3A4F1C] mb-2" />
                      <span>Loading verified audit entries...</span>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-16 text-center text-[#2B3817]/60">
                      <FileDiff className="mx-auto h-8 w-8 text-[#2B3817]/30 mb-2" />
                      <p className="font-semibold text-xs text-[#2B3817]">
                        No audit records match the current filters.
                      </p>
                      <p className="text-[11px] text-[#2B3817]/60 mt-0.5">
                        Adjust filter presets or search terms above.
                      </p>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const hasChanges = log.changes && Object.keys(log.changes).length > 0;
                    const isBookingRelated = Boolean(
                      log.entity_ref && log.entity_ref.startsWith('CAS-')
                    );

                    return (
                      <tr key={log.id} className="hover:bg-[#FAF8F2] transition group">
                        {/* Timestamp (12-hour clock) */}
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3.5 whitespace-nowrap font-mono text-[10px] sm:text-[11px] text-[#2B3817]/70">
                          {format12Hour(log.created_at)}
                        </td>

                        {/* User Code */}
                        <td className="px-2.5 sm:px-3 py-2.5 sm:py-3.5 whitespace-nowrap">
                          <span className="inline-block rounded bg-[#3A4F1C]/10 px-1.5 py-0.5 font-mono text-[10px] sm:text-[11px] font-semibold text-[#3A4F1C]">
                            {log.actor_code || 'SYS-000'}
                          </span>
                        </td>

                        {/* Actor Name & Email */}
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3.5 whitespace-nowrap">
                          <p className="font-semibold text-[#2B3817] leading-tight">
                            {log.actor_name || 'System Actor'}
                          </p>
                          <p className="text-[10px] text-[#2B3817]/60 truncate max-w-[130px]">
                            {log.actor_email || '—'}
                          </p>
                        </td>

                        {/* Category */}
                        <td className="px-2.5 sm:px-3 py-2.5 sm:py-3.5 whitespace-nowrap">
                          <span className="rounded bg-slate-100 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-medium text-slate-700">
                            {log.category}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-2.5 sm:px-3 py-2.5 sm:py-3.5 whitespace-nowrap font-medium text-[#2B3817]">
                          {log.action}
                        </td>

                        {/* Severity */}
                        <td className="px-2.5 sm:px-3 py-2.5 sm:py-3.5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider ${
                              log.severity === 'Critical'
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : log.severity === 'Warning'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {log.severity === 'Critical' && <AlertTriangle className="h-3 w-3" />}
                            {log.severity === 'Warning' && <AlertTriangle className="h-3 w-3" />}
                            <span>{log.severity}</span>
                          </span>
                        </td>

                        {/* Outcome */}
                        <td className="px-2.5 sm:px-3 py-2.5 sm:py-3.5 whitespace-nowrap">
                          <span
                            className={`font-semibold text-[10px] sm:text-[11px] ${
                              log.outcome === 'Success'
                                ? 'text-emerald-700'
                                : log.outcome === 'Failure'
                                ? 'text-red-700'
                                : 'text-slate-600'
                            }`}
                          >
                            {log.outcome}
                          </span>
                        </td>

                        {/* Summary with clickable reference */}
                        <td className="px-4 sm:px-6 py-2.5 sm:py-3.5 min-w-[280px] max-w-[420px]">
                          <p className="text-[11px] sm:text-xs text-[#2B3817] leading-relaxed line-clamp-2">
                            {log.summary}
                          </p>
                          {isBookingRelated && (
                            <button
                              type="button"
                              onClick={() => setTimelineRef(log.entity_ref)}
                              className="mt-1 inline-flex items-center gap-1 font-mono text-[9px] sm:text-[10px] font-semibold text-[#3A4F1C] hover:underline cursor-pointer"
                              title="Open chronological booking timeline"
                            >
                              <span>Timeline: {log.entity_ref}</span>
                              <ExternalLink className="h-2.5 w-2.5" />
                            </button>
                          )}
                        </td>

                        {/* Changes Button */}
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3.5 whitespace-nowrap text-center">
                          {hasChanges ? (
                            <button
                              type="button"
                              onClick={() => setDiffLog(log)}
                              className="inline-flex items-center gap-1 rounded border border-[#3A4F1C]/20 bg-white px-2 py-1 font-mono text-[9px] sm:text-[10px] font-semibold text-[#3A4F1C] shadow-2xs hover:bg-[#3A4F1C]/10 transition cursor-pointer"
                            >
                              <FileDiff className="h-3 w-3" />
                              <span>+{Object.keys(log.changes).length} diff</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-[#2B3817]/40">—</span>
                          )}
                        </td>

                        {/* Details / Triage Button */}
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3.5 whitespace-nowrap text-right">
                          <button
                            type="button"
                            onClick={() => setMetaLog(log)}
                            className="rounded-lg border border-[#3A4F1C]/20 bg-white px-2 sm:px-2.5 py-1 text-[10px] sm:text-[11px] font-semibold text-[#2B3817] shadow-2xs hover:bg-[#3A4F1C]/5 transition cursor-pointer"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table Footer with Pagination: 1 Single Row on All Screen Sizes */}
        <div className="flex flex-row items-center justify-between border-t border-[#3A4F1C]/15 bg-[#F7F3E8] px-3 sm:px-6 py-2.5 sm:py-3 text-[10px] sm:text-xs text-[#2B3817]/70 gap-2">
          <div className="truncate">
            Showing <span className="font-semibold">{logs.length > 0 ? (page - 1) * pageSize + 1 : 0}</span> to{' '}
            <span className="font-semibold">{Math.min(page * pageSize, totalCount)}</span> of{' '}
            <span className="font-semibold">{totalCount}</span> entries
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg border border-[#3A4F1C]/20 bg-white text-[#2B3817] shadow-xs hover:bg-[#3A4F1C]/5 disabled:opacity-40 transition cursor-pointer"
              aria-label="Previous Page"
            >
              <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
            <span className="text-[10px] sm:text-xs font-semibold text-[#2B3817] whitespace-nowrap">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg border border-[#3A4F1C]/20 bg-white text-[#2B3817] shadow-xs hover:bg-[#3A4F1C]/5 disabled:opacity-40 transition cursor-pointer"
              aria-label="Next Page"
            >
              <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================================
          Modals & Drawers
         ===================================================================== */}
      {diffLog && (
        <AuditDiffModal log={diffLog} onClose={() => setDiffLog(null)} />
      )}

      {metaLog && (
        <AuditMetadataModal
          log={metaLog}
          onClose={() => setMetaLog(null)}
          onAcknowledged={handleManualRefresh}
        />
      )}

      {timelineRef && (
        <AuditBookingTimelineModal
          bookingReference={timelineRef}
          onClose={() => setTimelineRef(null)}
          onSelectLogForDiff={(log) => setDiffLog(log)}
        />
      )}
    </div>
  );
}
