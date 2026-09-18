import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    return [
      {
        // Apply to all routes
        source: '/(.*)',
        headers: [
          /**
           * Content Security Policy
           * - Allows YouTube (nocookie) and Vimeo iframes
           * - Blocks third-party tracking frames
           * - Allows Sanity CDN images and scripts
           */
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Scripts: self + Next.js inline chunks + Sanity + Google reCAPTCHA
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com",
              // Styles: self + inline (Next.js injects critical CSS)
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Fonts: self + Google Fonts CDN + Next.js static
              "font-src 'self' https://fonts.gstatic.com",
              // Images: self + data URIs + CDNs used in mock/sanity/unsplash
              "img-src 'self' data: blob: https://cdn.sanity.io https://images.unsplash.com https://*.supabase.co https://i.ytimg.com https://vumbnail.com",
              // Media: self + Sanity CDN (native video assets)
              "media-src 'self' https://cdn.sanity.io https://*.supabase.co",
              // Frames: ONLY youtube-nocookie.com and player.vimeo.com
              // Using youtube-nocookie.com prevents PREF / tracking cookies from being set
              "frame-src https://www.youtube-nocookie.com https://player.vimeo.com",
              // Connections: self + Sanity API + Supabase + Google fonts
              "connect-src 'self' https://*.sanity.io https://*.supabase.co https://fonts.googleapis.com https://fonts.gstatic.com",
              // Disable browser features not needed
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
          /**
           * Permissions Policy
           * Restricts browser features; avoids cross-origin cookie leakage
           */
          {
            key: 'Permissions-Policy',
            value: [
              'camera=()',
              'microphone=()',
              'geolocation=()',
              'interest-cohort=()',   // Opt out of FLoC / Topics API
            ].join(', '),
          },
          // Prevent MIME-type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Prevent clickjacking — only allow iframes from same origin
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          // Force HTTPS in production
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // Stop referrer leakage to third parties
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
