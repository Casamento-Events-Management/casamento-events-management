import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { SiteChrome } from '@/components/layout/site-chrome';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});


const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING !== 'false';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://casamentoevents.com'),
  title: {
    default: 'Casamento Events Management | Full-Service Event Planning & Production Philippines',
    template: '%s | Casamento Events Management',
  },
  description:
    'Casamento Events Management is a trusted full-service event planning and technical production company in the Philippines. We handle corporate events, brand activations, weddings, debuts, broadcast livestreaming, and creative stage design across Metro Manila and nationwide.',
  keywords: [
    'events management Philippines',
    'corporate event planner Metro Manila',
    'brand activation agency PH',
    'wedding coordinator Philippines',
    'OTD coordinator Manila',
    'event production company Philippines',
    'live streaming services Philippines',
    'event stylist Metro Manila',
    'stage design and lights and sounds Manila',
    'debut planner Philippines',
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
    title: 'Casamento Events Management | Full-Service Event Planning & Production Philippines',
    description:
      'Trusted full-service event planning, corporate activations, wedding coordination, broadcast livestreaming, and stage production across the Philippines.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://casamentoevents.com',
    siteName: 'Casamento Events Management',
    images: [
      {
        url: '/icon.png',
        width: 800,
        height: 800,
        alt: 'Casamento Events Icon',
      },
    ],
    locale: 'en_PH',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Casamento Events Management | Event Planning & Production Philippines',
    description:
      'Trusted full-service event planning, corporate activations, wedding coordination, broadcast livestreaming, and stage production across the Philippines.',
    images: ['/icon.png'],
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

