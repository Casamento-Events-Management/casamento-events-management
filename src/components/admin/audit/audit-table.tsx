'use client';

// =============================================================================
// components/admin/audit/audit-table.tsx — Administrative Audit Trail Viewer
//
// Direct PostgREST browser polling (Zero Vercel Function Invocations).
// Includes 60s visibility-aware polling, manual refresh button, capped exports,
// comprehensive filter presets, and per-booking timeline drilldown.
// =============================================================================

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { AuditLogEntry } from '@/types/admin-auth';
import { recordExportAuditAction } from '@/lib/services/admin-audit-actions';
import { AuditDiffModal } from './audit-diff-modal';
import { AuditMetadataModal } from './audit-metadata-modal';
import { AuditBookingTimelineModal } from './audit-booking-timeline-modal';

type PresetTab = 'all' | 'needs_attention' | 'bookings' | 'team';

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
   * Fetches audit logs directly from Supabase PostgREST
   * Consumes zero Vercel serverless function invocations.
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
        ];

        const csvLines = [headers.join(',')];

        rows.forEach((row) => {
          const escapeCsv = (val: unknown) =>
            `"${String(val || '').replace(/"/g, '""')}"`;

          csvLines.push(
            [
              escapeCsv(row.created_at),
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
            ].join(',')
          );
        });

        const csvBlob = new Blob([csvLines.join('\n')], { type: 'text/csv' });
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
   * 12-Hour Clock Formatter (MM/DD/YYYY hh:mm AM/PM)
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

  return (
    <div className="space-y-6">
      {/* =====================================================================
          1. Header Banner & Action Bar
         ===================================================================== */}
      <div className="rounded-2xl border border-[#3A4F1C]/15 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-serif font-bold text-[#2B3817] sm:text-2xl">
                Audit Trail & Activity Log
              </h1>
              <span className="rounded-full bg-[#3A4F1C]/10 px-2.5 py-0.5 text-xs font-semibold text-[#3A4F1C]">
                {totalCount} records
              </span>
            </div>
            <p className="mt-1 text-xs text-[#2B3817]/70">
              Audit Sync Every 60 secs · Last synced:{' '}
              <span className="font-mono text-[11px] font-semibold text-[#3A4F1C]">
                {lastRefreshedAt.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true,
                })}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Manual Refresh Button */}
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 rounded-lg border border-[#3A4F1C]/20 bg-white px-3 py-2 text-xs font-medium text-[#2B3817] shadow-xs hover:bg-[#3A4F1C]/5 transition disabled:opacity-50 cursor-pointer"
              title="Refresh Activity Now"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-[#3A4F1C]' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>

            {/* Export Dropdown / Buttons */}
            <div className="flex items-center rounded-lg border border-[#3A4F1C]/20 bg-white shadow-xs overflow-hidden">
              <button
                type="button"
                onClick={() => handleExport('csv')}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#2B3817] hover:bg-[#3A4F1C]/5 transition disabled:opacity-50 cursor-pointer"
              >
                {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5 text-[#3A4F1C]" />}
                <span>Export CSV</span>
              </button>
              <span className="h-4 w-px bg-[#3A4F1C]/15" />
              <button
                type="button"
                onClick={() => handleExport('json')}
                disabled={isExporting}
                className="px-2.5 py-2 text-[11px] font-medium text-[#2B3817]/80 hover:bg-[#3A4F1C]/5 transition disabled:opacity-50 cursor-pointer"
                title="Export raw JSON"
              >
                JSON
              </button>
            </div>
          </div>
        </div>

        {/* Preset Tabs */}
        <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-[#3A4F1C]/10 pb-4">
          <button
            type="button"
            onClick={() => { setActiveTab('all'); setPage(1); }}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#3A4F1C] text-white shadow-xs'
                : 'bg-[#FAF8F2] text-[#2B3817]/70 hover:bg-[#3A4F1C]/10 hover:text-[#2B3817]'
            }`}
          >
            All Activity
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('needs_attention'); setPage(1); }}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
              activeTab === 'needs_attention'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Needs Attention</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('bookings'); setPage(1); }}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
              activeTab === 'bookings'
                ? 'bg-[#3A4F1C] text-white shadow-xs'
                : 'bg-[#FAF8F2] text-[#2B3817]/70 hover:bg-[#3A4F1C]/10 hover:text-[#2B3817]'
            }`}
          >
            Bookings Only
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('team'); setPage(1); }}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
              activeTab === 'team'
                ? 'bg-[#3A4F1C] text-white shadow-xs'
                : 'bg-[#FAF8F2] text-[#2B3817]/70 hover:bg-[#3A4F1C]/10 hover:text-[#2B3817]'
            }`}
          >
            Team & Authentication
          </button>
        </div>

        {/* Filter Controls Row */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search Input */}
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#2B3817]/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              placeholder="Search summary, reference (CAS-...), or actor..."
              className="w-full rounded-lg border border-[#3A4F1C]/20 bg-[#FAF8F2] pl-9 pr-3 py-2 text-xs text-[#2B3817] placeholder:text-[#2B3817]/40 focus:border-[#3A4F1C] focus:bg-white focus:outline-none"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-[#3A4F1C]/20 bg-[#FAF8F2] px-3 py-2 text-xs text-[#2B3817] focus:border-[#3A4F1C] focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="Booking">Booking</option>
              <option value="Team">Team</option>
              <option value="Authentication">Authentication</option>
              <option value="Payment">Payment</option>
              <option value="Security">Security</option>
              <option value="System">System</option>
            </select>
          </div>

          {/* Severity Dropdown */}
          <div>
            <select
              value={severityFilter}
              onChange={(e) => { setSeverityFilter(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-[#3A4F1C]/20 bg-[#FAF8F2] px-3 py-2 text-xs text-[#2B3817] focus:border-[#3A4F1C] focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="all">All Severities</option>
              <option value="Info">Info</option>
              <option value="Warning">Warning</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          {/* Outcome Dropdown */}
          <div>
            <select
              value={outcomeFilter}
              onChange={(e) => { setOutcomeFilter(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-[#3A4F1C]/20 bg-[#FAF8F2] px-3 py-2 text-xs text-[#2B3817] focus:border-[#3A4F1C] focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="all">All Outcomes</option>
              <option value="Success">Success</option>
              <option value="Failure">Failure</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>

          {/* Date Range Dropdown */}
          <div>
            <select
              value={dateRangeFilter}
              onChange={(e) => { setDateRangeFilter(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-[#3A4F1C]/20 bg-[#FAF8F2] px-3 py-2 text-xs text-[#2B3817] focus:border-[#3A4F1C] focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* =====================================================================
          2. Audit Log Data Table
         ===================================================================== */}
      <div className="rounded-2xl border border-[#3A4F1C]/15 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#3A4F1C]/15 bg-[#F7F3E8] text-[#2B3817]/70 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3.5">Timestamp</th>
                <th className="px-3 py-3.5">User Code</th>
                <th className="px-4 py-3.5">Actor</th>
                <th className="px-3 py-3.5">Category</th>
                <th className="px-3 py-3.5">Action</th>
                <th className="px-3 py-3.5">Severity</th>
                <th className="px-3 py-3.5">Outcome</th>
                <th className="px-6 py-3.5">Activity Summary</th>
                <th className="px-4 py-3.5 text-center">Changes</th>
                <th className="px-4 py-3.5 text-right">Details</th>
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
                    <p className="font-semibold text-xs text-[#2B3817]">No audit records match the current filters.</p>
                    <p className="text-[11px] text-[#2B3817]/60 mt-0.5">Adjust filter presets or search terms above.</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const hasChanges = log.changes && Object.keys(log.changes).length > 0;
                  const isBookingRelated = Boolean(log.entity_ref && log.entity_ref.startsWith('CAS-'));

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-[#FAF8F2] transition group"
                    >
                      {/* Timestamp (12-hour clock) */}
                      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[11px] text-[#2B3817]/70">
                        {format12Hour(log.created_at)}
                      </td>

                      {/* User Code */}
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <span className="inline-block rounded bg-[#3A4F1C]/10 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-[#3A4F1C]">
                          {log.actor_code || 'SYS-000'}
                        </span>
                      </td>

                      {/* Actor Name & Email */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-semibold text-[#2B3817] leading-tight">
                          {log.actor_name}
                        </div>
                        {log.actor_email && (
                          <div className="text-[10px] text-[#2B3817]/60 truncate max-w-[140px]" title={log.actor_email}>
                            {log.actor_email}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                          {log.category}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-3 py-3.5 whitespace-nowrap font-medium text-[#2B3817]">
                        {log.action}
                      </td>

                      {/* Severity */}
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
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
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <span
                          className={`font-semibold text-[11px] ${
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
                      <td className="px-6 py-3.5 min-w-[280px] max-w-[420px]">
                        <p className="text-xs text-[#2B3817] leading-relaxed line-clamp-2">
                          {log.summary}
                        </p>
                        {isBookingRelated && (
                          <button
                            type="button"
                            onClick={() => setTimelineRef(log.entity_ref)}
                            className="mt-1 inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-[#3A4F1C] hover:underline cursor-pointer"
                            title="Open chronological booking timeline"
                          >
                            <span>Timeline: {log.entity_ref}</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </button>
                        )}
                      </td>

                      {/* Changes Button */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-center">
                        {hasChanges ? (
                          <button
                            type="button"
                            onClick={() => setDiffLog(log)}
                            className="inline-flex items-center gap-1 rounded border border-[#3A4F1C]/20 bg-white px-2 py-1 font-mono text-[10px] font-semibold text-[#3A4F1C] shadow-2xs hover:bg-[#3A4F1C]/10 transition cursor-pointer"
                          >
                            <FileDiff className="h-3 w-3" />
                            <span>+{Object.keys(log.changes).length} diff</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-[#2B3817]/40">—</span>
                        )}
                      </td>

                      {/* Details / Triage Button */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-right">
                        <button
                          type="button"
                          onClick={() => setMetaLog(log)}
                          className="rounded-lg border border-[#3A4F1C]/20 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#2B3817] shadow-2xs hover:bg-[#3A4F1C]/5 transition cursor-pointer"
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

        {/* Table Footer with Pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-[#3A4F1C]/15 bg-[#F7F3E8] px-6 py-3 text-xs text-[#2B3817]/70 gap-3">
          <div>
            Showing <span className="font-semibold">{logs.length > 0 ? (page - 1) * pageSize + 1 : 0}</span> to{' '}
            <span className="font-semibold">{Math.min(page * pageSize, totalCount)}</span> of{' '}
            <span className="font-semibold">{totalCount}</span> entries
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#3A4F1C]/20 bg-white text-[#2B3817] shadow-xs hover:bg-[#3A4F1C]/5 disabled:opacity-40 transition cursor-pointer"
              aria-label="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-semibold text-[#2B3817]">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#3A4F1C]/20 bg-white text-[#2B3817] shadow-xs hover:bg-[#3A4F1C]/5 disabled:opacity-40 transition cursor-pointer"
              aria-label="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================================
          3. Modals & Drawers
         ===================================================================== */}
      {diffLog && (
        <AuditDiffModal
          log={diffLog}
          onClose={() => setDiffLog(null)}
        />
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
