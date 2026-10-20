'use client';

// =============================================================================
// tasks-view-shell.tsx — Master View Shell for Tasks Tab & Role-based CRUD
// =============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckSquare,
  Square,
  Search,
  User,
  Calendar,
  Clock,
  Edit3,
  Trash2,
  Shield,
  Loader2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import type { EventTask, BookingRecord } from '@/types/booking';
import {
  getAdminTasksAction,
  toggleTaskDoneAction,
  type TaskViewFilter,
} from '@/lib/services/admin-tasks-actions';
import { calculateDaysRemaining } from '@/lib/utils/dateUtils';
import { EditTaskModal } from './modals/edit-task-modal';
import { CancelTaskModal } from './modals/cancel-task-modal';

interface TasksViewShellProps {
  currentUserId?: string;
  isSuperAdmin?: boolean;
  isStaff?: boolean;
  onSelectBooking?: (booking: BookingRecord) => void;
}

type StatusFilter = 'all' | 'pending' | 'done' | 'cancelled';

export function TasksViewShell({
  currentUserId,
  isSuperAdmin = false,
  isStaff = false,
  onSelectBooking,
}: TasksViewShellProps) {
  const [activeSubTab, setActiveSubTab] = useState<TaskViewFilter>('assigned_to_me');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [tasks, setTasks] = useState<EventTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [editingTask, setEditingTask] = useState<EventTask | null>(null);
  const [cancellingTask, setCancellingTask] = useState<EventTask | null>(null);

  // Handle tab switching
  const handleTabChange = (tab: TaskViewFilter) => {
    if (tab === activeSubTab) return;
    setIsLoading(true);
    setActiveSubTab(tab);
  };

  // Manual refresh
  const handleRefresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getAdminTasksAction({ view: activeSubTab, includeCancelled: true });
      if (res.success && res.tasks) {
        setTasks(res.tasks);
      } else {
        setError(res.error || 'Failed to load tasks.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching tasks.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load tasks when activeSubTab changes
  useEffect(() => {
    let isCancelled = false;

    getAdminTasksAction({ view: activeSubTab, includeCancelled: true })
      .then((res) => {
        if (isCancelled) return;
        if (res.success && res.tasks) {
          setTasks(res.tasks);
        } else {
          setError(res.error || 'Failed to load tasks.');
        }
      })
      .catch((err) => {
        if (isCancelled) return;
        setError(err instanceof Error ? err.message : 'Error fetching tasks.');
      })
      .finally(() => {
        if (isCancelled) return;
        setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [activeSubTab]);

  // Compute status counts
  const statusCounts = useMemo(() => {
    let pending = 0;
    let done = 0;
    let cancelled = 0;

    for (const t of tasks) {
      if (t.is_cancelled) {
        cancelled++;
      } else if (t.is_done) {
        done++;
      } else {
        pending++;
      }
    }

    return {
      all: tasks.length,
      pending,
      done,
      cancelled,
    };
  }, [tasks]);

  // Filter tasks based on statusFilter and searchTerm
  const filteredTasks = useMemo(() => {
    let list = tasks;

    // Apply status filter
    if (statusFilter === 'pending') {
      list = list.filter((t) => !t.is_done && !t.is_cancelled);
    } else if (statusFilter === 'done') {
      list = list.filter((t) => t.is_done && !t.is_cancelled);
    } else if (statusFilter === 'cancelled') {
      list = list.filter((t) => t.is_cancelled);
    }

    // Apply search filter
    if (searchTerm.trim().length > 0) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.booking && t.booking.booking_reference.toLowerCase().includes(q)) ||
          (t.booking && t.booking.service_title.toLowerCase().includes(q)) ||
          (t.booking && t.booking.client_full_name.toLowerCase().includes(q)) ||
          (t.assignee_names &&
            t.assignee_names.some((name) => name.toLowerCase().includes(q))) ||
          (t.assignee_name && t.assignee_name.toLowerCase().includes(q))
      );
    }

    return list;
  }, [tasks, statusFilter, searchTerm]);

  // Toggle task completion
  const handleToggleDone = async (task: EventTask) => {
    const nextDone = !task.is_done;
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? { ...t, is_done: nextDone, completed_at: nextDone ? new Date().toISOString() : null }
          : t
      )
    );

    try {
      const res = await toggleTaskDoneAction({ taskId: task.id, isDone: nextDone });
      if (!res.success) {
        throw new Error(res.error || 'Failed to update task.');
      }
    } catch (err) {
      // Revert on error
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, is_done: task.is_done } : t))
      );
      setError(err instanceof Error ? err.message : 'Error updating task state.');
    }
  };

  const formatShortDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const formatDueTime = (timeStr?: string | null) => {
    if (!timeStr) return null;
    try {
      const parts = timeStr.split(':');
      if (parts.length >= 2) {
        const hour = parseInt(parts[0], 10);
        const min = parts[1];
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${min} ${ampm}`;
      }
      return timeStr;
    } catch {
      return timeStr;
    }
  };

  const getCountdownBadge = (dueDate?: string | null) => {
    if (!dueDate) return null;
    const days = calculateDaysRemaining(dueDate);
    if (days < 0) {
      return (
        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold text-red-800">
          Overdue
        </span>
      );
    }
    if (days === 0) {
      return (
        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold text-red-800 animate-pulse">
          Due Today
        </span>
      );
    }
    if (days === 1) {
      return (
        <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold text-amber-800">
          Due Tomorrow
        </span>
      );
    }
    if (days <= 7) {
      return (
        <span className="inline-flex items-center rounded-full bg-[#BC6F07]/15 px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold text-[#BC6F07]">
          In {days} days
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-[#3A4F1C]/10 px-2 py-0.5 text-[9px] sm:text-[10px] font-medium text-[#3A4F1C]">
        In {days} days
      </span>
    );
  };

  // Authority checks for buttons
  const canEdit = (t: EventTask) => {
    if (isStaff) return false;
    if (isSuperAdmin) return true;
    if (currentUserId && t.created_by === currentUserId) return true;
    return false;
  };

  const canCancel = (t: EventTask) => {
    if (isStaff) return false;
    if (isSuperAdmin) return true;
    if (currentUserId && t.created_by === currentUserId) return true;
    if (
      currentUserId &&
      ((t.assignee_ids && t.assignee_ids.includes(currentUserId)) ||
        t.assignee_id === currentUserId)
    ) {
      return true;
    }
    return false;
  };

  return (
    <div className="rounded-2xl border border-[#3A4F1C]/15 bg-white shadow-2xs overflow-hidden flex flex-col space-y-4 p-4 sm:p-6">
      {/* Sub-Tabs: Assigned to Me vs Assigned by Me vs All Team Tasks (Super Admin) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => handleTabChange('assigned_to_me')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${activeSubTab === 'assigned_to_me'
                ? 'bg-[#3A4F1C] text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Assigned to Me</span>
          </button>

          {!isStaff && (
            <button
              type="button"
              onClick={() => handleTabChange('assigned_by_me')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${activeSubTab === 'assigned_by_me'
                  ? 'bg-[#3A4F1C] text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Assigned by Me</span>
            </button>
          )}

          {isSuperAdmin && !isStaff && (
            <button
              type="button"
              onClick={() => handleTabChange('all')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${activeSubTab === 'all'
                  ? 'bg-amber-800 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
            >
              <Shield className="h-3.5 w-3.5" />
              <span>All Team Tasks</span>
              <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px] font-bold">
                Super Admin
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={handleRefresh}
            title="Refresh tasks"
            className="rounded-lg p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, event, client, or member..."
            className="w-full rounded-xl border border-stone-200 bg-white py-1.5 pl-8 pr-3 text-xs text-stone-900 placeholder-stone-400 focus:border-[#3A4F1C] focus:outline-hidden shadow-2xs"
          />
        </div>
      </div>

      {/* Filter Status: Dropdown on Mobile (<sm) */}
      <div className="sm:hidden flex items-center gap-2">
        <label htmlFor="mobile-status-filter" className="text-[11px] font-medium text-stone-500 shrink-0">
          Status:
        </label>
        <div className="relative flex-1">
          <select
            id="mobile-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="w-full rounded-xl border border-stone-200 bg-white py-1.5 pl-3 pr-8 text-xs font-medium text-stone-800 focus:border-[#3A4F1C] focus:outline-hidden shadow-2xs cursor-pointer appearance-none"
          >
            <option value="all">All ({statusCounts.all})</option>
            <option value="pending">Pending ({statusCounts.pending})</option>
            <option value="done">Completed ({statusCounts.done})</option>
            <option value="cancelled">Cancelled ({statusCounts.cancelled})</option>
          </select>
          <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400">
            <ChevronDown className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>

      {/* Filter Status: Tablet & Desktop Pills (sm+) */}
      <div className="hidden sm:flex items-center gap-1.5 flex-wrap">
        <span className="text-[11px] font-medium text-stone-500 mr-1">Status:</span>
        {(
          [
            { id: 'all', label: 'All', count: statusCounts.all },
            { id: 'pending', label: 'Pending', count: statusCounts.pending },
            { id: 'done', label: 'Completed', count: statusCounts.done },
            { id: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled },
          ] as const
        ).map((pill) => (
          <button
            key={pill.id}
            type="button"
            onClick={() => setStatusFilter(pill.id)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
              statusFilter === pill.id
                ? 'bg-[#3A4F1C]/15 text-[#3A4F1C] border border-[#3A4F1C]/30 font-semibold'
                : 'border border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900'
            }`}
          >
            <span>{pill.label}</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                statusFilter === pill.id
                  ? 'bg-[#3A4F1C] text-white font-bold'
                  : 'bg-stone-100 text-stone-500'
              }`}
            >
              {pill.count}
            </span>
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Task Cards List (Limited height container with vertical scroll) */}
      <div className="w-full max-h-[600px] sm:max-h-[680px] overflow-y-auto pr-1 sm:pr-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-xs text-stone-400">
            <Loader2 className="h-4 w-4 animate-spin mr-2 text-[#3A4F1C]" />
            <span>Loading tasks...</span>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-16 text-stone-400 text-xs">
            No tasks found matching your filter or search criteria.
          </div>
        ) : (
          <div className="space-y-2.5 w-full pb-2">
            {filteredTasks.map((t) => {
              const isDone = t.is_done && !t.is_cancelled;
              const isCancelled = t.is_cancelled;
              const assignees =
                t.assignee_names && t.assignee_names.length > 0
                  ? t.assignee_names
                  : t.assignee_name
                    ? [t.assignee_name]
                    : [];

              return (
                <div
                  key={t.id}
                  className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 rounded-xl border p-2.5 sm:p-3.5 transition ${
                    isCancelled
                      ? 'border-red-200/80 bg-red-50/30 opacity-75'
                      : isDone
                        ? 'border-stone-200 bg-stone-50/70 opacity-80'
                        : 'border-stone-200/90 bg-white hover:border-[#3A4F1C]/40 hover:bg-[#F7F3E8]/20'
                  }`}
                >
                  {/* Left: Checkbox & Title */}
                  <div className="flex items-start gap-2.5 sm:gap-3 flex-1 min-w-0">
                    <button
                      type="button"
                      disabled={isCancelled}
                      onClick={() => handleToggleDone(t)}
                      className="mt-0.5 text-stone-400 hover:text-[#3A4F1C] transition shrink-0 disabled:opacity-40"
                      title={
                        isCancelled
                          ? 'Cancelled task'
                          : isDone
                            ? 'Mark as pending'
                            : 'Mark as completed'
                      }
                    >
                      {isCancelled ? (
                        <Square className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-stone-300" />
                      ) : isDone ? (
                        <CheckSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#3A4F1C]" />
                      ) : (
                        <Square className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      )}
                    </button>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <span
                          className={`text-[11px] sm:text-xs block leading-snug break-words ${
                            isCancelled
                              ? 'line-through text-red-600/80 font-normal'
                              : isDone
                                ? 'line-through text-stone-400 font-normal'
                                : 'text-stone-900 font-semibold'
                          }`}
                        >
                          {t.title}
                        </span>

                        {isCancelled && (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-1.5 sm:px-2 py-0.2 text-[8.5px] sm:text-[9px] font-bold text-red-800">
                            Cancelled
                          </span>
                        )}
                      </div>

                      {/* Event Context & Creator (Left-aligned & stacked on mobile, inline on sm+) */}
                      <div className="flex flex-col sm:flex-row sm:items-center items-start gap-0.5 sm:gap-2 text-[10px] sm:text-[11px] text-stone-500 text-left">
                        {t.booking && (
                          <button
                            type="button"
                            onClick={() => onSelectBooking && t.booking && onSelectBooking(t.booking as unknown as BookingRecord)}
                            className="inline-flex items-center gap-1 font-mono font-medium text-stone-700 hover:text-[#3A4F1C] transition cursor-pointer text-left"
                            title="View event details"
                          >
                            <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-[#3A4F1C] shrink-0" />
                            <span>{t.booking.booking_reference}</span>
                            <span className="font-sans font-normal text-stone-400 truncate max-w-[200px] sm:max-w-none">
                              • {t.booking.service_title}
                            </span>
                          </button>
                        )}
                        {t.creator_name && (
                          <span className="text-[9px] sm:text-[10px] text-stone-400 text-left">
                            (Assigned by {t.creator_name})
                          </span>
                        )}
                      </div>

                      {/* Assignees & Deadlines */}
                      <div className="flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] text-stone-500 flex-wrap pt-0.5">
                        {assignees.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap">
                            <User className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-stone-400 shrink-0" />
                            {assignees.map((name, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center rounded-sm bg-stone-100 px-1.5 py-0.2 text-[9px] sm:text-[10px] font-medium text-stone-700"
                              >
                                @{name}
                              </span>
                            ))}
                          </div>
                        )}

                        {(t.due_date || t.due_time) && (
                          <div className="flex items-center gap-1 sm:gap-1.5">
                            <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-stone-400 shrink-0" />
                            <span>
                              Due: {formatShortDate(t.due_date)}
                              {t.due_time ? ` at ${formatDueTime(t.due_time)}` : ''}
                            </span>
                            {getCountdownBadge(t.due_date)}
                          </div>
                        )}

                        {t.cancellation_reason && (
                          <span className="text-red-600/90 italic text-[9px] sm:text-[10px]">
                            Reason: {t.cancellation_reason}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Action Buttons */}
                  <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 justify-end pt-1.5 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                    {/* Edit Task Button: enabled if creator or super admin */}
                    {canEdit(t) && !isCancelled && (
                      <button
                        type="button"
                        onClick={() => setEditingTask(t)}
                        className="h-6.5 w-6.5 sm:h-7 sm:w-7 rounded-lg inline-flex items-center justify-center border border-stone-200 bg-white text-stone-600 hover:text-[#3A4F1C] hover:border-[#3A4F1C]/40 hover:bg-stone-50 transition shrink-0"
                        title="Edit Task Details"
                        aria-label="Edit Task Details"
                      >
                        <Edit3 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </button>
                    )}

                    {/* Cancel / Soft Delete Task Button: enabled if assignee, creator or super admin */}
                    {canCancel(t) && !isCancelled && (
                      <button
                        type="button"
                        onClick={() => setCancellingTask(t)}
                        className="h-6.5 w-6.5 sm:h-7 sm:w-7 rounded-lg inline-flex items-center justify-center border border-red-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-300 transition shrink-0"
                        title="Cancel Task"
                        aria-label="Cancel Task"
                      >
                        <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingTask && (
        <EditTaskModal
          key={editingTask.id}
          task={editingTask}
          isOpen={true}
          onClose={() => setEditingTask(null)}
          onSuccess={(updated) => {
            setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
          }}
        />
      )}

      {/* Cancel Modal */}
      {cancellingTask && (
        <CancelTaskModal
          key={cancellingTask.id}
          task={cancellingTask}
          isOpen={true}
          onClose={() => setCancellingTask(null)}
          onSuccess={(cancelledId) => {
            setTasks((prev) =>
              prev.map((t) =>
                t.id === cancelledId ? { ...t, is_cancelled: true } : t
              )
            );
          }}
        />
      )}
    </div>
  );
}
