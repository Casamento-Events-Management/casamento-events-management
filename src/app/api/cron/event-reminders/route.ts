// =============================================================================
// app/api/cron/event-reminders/route.ts — Daily Scheduled Reminder & Keepalive Worker
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { checkAndDispatch7DayReminders } from '@/lib/services/event-reminder-service';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const maxDuration = 10; // Within Vercel free tier cap

/**
 * Daily Cron Worker:
 * 1. Checks and dispatches 7-day upcoming event reminder notices.
 * 2. Acts as daily keepalive ping for Supabase to prevent free-tier project dormancy.
 */
export async function GET(request: NextRequest) {
  // Validate Vercel Cron Bearer Authentication
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Unauthorized: Invalid Cron Secret' }, { status: 401 });
    }
  }

  try {
    // 1. Supabase Keepalive check
    const supabase = createAdminClient();
    const { error: dbError } = await supabase.from('admin_profiles').select('id').limit(1);
    if (dbError) {
      console.warn('[cron/event-reminders] Keepalive query notice:', dbError.message);
    }

    // 2. Process automated 7-day event reminders
    const result = await checkAndDispatch7DayReminders();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      supabaseStatus: dbError ? 'Notice: ' + dbError.message : 'Active',
      processedCount: result.processedCount,
      errors: result.errors,
    });
  } catch (err) {
    console.error('[cron/event-reminders] Unhandled error:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Internal worker error' },
      { status: 500 }
    );
  }
}
