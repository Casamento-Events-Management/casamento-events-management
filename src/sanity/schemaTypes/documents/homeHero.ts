import { defineArrayMember, defineField, defineType } from 'sanity'

/**
 * Singleton Document Schema for the Home Page Hero & Partners (`_type: 'homeHero'`).
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
      title: 'Partners & Sponsors',
      type: 'array',
      of: [defineArrayMember({ type: 'partner' })],
      description: 'Brand partner and sponsor logos.',
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Home Page Hero & Partners',
        subtitle: 'Singleton — Main landing page hero section and brand logos',
      }
    },
  },
})
