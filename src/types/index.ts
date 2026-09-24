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

// Shared Media Category types
export type {
    MediaCategory,
    PortfolioCategory,
    ArticleVlogCategory,
    ActiveCategoryFilter,
} from './category';

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
    HeroSlide,
    UpcomingEvent,
    HomePageContent,
} from './home';

// Portfolio types
export type {
    SanityPortfolioCategory,
    SanityPortfolioItem,
    SanityPortfolioHero,
    PortfolioItem,
    PortfolioHeroContent,
    PortfolioModalState,
    PortfolioPageData,
    PortfolioPageProps,
} from './portfolio';

// Services types
export type {
    SanityServiceCategory,
    SanityServiceAddOn,
    SanityServiceItem,
    SanityServicesHero,
    ServiceCategory,
    ServiceAddOn,
    ServiceItem,
    ServicesHeroContent,
    ActiveServiceCategoryFilter,
    ServiceBookingRedirectParams,
} from './service';

// Article Banner types
export type {
    ArticleVlogBanner,
    ArticleBannerCTA,
    ArticleVlogBannerProps,
} from './articleBanner';

// Article Vlog types
export type {
    ArticleVlogMediaType,
    VlogSocialBacklink,
    ArticleVlogItem,
    ArticlesHeroContent,
    ArticlesHeroProps,
    VlogGalleryProps,
    VlogItemProps,
    VlogCategoryFilterProps,
} from './articleVlog';

// Client Feedback types
export type {
    FeedbackStatus,
    FeedbackRating,
    ClientFeedback,
    ClientFeedbackDocument,
    FeedbackSubmitPayload,
    FeedbackSectionProps,
    FeedbackCardProps,
    FeedbackFormProps,
} from './feedback';





