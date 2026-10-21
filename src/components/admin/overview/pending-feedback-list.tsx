'use client';

// =============================================================================
// components/admin/overview/pending-feedback-list.tsx — Pending Client Feedbacks
// =============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MessageSquareHeart,
  Star,
  Check,
  X,
  ExternalLink,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import type { OverviewPendingFeedback } from '@/types/admin-overview';
import {
  approveFeedbackAction,
  rejectFeedbackAction,
} from '@/lib/services/admin-feedback-service';

interface PendingFeedbackListProps {
  initialFeedbacks: OverviewPendingFeedback[];
  onFeedbackAction?: () => void;
}

export function PendingFeedbackList({
  initialFeedbacks,
  onFeedbackAction,
}: PendingFeedbackListProps) {
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  // Filter out optimistically actioned feedbacks during render (0 cascading renders)
  const visibleFeedbacks = initialFeedbacks.filter((f) => !removedIds.has(f.id));

  const handleApprove = async (item: OverviewPendingFeedback) => {
    if (processingIds.has(item.id)) return;

    setProcessingIds((prev) => new Set(prev).add(item.id));
    // Optimistic removal
    setRemovedIds((prev) => new Set(prev).add(item.id));

    try {
      const res = await approveFeedbackAction(item.id);
      if (!res.success) {
        throw new Error(res.error || 'Failed to approve feedback.');
      }
      onFeedbackAction?.();
    } catch (err) {
      console.error('[PendingFeedbackList Approve Error]:', err);
      // Revert on failure
      setRemovedIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  const handleReject = async (item: OverviewPendingFeedback) => {
    if (processingIds.has(item.id)) return;

    if (!window.confirm(`Reject and dismiss feedback from ${item.name}?`)) {
      return;
    }

    setProcessingIds((prev) => new Set(prev).add(item.id));
    // Optimistic removal
    setRemovedIds((prev) => new Set(prev).add(item.id));

    try {
      const res = await rejectFeedbackAction(item.id);
      if (!res.success) {
        throw new Error(res.error || 'Failed to reject feedback.');
      }
      onFeedbackAction?.();
    } catch (err) {
      console.error('[PendingFeedbackList Reject Error]:', err);
      // Revert on failure
      setRemovedIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffSec < 60) return 'Just now';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHour = Math.floor(diffMin / 60);
      if (diffHour < 24) return `${diffHour}h ago`;
      const diffDay = Math.floor(diffHour / 24);
      if (diffDay < 7) return `${diffDay}d ago`;

      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-5 shadow-2xs space-y-3">
      {/* Header */}
      <div className="flex items-center pb-2 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <MessageSquareHeart className="h-4 w-4 text-[#3A4F1C]" />
          <h2 className="text-sm font-semibold text-stone-900">
            Feedback Approval
          </h2>
          <span className="rounded-full bg-amber-100 px-2 py-0.2 text-[11px] font-bold text-amber-900">
            {visibleFeedbacks.length}
          </span>
        </div>

        <Link
          href="/studio/structure/clientFeedback"
          title="Manage in Sanity Studio"
          className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-[#3A4F1C] hover:text-[#2B3817] hover:underline"
        >
          <span>Sanity Studio</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* List / Zero State */}
      {visibleFeedbacks.length === 0 ? (
        <div className="py-8 text-center text-xs text-stone-400 flex flex-col items-center gap-1.5">
          <CheckCircle2 className="h-6 w-6 text-emerald-600/70" />
          <span>No feedback items currently awaiting approval.</span>
        </div>
      ) : (
        <div className="divide-y divide-stone-100 max-h-[380px] sm:max-h-[420px] overflow-y-auto overflow-x-hidden">
          {visibleFeedbacks.map((item) => {
            const isBusy = processingIds.has(item.id);

            return (
              <div
                key={item.id}
                className="group py-3.5 hover:bg-[#F7F3E8]/30 rounded-xl px-2.5 sm:px-2 transition -mx-2 space-y-2"
              >
                {/* Top Row: Client Name, Event Type, Rating & Relative Time */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-stone-900">
                      {item.name}
                    </span>
                    <span className="rounded-md bg-stone-100 px-1.5 py-0.2 text-[10px] font-medium text-stone-600">
                      {item.eventType}
                    </span>
                    {/* Star Rating Display */}
                    <div className="inline-flex items-center gap-0.5 text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < item.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-stone-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Relative Timestamp (Pushed right) */}
                  <span className="sm:ml-auto text-[10px] font-mono text-stone-400">
                    {formatRelativeTime(item.submittedAt)}
                  </span>
                </div>

                {/* Message Excerpt */}
                <p className="text-xs text-stone-700 bg-stone-50/80 p-2.5 rounded-xl border border-stone-200/50 leading-relaxed italic">
                  &ldquo;{item.message}&rdquo;
                </p>

                {/* Bottom Actions Row: Right-Aligned */}
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-[10px] text-stone-400 truncate max-w-[200px]" title={item.email}>
                    {item.email}
                  </span>

                  {/* Action Buttons: Pushed Right */}
                  <div className="flex items-center gap-2 ml-auto shrink-0">
                    {/* Direct Studio Edit Link */}
                    <Link
                      href={`/studio/structure/clientFeedback;${item.id}`}
                      title="Inspect & edit in Sanity Studio"
                      className="h-7 px-2 rounded-lg border border-stone-200 bg-white inline-flex items-center gap-1 text-[11px] font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition shadow-2xs"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span className="hidden sm:inline">Studio</span>
                    </Link>

                    {/* Reject Button */}
                    <button
                      type="button"
                      onClick={() => handleReject(item)}
                      disabled={isBusy}
                      title="Reject feedback"
                      className="h-7 px-2.5 rounded-lg border border-stone-200 bg-white inline-flex items-center gap-1 text-[11px] font-medium text-stone-600 hover:text-red-700 hover:border-red-200 hover:bg-red-50 transition cursor-pointer shadow-2xs disabled:opacity-50"
                    >
                      {isBusy ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                      <span>Reject</span>
                    </button>

                    {/* Approve Button */}
                    <button
                      type="button"
                      onClick={() => handleApprove(item)}
                      disabled={isBusy}
                      title="Approve and publish to website"
                      className="h-7 px-3 rounded-lg bg-[#3A4F1C] inline-flex items-center gap-1 text-[11px] font-semibold text-white hover:bg-[#2B3817] transition cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {isBusy ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}
                      <span>Approve</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
