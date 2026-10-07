import { defineArrayMember, defineField, defineType } from 'sanity'

/**
 * Singleton Document Schema for the Home Page Hero & Clients (`_type: 'homeHero'`).
 * Matches `HomeHeroContent` interface in `src/types/home.ts`.
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
    defineField({
      name: 'partners',
      title: 'Clients & Brands Served',
      type: 'array',
      of: [defineArrayMember({ type: 'partner' })],
      description: 'Logos of corporate clients, brands, and organizations we have served.',
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Home Page Hero & Clients',
        subtitle: 'Singleton — Main landing page hero section and client logos',
      }
    },
  },
})
