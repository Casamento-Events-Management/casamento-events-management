import { defineArrayMember, defineField, defineType } from 'sanity'

/**
 * Singleton Document Schema for the Home Page (`_type: 'homePage'`).
 * Matches `HomePageContent` interface in `src/types/home.ts`.
 */
export const homePage = defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  fields: [
    defineField({
      name: 'hero',
      title: 'Hero / Landing Section',
      type: 'heroSection',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'teaserVideos',
      title: 'Teaser Highlight Videos',
      type: 'array',
      of: [defineArrayMember({ type: 'teaserVideo' })],
      description: 'The row of teaser videos on the home page.',
    }),
    defineField({
      name: 'upcomingEvents',
      title: 'Upcoming Events',
      type: 'array',
      of: [defineArrayMember({ type: 'upcomingEvent' })],
      description: 'Upcoming event cards featured on the home page.',
    }),
    defineField({
      name: 'partners',
      title: 'Partners & Sponsors',
      type: 'array',
      of: [defineArrayMember({ type: 'partner' })],
      description: 'Brand partner and sponsor logos.',
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'array',
      of: [defineArrayMember({ type: 'socialLink' })],
      description: 'Social media profile links displayed on home page and footer.',
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Home Page Singleton Content',
        subtitle: 'Main landing page content and sections',
      }
    },
  },
})
