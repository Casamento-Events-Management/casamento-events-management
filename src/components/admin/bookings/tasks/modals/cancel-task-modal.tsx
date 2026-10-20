'use client';

// =============================================================================
// cancel-task-modal.tsx — Modal for confirming task cancellation / soft-delete
// =============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { Trash2, AlertTriangle, X, Loader2, AlertCircle } from 'lucide-react';
import type { EventTask } from '@/types/booking';
import { cancelEventTaskAction } from '@/lib/services/admin-tasks-actions';

interface CancelTaskModalProps {
  task: EventTask;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (taskId: string) => void;
}

export function CancelTaskModal({
  task,
  isOpen,
  onClose,
  onSuccess,
}: CancelTaskModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [reason, setReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Esc key & scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCancelling(true);
    setError(null);

    try {
      const res = await cancelEventTaskAction({
        taskId: task.id,
        reason: reason.trim() || undefined,
      });

      if (!res.success) {
        throw new Error(res.error || 'Failed to cancel task.');
      }

      onSuccess(task.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cancelling task.');
    } finally {
      setIsCancelling(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        e.stopPropagation();
        handleBackdropClick(e);
      }}
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-md my-8 rounded-2xl bg-white shadow-xl border border-red-200 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center px-6 py-4 border-b border-red-100 bg-red-50/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-700">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-red-950">
                Cancel Task
              </h3>
              <p className="text-xs text-red-700">
                This will soft-delete and flag the task as cancelled.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleConfirm} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs space-y-1">
            <span className="text-[11px] font-semibold uppercase text-stone-500 block">
              Task to Cancel:
            </span>
            <p className="font-semibold text-stone-900">{task.title}</p>
            {task.booking && (
              <p className="text-[11px] text-stone-500">
                Event: <span className="font-mono text-stone-700">{task.booking.booking_reference}</span> • {task.booking.service_title}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              Cancellation Reason (Optional)
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Vendor arrangement no longer required, task duplicated..."
              className="w-full rounded-xl border border-stone-300 bg-white p-3 text-xs text-stone-900 placeholder-stone-400 focus:border-red-500 focus:outline-hidden"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 transition"
            >
              Keep Task
            </button>
            <button
              type="submit"
              disabled={isCancelling}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-red-700 transition disabled:opacity-50"
            >
              {isCancelling ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              <span>Confirm Cancellation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
