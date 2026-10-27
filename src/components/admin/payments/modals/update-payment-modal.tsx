'use client';

// =============================================================================
// components/admin/payments/modals/update-payment-modal.tsx — Edit Payment Entry
// =============================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  CreditCard,
  Loader2,
  AlertCircle,
  Paperclip,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
  updatePaymentAction,
  type ExtendedPaymentRecord,
} from '@/lib/services/admin-payment-actions';
import { PAYMENT_METHODS } from '@/types/payment';
import {
  handleNumberInputKeyDown,
  sanitizeNumberInput,
} from '@/lib/utils/currencyUtils';

interface UpdatePaymentModalProps {
  payment: ExtendedPaymentRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UpdatePaymentModal({
  payment,
  isOpen,
  onClose,
  onSuccess,
}: UpdatePaymentModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [amountPesos, setAmountPesos] = useState(() =>
    payment ? (payment.amount_centavos / 100).toFixed(2) : ''
  );
  const [paymentMethod, setPaymentMethod] = useState<string>(
    () => payment?.payment_method || 'bank_transfer'
  );
  const [paidAt, setPaidAt] = useState(() =>
    payment?.paid_at
      ? new Date(payment.paid_at).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  );
  const [notes, setNotes] = useState(() => payment?.notes || '');
  const [channelDetails, setChannelDetails] = useState(() => {
    const cd = (payment?.channel_details || {}) as Record<string, string>;
    return {
      bankName: cd.bankName || '',
      referenceNumber: cd.referenceNumber || '',
      senderName: cd.senderName || '',
      accountNumberLast4: cd.accountNumberLast4 || '',
    };
  });

  // Proof file state
  const [existingProof] = useState<{
    path: string;
    name: string;
  } | null>(() =>
    payment?.proof_attachment_path
      ? {
        path: payment.proof_attachment_path,
        name: payment.proof_attachment_name || 'Proof Attachment',
      }
      : null
  );
  const [newProofFile, setNewProofFile] = useState<File | null>(null);
  const [removeProof, setRemoveProof] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Esc key and scroll lock
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('Proof attachment file size cannot exceed 10MB.');
      return;
    }

    setNewProofFile(file);
    setRemoveProof(false);
    setError(null);
  };

  if (!isOpen || !payment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numAmount = parseFloat(amountPesos);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid payment amount greater than zero.');
      return;
    }

    setIsSubmitting(true);

    try {
      let proofAttachmentPayload: {
        path: string;
        name: string;
        sizeBytes?: number;
        mimeType?: string;
      } | null = null;

      if (removeProof) {
        proofAttachmentPayload = null;
      } else if (newProofFile) {
        // Upload new file to Supabase storage
        const supabase = createClient();
        const timestamp = Date.now();
        const cleanName = newProofFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const storagePath = `proofs/${payment.booking_reference}/${timestamp}_${cleanName}`;

        const { error: uploadError } = await supabase.storage
          .from('payment-proofs')
          .upload(storagePath, newProofFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Failed to upload proof of payment: ${uploadError.message}`);
        }

        proofAttachmentPayload = {
          path: storagePath,
          name: newProofFile.name,
          sizeBytes: newProofFile.size,
          mimeType: newProofFile.type,
        };
      } else if (existingProof) {
        proofAttachmentPayload = {
          path: existingProof.path,
          name: existingProof.name,
          sizeBytes: payment.proof_attachment_size_bytes || undefined,
          mimeType: payment.proof_attachment_mime_type || undefined,
        };
      }

      const res = await updatePaymentAction({
        paymentId: payment.id,
        amountPesos: numAmount,
        paymentMethod,
        paidAt,
        channelDetails,
        notes: notes.trim() || null,
        proofAttachment: proofAttachmentPayload,
      });

      if (!res.success) {
        setError(res.error || 'Failed to update payment record.');
        setIsSubmitting(false);
        return;
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error('[UpdatePaymentModal Error]:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-[#F7F3E8] border border-[#3A4F1C]/20 rounded-2xl shadow-2xl overflow-hidden my-4 max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center px-6 py-4 bg-[#3A4F1C] text-[#F7F3E8] shrink-0">
          <div className="flex items-center gap-2.5">
            <CreditCard className="h-5 w-5 text-[#BC6F07] shrink-0" />
            <div>
              <h3 className="font-serif font-bold text-base text-white">Update Payment Entry</h3>
              <p className="text-xs text-[#F7F3E8]/80 font-mono">
                {payment.payment_number} · Ref: {payment.booking_reference}
              </p>
            </div>
          </div>
          <div className="ml-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="p-1 rounded-lg text-[#F7F3E8]/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Amount (PHP) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
              Payment Amount (PHP) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-stone-500 text-sm">
                ₱
              </span>
              <input
                type="text"
                inputMode="decimal"
                required
                value={amountPesos}
                onKeyDown={handleNumberInputKeyDown}
                onChange={(e) => setAmountPesos(sanitizeNumberInput(e.target.value))}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-2 bg-white border border-stone-300 rounded-xl text-sm font-semibold text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-[#3A4F1C]/20 focus:border-[#3A4F1C]"
              />
            </div>
          </div>

          {/* Payment Method & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                Payment Method <span className="text-rose-500">*</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-medium text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-[#3A4F1C]/20 focus:border-[#3A4F1C] capitalize cursor-pointer"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m} className="capitalize">
                    {m.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                Payment Date & Time <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  required
                  value={paidAt}
                  onChange={(e) => setPaidAt(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-medium text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-[#3A4F1C]/20 focus:border-[#3A4F1C]"
                />
              </div>
            </div>
          </div>

          {/* Channel Details */}
          {(paymentMethod === 'bank_transfer' || paymentMethod === 'gcash' || paymentMethod === 'maya') && (
            <div className="p-3.5 bg-stone-50/80 rounded-xl border border-stone-200/80 space-y-3">
              <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                Channel / Transfer Details
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {paymentMethod === 'bank_transfer' && (
                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={channelDetails.bankName}
                      onChange={(e) =>
                        setChannelDetails({ ...channelDetails, bankName: e.target.value })
                      }
                      placeholder="e.g. BDO, BPI"
                      className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">
                    Reference / Ref #
                  </label>
                  <input
                    type="text"
                    value={channelDetails.referenceNumber}
                    onChange={(e) =>
                      setChannelDetails({ ...channelDetails, referenceNumber: e.target.value })
                    }
                    placeholder="Reference number"
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">
                    Sender / Account Name
                  </label>
                  <input
                    type="text"
                    value={channelDetails.senderName}
                    onChange={(e) =>
                      setChannelDetails({ ...channelDetails, senderName: e.target.value })
                    }
                    placeholder="Sender name"
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Proof Attachment */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
              Proof of Payment Attachment
            </label>

            {existingProof && !removeProof && !newProofFile && (
              <div className="flex items-center justify-between p-2.5 bg-white border border-stone-200 rounded-xl text-xs">
                <div className="flex items-center gap-2 truncate">
                  <Paperclip className="h-4 w-4 text-emerald-700 shrink-0" />
                  <span className="truncate text-stone-800 font-medium">{existingProof.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] text-[#3A4F1C] hover:underline font-semibold cursor-pointer"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={() => setRemoveProof(true)}
                    className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer"
                    title="Remove Proof"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {newProofFile && (
              <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                <div className="flex items-center gap-2 truncate">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="truncate font-semibold">{newProofFile.name} (New)</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNewProofFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {removeProof && (
              <div className="flex items-center justify-between p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                <span>Existing proof will be removed upon saving.</span>
                <button
                  type="button"
                  onClick={() => setRemoveProof(false)}
                  className="text-rose-700 underline font-semibold cursor-pointer"
                >
                  Undo
                </button>
              </div>
            )}

            {(!existingProof || removeProof) && !newProofFile && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-4 rounded-xl border border-dashed border-stone-300 hover:border-[#3A4F1C] bg-white text-center cursor-pointer transition"
              >
                <Paperclip className="h-5 w-5 mx-auto text-stone-400 mb-1" />
                <p className="text-xs text-stone-600 font-medium">Click to upload proof (optional)</p>
                <p className="text-[10px] text-stone-400">JPG, PNG, WEBP, or PDF up to 10MB</p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Internal Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
              Internal Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Operational or reconciliation notes..."
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-[#3A4F1C]/20 focus:border-[#3A4F1C]"
            />
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-200 hover:bg-stone-300 text-stone-700 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-[#3A4F1C] hover:bg-[#2B3817] text-white shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
