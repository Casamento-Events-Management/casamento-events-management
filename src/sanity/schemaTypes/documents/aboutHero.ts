import { defineField, defineType } from 'sanity'

/**
 * Singleton Document Schema for the About Us Page Hero (`_type: 'aboutHero'`).
 * Matches `AboutHeroContent` in `src/types/about.ts`.
 */
export const aboutHero = defineType({
  name: 'aboutHero',
  title: 'About Us Page Hero',
  type: 'document',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Hero Eyebrow Tagline',
      type: 'string',
      description: 'Small uppercase label displayed above the hero headline (e.g. "About Us").',
      initialValue: 'About Us',
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: 'title',
      title: 'Hero Title',
      type: 'string',
      description: 'Primary H1 headline displayed at the top of the /about route.',
      validation: (Rule) => Rule.required().min(5).max(140),
    }),
    defineField({
      name: 'description',
      title: 'Hero Quote / Subtitle',
      type: 'text',
      rows: 3,
      description: 'Editorial introductory line shown below the title and divider.',
      validation: (Rule) => Rule.required().min(20).max(400),
    }),
    defineField({
      name: 'bannerImages',
      title: 'Hero Banner Images (Optional Carousel)',
      type: 'array',
      description: 'Upload one or more full-width banner images. Multiple images crossfade automatically every 2 seconds. Leave empty to use the brand cream surface.',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alternative Text',
              type: 'string',
              description: 'Descriptive alt text for accessibility and SEO.',
            }),
          ],
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({ title }) {
      return {
        title: title ?? 'About Us Page Hero',
        subtitle: 'Singleton — About Us hero banner',
      }
    },
  },
})
