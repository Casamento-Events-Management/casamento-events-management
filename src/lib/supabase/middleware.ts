// =============================================================================
// lib/supabase/middleware.ts — Session Refresh, No-Cache Enforcement & Route Guard
// =============================================================================

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const ADMIN_NO_CACHE_HEADERS: Record<string, string> = {
  'Cache-Control': 'private, no-store, no-cache, must-revalidate, max-age=0',
  Pragma: 'no-cache',
  Expires: '0',
  'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
};

function applyAdminSecurityHeaders(response: NextResponse): void {
  for (const [key, value] of Object.entries(ADMIN_NO_CACHE_HEADERS)) {
    response.headers.set(key, value);
  }
}

function clearSupabaseAuthCookies(request: NextRequest, response: NextResponse): void {
  const isProd = process.env.NODE_ENV === 'production';
  for (const cookie of request.cookies.getAll()) {
    if (cookie.name.startsWith('sb-')) {
      response.cookies.set(cookie.name, '', {
        path: '/',
        maxAge: 0,
        sameSite: 'lax',
        secure: isProd,
      });
    }
  }
}

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;
  const isAdminArea = pathname.startsWith('/admin');

  // Intercept any unhandled Supabase auth PKCE codes landing outside /auth/callback
  if (request.nextUrl.searchParams.has('code') && !pathname.startsWith('/auth/callback')) {
    const callbackUrl = new URL('/auth/callback', request.url);
    request.nextUrl.searchParams.forEach((value, key) => {
      callbackUrl.searchParams.set(key, value);
    });
    if (!callbackUrl.searchParams.has('next')) {
      callbackUrl.searchParams.set('next', '/admin/reset-password');
    }
    const redirectRes = NextResponse.redirect(callbackUrl);
    applyAdminSecurityHeaders(redirectRes);
    return redirectRes;
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  if (isAdminArea) {
    applyAdminSecurityHeaders(supabaseResponse);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Fail closed for protected admin routes if Supabase configuration is missing
    if (isAdminArea) {
      return new NextResponse('Service Unavailable: Authentication service not configured.', {
        status: 503,
        headers: ADMIN_NO_CACHE_HEADERS,
      });
    }
    return supabaseResponse;
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
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        if (isAdminArea) {
          applyAdminSecurityHeaders(supabaseResponse);
        }
        if (headers) {
          for (const [key, value] of Object.entries(headers)) {
            supabaseResponse.headers.set(key, value);
          }
        }
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, {
            ...options,
            path: options?.path ?? '/',
            sameSite: options?.sameSite ?? 'lax',
            secure: isProd ? true : options?.secure,
          })
        );
      },
    },
  });

  // Re-verify user via Supabase Auth server and refresh token if needed
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isGuestOnlyAuthPage =
    pathname === '/admin/login' ||
    pathname === '/admin/forgot-password';

  // For admin routes, verify that an authenticated user still holds an active admin profile.
  // Prevents deactivated accounts from accessing /admin/reset-password or triggering redirect loops.
  if (isAdminArea && user) {
    const { data: profile } = await supabase
      .from('admin_profiles')
      .select('is_active')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!profile || !profile.is_active) {
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch {
        // Ensure cookies are still purged below even if signOut call fails
      }

      if (!isGuestOnlyAuthPage) {
        const url = request.nextUrl.clone();
        url.pathname = '/admin/login';
        url.search = '?error=account_inactive';
        const redirectRes = NextResponse.redirect(url);
        applyAdminSecurityHeaders(redirectRes);
        clearSupabaseAuthCookies(request, redirectRes);
        return redirectRes;
      }

      clearSupabaseAuthCookies(request, supabaseResponse);
      return supabaseResponse;
    }
  }

  // Redirect unauthenticated visitors attempting to reach protected admin routes or reset-password
  if (isAdminArea && !isGuestOnlyAuthPage && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    url.search = '';
    url.searchParams.set('returnUrl', pathname);
    const redirectRes = NextResponse.redirect(url);
    applyAdminSecurityHeaders(redirectRes);
    return redirectRes;
  }

  // Redirect active authenticated admins away from login/forgot-password to dashboard
  if (isGuestOnlyAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/dashboard';
    url.search = '';
    const redirectRes = NextResponse.redirect(url);
    applyAdminSecurityHeaders(redirectRes);
    return redirectRes;
  }

  return supabaseResponse;
}
