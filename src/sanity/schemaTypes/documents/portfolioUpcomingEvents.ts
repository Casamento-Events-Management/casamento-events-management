import { defineArrayMember, defineField, defineType } from 'sanity'

/**
 * Singleton Document Schema for Portfolio Upcoming Events (`_type: 'portfolioUpcomingEvents'`).
 * Matches `PortfolioUpcomingEventsContent` in `src/types/portfolio.ts`.
 */
export const portfolioUpcomingEvents = defineType({
  name: 'portfolioUpcomingEvents',
  title: 'Portfolio Upcoming Events',
  type: 'document',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Upcoming Events Section Eyebrow',
      type: 'string',
      description: 'Tagline displayed above the Upcoming Events section title (e.g. "Calendar & Events").',
      initialValue: 'Calendar & Events',
    }),
    defineField({
      name: 'title',
      title: 'Upcoming Events Section Title',
      type: 'string',
      description: 'Main headline for the Upcoming Events section.',
      initialValue: 'Upcoming & Featured Events',
    }),
    defineField({
      name: 'description',
      title: 'Upcoming Events Section Description',
      type: 'text',
      rows: 3,
      description: 'Introductory paragraph for the Upcoming Events section.',
      initialValue: 'Discover our upcoming celebrations and past milestone galas curated with timeless elegance.',
    }),
    defineField({
      name: 'upcomingEvents',
      title: 'Upcoming Events',
      type: 'array',
      of: [defineArrayMember({ type: 'upcomingEvent' })],
      description: 'Upcoming event cards featured on the portfolio page.',
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Portfolio Upcoming Events',
        subtitle: 'Singleton — Upcoming events list and section header',
      }
    },
  },
})
