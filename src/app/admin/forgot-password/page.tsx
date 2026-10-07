// =============================================================================
// app/admin/forgot-password/page.tsx — Admin Password Recovery Request Page
// =============================================================================

import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { AuthCard } from '@/components/admin/auth-card';
import { ForgotPasswordForm } from '@/components/admin/forgot-password-form';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Reset Password | Casamento Admin Portal',
};

export default function AdminForgotPasswordPage() {
  return (
    <AuthCard
      title="Recover Account Access"
      subtitle="Enter your verified staff email to receive a secure, one-time password reset link."
    >
      <Suspense
        fallback={
          <div className="flex h-36 items-center justify-center text-[#3A4F1C]">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        }
      >
        <ForgotPasswordForm />
      </Suspense>
    </AuthCard>
  );
}
