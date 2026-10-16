import React from 'react';
import { AdminLayoutSkeleton, AuditTableSkeleton } from '@/components/admin/skeleton';

/**
 * Root Protected Admin Route Loading Boundary.
 * Shows during full page reload when resolving active admin session.
 */
export default function ProtectedAdminLoading() {
  return (
    <AdminLayoutSkeleton>
      <AuditTableSkeleton />
    </AdminLayoutSkeleton>
  );
}
