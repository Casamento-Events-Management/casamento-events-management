import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },

  async headers() {
    const studioPermissiveCSP = [
      "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: *",
      "img-src * data: blob:",
      "media-src * data: blob:",
      "connect-src *",
      "frame-src *",
      "frame-ancestors 'self' https://*.sanity.io https://*.sanity.build https://sanity.io",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' *",
      "style-src 'self' 'unsafe-inline' *",
      "font-src 'self' data: *",
    ].join('; ');

    const publicCSP = [
      "default-src 'self' https://www.google.com https://www.gstatic.com",
      // Scripts: self + Next.js inline chunks + Sanity + Google reCAPTCHA
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com",
      "script-src-elem 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com",
      // Styles: self + inline (Next.js injects critical CSS) + Google Fonts
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.gstatic.com",
      // Fonts: self + Google Fonts CDN + Next.js static
      "font-src 'self' https://fonts.gstatic.com",
      // Images: self + data URIs + CDNs + Google reCAPTCHA icons/badges
      "img-src 'self' data: blob: https://cdn.sanity.io https://images.unsplash.com https://*.supabase.co https://i.ytimg.com https://vumbnail.com https://lh3.googleusercontent.com https://picsum.photos https://www.google.com https://www.gstatic.com",
      // Media: self + Sanity CDN (native video assets)
      "media-src 'self' https://cdn.sanity.io https://*.supabase.co",
      // Frames: youtube-nocookie.com, player.vimeo.com, and Google reCAPTCHA
      "frame-src 'self' https://www.youtube-nocookie.com https://player.vimeo.com https://www.google.com https://recaptcha.google.com https://www.gstatic.com",
      // Connections: self + Sanity API + Supabase + Google fonts + Google reCAPTCHA
      "connect-src 'self' https://*.sanity.io https://*.supabase.co https://fonts.googleapis.com https://fonts.gstatic.com https://www.google.com https://www.gstatic.com",
      // Disable browser features not needed
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ');

    const sharedSecurityHeaders = [
      {
        key: 'Permissions-Policy',
        value: [
          'camera=()',
          'microphone=()',
          'geolocation=()',
          'interest-cohort=()',
        ].join(', '),
      },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    ];

    return [
      // ── Sanity Studio: allow embedding inside sanity.io dashboard ───────────
      {
        source: '/studio/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: studioPermissiveCSP },
          ...sharedSecurityHeaders,
        ],
      },
      // ── Public routes: strict CSP + SAMEORIGIN frame protection ─────────────
      {
        source: '/((?!studio).*)',
        headers: [
          { key: 'Content-Security-Policy', value: publicCSP },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          ...sharedSecurityHeaders,
        ],
      },
    ];
  },
};

export default nextConfig;
