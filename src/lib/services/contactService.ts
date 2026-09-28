import { client } from '@/sanity/lib/client';
import type { ContactSectionContent } from '@/types';

/**
 * GROQ Query targeting the `contactSection` singleton document.
 */
export const GROQ_CONTACT_SECTION = `
  *[_type == "contactSection"][0] {
    _id,
    _type,
    _createdAt,
    _updatedAt,
    eyebrow,
    title,
    description,
    socialLinks[] {
      _key,
      platform,
      url
    }
  }
`;

export const contactSectionMockData: ContactSectionContent = {
  _id: 'drafts.contactSection-mock-1',
  _type: 'contactSection',
  _createdAt: '2024-01-01T00:00:00Z',
  _updatedAt: '2024-01-02T00:00:00Z',
  _rev: 'rev-1',
  eyebrow: 'Join Our Journey',
  title: 'Connect With Us',
  description: 'Follow our latest event highlights, behind-the-scenes stories, and creative inspirations across our official channels.',
  socialLinks: [
    {
      platform: 'instagram',
      url: 'https://www.instagram.com/casamento.events.management',
    },
    {
      platform: 'facebook',
      url: 'https://facebook.com/casamentoevents',
    },
    {
      platform: 'tiktok',
      url: 'https://www.tiktok.com/@casamentoevents',
    },
    {
      platform: 'youtube',
      url: 'https://www.youtube.com/@casamentoevents8664',
    },
  ],
};

/**
 * Service module for retrieving Contact Section & Social Links content.
 * Queries Sanity CMS via GROQ with ISR caching (revalidate: 3600),
 * falling back to local mock data if the CMS query is empty or fails.
 */
export async function getContactSectionContent(): Promise<ContactSectionContent> {
  try {
    const cmsData = await client.fetch<ContactSectionContent | null>(
      GROQ_CONTACT_SECTION,
      {},
      { next: { revalidate: 3600, tags: ['contactSection'] } }
    );

    if (cmsData && cmsData.socialLinks) {
      return {
        ...cmsData,
        eyebrow: cmsData.eyebrow || 'Join Our Journey',
        title: cmsData.title || 'Connect With Us',
        description: cmsData.description || 'Follow our latest event highlights, behind-the-scenes stories, and creative inspirations across our official channels.',
        socialLinks: cmsData.socialLinks || [],
      };
    }
  } catch (err) {
    console.warn('[contactService] Failed to fetch contactSection from Sanity, using mock data fallback:', err);
  }

  return contactSectionMockData;
}
