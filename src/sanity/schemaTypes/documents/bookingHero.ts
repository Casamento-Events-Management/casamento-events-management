import { defineField, defineType } from 'sanity'

/**
 * Singleton Document Schema for the Booking Page Hero (`_type: 'bookingHero'`).
 * Matches `SanityBookingHero` interface in `src/types/booking.ts`.
 *
 * Editors control the hero eyebrow, title, and description copy
 * displayed at the top of the /book-now route without code deployment.
 */
export const bookingHero = defineType({
  name: 'bookingHero',
  title: 'Booking Page Hero',
  type: 'document',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Hero Eyebrow Tagline',
      type: 'string',
      description: 'Small uppercase tagline shown at the top of the hero (e.g. "SERVICE BOOKING").',
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: 'title',
      title: 'Hero Title',
      type: 'string',
      description: 'Primary headline displayed at the top of the Booking page (e.g. "Reserve Your Date with Casamento").',
      validation: (Rule) => Rule.required().min(5).max(120),
    }),
    defineField({
      name: 'description',
      title: 'Hero Description',
      type: 'text',
      rows: 4,
      description: 'Introductory paragraph shown beneath the title. Keep it concise — 1–2 sentences recommended.',
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
        title: title ?? 'Booking Page Hero',
        subtitle: 'Singleton — Booking page hero section',
      }
    },
  },
})
