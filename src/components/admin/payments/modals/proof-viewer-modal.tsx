'use client';

// =============================================================================
// components/admin/payments/modals/proof-viewer-modal.tsx — Secure Proof Viewer
// =============================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Paperclip,
  Download,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { getProofSignedUrlAction } from '@/lib/services/admin-payment-actions';
import type { ExtendedPaymentRecord } from '@/lib/services/admin-payment-actions';

interface ProofViewerModalProps {
  payment: ExtendedPaymentRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProofViewerModal({ payment, isOpen, onClose }: ProofViewerModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

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

  // Fetch signed URL asynchronously without synchronous setState in effect body
  useEffect(() => {
    const storagePath = payment?.proof_attachment_path;
    if (!isOpen || !storagePath) return;

    let active = true;
    getProofSignedUrlAction(storagePath)
      .then((res) => {
        if (!active) return;
        if (res.success && res.signedUrl) {
          setSignedUrl(res.signedUrl);
        } else {
          setError(res.error || 'Failed to generate secure viewing link.');
        }
        setIsLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Error generating preview link.');
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen, payment?.proof_attachment_path]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen || !payment) return null;

  const isPdf =
    payment.proof_attachment_mime_type === 'application/pdf' ||
    payment.proof_attachment_name?.toLowerCase().endsWith('.pdf');

  const handleDownloadProof = async () => {
    if (!signedUrl || isDownloading) return;
    setIsDownloading(true);
    try {
      const response = await fetch(signedUrl);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = payment?.proof_attachment_name || `payment_proof_${payment?.payment_number || 'receipt'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('[handleDownloadProof Error]:', err);
      // Fallback: open signed URL in a new window
      window.open(signedUrl, '_blank');
    } finally {
      setIsDownloading(false);
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
        className="relative w-full max-w-2xl bg-[#F7F3E8] border border-[#3A4F1C]/20 rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#3A4F1C] text-[#F7F3E8] shrink-0">
          <div className="flex items-center gap-2 truncate">
            <Paperclip className="h-4 w-4 text-[#BC6F07] shrink-0" />
            <div className="truncate">
              <h3 className="font-serif font-semibold text-sm truncate">
                Proof of Payment: {payment.payment_number}
              </h3>
              <p className="text-[10px] text-[#F7F3E8]/70 truncate">
                {payment.proof_attachment_name || 'Attached file'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#F7F3E8]/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Security Banner */}
        <div className="bg-emerald-50/80 border-b border-emerald-100 px-4 py-2 flex items-center justify-end text-[11px] text-emerald-900 shrink-0">
          {signedUrl && (
            <button
              type="button"
              onClick={handleDownloadProof}
              disabled={isDownloading}
              className="inline-flex items-center gap-1 text-emerald-800 hover:text-emerald-950 font-semibold cursor-pointer disabled:opacity-50"
            >
              {isDownloading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Download className="h-3 w-3" />
              )}
              <span>{isDownloading ? 'Downloading...' : 'Download Proof'}</span>
            </button>
          )}
        </div>

        {/* Body Preview Area */}
        <div className="p-4 flex-1 overflow-y-auto flex items-center justify-center bg-stone-900/5 min-h-[350px]">
          {isLoading && (
            <div className="text-center space-y-2 py-12">
              <Loader2 className="h-6 w-6 animate-spin text-[#3A4F1C] mx-auto" />
              <p className="text-xs text-stone-500 font-medium">Generating secure temporary URL...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 max-w-md text-center space-y-2">
              <AlertCircle className="h-5 w-5 text-rose-600 mx-auto" />
              <p className="text-xs font-semibold">{error}</p>
            </div>
          )}

          {!isLoading && !error && signedUrl && (
            <div className="w-full flex items-center justify-center">
              {isPdf ? (
                <div className="w-full h-[500px] rounded-xl overflow-hidden border border-stone-200 bg-white">
                  <iframe
                    src={signedUrl}
                    title="Proof of Payment PDF Preview"
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <div className="relative max-h-[500px] w-full flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={signedUrl}
                    alt={`Proof for ${payment.payment_number}`}
                    className="max-h-[500px] max-w-full rounded-xl object-contain shadow-md border border-stone-200"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500 shrink-0">
          <span>
            Client: <strong className="text-stone-700">{payment.booking?.client_full_name}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-stone-200 hover:bg-stone-300 text-stone-800 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
