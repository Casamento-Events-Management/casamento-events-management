// =============================================================================
// lib/supabase/middleware.ts — Session Refresh & Route Protection for Middleware
// =============================================================================

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;

  // Intercept any unhandled Supabase auth PKCE codes landing outside /auth/callback (e.g. redirected to Site URL /)
  // Forward them directly to /auth/callback to perform the PKCE session exchange before redirecting.
  if (request.nextUrl.searchParams.has('code') && !pathname.startsWith('/auth/callback')) {
    const callbackUrl = new URL('/auth/callback', request.url);
    request.nextUrl.searchParams.forEach((value, key) => {
      callbackUrl.searchParams.set(key, value);
    });
    if (!callbackUrl.searchParams.has('next')) {
      callbackUrl.searchParams.set('next', '/admin/reset-password');
    }
    return NextResponse.redirect(callbackUrl);
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Re-verify user via auth server and refresh token if needed
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAdminArea = pathname.startsWith('/admin');
  const isGuestOnlyAuthPage =
    pathname === '/admin/login' ||
    pathname === '/admin/forgot-password';

  // Inject search-crawler barrier on all admin pages
  if (isAdminArea) {
    supabaseResponse.headers.set(
      'X-Robots-Tag',
      'noindex, nofollow, noarchive, nosnippet'
    );
  }

  // Redirect unauthenticated visitors attempting to reach protected admin routes or reset-password
  if (isAdminArea && !isGuestOnlyAuthPage && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    url.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated visitors away from login/forgot-password to dashboard
  if (isGuestOnlyAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
