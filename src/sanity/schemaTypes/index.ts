import { type SchemaTypeDefinition } from 'sanity'

// Documents
import { articleVlogBanner } from './documents/articleVlogBanner'
import { articlesHero } from './documents/articlesHero'
import { articleVlog } from './documents/articleVlog'
import { bookingHero } from './documents/bookingHero'
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
import { videoEmbed } from './objects/videoEmbed'
import { videoFile } from './objects/videoFile'

import { clientFeedback } from './documents/clientFeedback'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    // Documents
    articleVlogBanner,
    articlesHero,
    articleVlog,
    bookingHero,
    clientFeedback,
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
    videoEmbed,
    videoFile,
  ],
}

