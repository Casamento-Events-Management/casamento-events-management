import React from 'react';
import type { Metadata } from 'next';
import {
  AboutCtaSection,
  AboutFeatureGrid,
  AboutHero,
  AboutJsonLd,
  AboutStorySection,
} from '@/components/about';
import { ConnectSection } from '@/components/layout/connect-section';
import { getAboutPageContent } from '@/lib/services/aboutService';
import { getContactSectionContent } from '@/lib/services/contactService';
import {
  buildCanonicalUrl,
  buildOpenGraphImages,
  SITE_NAME,
} from '@/lib/utils/seoUtils';

const canonicalUrl = buildCanonicalUrl('/about');
const defaultOgImages = buildOpenGraphImages(
  undefined,
  `About ${SITE_NAME} — 14+ Years of Event Management in the Philippines`
);

export const metadata: Metadata = {
  title: 'About Us — 14+ Years of Events Management in the Philippines',
  description:
    'Learn about Casamento Events Management — over 14 years of delivering corporate events, brand activations, roadshows, social celebrations, creative production, livestreaming, and e-commerce production across the Philippines.',
  keywords: [
    'about Casamento Events',
    'Casamento story',
    'events management Philippines',
    'corporate event production Philippines',
    'brand activation agency Manila',
    'Casamento core values',
    'full service event production company Manila',
  ],
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: `About Us | ${SITE_NAME}`,
    description:
      'Over 14 years of delivering meaningful celebrations, corporate activations, and full-scale event productions across Metro Manila, Luzon, Visayas, and Mindanao.',
    url: canonicalUrl,
    siteName: SITE_NAME,
    locale: 'en_PH',
    type: 'website',
    images: defaultOgImages,
  },
  twitter: {
    card: 'summary_large_image',
    title: `About Us | ${SITE_NAME}`,
    description:
      'Over 14 years of delivering meaningful celebrations, corporate activations, and full-scale event productions across the Philippines.',
    images: defaultOgImages.map((img) => img.url),
  },
};

export default async function AboutPage() {
  const [aboutData, contactData] = await Promise.all([
    getAboutPageContent(),
    getContactSectionContent(),
  ]);

  const { hero, story, missionVision, coreValues, whyChoose, cta } = aboutData;

  return (
    <>
      <AboutJsonLd socialLinks={contactData.socialLinks} />

      <article className="min-h-screen bg-[#F7F3E8] text-[#3A4F1C]">
        {/* Hero Banner */}
        <AboutHero
          eyebrow={hero.eyebrow}
          title={hero.title}
          description={hero.description}
          bannerImages={hero.bannerImages}
        />

        {/* Section 1: Our Story */}
        <AboutStorySection
          paragraphs={story.paragraphs}
          closingStatement={story.closingStatement}
          mantras={story.mantras}
        />

        {/* Section 2: Mission & Vision */}
        <AboutFeatureGrid
          eyebrow={missionVision.eyebrow}
          title={missionVision.title}
          description={missionVision.description}
          items={[missionVision.mission, missionVision.vision]}
          variant="split"
          surface="tinted"
        />

        {/* Section 3: Our Core Values */}
        <AboutFeatureGrid
          eyebrow={coreValues.eyebrow}
          title={coreValues.title}
          description={coreValues.description}
          items={coreValues.items}
          variant="ledger"
          surface="plain"
        />

        {/* Section 4: Why Choose Casamento? */}
        <AboutFeatureGrid
          eyebrow={whyChoose.eyebrow}
          title={whyChoose.title}
          description={whyChoose.description}
          items={whyChoose.items}
          variant="rows"
          surface="tinted"
        />

        {/* Section 5: Call to Action */}
        <AboutCtaSection
          eyebrow={cta.eyebrow}
          title={cta.title}
          description={cta.description}
          secondaryCtaText={cta.secondaryCtaText}
          secondaryCtaLink={cta.secondaryCtaLink}
          primaryCtaText={cta.primaryCtaText}
          primaryCtaLink={cta.primaryCtaLink}
        />

        {/* Section 6: Contact & Connect Form */}
        <ConnectSection
          eyebrow={contactData.eyebrow}
          title={contactData.title}
          description={contactData.description}
          socialLinks={contactData.socialLinks}
        />
      </article>
    </>
  );
}
