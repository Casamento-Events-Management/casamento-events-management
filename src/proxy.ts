// =============================================================================
// proxy.ts — Next.js 16 Application Proxy & Admin Auth Guard
// (Migrated from deprecated middleware.ts per Next.js 16 convention)
// =============================================================================

import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Scope Proxy execution strictly to routes that require Supabase Auth:
     * 1. /admin and all nested admin routes (including admin Server Actions)
     * 2. /auth routes
     * 3. Any non-static route carrying a stray Supabase PKCE `?code=` query param
     *    so it is redirected to /auth/callback
     *
     * Public pages (/, /about, /services, /portfolio, /articles, /book-now,
     * /sitemap.xml, /robots.txt, /api/*) bypass Proxy completely for optimal
     * TTFB and Edge/ISR cache hits.
     */
    '/admin/:path*',
    '/auth/:path*',
    {
      source:
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
      has: [{ type: 'query', key: 'code' }],
    },
  ],
};
