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
    defineField({
      name: 'upcomingEventsEyebrow',
      title: 'Upcoming Events Section Eyebrow',
      type: 'string',
      description: 'Small tagline above the Upcoming Events section title (e.g. "Calendar & Events").',
      initialValue: 'Calendar & Events',
    }),
    defineField({
      name: 'upcomingEventsTitle',
      title: 'Upcoming Events Section Title',
      type: 'string',
      description: 'Main heading for the Upcoming Events section on the Portfolio page.',
      initialValue: 'Upcoming & Featured Events',
    }),
    defineField({
      name: 'upcomingEventsDescription',
      title: 'Upcoming Events Section Description',
      type: 'text',
      rows: 3,
      description: 'Introductory paragraph beneath the Upcoming Events section heading.',
      initialValue: 'Discover our upcoming celebrations and past milestone galas curated with timeless elegance.',
    }),
    defineField({
      name: 'galleryEyebrow',
      title: 'Gallery Section Eyebrow',
      type: 'string',
      description: 'Small tagline displayed above the Gallery section title (e.g. "PORTFOLIO GALLERY").',
      initialValue: 'Portfolio Gallery',
    }),
    defineField({
      name: 'galleryTitle',
      title: 'Gallery Section Title',
      type: 'string',
      description: 'Headline displayed above the Portfolio Gallery filter bar (e.g. "Explore Our Showcase").',
      initialValue: 'Explore Our Showcase',
    }),
    defineField({
      name: 'galleryDescription',
      title: 'Gallery Section Description',
      type: 'text',
      rows: 3,
      description: 'Introductory paragraph for the Portfolio Gallery section.',
      initialValue: 'Browse through our curated collection of wedding films, stage production designs, and broadcast live streams.',
    })
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
