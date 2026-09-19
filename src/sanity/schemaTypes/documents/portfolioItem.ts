import { defineArrayMember, defineField, defineType } from 'sanity'

/**
 * Document Schema for Portfolio Items (`_type: 'portfolioItem'`).
 * Matches `SanityPortfolioItem` interface in `src/types/portfolio.ts`.
 */
export const portfolioItem = defineType({
  name: 'portfolioItem',
  title: 'Portfolio Item',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Item Title',
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
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'portfolioCategory' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'mediaType',
      title: 'Media Type',
      type: 'string',
      options: {
        list: [
          { title: 'Image Gallery / Still', value: 'image' },
          { title: 'Video Stream / Clip', value: 'video' },
        ],
        layout: 'radio',
      },
      initialValue: 'image',
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail / Cover Image',
      type: 'sanityImageWithPriority',
      description: 'Main thumbnail image. Enforces LCP optimization and Satisfies Google schema requirements.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'video',
      title: 'Video Source',
      type: 'videoSource',
      description: 'Required if Media Type is Video.',
      hidden: ({ parent }) => parent?.mediaType !== 'video',
    }),
    defineField({
      name: 'duration',
      title: 'Video Duration (ISO 8601, e.g. PT3M45S)',
      type: 'string',
      description: 'Required by Google Video Rich Snippet guidelines for VideoObject schema when mediaType === video.',
      hidden: ({ parent }) => parent?.mediaType !== 'video',
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'eventDate',
      title: 'Event Date',
      type: 'date',
    }),
    defineField({
      name: 'location',
      title: 'Location / Venue',
      type: 'string',
    }),
    defineField({
      name: 'clientName',
      title: 'Client / Couple Name',
      type: 'string',
    }),
    defineField({
      name: 'featured',
      title: 'Featured Item',
      type: 'boolean',
      description: 'Highlight this item as a featured showcase piece.',
      initialValue: false,
    }),
    defineField({
      name: 'priority',
      title: 'Display Priority Order',
      type: 'number',
      description: 'Higher value = shown first in portfolio gallery.',
      initialValue: 0,
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      category: 'category.title',
      mediaType: 'mediaType',
      media: 'thumbnail',
      featured: 'featured',
    },
    prepare({ title, category, mediaType, media, featured }) {
      return {
        title: `${featured ? '★ ' : ''}${title}`,
        subtitle: `${category || 'Uncategorized'} • ${mediaType || 'image'}`,
        media,
      }
    },
  },
})
