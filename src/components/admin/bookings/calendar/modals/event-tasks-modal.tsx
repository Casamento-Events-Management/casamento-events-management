'use client';

// =============================================================================
// event-tasks-modal.tsx — Event Task Checklist & Assignee Management
// =============================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Calendar,
  User,
  Clock,
  Loader2,
  X,
  AlertCircle,
  AtSign,
} from 'lucide-react';
import type { BookingRecord, EventTask } from '@/types/booking';
import {
  getEventTasksAction,
  createEventTaskAction,
  toggleEventTaskAction,
  deleteEventTaskAction,
  getTeamMembersAction,
} from '@/lib/services/admin-calendar-actions';

interface EventTasksModalProps {
  booking: BookingRecord;
  isOpen: boolean;
  onClose: () => void;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export function EventTasksModal({
  booking,
  isOpen,
  onClose,
}: EventTasksModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [tasks, setTasks] = useState<EventTask[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newAssignee, setNewAssignee] = useState('');
  const [newAssigneeId, setNewAssigneeId] = useState<string | null>(null);
  const [newDueDate, setNewDueDate] = useState('');
  const [newDueTime, setNewDueTime] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [showMemberSuggestions, setShowMemberSuggestions] = useState(false);

  // Load tasks and team members on open
  useEffect(() => {
    if (!isOpen) return;

    let isCancelled = false;

    Promise.all([
      getEventTasksAction(booking.id),
      getTeamMembersAction(),
    ])
      .then(([tasksRes, membersRes]) => {
        if (!isCancelled) {
          if (tasksRes.success && tasksRes.tasks) {
            setTasks(tasksRes.tasks);
          } else {
            setError(tasksRes.error || 'Failed to load tasks.');
          }

          if (Array.isArray(membersRes)) {
            setTeamMembers(membersRes);
          }
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Error fetching tasks.');
        }
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [isOpen, booking.id]);

  // Esc key and scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
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

  const handleSelectMember = (member: TeamMember) => {
    setNewAssignee(member.name);
    setNewAssigneeId(member.id);
    setShowMemberSuggestions(false);
  };

  const filteredMembers = teamMembers.filter((m) => {
    if (!newAssignee.trim()) return true;
    const cleanQuery = newAssignee.replace(/^@/, '').toLowerCase();
    return (
      m.name.toLowerCase().includes(cleanQuery) ||
      m.email.toLowerCase().includes(cleanQuery) ||
      (m.role && m.role.toLowerCase().includes(cleanQuery))
    );
  });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsAdding(true);
    setError(null);

    try {
      const res = await createEventTaskAction({
        bookingId: booking.id,
        title: newTitle.trim(),
        assignee_name: newAssignee.trim() ? newAssignee.replace(/^@/, '').trim() : undefined,
        assignee_id: newAssigneeId || undefined,
        due_date: newDueDate || undefined,
        due_time: newDueTime || undefined,
      });

      if (!res.success || !res.task) {
        throw new Error(res.error || 'Failed to create task.');
      }

      setTasks((prev) => [...prev, res.task!]);
      setNewTitle('');
      setNewAssignee('');
      setNewAssigneeId(null);
      setNewDueDate('');
      setNewDueTime('');
      setShowMemberSuggestions(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add task.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleTask = async (taskId: string, currentDone: boolean) => {
    const nextDone = !currentDone;
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, is_done: nextDone, completed_at: nextDone ? new Date().toISOString() : null }
          : t
      )
    );

    try {
      const res = await toggleEventTaskAction({ taskId, isDone: nextDone });
      if (!res.success) {
        throw new Error(res.error || 'Failed to update task.');
      }
    } catch (err) {
      // Revert optimistic update on failure
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, is_done: currentDone } : t))
      );
      setError(err instanceof Error ? err.message : 'Error updating task.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const previous = [...tasks];
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    try {
      const res = await deleteEventTaskAction(taskId);
      if (!res.success) {
        throw new Error(res.error || 'Failed to delete task.');
      }
    } catch (err) {
      setTasks(previous);
      setError(err instanceof Error ? err.message : 'Error deleting task.');
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

  if (!isOpen) return null;

  const completedCount = tasks.filter((t) => t.is_done).length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-xl my-8 rounded-2xl bg-white shadow-xl border border-[#3A4F1C]/20 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center px-6 py-4 border-b border-[#3A4F1C]/10 bg-[#F7F3E8]/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3A4F1C]/10 text-[#3A4F1C]">
              <CheckSquare className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-serif font-bold text-[#2B3817]">
                  Event Tasks Checklist
                </h3>
                {tasks.length > 0 && (
                  <span className="inline-flex items-center rounded-full bg-[#3A4F1C]/10 px-2 py-0.5 text-[11px] font-semibold text-[#3A4F1C]">
                    {completedCount} of {tasks.length} done
                  </span>
                )}
              </div>
              <p className="text-xs text-[#2B3817]/70">
                Ref: <span className="font-mono font-semibold text-stone-900">{booking.booking_reference}</span> • {booking.service_title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            title="Close (Esc)"
            className="ml-auto rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[calc(85vh-140px)] overflow-y-auto">
          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* New Task Inline Form */}
          <form
            onSubmit={handleCreateTask}
            className="rounded-xl border border-stone-200/90 bg-[#F7F3E8]/30 p-3.5 space-y-2.5"
          >
            <span className="text-xs font-semibold text-stone-800 block">
              Add New Event Task
            </span>
            <input
              type="text"
              required
              placeholder="e.g. Order floral arrangements, confirm sound system delivery..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-900 placeholder-stone-400 focus:border-[#3A4F1C] focus:outline-hidden"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Member Mentioning / Assignee Field */}
              <div className="relative">
                <AtSign className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Assignee (e.g. @Maria)"
                  value={newAssignee}
                  onFocus={() => setShowMemberSuggestions(true)}
                  onChange={(e) => {
                    setNewAssignee(e.target.value);
                    setNewAssigneeId(null);
                    setShowMemberSuggestions(true);
                  }}
                  className="w-full rounded-lg border border-stone-300 bg-white py-1.5 pl-8 pr-2 text-xs text-stone-900 placeholder-stone-400 focus:border-[#3A4F1C] focus:outline-hidden"
                />

                {/* Member Dropdown / Mention Suggestions */}
                {showMemberSuggestions && teamMembers.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-30 max-h-40 overflow-y-auto rounded-lg border border-stone-200 bg-white shadow-lg p-1">
                    <div className="px-2 py-1 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                      Mention Team Member
                    </div>
                    {filteredMembers.length === 0 ? (
                      <div className="px-2 py-1 text-xs text-stone-400 italic">No matches</div>
                    ) : (
                      filteredMembers.map((member) => (
                        <button
                          key={member.id}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelectMember(member);
                          }}
                          className="w-full text-left flex items-center justify-between px-2 py-1.5 text-xs rounded-md hover:bg-[#F7F3E8] hover:text-[#3A4F1C] transition"
                        >
                          <div className="flex items-center gap-1.5">
                            <User className="h-3 w-3 text-stone-400" />
                            <span className="font-medium text-stone-800">{member.name}</span>
                          </div>
                          {member.role && (
                            <span className="text-[10px] text-stone-400 capitalize">{member.role}</span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Due Date */}
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  title="Due Date"
                  className="w-full rounded-lg border border-stone-300 bg-white py-1.5 pl-8 pr-2 text-xs text-stone-900 focus:border-[#3A4F1C] focus:outline-hidden cursor-pointer"
                />
              </div>

              {/* Due Time */}
              <div className="relative">
                <Clock className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                <input
                  type="time"
                  value={newDueTime}
                  onChange={(e) => setNewDueTime(e.target.value)}
                  title="Due Time"
                  className="w-full rounded-lg border border-stone-300 bg-white py-1.5 pl-8 pr-2 text-xs text-stone-900 focus:border-[#3A4F1C] focus:outline-hidden cursor-pointer"
                />
              </div>
            </div>

            {/* Quick Member Mention Badges if teamMembers loaded */}
            {teamMembers.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[10px] text-stone-400 font-medium">Mention:</span>
                {teamMembers.slice(0, 5).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleSelectMember(m)}
                    className="inline-flex items-center gap-1 rounded-md bg-stone-100 hover:bg-[#3A4F1C]/15 hover:text-[#3A4F1C] px-1.5 py-0.5 text-[10px] text-stone-600 transition"
                  >
                    <span>@{m.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isAdding || !newTitle.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#3A4F1C] px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-[#2B3817] transition disabled:opacity-50"
              >
                {isAdding ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
                <span>Add Task</span>
              </button>
            </div>
          </form>

          {/* Task List */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block">
              Tasks
            </span>

            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-xs text-stone-400">
                <Loader2 className="h-4 w-4 animate-spin mr-2 text-[#3A4F1C]" />
                <span>Loading tasks...</span>
              </div>
            ) : tasks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-stone-200 p-6 text-center text-xs text-stone-400">
                No tasks added for this event yet. Use the form above to add checklist items.
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className={`group flex items-start gap-3 rounded-xl border p-3 transition ${
                    task.is_done
                      ? 'border-stone-200 bg-stone-50/70 opacity-75'
                      : 'border-stone-200/90 bg-white hover:border-[#3A4F1C]/40'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleToggleTask(task.id, task.is_done)}
                    className="mt-0.5 text-stone-400 hover:text-[#3A4F1C] transition shrink-0"
                    title={task.is_done ? 'Mark as incomplete' : 'Mark as completed'}
                  >
                    {task.is_done ? (
                      <CheckSquare className="h-4 w-4 text-[#3A4F1C]" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <span
                      className={`text-xs block leading-snug break-words ${
                        task.is_done
                          ? 'line-through text-stone-400 font-normal'
                          : 'text-stone-900 font-medium'
                      }`}
                    >
                      {task.title}
                    </span>

                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-stone-500">
                      {task.assignee_name && (
                        <span className="inline-flex items-center gap-1 font-medium text-stone-700 bg-stone-100 rounded-sm px-1 py-0.2">
                          <User className="h-2.5 w-2.5 text-stone-400" />
                          <span>@{task.assignee_name}</span>
                        </span>
                      )}
                      {(task.due_date || task.due_time) && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3 text-stone-400" />
                          <span>
                            Due:{' '}
                            {task.due_date ? task.due_date : ''}
                            {task.due_date && task.due_time ? ' at ' : ''}
                            {task.due_time ? formatDueTime(task.due_time) : ''}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteTask(task.id)}
                    title="Delete task"
                    className="opacity-0 group-hover:opacity-100 p-1 text-stone-300 hover:text-red-600 transition shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-stone-100 bg-stone-50">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
