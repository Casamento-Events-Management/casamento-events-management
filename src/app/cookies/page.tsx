import React from 'react';
import type { Metadata } from 'next';
import { getContactSectionContent } from '@/lib/services/contactService';
import { ConnectSection } from '@/components/layout/connect-section';
import { CookiesContent } from '@/components/cookies/cookies-content';

export const metadata: Metadata = {
  title: 'Cookie Settings & Disclosure | Casamento Events Management',
  description:
    'Technical disclosure regarding cookie usage, security verification via Google reCAPTCHA, and our policy on commercial advertising cookies.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://casamentoevents.com'}/cookies`,
  },
};

export default async function CookieSettingsPage() {
  const contactData = await getContactSectionContent();

  return (
    <main className="bg-[#F7F3E8] text-[#2A3A14] min-h-screen">
      {/* Page Top Header Banner */}
      <header className="min-h-[45vh] sm:min-h-[52vh] flex flex-col justify-center items-center pt-32 pb-20 sm:pt-40 sm:pb-28 px-6 bg-[#EFEAD8] border-b border-[#3A4F1C]/15 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-[#2A3A14] tracking-tight">
            Cookie Settings &amp; Disclosure
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-[#2A3A14]/80 max-w-2xl mx-auto leading-relaxed font-light">
            Technical transparency regarding our essential security cookies, anti-spam protections via Google reCAPTCHA, and strict zero-advertising policy.
          </p>
        </div>
      </header>

      {/* Interactive Content With Left Tab Navigation & Alternating Sections */}
      <CookiesContent />

      {/* Pre-Footer Connect / Contact Section */}
      <ConnectSection
        eyebrow={contactData.eyebrow}
        title={contactData.title}
        description={contactData.description}
        socialLinks={contactData.socialLinks}
      />
    </main>
  );
}
