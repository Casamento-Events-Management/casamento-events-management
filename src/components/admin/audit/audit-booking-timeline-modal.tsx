'use client';

// =============================================================================
// components/admin/audit/audit-booking-timeline-modal.tsx — Per-Booking Event Timeline
//
// Shows the complete chronological lifecycle of a specific booking reference:
// reservation created, preview email sent, status changed, confirmation emailed, etc.
// =============================================================================

import React, { useEffect, useState } from 'react';
import {
  X,
  Clock,
  AlertTriangle,
  Mail,
  Calendar,
  CreditCard,
  User,
  Loader2,
  FileText,
  Copy,
  Check,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { AuditLogEntry } from '@/types/admin-auth';

interface AuditBookingTimelineModalProps {
  bookingReference: string | null;
  onClose: () => void;
  onSelectLogForDiff?: (log: AuditLogEntry) => void;
}

export function AuditBookingTimelineModal({
  bookingReference,
  onClose,
  onSelectLogForDiff,
}: AuditBookingTimelineModalProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!bookingReference) return;

    let isMounted = true;
    async function fetchTimeline() {
      setIsLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*, audit_log_acknowledgments(*)')
          .or(`entity_ref.eq.${bookingReference},metadata->>booking_reference.eq.${bookingReference}`)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('[Timeline Fetch Error]:', error);
        } else if (isMounted) {
          setLogs((data as unknown as AuditLogEntry[]) || []);
        }
      } catch (err) {
        console.error('[Timeline Exception]:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchTimeline();

    return () => {
      isMounted = false;
    };
  }, [bookingReference]);

  if (!bookingReference) return null;

  const handleCopyRef = () => {
    navigator.clipboard.writeText(bookingReference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const format12HourTime = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  const getTimelineIcon = (log: AuditLogEntry) => {
    if (log.action.includes('Email')) return <Mail className="h-4 w-4" />;
    if (log.action.includes('Payment')) return <CreditCard className="h-4 w-4" />;
    if (log.action === 'Delete') return <AlertTriangle className="h-4 w-4" />;
    if (log.category === 'Booking' && log.action === 'Create') return <Calendar className="h-4 w-4" />;
    if (log.severity === 'Critical') return <AlertTriangle className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const getTimelineBadgeColor = (log: AuditLogEntry) => {
    if (log.severity === 'Critical') return 'bg-red-100 text-red-700 border-red-300';
    if (log.severity === 'Warning') return 'bg-amber-100 text-amber-800 border-amber-300';
    if (log.action.includes('Dispatched') || log.action === 'Create')
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    return 'bg-[#3A4F1C]/10 text-[#3A4F1C] border-[#3A4F1C]/20';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-2xl border border-[#3A4F1C]/20 bg-white shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#3A4F1C]/15 bg-[#F7F3E8] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3A4F1C] text-white shadow-xs">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-serif font-bold text-[#2B3817]">Per-Booking Lifecycle Timeline</h3>
                <button
                  type="button"
                  onClick={handleCopyRef}
                  className="flex items-center gap-1 rounded bg-[#3A4F1C]/10 px-2 py-0.5 font-mono text-xs font-semibold text-[#3A4F1C] hover:bg-[#3A4F1C]/20 transition"
                  title="Copy reference code"
                >
                  <span>{bookingReference}</span>
                  {copied ? <Check className="h-3 w-3 text-emerald-700" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
              <p className="text-xs text-[#2B3817]/70">
                Complete chronological activity log for this client reservation
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#2B3817]/70 hover:bg-[#3A4F1C]/10 hover:text-[#2B3817] transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#2B3817]/70 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-[#3A4F1C]" />
              <p className="text-xs font-medium">Reconstructing reservation timeline...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#3A4F1C]/20 p-12 text-center">
              <p className="text-xs text-[#2B3817]/70">
                No recorded audit events found for booking reference <span className="font-mono font-semibold">{bookingReference}</span>.
              </p>
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:bottom-0 before:top-2 before:left-[17px] before:w-0.5 before:bg-[#3A4F1C]/20">
              {logs.map((log) => {
                const hasChanges = log.changes && Object.keys(log.changes).length > 0;
                return (
                  <div key={log.id} className="relative group">
                    {/* Bullet marker */}
                    <div
                      className={`absolute -left-[23px] top-1 flex h-7 w-7 items-center justify-center rounded-full border bg-white shadow-xs ${getTimelineBadgeColor(
                        log
                      )}`}
                    >
                      {getTimelineIcon(log)}
                    </div>

                    {/* Timeline card */}
                    <div className="rounded-xl border border-[#3A4F1C]/15 bg-[#FAF8F2] p-4 text-xs transition hover:border-[#3A4F1C]/30 hover:bg-white shadow-2xs">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-[#3A4F1C]/10 pb-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#2B3817]">{log.action}</span>
                          <span className="rounded bg-[#3A4F1C]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#3A4F1C] uppercase">
                            {log.category}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase ${
                              log.severity === 'Critical'
                                ? 'bg-red-100 text-red-800'
                                : log.severity === 'Warning'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {log.severity}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-[#2B3817]/60">
                          {format12HourTime(log.created_at)}
                        </span>
                      </div>

                      <p className="text-xs text-[#2B3817]/90 mb-2 leading-relaxed">{log.summary}</p>

                      <div className="flex items-center justify-between text-[11px] text-[#2B3817]/70 pt-1">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-[#3A4F1C]" />
                          <span>
                            {log.actor_name}{' '}
                            <span className="font-mono text-[10px] text-[#3A4F1C]">({log.actor_code})</span>
                          </span>
                        </div>

                        {hasChanges && onSelectLogForDiff && (
                          <button
                            type="button"
                            onClick={() => onSelectLogForDiff(log)}
                            className="font-medium text-[#3A4F1C] hover:underline cursor-pointer"
                          >
                            View Changes ({Object.keys(log.changes).length})
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#3A4F1C]/15 bg-[#F7F3E8] px-6 py-3.5 text-xs">
          <span className="text-[#2B3817]/60">
            {logs.length} milestone{logs.length === 1 ? '' : 's'} recorded
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#3A4F1C]/20 bg-white px-4 py-2 font-semibold text-[#2B3817] shadow-xs hover:bg-[#3A4F1C]/5 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
