import React from 'react';
import type { Metadata } from 'next';
import { getContactSectionContent } from '@/lib/services/contactService';
import { ConnectSection } from '@/components/layout/connect-section';
import { PrivacyContent } from '@/components/privacy/privacy-content';

export const metadata: Metadata = {
  title: 'Privacy Policy | Casamento Events Management',
  description:
    'Official Privacy Policy for Casamento Events Management Inc. Explains our compliance with the Philippine Data Privacy Act of 2012, guest checkout architecture, data security, and media release policies.',
  keywords: [
    'Casamento Events privacy policy',
    'Philippine Data Privacy Act compliance',
    'event management privacy',
    'guest checkout data security',
    'Casamento Events data protection',
  ],
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://casamentoevents.com'}/privacy`,
  },
  openGraph: {
    title: 'Privacy Policy | Casamento Events Management',
    description:
      'Official Privacy Policy for Casamento Events Management Inc. Detailing data protection, guest checkout architecture, and client portfolio release protocols.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://casamentoevents.com'}/privacy`,
    siteName: 'Casamento Events Management',
    type: 'website',
  },
};

export default async function PrivacyPolicyPage() {
  const contactData = await getContactSectionContent();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Privacy Policy | Casamento Events Management',
    description:
      'Official Privacy Policy for Casamento Events Management Inc. in compliance with the Philippine Data Privacy Act of 2012.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://casamentoevents.com'}/privacy`,
    inLanguage: 'en-US',
    publisher: {
      '@type': 'Organization',
      name: 'Casamento Events Management Inc.',
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://casamentoevents.com',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="bg-[#F7F3E8] text-[#2A3A14] min-h-screen">
        {/* Page Top Header Banner */}
        <header className="min-h-[45vh] sm:min-h-[52vh] flex flex-col justify-center items-center pt-32 pb-20 sm:pt-40 sm:pb-28 px-6 bg-[#EFEAD8] border-b border-[#3A4F1C]/15 text-center">
          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-[#2A3A14] tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-[#2A3A14]/80 max-w-2xl mx-auto leading-relaxed font-light">
              Casamento Events Management Inc. is dedicated to transparent data stewardship and safeguarding client privacy in accordance with the Philippine Data Privacy Act of 2012.
            </p>
          </div>
        </header>

        {/* Interactive Content With Left Tab Navigation & Alternating Sections */}
        <PrivacyContent />

        {/* Pre-Footer Connect / Contact Section */}
        <ConnectSection
          eyebrow={contactData.eyebrow}
          title={contactData.title}
          description={contactData.description}
          socialLinks={contactData.socialLinks}
        />
      </main>
    </>
  );
}
