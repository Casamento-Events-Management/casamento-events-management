'use client';

// =============================================================================
// components/admin/overview/personal-tasks-list.tsx — Assigned Tasks with Toggle
// =============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckSquare,
  Square,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import type { EventTask } from '@/types/booking';
import { calculateDaysRemaining } from '@/lib/utils/dateUtils';
import { toggleTaskDoneAction } from '@/lib/services/admin-tasks-actions';

interface PersonalTasksListProps {
  initialTasks: EventTask[];
  onTaskToggled?: (taskId: string, isDone: boolean) => void;
}

export function PersonalTasksList({
  initialTasks,
  onTaskToggled,
}: PersonalTasksListProps) {
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());
  const [optimisticOverrides, setOptimisticOverrides] = useState<Record<string, boolean>>({});

  const handleToggle = async (task: EventTask) => {
    const currentDone =
      optimisticOverrides[task.id] !== undefined
        ? optimisticOverrides[task.id]
        : task.is_done;
    const nextDone = !currentDone;

    // Optimistic UI update
    setOptimisticOverrides((prev) => ({ ...prev, [task.id]: nextDone }));
    setTogglingIds((prev) => new Set(prev).add(task.id));

    try {
      const res = await toggleTaskDoneAction({ taskId: task.id, isDone: nextDone });
      if (!res.success) {
        throw new Error(res.error || 'Failed to update task.');
      }
      onTaskToggled?.(task.id, nextDone);
    } catch (err) {
      // Revert on error
      setOptimisticOverrides((prev) => {
        const next = { ...prev };
        delete next[task.id];
        return next;
      });
      console.error('[PersonalTasksList Error]:', err);
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(task.id);
        return next;
      });
    }
  };

  const getDueBadge = (dueDate?: string | null) => {
    if (!dueDate) return null;
    const days = calculateDaysRemaining(dueDate);
    if (days < 0) {
      return (
        <span
          title={`Overdue since ${dueDate}`}
          className="rounded-md bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-800"
        >
          Overdue
        </span>
      );
    }
    if (days === 0) {
      return (
        <span
          title="Due by end of day today"
          className="rounded-md bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-800 animate-pulse"
        >
          Due Today
        </span>
      );
    }
    if (days === 1) {
      return (
        <span
          title="Due tomorrow"
          className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800"
        >
          Tomorrow
        </span>
      );
    }
    return (
      <span
        title={`Due on ${dueDate}`}
        className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium text-stone-600"
      >
        In {days}d
      </span>
    );
  };

  const activeIncompleteTasks = initialTasks.filter((t) => {
    const isDone =
      optimisticOverrides[t.id] !== undefined
        ? optimisticOverrides[t.id]
        : t.is_done;
    return !isDone && !t.is_cancelled;
  });

  return (
    <div className="rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-5 shadow-2xs space-y-3">
      {/* Header */}
      <div className="flex items-center pb-2 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-[#3A4F1C]" />
          <h2 className="text-sm font-semibold text-stone-900">
            Your Tasks
          </h2>
          <span className="rounded-full bg-stone-100 px-2 py-0.2 text-[11px] font-bold text-stone-600">
            {activeIncompleteTasks.length}
          </span>
        </div>

        <Link
          href="/admin/bookings?tab=tasks&taskView=assigned_to_me"
          className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-[#3A4F1C] hover:text-[#2B3817] hover:underline"
        >
          <span>All Tasks</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Tasks List */}
      {activeIncompleteTasks.length === 0 ? (
        <div className="py-8 text-center text-xs text-stone-400 flex flex-col items-center gap-1.5">
          <CheckCircle2 className="h-6 w-6 text-emerald-600/70" />
          <span>You have no incomplete tasks assigned to you right now.</span>
        </div>
      ) : (
        <div className="divide-y divide-stone-100">
          {activeIncompleteTasks.map((task) => {
            const isBusy = togglingIds.has(task.id);
            const isDone =
              optimisticOverrides[task.id] !== undefined
                ? optimisticOverrides[task.id]
                : task.is_done;

            return (
              <div
                key={task.id}
                className="group flex items-start gap-2.5 py-2.5 hover:bg-[#F7F3E8]/30 rounded-xl px-2 transition -mx-2"
              >
                {/* 1-Click Checkbox Toggle */}
                <button
                  type="button"
                  onClick={() => handleToggle(task)}
                  disabled={isBusy}
                  title={isDone ? 'Mark as incomplete' : 'Mark as complete'}
                  className="mt-0.5 text-stone-400 hover:text-[#3A4F1C] transition cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {isDone ? (
                    <CheckSquare className="h-4 w-4 text-[#3A4F1C]" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </button>

                {/* Title & Linked Event Info */}
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p
                    className={`text-xs font-medium text-stone-900 leading-tight ${
                      isDone ? 'line-through text-stone-400' : ''
                    }`}
                  >
                    {task.title}
                  </p>

                  {task.booking && (
                    <div className="flex items-center gap-2 text-[10px] text-stone-500">
                      <span className="truncate max-w-[160px]">
                        {task.booking.service_title}
                      </span>
                      <span>·</span>
                      <span className="font-mono text-stone-400">
                        {task.booking.booking_reference}
                      </span>
                    </div>
                  )}
                </div>

                {/* Due Date Urgency Badge (Right Side) */}
                <div className="shrink-0 ml-auto pt-0.5">
                  {getDueBadge(task.due_date)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
