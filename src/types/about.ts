// =============================================================================
// types/about.ts — About Us Domain Types
// =============================================================================

import type { SanityDocument } from './sanity';

/**
 * Curated Lucide icon identifiers supported in About Us Sanity card items.
 */
export type AboutIconName =
  | 'Heart'
  | 'Sparkles'
  | 'Award'
  | 'ShieldCheck'
  | 'Flame'
  | 'Users'
  | 'Clock3'
  | 'Layers3'
  | 'Lightbulb'
  | 'Video'
  | 'MapPin'
  | 'Handshake'
  | 'Target'
  | 'Eye'
  | 'Star'
  | 'Compass'
  | 'CheckCircle2'
  | 'Gem';

/**
 * Shared card item structure (`_type: 'aboutCardItem'`) used across
 * Mission & Vision, Core Values, and Why Choose Casamento sections.
 */
export interface AboutCardItem {
  _key?: string;
  title: string;
  description: string;
  icon: AboutIconName;
}

/**
 * Singleton document content for the About Us Hero (`_type: 'aboutHero'`).
 */
export interface AboutHeroContent extends Partial<SanityDocument> {
  eyebrow?: string;
  title: string;
  description: string;
}

/**
 * Singleton document content for the Our Story section (`_type: 'aboutStory'`).
 */
export interface AboutStoryContent extends Partial<SanityDocument> {
  paragraphs: string[];
  closingStatement?: string;
  mantras: string[];
}

/**
 * Singleton document content for the Mission & Vision section (`_type: 'aboutMissionVision'`).
 */
export interface AboutMissionVisionContent extends Partial<SanityDocument> {
  eyebrow?: string;
  title: string;
  description?: string;
  mission: AboutCardItem;
  vision: AboutCardItem;
}

/**
 * Singleton document content for the Core Values section (`_type: 'aboutCoreValues'`).
 */
export interface AboutCoreValuesContent extends Partial<SanityDocument> {
  eyebrow?: string;
  title: string;
  description?: string;
  items: AboutCardItem[];
}

/**
 * Singleton document content for the Why Choose Us section (`_type: 'aboutWhyChoose'`).
 */
export interface AboutWhyChooseContent extends Partial<SanityDocument> {
  eyebrow?: string;
  title: string;
  description?: string;
  items: AboutCardItem[];
}

/**
 * Singleton document content for the Call-to-Action section (`_type: 'aboutCta'`).
 */
export interface AboutCtaContent extends Partial<SanityDocument> {
  eyebrow?: string;
  title: string;
  description: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
}

/**
 * Aggregated About Us page data payload returned by `getAboutPageContent()`.
 */
export interface AboutPageContent {
  hero: AboutHeroContent;
  story: AboutStoryContent;
  missionVision: AboutMissionVisionContent;
  coreValues: AboutCoreValuesContent;
  whyChoose: AboutWhyChooseContent;
  cta: AboutCtaContent;
}
