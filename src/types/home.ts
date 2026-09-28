// =============================================================================
// home.ts — Home Page Document Types
//
// Types the shape of `homeHero` and `featuredTeaser` Sanity documents returned by GROQ.
// =============================================================================

import type { SanityDocument, SanityImageWithPriority, VideoSource } from './sanity';
import type { Partner, SocialLink, TeaserVideo } from './shared';
import type { UpcomingEvent } from './portfolio';

// ---------------------------------------------------------------------------
// 1. Hero / Service Carousel Section
// ---------------------------------------------------------------------------

/**
 * Interface representing an individual service highlight slide within the Hero carousel.
 */
export interface HeroSlide {
  _key?: string;
  /** Heading displayed on the left pane (e.g. "Full Planning & Styling"). */
  heading: string;
  /** Short service overview text displayed on the left pane. */
  description: string;
  /** Text label for the CTA button (defaults to "Explore Service"). */
  ctaText?: string;
  /** Explicit URL link destination for CTA (e.g., "/services?category=full-planning-styling"). */
  ctaLink?: string;
  /** Media discriminator: 'image' or 'video'. */
  mediaType: 'image' | 'video';
  /** Image object when mediaType === 'image'. */
  image?: SanityImageWithPriority;
  /** Video source when mediaType === 'video'. */
  video?: VideoSource;
  /** Required poster thumbnail image for video slides (for LCP optimization & video policy). */
  videoPoster?: SanityImageWithPriority;
  /** Optional resolved category slug from Sanity reference */
  serviceCategorySlug?: string;
}

/**
 * Data contract for the full-width Hero Service Carousel section.
 */
export interface HeroSection {
  /** Auto-play rotation interval in seconds (default: 3 seconds). */
  autoPlayInterval?: number;
  /** Array of service highlight slides. */
  slides: HeroSlide[];
}

// ---------------------------------------------------------------------------
// 2. Home Hero Document (`_type: 'homeHero'`)
// ---------------------------------------------------------------------------

/**
 * Interface representing the `homeHero` singleton document in Sanity.
 */
export interface HomeHeroContent extends SanityDocument {
  _type: 'homeHero';
  /** Full-screen landing / hero section data. */
  hero: HeroSection;
  /** Partner / sponsor logos. */
  partners: Partner[];
}

// ---------------------------------------------------------------------------
// 3. Featured Teaser Document (`_type: 'featuredTeaser'`)
// ---------------------------------------------------------------------------

/**
 * Interface representing the `featuredTeaser` singleton document in Sanity.
 */
export interface FeaturedTeaserContent extends SanityDocument {
  _type: 'featuredTeaser';
  /** Section header eyebrow for the teaser videos section. */
  eyebrow?: string;
  /** Section header title for the teaser videos section. */
  title?: string;
  /** Section header description for the teaser videos section. */
  description?: string;
  /** Alias for section header eyebrow. */
  teaserVideosEyebrow?: string;
  /** Alias for section header title. */
  teaserVideosTitle?: string;
  /** Alias for section header description. */
  teaserVideosDescription?: string;
  /** Teaser highlight videos array. */
  teaserVideos: TeaserVideo[];
}

/**
 * Combined / legacy interface matching total home page data contract.
 */
export interface HomePageContent extends SanityDocument {
  _type: 'homePage' | 'homeHero';
  hero: HeroSection;
  teaserVideosEyebrow?: string;
  teaserVideosTitle?: string;
  teaserVideosDescription?: string;
  teaserVideos: TeaserVideo[];
  partners: Partner[];
  upcomingEvents?: UpcomingEvent[];
  socialLinks?: SocialLink[];
}
