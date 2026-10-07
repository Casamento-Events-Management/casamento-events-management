// =============================================================================
// app/admin/reset-password/page.tsx — Admin Set New Password Page
// =============================================================================

import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { AuthCard } from '@/components/admin/auth-card';
import { ResetPasswordForm } from '@/components/admin/reset-password-form';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Update Password | Casamento Admin Portal',
};

export default function AdminResetPasswordPage() {
  return (
    <AuthCard
      title="Create New Password"
      subtitle="Enter a strong, unique password to secure your administrative account."
    >
      <Suspense
        fallback={
          <div className="flex h-40 items-center justify-center text-[#3A4F1C]">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </AuthCard>
  );
}
