import { defineArrayMember, defineField, defineType } from 'sanity'

/**
 * Singleton Document Schema for the Featured Teaser Section (`_type: 'featuredTeaser'`).
 * Matches `FeaturedTeaserContent` interface in `src/types/home.ts`.
 */
export const featuredTeaser = defineType({
  name: 'featuredTeaser',
  title: 'Featured Teaser',
  type: 'document',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Teaser Videos Section Eyebrow',
      type: 'string',
      description: 'Small tagline above the teaser videos section title (e.g. "Visual Stories").',
      initialValue: 'Visual Stories',
    }),
    defineField({
      name: 'title',
      title: 'Teaser Videos Section Title',
      type: 'string',
      description: 'Main heading for the teaser videos section.',
      initialValue: 'Featured Teaser Highlights',
    }),
    defineField({
      name: 'description',
      title: 'Teaser Videos Section Description',
      type: 'text',
      rows: 3,
      description: 'Introductory paragraph beneath the section heading.',
      initialValue: 'Experience the emotional intensity and cinematic splendor of our handcrafted celebrations.',
    }),
    defineField({
      name: 'teaserVideos',
      title: 'Teaser Highlight Videos',
      type: 'array',
      of: [defineArrayMember({ type: 'teaserVideo' })],
      description: 'The row of teaser videos on the home page.',
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Featured Teaser Section',
        subtitle: 'Singleton — Featured teaser videos highlight section',
      }
    },
  },
})
