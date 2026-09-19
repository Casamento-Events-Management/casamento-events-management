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


export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://casamentoevents.com'),
  title: {
    default: 'Casamento Events | Crafting Unforgettable Celebrations',
    template: '%s | Casamento Events',
  },
  description:
    'Casamento Events Management specializes in luxury weddings, grand debutante galas, corporate milestones, and bespoke celebration planning.',
  keywords: [
    'luxury wedding planner Philippines',
    'luxury wedding planner Manila',
    'cinematic wedding films Philippines',
    'wedding cinematographer Manila',
    'debutante gala production Manila',
    'corporate event management Philippines',
    'stage production events Manila',
    'live streaming events Philippines',
    'LED lighting design events',
    'destination wedding planner Philippines',
    'Casamento Events',
    'Casamento Events Management',
    'event planning Metro Manila',
    'broadcast production Philippines',
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/icon.jpg',
    shortcut: '/icon.jpg',
    apple: '/icon.jpg',
  },
  openGraph: {
    title: 'Casamento Events | Crafting Unforgettable Celebrations',
    description:
      'Casamento Events Management specializes in luxury weddings, grand debutante galas, corporate milestones, and bespoke celebration planning.',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: 'Casamento Events',
    images: [
      {
        url: '/icon.jpg',
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
    title: 'Casamento Events | Unforgettable Celebrations',
    description:
      'Casamento Events Management specializes in luxury weddings, grand debutante galas, corporate milestones, and bespoke celebration planning.',
    images: ['/icon.jpg'],
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

