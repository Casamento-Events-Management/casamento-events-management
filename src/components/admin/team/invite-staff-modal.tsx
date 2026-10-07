'use client';

// =============================================================================
// components/admin/team/invite-staff-modal.tsx — Modal Form to Invite Staff
// =============================================================================

import React, { useState } from 'react';
import { X, Mail, User, Shield, Loader2, AlertCircle, CheckCircle2, Copy, Check } from 'lucide-react';
import { inviteStaffAction } from '@/lib/services/admin-team-actions';
import type { AdminRole } from '@/types/admin-auth';

interface InviteStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function InviteStaffModal({ isOpen, onClose, onSuccess }: InviteStaffModalProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AdminRole>('admin');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    if (!generatedLink) return;
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleClose = () => {
    setFullName('');
    setEmail('');
    setRole('admin');
    setErrorMessage(null);
    setSuccessMessage(null);
    setGeneratedLink(null);
    setCopied(false);
    onClose();
    if (onSuccess) onSuccess();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setGeneratedLink(null);
    setIsLoading(true);

    try {
      const result = await inviteStaffAction({
        fullName,
        email,
        role,
      });

      if (!result.success) {
        setErrorMessage(result.error || 'Failed to dispatch invitation.');
        setIsLoading(false);
        return;
      }

      setSuccessMessage(result.message || 'Invitation created successfully!');
      if (result.inviteLink) {
        setGeneratedLink(result.inviteLink);
      }
      setIsLoading(false);
    } catch (err) {
      console.error('[InviteStaffModal Error]:', err);
      setErrorMessage('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md rounded-2xl border border-[#3A4F1C]/15 bg-white p-6 shadow-2xl sm:p-8 animate-fade-in-scale">
        <div className="flex items-center justify-between border-b border-[#3A4F1C]/10 pb-4">
          <div>
            <h2 className="text-lg font-serif font-bold text-[#2B3817]">
              Invite Team Member
            </h2>
            <p className="text-xs text-[#2B3817]/60">
              Onboard a new administrator to the management portal.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#2B3817]/60 hover:bg-[#3A4F1C]/5 hover:text-[#2B3817] transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <p className="leading-snug">{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <p className="leading-snug">{successMessage}</p>
            </div>

            {generatedLink && (
              <div className="rounded-xl border border-[#3A4F1C]/15 bg-[#F7F3E8] p-3 text-xs">
                <p className="font-semibold text-[#2B3817]">
                  Direct Onboarding Link:
                </p>
                <p className="mt-0.5 text-[11px] text-[#2B3817]/60">
                  Email dispatched via Resend. You can also copy and send this link directly:
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedLink}
                    className="w-full rounded-lg border border-[#3A4F1C]/20 bg-white px-2.5 py-1.5 text-[11px] text-[#2B3817]"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#3A4F1C] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2A3A14] transition cursor-pointer shadow-xs"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleClose}
              className="mt-2 w-full rounded-lg bg-[#3A4F1C] py-2 text-xs font-semibold text-white hover:bg-[#2A3A14] transition cursor-pointer"
            >
              Done
            </button>
          </div>
        )}

        {!successMessage && (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-[#2B3817]">
                Full Name
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#3A4F1C]/40">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  disabled={isLoading}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Maria Santos"
                  className="w-full rounded-lg border border-[#3A4F1C]/20 py-2 pr-3 pl-9 text-xs text-[#2B3817] placeholder-[#2B3817]/40 transition focus:border-[#BC6F07] focus:ring-1 focus:ring-[#BC6F07] focus:outline-none disabled:bg-gray-50"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-[#2B3817]">
                Staff Email Address
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#3A4F1C]/40">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  disabled={isLoading}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff@casamentoevents.com"
                  className="w-full rounded-lg border border-[#3A4F1C]/20 py-2 pr-3 pl-9 text-xs text-[#2B3817] placeholder-[#2B3817]/40 transition focus:border-[#BC6F07] focus:ring-1 focus:ring-[#BC6F07] focus:outline-none disabled:bg-gray-50"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-[#2B3817]">
                Access Role
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#3A4F1C]/40">
                  <Shield className="h-4 w-4" />
                </div>
                <select
                  value={role}
                  disabled={isLoading}
                  onChange={(e) => setRole(e.target.value as AdminRole)}
                  className="w-full rounded-lg border border-[#3A4F1C]/20 py-2 pr-3 pl-9 text-xs text-[#2B3817] transition focus:border-[#BC6F07] focus:ring-1 focus:ring-[#BC6F07] focus:outline-none disabled:bg-gray-50 bg-white"
                >
                  <option value="admin">Admin (Operational & Management Access)</option>
                  <option value="super_admin">Super Admin (Full Administrative Authority)</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isLoading}
                onClick={handleClose}
                className="rounded-lg border border-[#3A4F1C]/20 bg-white px-3.5 py-2 text-xs font-medium text-[#2B3817] hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-lg bg-[#3A4F1C] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2A3A14] transition disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Dispatching...</span>
                  </>
                ) : (
                  <span>Dispatch Invitation</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
