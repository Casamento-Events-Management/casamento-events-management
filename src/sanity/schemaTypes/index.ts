import { type SchemaTypeDefinition } from 'sanity'

// Documents
import { homePage } from './documents/homePage'
import { portfolioCategory } from './documents/portfolioCategory'
import { portfolioItem } from './documents/portfolioItem'

// Objects
import { heroSection } from './objects/heroSection'
import { partner } from './objects/partner'
import { sanityImageWithPriority } from './objects/sanityImageWithPriority'
import { socialLink } from './objects/socialLink'
import { teaserVideo } from './objects/teaserVideo'
import { upcomingEvent } from './objects/upcomingEvent'
import { videoSource } from './objects/videoSource'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    // Documents
    homePage,
    portfolioCategory,
    portfolioItem,

    // Reusable Objects
    heroSection,
    partner,
    sanityImageWithPriority,
    socialLink,
    teaserVideo,
    upcomingEvent,
    videoSource,
  ],
}
