// =============================================================================
// app/admin/login/page.tsx — Admin Portal Login Page
// =============================================================================

import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { AuthCard } from '@/components/admin/auth-card';
import { LoginForm } from '@/components/admin/login-form';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sign In | Casamento Admin Portal',
};

export default function AdminLoginPage() {
  return (
    <AuthCard
      title="Staff Portal Sign In"
      subtitle="Enter your verified Casamento administrative credentials to access management controls."
    >
      <Suspense
        fallback={
          <div className="flex h-40 items-center justify-center text-[#3A4F1C]">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
