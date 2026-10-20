'use client';

// =============================================================================
// components/admin/layout/edit-profile-modal.tsx — Self Profile Editor Modal
//
// Allows staff, admins, and super admins to edit their own full name and phone.
// =============================================================================

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, User, Phone, Mail, Shield, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { updateSelfProfileAction } from '@/lib/services/admin-team-actions';
import type { AdminProfile } from '@/types/admin-auth';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  admin: AdminProfile;
}

export function EditProfileModal({ isOpen, onClose, admin }: EditProfileModalProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(admin.full_name || '');
  const [phone, setPhone] = useState(admin.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMsg('Full name must be at least 2 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateSelfProfileAction({
        fullName: fullName.trim(),
        phone: phone.trim() || null,
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Failed to update profile.');
        setIsSubmitting(false);
        return;
      }

      setSuccessMsg('Your profile has been updated.');
      setTimeout(() => {
        router.refresh();
        onClose();
      }, 1000);
    } catch (err) {
      console.error('[EditProfileModal Error]:', err);
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleLabel =
    admin.role === 'super_admin'
      ? 'Super Admin'
      : admin.role === 'admin'
      ? 'Admin'
      : 'Staff (Viewer)';

  const roleBadgeStyle =
    admin.role === 'super_admin'
      ? 'border-amber-300 bg-amber-100 text-amber-900'
      : admin.role === 'admin'
      ? 'border-emerald-300 bg-emerald-100 text-emerald-900'
      : 'border-blue-300 bg-blue-100 text-blue-900';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4 bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3A4F1C]/10 text-[#3A4F1C]">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-stone-900">My Profile</h2>
              <p className="text-[11px] text-stone-500">Update your personal account details</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {errorMsg && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Account Role & Code (Read-Only) */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200/60">
            <div>
              <span className="text-[10px] uppercase font-semibold text-stone-400 block mb-1">
                Account Role
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${roleBadgeStyle}`}
              >
                <Shield className="h-2.5 w-2.5" />
                <span>{roleLabel}</span>
              </span>
            </div>
            {admin.user_code && (
              <div>
                <span className="text-[10px] uppercase font-semibold text-stone-400 block mb-1">
                  User Code
                </span>
                <span className="font-mono text-xs font-bold text-stone-700">
                  {admin.user_code}
                </span>
              </div>
            )}
          </div>

          {/* Email (Read-Only) */}
          <div>
            <label className="block text-[11px] font-medium text-stone-600 mb-1">
              Email Address
            </label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-100/70 border border-stone-200 text-stone-500 cursor-not-allowed">
              <Mail className="h-3.5 w-3.5 text-stone-400" />
              <span className="truncate">{admin.email}</span>
            </div>
            <p className="text-[10px] text-stone-400 mt-1">
              Contact a Super Administrator to modify your registered email.
            </p>
          </div>

          {/* Full Name (Editable) */}
          <div>
            <label className="block text-[11px] font-medium text-stone-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                required
                className="w-full rounded-xl border border-stone-300 px-3 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:border-[#3A4F1C] focus:outline-none focus:ring-1 focus:ring-[#3A4F1C]"
              />
            </div>
          </div>

          {/* Contact Phone (Editable) */}
          <div>
            <label className="block text-[11px] font-medium text-stone-700 mb-1">
              Contact Phone (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <Phone className="h-3.5 w-3.5" />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+63 9XX XXX XXXX"
                className="w-full pl-9 rounded-xl border border-stone-300 px-3 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:border-[#3A4F1C] focus:outline-none focus:ring-1 focus:ring-[#3A4F1C]"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 font-medium transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3A4F1C] text-white hover:bg-[#2B3817] font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
