'use client';

// =============================================================================
// edit-task-modal.tsx — Modal for updating event task details
// =============================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  Edit3,
  Calendar,
  Clock,
  User,
  X,
  Loader2,
  AlertCircle,
  Check,
} from 'lucide-react';
import type { EventTask } from '@/types/booking';
import { updateEventTaskAction } from '@/lib/services/admin-tasks-actions';
import { getTeamMembersAction } from '@/lib/services/admin-calendar-actions';

interface EditTaskModalProps {
  task: EventTask;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedTask: EventTask) => void;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export function EditTaskModal({
  task,
  isOpen,
  onClose,
  onSuccess,
}: EditTaskModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState(task.title);
  const [dueDate, setDueDate] = useState(task.due_date || '');
  const [dueTime, setDueTime] = useState(task.due_time || '');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(
    task.assignee_ids && task.assignee_ids.length > 0
      ? task.assignee_ids
      : task.assignee_id
      ? [task.assignee_id]
      : []
  );
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load team members on open
  useEffect(() => {
    if (!isOpen) return;

    let isCancelled = false;
    getTeamMembersAction()
      .then((members) => {
        if (!isCancelled && Array.isArray(members)) {
          setTeamMembers(members);
        }
      })
      .catch((err) => console.error('[EditTaskModal Members Error]:', err));

    return () => {
      isCancelled = true;
    };
  }, [isOpen]);

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

  const toggleMember = (memberId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title cannot be empty.');
      return;
    }

    setIsSaving(true);
    setError(null);

    const selectedMembers = teamMembers.filter((m) =>
      selectedMemberIds.includes(m.id)
    );
    const assigneeNames = selectedMembers.map((m) => m.name);

    try {
      const res = await updateEventTaskAction({
        taskId: task.id,
        title: title.trim(),
        assignee_ids: selectedMemberIds,
        assignee_names: assigneeNames,
        due_date: dueDate || null,
        due_time: dueTime || null,
      });

      if (!res.success || !res.task) {
        throw new Error(res.error || 'Failed to update task.');
      }

      onSuccess(res.task);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating task.');
    } finally {
      setIsSaving(false);
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
        className="relative w-full max-w-lg my-8 rounded-2xl bg-white shadow-xl border border-[#3A4F1C]/20 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center px-6 py-4 border-b border-[#3A4F1C]/10 bg-[#F7F3E8]/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3A4F1C]/10 text-[#3A4F1C]">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-[#2B3817]">
                Edit Task Details
              </h3>
              <p className="text-xs text-[#2B3817]/70">
                Only the creator or a Super Admin can edit task details.
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              Task Description
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:border-[#3A4F1C] focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Due Date
              </label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-white py-2 pl-9 pr-3 text-xs text-stone-900 focus:border-[#3A4F1C] focus:outline-hidden cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Due Time
              </label>
              <div className="relative">
                <Clock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-white py-2 pl-9 pr-3 text-xs text-stone-900 focus:border-[#3A4F1C] focus:outline-hidden cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Multi-Member Assignment */}
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              Assign Team Members (Multiple allowed)
            </label>
            <div className="max-h-40 overflow-y-auto rounded-xl border border-stone-200 bg-stone-50/50 p-2 space-y-1">
              {teamMembers.length === 0 ? (
                <div className="text-center py-3 text-xs text-stone-400">
                  Loading team members...
                </div>
              ) : (
                teamMembers.map((member) => {
                  const isSelected = selectedMemberIds.includes(member.id);
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => toggleMember(member.id)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition ${
                        isSelected
                          ? 'bg-[#3A4F1C] text-white font-medium shadow-2xs'
                          : 'bg-white border border-stone-200/80 text-stone-700 hover:bg-[#F7F3E8] hover:text-[#3A4F1C]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 shrink-0" />
                        <span>{member.name}</span>
                        {member.role && (
                          <span
                            className={`text-[10px] capitalize ${
                              isSelected ? 'text-white/80' : 'text-stone-400'
                            }`}
                          >
                            • {member.role}
                          </span>
                        )}
                      </div>
                      {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#3A4F1C] px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-[#2B3817] transition disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Edit3 className="h-3.5 w-3.5" />
              )}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
