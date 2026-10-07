// =============================================================================
// types/index.ts — Barrel Export
//
// Single entry-point for all application types. Import from '@/types' instead
// of individual files so that internal file renames don't break consumers.
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
    ClientBrand,
    Partner,
    CTAButton,
    TeaserVideo,
} from './shared';

// Home page types
export type {
    HeroSection,
    HeroSlide,
    HomeHeroContent,
    FeaturedTeaserContent,
    HomePageContent,
} from './home';

// Contact Section types
export type {
    ContactSectionContent,
} from './contact';

// Portfolio types
export type {
    SanityPortfolioCategory,
    SanityPortfolioItem,
    SanityPortfolioHero,
    PortfolioItem,
    PortfolioHeroContent,
    UpcomingEvent,
    PortfolioUpcomingEventsContent,
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
    FeedbackUploadPayload,
    FeedbackUploadResult,
    FeedbackSectionProps,
    FeedbackCardProps,
    FeedbackFormProps,
} from './feedback';

// Booking page types
export type {
    SanityBookingHero,
    BookingHeroContent,
} from './booking';

export type {
    BookingStep,
    SelectedAddOn,
    BookingFormData,
} from './bookingForm';
