import { type SchemaTypeDefinition } from 'sanity'

// Documents
import { aboutCoreValues } from './documents/aboutCoreValues'
import { aboutCta } from './documents/aboutCta'
import { aboutHero } from './documents/aboutHero'
import { aboutMissionVision } from './documents/aboutMissionVision'
import { aboutStory } from './documents/aboutStory'
import { aboutWhyChoose } from './documents/aboutWhyChoose'
import { articleVlogBanner } from './documents/articleVlogBanner'
import { articlesHero } from './documents/articlesHero'
import { articleVlog } from './documents/articleVlog'
import { bookingHero } from './documents/bookingHero'
import { clientSection } from './documents/clientSection'
import { homeHero } from './documents/homeHero'
import { featuredTeaser } from './documents/featuredTeaser'
import { contactSection } from './documents/contactSection'
import { portfolioCategory } from './documents/portfolioCategory'
import { portfolioHero } from './documents/portfolioHero'
import { portfolioUpcomingEvents } from './documents/portfolioUpcomingEvents'
import { portfolioItem } from './documents/portfolioItem'
import { serviceCategory } from './documents/serviceCategory'
import { servicesHero } from './documents/servicesHero'
import { serviceItem } from './documents/serviceItem'
import { clientFeedback } from './documents/clientFeedback'

// Objects
import { aboutCardItem } from './objects/aboutCardItem'
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

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    // Documents
    aboutHero,
    aboutStory,
    aboutMissionVision,
    aboutCoreValues,
    aboutWhyChoose,
    aboutCta,
    articleVlogBanner,
    articlesHero,
    articleVlog,
    bookingHero,
    clientFeedback,
    clientSection,
    homeHero,
    featuredTeaser,
    contactSection,
    portfolioCategory,
    portfolioHero,
    portfolioUpcomingEvents,
    portfolioItem,
    serviceCategory,
    servicesHero,
    serviceItem,

    // Reusable Objects
    aboutCardItem,
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
