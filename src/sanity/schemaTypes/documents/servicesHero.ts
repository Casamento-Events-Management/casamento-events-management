import { defineField, defineType } from 'sanity'

/**
 * Singleton Document Schema for the Services Page Hero (`_type: 'servicesHero'`).
 * Matches `SanityServicesHero` interface in `src/types/service.ts`.
 *
 * Editors control the hero headline and introductory copy displayed at the
 * top of the /services route without a code deployment.
 */
export const servicesHero = defineType({
  name: 'servicesHero',
  title: 'Services Page Hero',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Hero Title',
      type: 'string',
      description: 'Primary headline displayed at the top of the Services page (e.g. "Crafted Experiences, Unforgettable Moments").',
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
      name: 'servicesEyebrow',
      title: 'Services Section Eyebrow Tagline',
      type: 'string',
      description: 'Small uppercase tagline shown above the Service Section title (e.g. "OUR SERVICE CATALOG").',
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: 'servicesTitle',
      title: 'Services Section Title',
      type: 'string',
      description: 'Heading displayed directly above the collapsible service categories list.',
      validation: (Rule) => Rule.max(120),
    }),
    defineField({
      name: 'servicesDescription',
      title: 'Services Section Description',
      type: 'text',
      rows: 3,
      description: 'Introductory copy displayed directly above the category list.',
      validation: (Rule) => Rule.max(400),
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({ title }) {
      return {
        title: title ?? 'Services Page Hero',
        subtitle: 'Singleton — Services page hero section',
      }
    },
  },
})
