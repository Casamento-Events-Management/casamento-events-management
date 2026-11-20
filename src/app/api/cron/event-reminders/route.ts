// =============================================================================
// app/api/cron/event-reminders/route.ts — Daily Scheduled Reminder & Keepalive Worker
// =============================================================================

import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { checkAndDispatch7DayReminders } from '@/lib/services/event-reminder-service';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const maxDuration = 10; // Within Vercel free tier cap

function isValidBearerSecret(authHeader: string | null, expectedSecret: string): boolean {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const provided = authHeader.slice('Bearer '.length);
  const a = Buffer.from(provided);
  const b = Buffer.from(expectedSecret);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/**
 * Daily Cron Worker:
 * 1. Checks and dispatches 7-day upcoming event reminder notices.
 * 2. Acts as daily keepalive ping for Supabase to prevent free-tier project dormancy.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET?.trim();

  // Fail CLOSED outside local development if CRON_SECRET is missing or mismatched
  if (process.env.NODE_ENV !== 'development') {
    if (!cronSecret) {
      console.error('[cron/event-reminders] CRON_SECRET is not configured in environment.');
      return NextResponse.json(
        { error: 'Service unavailable: Cron authentication not configured.' },
        { status: 503 }
      );
    }

    if (!isValidBearerSecret(authHeader, cronSecret)) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid Cron Secret' },
        { status: 401 }
      );
    }
  } else if (cronSecret && !isValidBearerSecret(authHeader, cronSecret)) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid Cron Secret' },
      { status: 401 }
    );
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
      supabaseStatus: dbError ? 'Degraded' : 'Active',
      processedCount: result.processedCount,
      errorCount: result.errors.length,
    });
  } catch (err) {
    console.error('[cron/event-reminders] Unhandled error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal worker error' },
      { status: 500 }
    );
  }
}
