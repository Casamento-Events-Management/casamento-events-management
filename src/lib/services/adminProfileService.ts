// =============================================================================
// lib/services/adminProfileService.ts — Admin Profile & Authorization Service
//
// Manages queries and validation for public.admin_profiles.
// =============================================================================

import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { AdminProfile } from '@/types/admin-auth';

/**
 * Retrieves the admin profile for a specific user ID.
 */
export async function getAdminProfileById(userId: string): Promise<AdminProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('admin_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as AdminProfile;
}

/**
 * Cryptographically verifies current session user and retrieves their active profile.
 * Returns null if the user is unauthenticated, profile does not exist, or is inactive.
 */
export async function getCurrentActiveAdmin(): Promise<{
  user: { id: string; email: string };
  profile: AdminProfile;
} | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user || !user.email) {
    return null;
  }

  const profile = await getAdminProfileById(user.id);

  if (!profile || !profile.is_active) {
    return null;
  }

  return {
    user: { id: user.id, email: user.email },
    profile,
  };
}
