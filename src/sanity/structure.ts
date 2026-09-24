import type { StructureResolver } from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Casamento Content Studio')
    .items([
      // Singleton: Home Page
      S.listItem()
        .title('Home Page')
        .id('homePageSingleton')
        .child(
          S.document()
            .schemaType('homePage')
            .documentId('homePage')
        ),
      S.divider(),
      // Media Categories
      S.listItem()
        .title('Media Categories')
        .child(S.documentTypeList('portfolioCategory').title('Media Categories')),
      S.divider(),
      // Portfolio section
      S.listItem()
        .title('Portfolio Page Hero')
        .id('portfolioHeroSingleton')
        .child(
          S.document()
            .schemaType('portfolioHero')
            .documentId('portfolioHero')
        ),
      S.listItem()
        .title('Portfolio Items')
        .child(S.documentTypeList('portfolioItem').title('Portfolio Items')),
      S.divider(),
      // Articles section
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
      // Services section
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
      // Filter out explicitly listed documents from default list
      ...S.documentTypeListItems().filter(
        (listItem) => !['homePage', 'portfolioHero', 'portfolioCategory', 'portfolioItem', 'servicesHero', 'serviceCategory', 'serviceItem', 'articleVlogBanner', 'articlesHero', 'articleVlog', 'clientFeedback'].includes(listItem.getId() || '')
      ),
    ])

