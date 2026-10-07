// =============================================================================
// app/admin/layout.tsx — Admin Section Root Layout
//
// Enforces complete search crawler blocking (noindex, nofollow) and disables
// edge/browser caching for all private admin and dashboard paths.
// =============================================================================

import type { Metadata } from 'next';
import Script from 'next/script';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Casamento Admin Portal',
  description: 'Casamento Events Administration and Management Portal',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  return (
    <div className="min-h-screen bg-[#F7F3E8] text-[#2B3817] antialiased selection:bg-[#BC6F07] selection:text-white">
      {recaptchaKey && (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${recaptchaKey}`}
          strategy="lazyOnload"
        />
      )}
      {children}
    </div>
  );
}
