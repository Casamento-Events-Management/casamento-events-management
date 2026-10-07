'use client';

// =============================================================================
// components/admin/forgot-password-form.tsx — Request Password Reset Form
// =============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { requestPasswordResetAction } from '@/lib/services/admin-auth-actions';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getRecaptchaToken = async (): Promise<string | undefined> => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!siteKey || typeof window === 'undefined' || !window.grecaptcha) {
      return undefined;
    }

    try {
      return await new Promise<string>((resolve) => {
        window.grecaptcha?.ready(() => {
          window.grecaptcha
            ?.execute(siteKey, { action: 'admin_forgot_password' })
            .then((token: string) => resolve(token))
            .catch(() => resolve(''));
        });
      });
    } catch {
      return undefined;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const recaptchaToken = await getRecaptchaToken();
      const result = await requestPasswordResetAction({
        email,
        recaptchaToken,
      });

      if (!result.success) {
        setErrorMessage(result.error || 'Request failed. Please try again.');
        setIsLoading(false);
        return;
      }

      setSuccessMessage(
        result.message ||
          'If an authorized account exists for this email, instructions have been sent.'
      );
      setIsLoading(false);
    } catch (err) {
      console.error('[ForgotPassword Error]:', err);
      setErrorMessage('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {errorMessage && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50/80 p-3.5 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <p className="leading-snug">{errorMessage}</p>
        </div>
      )}

      {successMessage ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-900">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <p className="leading-relaxed">{successMessage}</p>
          </div>
          <Link
            href="/admin/login"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#3A4F1C] py-2.5 px-4 text-sm font-semibold text-white transition hover:bg-[#2A3A14]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Sign In</span>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold tracking-wide text-[#2B3817] uppercase"
            >
              Staff Email Address
            </label>
            <div className="relative mt-1.5">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#3A4F1C]/40">
                <Mail className="h-4 w-4" />
              </div>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                disabled={isLoading}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@casamentoevents.com"
                className="w-full rounded-lg border border-[#3A4F1C]/20 bg-white py-2.5 pr-4 pl-10 text-sm text-[#2B3817] placeholder-[#2B3817]/40 transition focus:border-[#BC6F07] focus:ring-1 focus:ring-[#BC6F07] focus:outline-none disabled:bg-gray-50 disabled:opacity-70"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#3A4F1C] py-2.5 px-4 text-sm font-semibold tracking-wide text-white transition hover:bg-[#2A3A14] focus:ring-2 focus:ring-[#BC6F07] focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70 shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Sending Reset Link...</span>
              </>
            ) : (
              <span>Dispatch Recovery Link</span>
            )}
          </button>

          <div className="text-center">
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#BC6F07] hover:text-[#9E5B04] hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
