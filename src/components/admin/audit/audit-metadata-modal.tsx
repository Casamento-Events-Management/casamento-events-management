'use client';

// =============================================================================
// components/admin/audit/audit-metadata-modal.tsx — Metadata & Telemetry Inspector
//
// Shows network context (IP, user agent), metadata JSON, and handles alert acknowledgment.
// =============================================================================

import React, { useState, useEffect } from 'react';
import { X, Globe, Terminal, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import type { AuditLogEntry } from '@/types/admin-auth';
import { acknowledgeAuditLogAction } from '@/lib/services/admin-audit-actions';

interface AuditMetadataModalProps {
  log: AuditLogEntry | null;
  onClose: () => void;
  onAcknowledged?: () => void;
}

export function AuditMetadataModal({ log, onClose, onAcknowledged }: AuditMetadataModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  const [triageNote, setTriageNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!log) return null;

  // Acknowledgment checking (can be array or single object depending on join)
  const acks = Array.isArray(log.audit_log_acknowledgments)
    ? log.audit_log_acknowledgments
    : log.audit_log_acknowledgments
    ? [log.audit_log_acknowledgments]
    : [];
  const isAcknowledged = acks.length > 0;
  const isActionable = log.severity === 'Warning' || log.severity === 'Critical';

  const handleAcknowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await acknowledgeAuditLogAction(log.id, triageNote);
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to acknowledge alert.');
        setIsSubmitting(false);
        return;
      }

      if (onAcknowledged) {
        onAcknowledged();
      }
      onClose();
    } catch (err) {
      console.error('[handleAcknowledge Error]:', err);
      setErrorMsg('Unexpected error while acknowledging alert.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl border border-[#3A4F1C]/20 bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#3A4F1C]/15 bg-[#F7F3E8] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3A4F1C] text-white">
              <Terminal className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-[#2B3817]">Event Telemetry & Metadata</h3>
              <p className="text-xs text-[#2B3817]/70">
                Log entry <span className="font-mono text-[11px] font-semibold">{log.id.substring(0, 8)}</span>
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

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto p-6 space-y-5">
          {/* Summary Box */}
          <div className="rounded-xl border border-[#3A4F1C]/15 bg-[#FAF8F2] p-4 text-xs">
            <p className="font-semibold text-[#2B3817] mb-1">Activity Summary</p>
            <p className="text-xs text-[#2B3817]/80">{log.summary}</p>
          </div>

          {/* Network & Actor Context */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-[#3A4F1C]/15 bg-white p-3.5 space-y-1">
              <span className="block text-[10px] font-semibold text-[#2B3817]/60 uppercase tracking-wider">
                Actor & Identity
              </span>
              <p className="font-semibold text-[#2B3817]">
                {log.actor_name}{' '}
                <span className="font-mono text-[11px] text-[#3A4F1C]">({log.actor_code})</span>
              </p>
              <p className="text-[#2B3817]/70">{log.actor_email || 'No email associated'}</p>
              <span className="inline-block rounded bg-[#3A4F1C]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#3A4F1C] uppercase mt-1">
                Type: {log.actor_type}
              </span>
            </div>

            <div className="rounded-xl border border-[#3A4F1C]/15 bg-white p-3.5 space-y-1">
              <span className="block text-[10px] font-semibold text-[#2B3817]/60 uppercase tracking-wider">
                Network & Origin
              </span>
              <div className="flex items-center gap-1.5 text-xs text-[#2B3817]">
                <Globe className="h-3.5 w-3.5 text-[#3A4F1C]" />
                <span className="font-mono">{log.ip_address || 'Internal / N/A'}</span>
              </div>
              <p className="text-[11px] text-[#2B3817]/70 truncate" title={log.user_agent || 'Unknown'}>
                {log.user_agent || 'No User-Agent provided'}
              </p>
            </div>
          </div>

          {/* Metadata JSON */}
          <div className="rounded-xl border border-[#3A4F1C]/15 bg-[#FAF8F2] p-4 text-xs">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-semibold text-[#2B3817]">Operational Metadata Payload</span>
              <span className="text-[10px] text-[#2B3817]/60 uppercase">JSON Context</span>
            </div>
            <pre className="max-h-48 overflow-y-auto rounded-lg border border-[#3A4F1C]/10 bg-white p-3 font-mono text-[11px] text-[#2B3817] whitespace-pre-wrap">
              {JSON.stringify(log.metadata || {}, null, 2)}
            </pre>
          </div>

          {/* Triage / Acknowledgment Section */}
          {isActionable && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-700" />
                <h4 className="font-semibold text-amber-900">
                  {log.severity} Alert Triage Status
                </h4>
              </div>

              {isAcknowledged ? (
                <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-emerald-900">
                  <div className="flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                    <span>Acknowledged by team member</span>
                  </div>
                  {acks[0].note && (
                    <p className="mt-1 text-xs text-emerald-800">Note: {acks[0].note}</p>
                  )}
                  <p className="mt-1 text-[10px] text-emerald-700">
                    Timestamp: {new Date(acks[0].acknowledged_at).toLocaleString()}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleAcknowledge} className="space-y-3 pt-1">
                  <p className="text-amber-800 text-xs">
                    This incident has not been marked as acknowledged yet. Add an optional triage note and confirm acknowledgment.
                  </p>

                  <input
                    type="text"
                    value={triageNote}
                    onChange={(e) => setTriageNote(e.target.value)}
                    placeholder="Optional triage note (e.g. verified with client, false alarm, etc.)"
                    className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs text-[#2B3817] focus:border-[#3A4F1C] focus:outline-none"
                  />

                  {errorMsg && (
                    <p className="text-xs text-red-600 font-medium">{errorMsg}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-1.5 rounded-lg bg-amber-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-amber-800 disabled:opacity-50 transition"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                    <span>Acknowledge Alert</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-[#3A4F1C]/15 bg-[#F7F3E8] px-6 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#3A4F1C]/20 bg-white px-4 py-2 text-xs font-semibold text-[#2B3817] shadow-xs hover:bg-[#3A4F1C]/5 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
