// =============================================================================
// components/admin/auth-card.tsx — Luxury Card Wrapper for Admin Auth Screens
// =============================================================================

import React from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md rounded-2xl border border-[#3A4F1C]/15 bg-white p-8 shadow-xl sm:p-10">
        {/* Brand Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#3A4F1C]/10 text-[#3A4F1C]">
            <Shield className="h-7 w-7 text-[#3A4F1C]" strokeWidth={1.75} />
          </div>
          <Link
            href="/"
            className="text-xs font-semibold tracking-[0.25em] text-[#BC6F07] uppercase hover:underline"
          >
            Casamento Events
          </Link>
          <h1 className="mt-2 text-2xl font-serif font-bold text-[#2B3817] tracking-tight">
            {title}
          </h1>
          <p className="mt-2 text-sm text-[#2B3817]/70 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Form Body */}
        {children}

        {/* Privacy & Security Footnote */}
        <div className="mt-8 border-t border-[#3A4F1C]/10 pt-4 text-center">
          <p className="text-[11px] text-[#2B3817]/50">
            Protected by Casamento Secure Gateway. Unauthorized access attempts are monitored and recorded.
          </p>
        </div>
      </div>
    </div>
  );
}
