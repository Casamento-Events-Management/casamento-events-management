import type { StructureResolver } from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Casamento Content Studio')
    .items([
      // 1. Home Page Documents
      S.listItem()
        .title('Home Page Hero')
        .id('homeHeroSingleton')
        .child(
          S.document()
            .schemaType('homeHero')
            .documentId('homeHero')
        ),
      S.listItem()
        .title('Featured Teaser')
        .id('featuredTeaserSingleton')
        .child(
          S.document()
            .schemaType('featuredTeaser')
            .documentId('featuredTeaser')
        ),
      S.listItem()
        .title('Client Section')
        .id('clientSectionSingleton')
        .child(
          S.document()
            .schemaType('clientSection')
            .documentId('clientSection')
        ),
      S.divider(),

      // 2. Contact Section Documents
      S.listItem()
        .title('Contact Section')
        .id('contactSectionSingleton')
        .child(
          S.document()
            .schemaType('contactSection')
            .documentId('contactSection')
        ),
      S.divider(),

      // 3. Media Categories
      S.listItem()
        .title('Media Categories')
        .child(S.documentTypeList('portfolioCategory').title('Media Categories')),
      S.divider(),

      // 4. Portfolio Section Documents
      S.listItem()
        .title('Portfolio Page Hero')
        .id('portfolioHeroSingleton')
        .child(
          S.document()
            .schemaType('portfolioHero')
            .documentId('portfolioHero')
        ),
      S.listItem()
        .title('Portfolio Upcoming Events')
        .id('portfolioUpcomingEventsSingleton')
        .child(
          S.document()
            .schemaType('portfolioUpcomingEvents')
            .documentId('portfolioUpcomingEvents')
        ),
      S.listItem()
        .title('Portfolio Items')
        .child(S.documentTypeList('portfolioItem').title('Portfolio Items')),
      S.divider(),

      // 5. Articles Section Documents
      S.listItem()
        .title('Article Vlog Banner')
        .id('articleVlogBannerSingleton')
        .child(
          S.document()
            .schemaType('articleVlogBanner')
            .documentId('articleVlogBanner')
        ),
      S.listItem()
        .title('Vlog Section Header')
        .id('articlesHeroSingleton')
        .child(
          S.document()
            .schemaType('articlesHero')
            .documentId('articlesHero')
        ),
      S.listItem()
        .title('Article Vlogs')
        .child(S.documentTypeList('articleVlog').title('Article Vlogs')),
      S.listItem()
        .title('Client Feedbacks')
        .child(S.documentTypeList('clientFeedback').title('Client Feedbacks')),
      S.divider(),

      // 6. Services Section Documents
      S.listItem()
        .title('Services Page Hero')
        .id('servicesHeroSingleton')
        .child(
          S.document()
            .schemaType('servicesHero')
            .documentId('servicesHero')
        ),
      S.listItem()
        .title('Service Categories')
        .child(S.documentTypeList('serviceCategory').title('Service Categories')),
      S.listItem()
        .title('Service Items')
        .child(S.documentTypeList('serviceItem').title('Service Items')),
      S.divider(),

      // 7. Booking Section Documents
      S.listItem()
        .title('Booking Page Hero')
        .id('bookingHeroSingleton')
        .child(
          S.document()
            .schemaType('bookingHero')
            .documentId('bookingHero')
        ),
      S.divider(),

      // 8. About Us Section Documents
      S.listItem()
        .title('About Us Page Hero')
        .id('aboutHeroSingleton')
        .child(
          S.document()
            .schemaType('aboutHero')
            .documentId('aboutHero')
        ),
      S.listItem()
        .title('About Us — Our Story')
        .id('aboutStorySingleton')
        .child(
          S.document()
            .schemaType('aboutStory')
            .documentId('aboutStory')
        ),
      S.listItem()
        .title('About Us — Mission & Vision')
        .id('aboutMissionVisionSingleton')
        .child(
          S.document()
            .schemaType('aboutMissionVision')
            .documentId('aboutMissionVision')
        ),
      S.listItem()
        .title('About Us — Core Values')
        .id('aboutCoreValuesSingleton')
        .child(
          S.document()
            .schemaType('aboutCoreValues')
            .documentId('aboutCoreValues')
        ),
      S.listItem()
        .title('About Us — Why Choose Us')
        .id('aboutWhyChooseSingleton')
        .child(
          S.document()
            .schemaType('aboutWhyChoose')
            .documentId('aboutWhyChoose')
        ),
      S.listItem()
        .title('About Us — Call to Action')
        .id('aboutCtaSingleton')
        .child(
          S.document()
            .schemaType('aboutCta')
            .documentId('aboutCta')
        ),
      S.divider(),

      // Filter out explicitly listed documents from default list
      ...S.documentTypeListItems().filter(
        (listItem) =>
          ![
            'homeHero',
            'featuredTeaser',
            'clientSection',
            'contactSection',
            'portfolioHero',
            'portfolioUpcomingEvents',
            'portfolioCategory',
            'portfolioItem',
            'servicesHero',
            'serviceCategory',
            'serviceItem',
            'articleVlogBanner',
            'articlesHero',
            'articleVlog',
            'clientFeedback',
            'bookingHero',
            'aboutHero',
            'aboutStory',
            'aboutMissionVision',
            'aboutCoreValues',
            'aboutWhyChoose',
            'aboutCta',
            'homePage',
          ].includes(listItem.getId() || '')
      ),
    ])
