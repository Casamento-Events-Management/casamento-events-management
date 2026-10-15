'use client';

// =============================================================================
// components/admin/audit/audit-diff-modal.tsx — Changes Inspector Modal
//
// Displays a clear side-by-side comparison of old vs new values for monitored fields.
// =============================================================================

import React, { useEffect } from 'react';
import { X, FileDiff } from 'lucide-react';
import type { AuditLogEntry } from '@/types/admin-auth';

interface AuditDiffModalProps {
  log: AuditLogEntry | null;
  onClose: () => void;
}

export function AuditDiffModal({ log, onClose }: AuditDiffModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!log) return null;

  const changes = log.changes || {};
  const fieldKeys = Object.keys(changes);

  const formatValue = (val: unknown): string => {
    if (val === null || val === undefined) return '<empty>';
    if (typeof val === 'boolean') return val ? 'true' : 'false';
    if (typeof val === 'object') return JSON.stringify(val, null, 2);
    return String(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl border border-[#3A4F1C]/20 bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#3A4F1C]/15 bg-[#F7F3E8] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3A4F1C] text-white">
              <FileDiff className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-[#2B3817]">Field Changes Inspector</h3>
              <p className="text-xs text-[#2B3817]/70">
                Log entry <span className="font-mono text-[11px] font-semibold">{log.id.substring(0, 8)}</span> · {log.summary}
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
        <div className="max-h-[70vh] overflow-y-auto p-6 space-y-4">
          {fieldKeys.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#3A4F1C]/20 p-8 text-center">
              <p className="text-xs text-[#2B3817]/70">No direct field mutations captured in this log entry.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {fieldKeys.map((field) => {
                const diff = changes[field] as { old: unknown; new: unknown } | undefined;
                const oldVal = diff ? formatValue(diff.old) : '<none>';
                const newVal = diff ? formatValue(diff.new) : '<none>';

                return (
                  <div key={field} className="rounded-xl border border-[#3A4F1C]/15 bg-[#FAF8F2] p-4 text-xs">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-mono font-semibold text-[#3A4F1C]">{field}</span>
                      <span className="text-[10px] text-[#2B3817]/60 uppercase">Field Mutation</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* Before */}
                      <div className="rounded-lg border border-red-200 bg-red-50/70 p-3">
                        <span className="block text-[10px] font-semibold text-red-800 uppercase tracking-wider mb-1">
                          Previous Value (Old)
                        </span>
                        <pre className="font-mono text-xs text-red-900 whitespace-pre-wrap break-all">
                          {oldVal}
                        </pre>
                      </div>

                      {/* After */}
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-3">
                        <span className="block text-[10px] font-semibold text-emerald-800 uppercase tracking-wider mb-1">
                          Updated Value (New)
                        </span>
                        <pre className="font-mono text-xs text-emerald-900 whitespace-pre-wrap break-all">
                          {newVal}
                        </pre>
                      </div>
                    </div>
                  </div>
                );
              })}
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
