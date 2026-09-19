import { defineField, defineType } from 'sanity'

/**
 * Document Schema for Portfolio Categories (`_type: 'portfolioCategory'`).
 * Matches `SanityPortfolioCategory` in `src/types/portfolio.ts`.
 */
export const portfolioCategory = defineType({
  name: 'portfolioCategory',
  title: 'Portfolio Category',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Category Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'priority',
      title: 'Display Priority Order',
      type: 'number',
      description: 'Higher value = listed first in category filter tabs.',
      initialValue: 0,
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      priority: 'priority',
    },
    prepare({ title, priority }) {
      return {
        title,
        subtitle: `Priority: ${priority}`,
      }
    },
  },
})
