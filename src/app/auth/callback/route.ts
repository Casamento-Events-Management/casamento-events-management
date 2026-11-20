// =============================================================================
// app/auth/callback/route.ts — Supabase Auth Code Exchange & OTP Handler
//
// Handles PKCE code exchanges and direct token_hash OTP verifications.
// Enforces canonical trusted origin, strict redirect path validation, and no-store headers.
// =============================================================================

import { type EmailOtpType } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getTrustedSiteUrl, isSafeAdminRedirectPath } from '@/lib/utils/securityUtils';

export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS: Record<string, string> = {
  'Cache-Control': 'private, no-store, no-cache, must-revalidate, max-age=0',
  Pragma: 'no-cache',
  Expires: '0',
};

function applyNoStoreHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(NO_STORE_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const code = searchParams.get('code');
  const rawNext = searchParams.get('next');

  // Always derive redirect origin from trusted server configuration (never untrusted headers)
  const trustedOrigin = getTrustedSiteUrl();
  const safeNext = isSafeAdminRedirectPath(rawNext) ? rawNext : '/admin/dashboard';
  const destination = `${trustedOrigin}${safeNext}`;
  const response = applyNoStoreHeaders(NextResponse.redirect(destination));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return applyNoStoreHeaders(
      NextResponse.redirect(`${trustedOrigin}/admin/login?error=config_missing`)
    );
  }

  const isProd = process.env.NODE_ENV === 'production';

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: {
      path: '/',
      sameSite: 'lax',
      secure: isProd,
    },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, {
            ...options,
            path: options?.path ?? '/',
            sameSite: options?.sameSite ?? 'lax',
            secure: isProd ? true : options?.secure,
          });
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
  return applyNoStoreHeaders(
    NextResponse.redirect(`${trustedOrigin}/admin/login?error=link_expired`)
  );
}
