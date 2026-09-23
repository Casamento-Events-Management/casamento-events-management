import { type SchemaTypeDefinition } from 'sanity'

// Documents
import { articleVlogBanner } from './documents/articleVlogBanner'
import { homePage } from './documents/homePage'
import { portfolioCategory } from './documents/portfolioCategory'
import { portfolioHero } from './documents/portfolioHero'
import { portfolioItem } from './documents/portfolioItem'
import { serviceCategory } from './documents/serviceCategory'
import { servicesHero } from './documents/servicesHero'
import { serviceItem } from './documents/serviceItem'

// Objects
import { heroSection } from './objects/heroSection'
import { heroSlide } from './objects/heroSlide'
import { partner } from './objects/partner'
import { sanityImageWithPriority } from './objects/sanityImageWithPriority'
import { serviceAddOn } from './objects/serviceAddOn'
import { socialLink } from './objects/socialLink'
import { teaserVideo } from './objects/teaserVideo'
import { upcomingEvent } from './objects/upcomingEvent'
import { videoSource } from './objects/videoSource'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    // Documents
    articleVlogBanner,
    homePage,
    portfolioCategory,
    portfolioHero,
    portfolioItem,
    serviceCategory,
    servicesHero,
    serviceItem,

    // Reusable Objects
    heroSection,
    heroSlide,
    partner,
    sanityImageWithPriority,
    serviceAddOn,
    socialLink,
    teaserVideo,
    upcomingEvent,
    videoSource,
  ],
}

