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
      // Portfolio section
      S.listItem()
        .title('Portfolio Categories')
        .child(S.documentTypeList('portfolioCategory').title('Portfolio Categories')),
      S.listItem()
        .title('Portfolio Items')
        .child(S.documentTypeList('portfolioItem').title('Portfolio Items')),
      S.divider(),
      // Filter out singletons from remaining document list if any
      ...S.documentTypeListItems().filter(
        (listItem) => !['homePage', 'portfolioCategory', 'portfolioItem'].includes(listItem.getId() || '')
      ),
    ])
