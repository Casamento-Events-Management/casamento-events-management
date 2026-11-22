// =============================================================================
// lib/services/aboutService.ts — About Us Data Service Layer
//
// Decoupled service layer for retrieving About Us singleton documents from
// Sanity CMS with ISR caching (revalidate: 3600) and resilient fallbacks.
// =============================================================================

import { client } from '@/sanity/lib/client';
import {
  ABOUT_CORE_VALUES_MOCK,
  ABOUT_CTA_MOCK,
  ABOUT_HERO_MOCK,
  ABOUT_MISSION_VISION_MOCK,
  ABOUT_STORY_MOCK,
  ABOUT_WHY_CHOOSE_MOCK,
} from '@/data/aboutMock';
import type {
  AboutCoreValuesContent,
  AboutCtaContent,
  AboutHeroContent,
  AboutMissionVisionContent,
  AboutPageContent,
  AboutStoryContent,
  AboutWhyChooseContent,
} from '@/types';

// =============================================================================
// 1. Sanity GROQ Queries
// =============================================================================

export const GROQ_ABOUT_HERO = `
  *[_type == "aboutHero" && _id == "aboutHero"][0] {
    _id,
    _type,
    _createdAt,
    _updatedAt,
    eyebrow,
    title,
    description
  }
`;

export const GROQ_ABOUT_STORY = `
  *[_type == "aboutStory" && _id == "aboutStory"][0] {
    _id,
    _type,
    _createdAt,
    _updatedAt,
    paragraphs,
    closingStatement,
    mantras
  }
`;

export const GROQ_ABOUT_MISSION_VISION = `
  *[_type == "aboutMissionVision" && _id == "aboutMissionVision"][0] {
    _id,
    _type,
    _createdAt,
    _updatedAt,
    eyebrow,
    title,
    description,
    mission {
      title,
      description,
      icon
    },
    vision {
      title,
      description,
      icon
    }
  }
`;

export const GROQ_ABOUT_CORE_VALUES = `
  *[_type == "aboutCoreValues" && _id == "aboutCoreValues"][0] {
    _id,
    _type,
    _createdAt,
    _updatedAt,
    eyebrow,
    title,
    description,
    items[] {
      _key,
      title,
      description,
      icon
    }
  }
`;

export const GROQ_ABOUT_WHY_CHOOSE = `
  *[_type == "aboutWhyChoose" && _id == "aboutWhyChoose"][0] {
    _id,
    _type,
    _createdAt,
    _updatedAt,
    eyebrow,
    title,
    description,
    items[] {
      _key,
      title,
      description,
      icon
    }
  }
`;

export const GROQ_ABOUT_CTA = `
  *[_type == "aboutCta" && _id == "aboutCta"][0] {
    _id,
    _type,
    _createdAt,
    _updatedAt,
    eyebrow,
    title,
    description,
    secondaryCtaText,
    secondaryCtaLink,
    primaryCtaText,
    primaryCtaLink
  }
`;

// =============================================================================
// 2. Data Access Functions
// =============================================================================

export async function getAboutHeroContent(): Promise<AboutHeroContent> {
  try {
    const data = await client.fetch<AboutHeroContent | null>(
      GROQ_ABOUT_HERO,
      {},
      { next: { revalidate: 3600, tags: ['aboutHero'] } }
    );

    if (data?.title && data?.description) {
      return {
        ...data,
        eyebrow: data.eyebrow || ABOUT_HERO_MOCK.eyebrow,
      };
    }
  } catch (err) {
    console.warn('[aboutService] Failed to fetch aboutHero from Sanity, using fallback:', err);
  }

  return ABOUT_HERO_MOCK;
}

export async function getAboutStoryContent(): Promise<AboutStoryContent> {
  try {
    const data = await client.fetch<AboutStoryContent | null>(
      GROQ_ABOUT_STORY,
      {},
      { next: { revalidate: 3600, tags: ['aboutStory'] } }
    );

    if (data && Array.isArray(data.paragraphs) && data.paragraphs.length > 0) {
      return {
        ...data,
        paragraphs: data.paragraphs.filter((p): p is string => Boolean(p && p.trim())),
        closingStatement: data.closingStatement ?? ABOUT_STORY_MOCK.closingStatement,
        mantras: Array.isArray(data.mantras) ? data.mantras.filter(Boolean) : ABOUT_STORY_MOCK.mantras,
      };
    }
  } catch (err) {
    console.warn('[aboutService] Failed to fetch aboutStory from Sanity, using fallback:', err);
  }

  return ABOUT_STORY_MOCK;
}

export async function getAboutMissionVisionContent(): Promise<AboutMissionVisionContent> {
  try {
    const data = await client.fetch<AboutMissionVisionContent | null>(
      GROQ_ABOUT_MISSION_VISION,
      {},
      { next: { revalidate: 3600, tags: ['aboutMissionVision'] } }
    );

    if (data?.title && data?.mission?.title && data?.vision?.title) {
      return {
        ...data,
        eyebrow: data.eyebrow || ABOUT_MISSION_VISION_MOCK.eyebrow,
        description: data.description || ABOUT_MISSION_VISION_MOCK.description,
      };
    }
  } catch (err) {
    console.warn(
      '[aboutService] Failed to fetch aboutMissionVision from Sanity, using fallback:',
      err
    );
  }

  return ABOUT_MISSION_VISION_MOCK;
}

export async function getAboutCoreValuesContent(): Promise<AboutCoreValuesContent> {
  try {
    const data = await client.fetch<AboutCoreValuesContent | null>(
      GROQ_ABOUT_CORE_VALUES,
      {},
      { next: { revalidate: 3600, tags: ['aboutCoreValues'] } }
    );

    if (data?.title && Array.isArray(data.items) && data.items.length > 0) {
      return {
        ...data,
        eyebrow: data.eyebrow || ABOUT_CORE_VALUES_MOCK.eyebrow,
        description: data.description || ABOUT_CORE_VALUES_MOCK.description,
      };
    }
  } catch (err) {
    console.warn(
      '[aboutService] Failed to fetch aboutCoreValues from Sanity, using fallback:',
      err
    );
  }

  return ABOUT_CORE_VALUES_MOCK;
}

export async function getAboutWhyChooseContent(): Promise<AboutWhyChooseContent> {
  try {
    const data = await client.fetch<AboutWhyChooseContent | null>(
      GROQ_ABOUT_WHY_CHOOSE,
      {},
      { next: { revalidate: 3600, tags: ['aboutWhyChoose'] } }
    );

    if (data?.title && Array.isArray(data.items) && data.items.length > 0) {
      return {
        ...data,
        eyebrow: data.eyebrow || ABOUT_WHY_CHOOSE_MOCK.eyebrow,
        description: data.description || ABOUT_WHY_CHOOSE_MOCK.description,
      };
    }
  } catch (err) {
    console.warn(
      '[aboutService] Failed to fetch aboutWhyChoose from Sanity, using fallback:',
      err
    );
  }

  return ABOUT_WHY_CHOOSE_MOCK;
}

export async function getAboutCtaContent(): Promise<AboutCtaContent> {
  try {
    const data = await client.fetch<AboutCtaContent | null>(
      GROQ_ABOUT_CTA,
      {},
      { next: { revalidate: 3600, tags: ['aboutCta'] } }
    );

    if (data?.title && data?.description) {
      return {
        ...data,
        eyebrow: data.eyebrow || ABOUT_CTA_MOCK.eyebrow,
        secondaryCtaText: data.secondaryCtaText ?? ABOUT_CTA_MOCK.secondaryCtaText,
        secondaryCtaLink: data.secondaryCtaLink ?? ABOUT_CTA_MOCK.secondaryCtaLink,
        primaryCtaText: data.primaryCtaText ?? ABOUT_CTA_MOCK.primaryCtaText,
        primaryCtaLink: data.primaryCtaLink ?? ABOUT_CTA_MOCK.primaryCtaLink,
      };
    }
  } catch (err) {
    console.warn('[aboutService] Failed to fetch aboutCta from Sanity, using fallback:', err);
  }

  return ABOUT_CTA_MOCK;
}

/**
 * Retrieves all About Us singleton sections in parallel.
 */
export async function getAboutPageContent(): Promise<AboutPageContent> {
  const [hero, story, missionVision, coreValues, whyChoose, cta] = await Promise.all([
    getAboutHeroContent(),
    getAboutStoryContent(),
    getAboutMissionVisionContent(),
    getAboutCoreValuesContent(),
    getAboutWhyChooseContent(),
    getAboutCtaContent(),
  ]);

  return {
    hero,
    story,
    missionVision,
    coreValues,
    whyChoose,
    cta,
  };
}
