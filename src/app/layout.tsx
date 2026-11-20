import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { SiteChrome } from '@/components/layout/site-chrome';
import {
  buildOpenGraphImages,
  getSiteUrl,
  isIndexingAllowed,
  SITE_NAME,
} from '@/lib/utils/seoUtils';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

const allowIndexing = isIndexingAllowed();
const siteUrl = getSiteUrl();
const defaultOgImages = buildOpenGraphImages();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Events Management & Production Philippines | Casamento Events Management',
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'Casamento Events Management is a full-service event planning and creative production company in the Philippines. Corporate events, brand activations, roadshows, social celebrations, styling, livestreaming, and e-commerce production nationwide.',
  keywords: [
    'events management Philippines',
    'corporate event planner Metro Manila',
    'brand activation agency PH',
    'event production company Philippines',
    'live streaming services Philippines',
    'event stylist Metro Manila',
    'stage design and lights and sounds Manila',
    'social event planner Philippines',
    'wedding coordinator Philippines',
    'company year end party organizer Manila',
    'e-commerce live selling production Manila',
    'nationwide roadshow event management PH',
    'Casamento Events',
    'Casamento Events Management',
  ],
  robots: {
    index: allowIndexing,
    follow: allowIndexing,
    googleBot: {
      index: allowIndexing,
      follow: allowIndexing,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
  openGraph: {
    title: 'Events Management & Production Philippines | Casamento Events Management',
    description:
      'Full-service events management, corporate events, brand activations, social celebrations, creative production, livestreaming, and e-commerce production across the Philippines.',
    url: siteUrl,
    siteName: SITE_NAME,
    images: defaultOgImages,
    locale: 'en_PH',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Events Management & Production Philippines | Casamento Events Management',
    description:
      'Full-service events management, corporate events, brand activations, social celebrations, creative production, livestreaming, and e-commerce production across the Philippines.',
    images: defaultOgImages.map((img) => img.url),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F7F3E8] text-[#2B3817]" suppressHydrationWarning>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
