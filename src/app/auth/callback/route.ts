// =============================================================================
// app/auth/callback/route.ts — Supabase Auth Code Exchange Handler
//
// Handles PKCE code exchanges for email confirmations, invites, and password resets.
// =============================================================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/admin/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const destination = next.startsWith('/') ? `${origin}${next}` : `${origin}/admin/dashboard`;
      return NextResponse.redirect(destination);
    }
  }

  // Fallback to admin login if code exchange fails or expired
  return NextResponse.redirect(`${origin}/admin/login?error=link_expired`);
}
