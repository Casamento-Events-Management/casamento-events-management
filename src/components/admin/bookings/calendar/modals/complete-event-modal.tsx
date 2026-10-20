'use client';

// =============================================================================
// complete-event-modal.tsx — Event Conclusion & Wrap-Up Dialog
// =============================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  X,
  AlertCircle,
  Calendar,
  MapPin,
  User,
  Loader2,
  Mail,
  CheckSquare,
  Sparkles,
  ChevronDown,
  Clock,
} from 'lucide-react';
import type { BookingRecord, EventTask } from '@/types/booking';
import {
  completeEventAction,
  getEventTasksAction,
} from '@/lib/services/admin-calendar-actions';

interface CompleteEventModalProps {
  booking: BookingRecord;
  isOpen: boolean;
  onClose: () => void;
  onCompleted: (updatedBooking: BookingRecord) => void;
}

export function CompleteEventModal({
  booking,
  isOpen,
  onClose,
  onCompleted,
}: CompleteEventModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  const [completionNotes, setCompletionNotes] = useState('');
  const [autoCompleteTasks, setAutoCompleteTasks] = useState(true);
  const [notifyClient, setNotifyClient] = useState(true);
  const [thankYouNote, setThankYouNote] = useState('');

  const [tasks, setTasks] = useState<EventTask[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [isTasksAccordionOpen, setIsTasksAccordionOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch event tasks on mount to check pending status
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    getEventTasksAction(booking.id)
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.tasks) {
          setTasks(res.tasks);
          if (res.tasks.some((t) => !t.is_done && !t.is_cancelled)) {
            setIsTasksAccordionOpen(true);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load event tasks for conclusion modal:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingTasks(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, booking.id]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const pendingTasks = tasks.filter((t) => !t.is_done && !t.is_cancelled);
  const totalTasks = tasks.filter((t) => !t.is_cancelled).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await completeEventAction({
        bookingId: booking.id,
        completionNotes: completionNotes.trim() || undefined,
        autoCompletePendingTasks: autoCompleteTasks && pendingTasks.length > 0,
        notifyClient: notifyClient && Boolean(booking.client_email),
        clientThankYouMessage: thankYouNote.trim() || undefined,
      });

      if (!res.success || !res.booking) {
        setErrorMessage(res.error || 'Failed to conclude event.');
        setIsSubmitting(false);
        return;
      }

      onCompleted(res.booking);
      onClose();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg my-6 max-h-[92vh] overflow-hidden rounded-2xl border border-[#3A4F1C]/20 bg-white shadow-xl flex flex-col animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#3A4F1C]/10 bg-[#F7F3E8]/50 px-5 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[#2B3817]">
                Conclude Event
              </h3>
              <p className="text-xs text-stone-500">
                Mark as successfully completed &bull;{' '}
                <span className="font-mono font-medium text-stone-700">{booking.booking_reference}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition cursor-pointer disabled:opacity-40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-800 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Event Context Snapshot */}
          <div className="rounded-xl border border-stone-200/90 bg-stone-50/60 p-3.5 space-y-2 text-xs">
            <div className="font-semibold text-stone-900 text-sm">
              {booking.service_title}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-600">
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-[#3A4F1C] shrink-0" />
                <span className="truncate">{booking.client_full_name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-[#3A4F1C] shrink-0" />
                <span>{booking.event_date}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:col-span-2">
                <MapPin className="h-3.5 w-3.5 text-[#3A4F1C] shrink-0" />
                <span className="truncate">
                  {booking.venue_city}
                  {booking.event_country_name ? `, ${booking.event_country_name}` : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Checklist Tasks Status */}
          <div className="rounded-xl border border-stone-200/90 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                <CheckSquare className="h-4 w-4 text-[#3A4F1C]" />
                Event Checklist Status
              </span>
              {isLoadingTasks ? (
                <span className="text-stone-400 text-[11px] flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" /> Checking tasks...
                </span>
              ) : (
                <span className="text-[11px] font-medium text-stone-500">
                  {totalTasks - pendingTasks.length} / {totalTasks} completed
                </span>
              )}
            </div>

            {!isLoadingTasks && pendingTasks.length > 0 ? (
              <div className="rounded-lg bg-amber-50/80 border border-amber-200/80 p-2.5 space-y-2 text-xs text-amber-900">
                <div className="flex items-start gap-1.5 font-medium">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    {pendingTasks.length} {pendingTasks.length === 1 ? 'task is' : 'tasks are'} still marked as pending.
                  </span>
                </div>
                <label className="flex items-center gap-2 text-[11px] font-medium text-amber-950 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={autoCompleteTasks}
                    onChange={(e) => setAutoCompleteTasks(e.target.checked)}
                    className="rounded border-amber-400 text-[#3A4F1C] focus:ring-[#3A4F1C]"
                  />
                  <span>Automatically mark all remaining tasks as completed</span>
                </label>
              </div>
            ) : !isLoadingTasks && totalTasks > 0 ? (
              <div className="text-[11px] text-emerald-800 flex items-center gap-1.5 font-medium">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                All event checklist tasks are already finished.
              </div>
            ) : null}

            {/* Collapsible Accordion to Manually Review Tasks */}
            {!isLoadingTasks && totalTasks > 0 && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setIsTasksAccordionOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between py-1.5 text-xs font-semibold text-[#3A4F1C] hover:text-[#2B3817] transition cursor-pointer select-none"
                  aria-expanded={isTasksAccordionOpen}
                >
                  <span className="flex items-center gap-1.5">
                    <span>{isTasksAccordionOpen ? 'Hide Task Checklist' : 'Review Task Checklist'}</span>
                    <span className="rounded-full bg-stone-100 px-1.5 py-0.2 text-[10px] text-stone-600 font-mono">
                      {totalTasks}
                    </span>
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 text-stone-500 ${
                      isTasksAccordionOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isTasksAccordionOpen && (
                  <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto pr-1 animate-in fade-in-50 duration-150">
                    {tasks
                      .filter((t) => !t.is_cancelled)
                      .sort((a, b) => (a.is_done === b.is_done ? 0 : a.is_done ? 1 : -1))
                      .map((task) => {
                        const isDone = task.is_done;
                        const assignees =
                          task.assignee_names && task.assignee_names.length > 0
                            ? task.assignee_names.join(', ')
                            : task.assignee_name || null;

                        return (
                          <div
                            key={task.id}
                            className={`flex items-start justify-between gap-2.5 rounded-lg border p-2 text-xs transition ${
                              isDone
                                ? 'bg-stone-50/70 border-stone-200/70 text-stone-500'
                                : 'bg-white border-amber-200/80 text-stone-900 shadow-2xs'
                            }`}
                          >
                            <div className="flex items-start gap-2 min-w-0">
                              {isDone ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              ) : (
                                <Clock className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                              )}
                              <div className="min-w-0">
                                <p
                                  className={`font-medium leading-tight ${
                                    isDone ? 'line-through text-stone-400' : 'text-stone-800'
                                  }`}
                                >
                                  {task.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1 text-[10px] text-stone-500 flex-wrap">
                                  {assignees && (
                                    <span className="inline-flex items-center gap-1">
                                      <User className="h-2.5 w-2.5 text-stone-400" />
                                      <span>{assignees}</span>
                                    </span>
                                  )}
                                  {task.due_date && (
                                    <span className="inline-flex items-center gap-1">
                                      <Calendar className="h-2.5 w-2.5 text-stone-400" />
                                      <span>{task.due_date}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <span
                              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                isDone
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {isDone ? 'Done' : 'Pending'}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Operational Wrap-Up Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-800">
              Operational Wrap-Up Notes{' '}
              <span className="text-stone-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              placeholder="E.g., Event finished smoothly. Sound crew packed out by 11 PM with zero damage. Client praised the lighting team."
              className="w-full rounded-xl border border-stone-200 p-2.5 text-xs text-stone-800 placeholder-stone-400 focus:border-[#3A4F1C] focus:outline-hidden focus:ring-1 focus:ring-[#3A4F1C] transition resize-none"
            />
          </div>

          {/* Client Thank You Email Notification */}
          <div className="rounded-xl border border-stone-200/90 p-3.5 space-y-2.5">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyClient}
                onChange={(e) => setNotifyClient(e.target.checked)}
                className="rounded border-stone-300 text-[#3A4F1C] focus:ring-[#3A4F1C] mt-0.5"
              />
              <div className="text-xs">
                <span className="font-semibold text-stone-900 block flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-[#3A4F1C]" />
                  Send Thank You & Review Request to client
                </span>
                <span className="text-stone-500 text-[11px] block mt-0.5">
                  Sends a warm, heartfelt message to{' '}
                  <strong className="text-stone-700">{booking.client_email}</strong>.
                </span>
              </div>
            </label>

            {notifyClient && (
              <div className="pt-2 border-t border-stone-100 space-y-1">
                <label className="block text-[11px] font-medium text-stone-700">
                  Personal Note from Coordinator{' '}
                  <span className="text-stone-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={thankYouNote}
                  onChange={(e) => setThankYouNote(e.target.value)}
                  placeholder="E.g., It was such an honor working with both of you. Give our love to your families!"
                  className="w-full rounded-xl border border-stone-200 p-2 text-xs text-stone-800 placeholder-stone-400 focus:border-[#3A4F1C] focus:outline-hidden focus:ring-1 focus:ring-[#3A4F1C] transition resize-none"
                />
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition cursor-pointer disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-800 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-900 transition cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Concluding Event...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Conclude Event (Done)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
