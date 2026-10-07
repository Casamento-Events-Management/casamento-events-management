// =============================================================================
// app/auth/callback/route.ts — Supabase Auth Code Exchange & OTP Handler
//
// Handles PKCE code exchanges and direct token_hash OTP verifications.
// Attaches refreshed session cookies directly to the redirect response.
// =============================================================================

import { type EmailOtpType } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/admin/dashboard';

  const destination = next.startsWith('/') ? `${origin}${next}` : `${origin}/admin/dashboard`;
  const response = NextResponse.redirect(destination);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(`${origin}/admin/login?error=config_missing`);
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // 1. Direct OTP Verification via token_hash (Invite & Recovery links)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      return response;
    }

    console.error('[auth/callback verifyOtp Error]:', error.message);
  }

  // 2. PKCE Code Exchange
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return response;
    }

    console.error('[auth/callback exchangeCode Error]:', error.message);
  }

  // Fallback to admin login if code exchange fails or expired
  return NextResponse.redirect(`${origin}/admin/login?error=link_expired`);
}
