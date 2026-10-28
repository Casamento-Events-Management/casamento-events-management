import { defineField, defineType } from 'sanity'

/**
 * Singleton Document Schema for the Home Page Hero (`_type: 'homeHero'`).
 * Matches `HomeHeroContent` interface in `src/types/home.ts`.
 *
 * NOTE: The `partners` (Clients & Brands Served) array has been moved to the
 * standalone `clientSection` singleton document.
 */
export const homeHero = defineType({
  name: 'homeHero',
  title: 'Home Page Hero',
  type: 'document',
  fields: [
    defineField({
      name: 'hero',
      title: 'Hero / Landing Section',
      type: 'heroSection',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Home Page Hero',
        subtitle: 'Singleton — Main landing page hero section',
      }
    },
  },
})
