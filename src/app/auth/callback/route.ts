// =============================================================================
// app/auth/callback/route.ts — Supabase Auth Code Exchange & OTP Handler
//
// Handles PKCE code exchanges and direct token_hash OTP verifications
// for invitations, email confirmations, and password resets.
// =============================================================================

import { type EmailOtpType } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/admin/dashboard';

  // 1. Direct OTP Verification via token_hash (Invite & Recovery links)
  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      const destination = next.startsWith('/') ? `${origin}${next}` : `${origin}/admin/dashboard`;
      return NextResponse.redirect(destination);
    }

    console.error('[auth/callback verifyOtp Error]:', error.message);
  }

  // 2. PKCE Code Exchange
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const destination = next.startsWith('/') ? `${origin}${next}` : `${origin}/admin/dashboard`;
      return NextResponse.redirect(destination);
    }

    console.error('[auth/callback exchangeCode Error]:', error.message);
  }

  // Fallback to admin login if code exchange fails or expired
  return NextResponse.redirect(`${origin}/admin/login?error=link_expired`);
}
