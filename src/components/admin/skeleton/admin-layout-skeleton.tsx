import React from 'react';
import { AdminSidebarSkeleton } from './admin-sidebar-skeleton';

interface AdminLayoutSkeletonProps {
  children?: React.ReactNode;
}

/**
 * Reusable Protected Layout Skeleton combining the AdminSidebarSkeleton
 * and content area matching ProtectedAdminLayout exactly across all viewport sizes.
 */
export function AdminLayoutSkeleton({ children }: AdminLayoutSkeletonProps) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-[#F7F3E8]">
      <AdminSidebarSkeleton />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
