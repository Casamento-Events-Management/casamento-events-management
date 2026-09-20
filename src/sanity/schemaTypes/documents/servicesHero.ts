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
