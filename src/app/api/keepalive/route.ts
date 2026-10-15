import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAudit } from '@/lib/services/auditService';

export const dynamic = 'force-dynamic';

/**
 * Vercel Keepalive Cron Endpoint
 *
 * Runs on a recurring schedule (every 3 days: "0 0 * / 3 * *") via vercel.json.
 * Executes a lightweight read query to Supabase to prevent project/database inactivity pausing.
 */
export async function GET(request: Request) {
  // Optional Vercel Cron Secret authorization
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();

    // Query 1 row from admin_profiles to keep the Supabase database instance active
    const { error: dbError } = await supabase
      .from('admin_profiles')
      .select('id')
      .limit(1);

    if (dbError) {
      console.warn('[Keepalive] Supabase query notice:', dbError.message);
    }

    // Audit Trail: Record scheduled keepalive ping execution
    void logAudit({
      category: 'System',
      action: 'System Keepalive Ping',
      severity: dbError ? 'Warning' : 'Info',
      outcome: dbError ? 'Failure' : 'Success',
      summary: dbError
        ? `Vercel keepalive cron ping executed with notice: ${dbError.message}`
        : 'Vercel keepalive 3-day cron query ping executed successfully',
      actorType: 'system',
      actorCode: 'SYS-CRON',
      actorName: 'Vercel Cron Service',
      entityType: 'keepalive',
      metadata: {
        service: 'casamentoevents-website',
        schedule: '0 0 * / 3 * *',
        databaseStatus: dbError ? dbError.message : 'Active',
      },
    });

    return NextResponse.json({
      ok: true,
      service: 'casamentoevents-website',
      timestamp: new Date().toISOString(),
      supabase: dbError ? 'Notice: ' + dbError.message : 'Active',
    });
  } catch (err) {
    console.error('[API /api/keepalive Exception]:', err);
    return NextResponse.json(
      { ok: false, error: 'Keepalive query failed' },
      { status: 500 }
    );
  }
}
