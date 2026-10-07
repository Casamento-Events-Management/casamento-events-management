'use client';

// =============================================================================
// components/admin/login-form.tsx — Client Login Form with reCAPTCHA & Feedback
// =============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { loginAdminAction } from '@/lib/services/admin-auth-actions';

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/admin/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
            ?.execute(siteKey, { action: 'admin_login' })
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
    setIsLoading(true);

    try {
      const recaptchaToken = await getRecaptchaToken();
      const result = await loginAdminAction({
        email,
        password,
        recaptchaToken,
        returnUrl,
      });

      if (!result.success) {
        setErrorMessage(result.error || 'Authentication failed. Please verify your credentials.');
        setIsLoading(false);
        return;
      }

      router.push(result.redirectUrl || '/admin/dashboard');
      router.refresh();
    } catch (err) {
      console.error('[LoginForm Error]:', err);
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

      {/* Email Input */}
      <div>
        <label
          htmlFor="email"
          className="block text-xs font-semibold tracking-wide text-[#2B3817] uppercase"
        >
          Staff Email
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

      {/* Password Input */}
      <div>
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="block text-xs font-semibold tracking-wide text-[#2B3817] uppercase"
          >
            Password
          </label>
          <Link
            href="/admin/forgot-password"
            className="text-xs text-[#BC6F07] hover:text-[#9E5B04] hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative mt-1.5">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#3A4F1C]/40">
            <Lock className="h-4 w-4" />
          </div>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
            value={password}
            disabled={isLoading}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
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
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#3A4F1C] py-2.5 px-4 text-sm font-semibold tracking-wide text-white transition hover:bg-[#2A3A14] focus:ring-2 focus:ring-[#BC6F07] focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70 shadow-sm"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Authenticating...</span>
          </>
        ) : (
          <span>Sign In to Portal</span>
        )}
      </button>
    </form>
  );
}
