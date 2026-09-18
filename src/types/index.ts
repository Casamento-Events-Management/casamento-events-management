// =============================================================================
// types/index.ts — Barrel Export
//
// Single entry-point for all application types. Import from '@/types' instead
// of individual files so that internal file renames don't break consumers.
//
// Usage:
//   import type { HomePageContent, SanityImageWithPriority, TeaserVideo } from '@/types';
// =============================================================================

// Sanity primitives & utilities
export type {
    SanityDocument,
    SanityAssetRef,
    SanityHotspot,
    SanityImage,
    SanityFile,
    SanitySlug,
    SanityImageWithPriority,
    SanityFileWithPriority,
    SanityVideoSource,
    ExternalVideoSource,
    ExternalVideoProvider,
    VideoProvider,
    VideoSource,
    WithPriority,
} from './sanity';

// Cross-page shared types
export type {
    SocialPlatform,
    SocialLink,
    Partner,
    CTAButton,
    TeaserVideo,
} from './shared';

// Home page types
export type {
    HeroSection,
    UpcomingEvent,
    HomePageContent,
} from './home';

// Portfolio types
export type {
    SanityPortfolioCategory,
    SanityPortfolioItem,
    PortfolioCategory,
    PortfolioItem,
    ActiveCategoryFilter,
    PortfolioModalState,
    PortfolioPageData,
    PortfolioPageProps,
} from './portfolio';

