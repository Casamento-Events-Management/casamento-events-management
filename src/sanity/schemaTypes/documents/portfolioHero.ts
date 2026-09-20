import { defineField, defineType } from 'sanity'

/**
 * Singleton Document Schema for the Portfolio Page Hero (`_type: 'portfolioHero'`).
 * Matches `SanityPortfolioHero` interface in `src/types/portfolio.ts`.
 *
 * Editors control the hero headline and introductory copy displayed at the
 * top of the /portfolio route without a code deployment.
 */
export const portfolioHero = defineType({
  name: 'portfolioHero',
  title: 'Portfolio Page Hero',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Hero Title',
      type: 'string',
      description: 'Primary headline displayed at the top of the Portfolio page (e.g. "Masterpieces in Motion").',
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
        title: title ?? 'Portfolio Page Hero',
        subtitle: 'Singleton — Portfolio page hero section',
      }
    },
  },
})
