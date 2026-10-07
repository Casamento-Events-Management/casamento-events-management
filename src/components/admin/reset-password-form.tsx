'use client';

// =============================================================================
// components/admin/reset-password-form.tsx — Set New Password Form
// =============================================================================

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { updatePasswordAction } from '@/lib/services/admin-auth-actions';

export function ResetPasswordForm() {
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const result = await updatePasswordAction({
        password,
        confirmPassword,
      });

      if (!result.success) {
        setErrorMessage(result.error || 'Password update failed.');
        setIsLoading(false);
        return;
      }

      setSuccessMessage('Password updated successfully. Redirecting to dashboard...');
      setTimeout(() => {
        router.push(result.redirectUrl || '/admin/dashboard');
        router.refresh();
      }, 1500);
    } catch (err) {
      console.error('[ResetPassword Error]:', err);
      setErrorMessage('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errorMessage && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50/80 p-3.5 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <p className="leading-snug">{errorMessage}</p>
        </div>
      )}

      {successMessage && (
        <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50/80 p-3.5 text-sm text-emerald-900">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <p className="leading-snug">{successMessage}</p>
        </div>
      )}

      {/* New Password */}
      <div>
        <label
          htmlFor="password"
          className="block text-xs font-semibold tracking-wide text-[#2B3817] uppercase"
        >
          New Password
        </label>
        <div className="relative mt-1.5">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#3A4F1C]/40">
            <Lock className="h-4 w-4" />
          </div>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="new-password"
            value={password}
            disabled={isLoading}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 8 characters"
            className="w-full rounded-lg border border-[#3A4F1C]/20 bg-white py-2.5 pr-10 pl-10 text-sm text-[#2B3817] placeholder-[#2B3817]/40 transition focus:border-[#BC6F07] focus:ring-1 focus:ring-[#BC6F07] focus:outline-none disabled:bg-gray-50 disabled:opacity-70"
          />
          <button
            type="button"
            disabled={isLoading}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#3A4F1C]/50 hover:text-[#2B3817]"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <p className="mt-1 text-[11px] text-[#2B3817]/60">
          Must be at least 8 characters with 1 uppercase letter and 1 number.
        </p>
      </div>

      {/* Confirm Password */}
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-xs font-semibold tracking-wide text-[#2B3817] uppercase"
        >
          Confirm New Password
        </label>
        <div className="relative mt-1.5">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#3A4F1C]/40">
            <Lock className="h-4 w-4" />
          </div>
          <input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="new-password"
            value={confirmPassword}
            disabled={isLoading}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat your password"
            className="w-full rounded-lg border border-[#3A4F1C]/20 bg-white py-2.5 pr-4 pl-10 text-sm text-[#2B3817] placeholder-[#2B3817]/40 transition focus:border-[#BC6F07] focus:ring-1 focus:ring-[#BC6F07] focus:outline-none disabled:bg-gray-50 disabled:opacity-70"
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || Boolean(successMessage)}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#3A4F1C] py-2.5 px-4 text-sm font-semibold tracking-wide text-white transition hover:bg-[#2A3A14] focus:ring-2 focus:ring-[#BC6F07] focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70 shadow-sm"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Updating Password...</span>
          </>
        ) : (
          <span>Save New Password</span>
        )}
      </button>
    </form>
  );
}
