import { defineField, defineType } from 'sanity'

/**
 * Document Schema for Service Categories (`_type: 'serviceCategory'`).
 * Matches `SanityServiceCategory` interface in `src/types/service.ts`.
 *
 * Used for category filtering (e.g., "All", "Full Planning & Styling", "Coordination", "Technical Production").
 */
export const serviceCategory = defineType({
  name: 'serviceCategory',
  title: 'Service Category',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Category Title',
      type: 'string',
      description: 'The display name of the service category (e.g. "Full Planning & Styling").',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL-friendly unique identifier used for tab routing and filtering.',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Category Description',
      type: 'text',
      rows: 3,
      description: 'Brief explanation of what services fall under this category.',
    }),
    defineField({
      name: 'icon',
      title: 'Lucide Icon Key',
      type: 'string',
      description: 'Optional Lucide React icon name (e.g., "Sparkles", "Camera", "Radio") for category tab badges.',
    }),
    defineField({
      name: 'priority',
      title: 'Display Priority Order',
      type: 'number',
      description: 'Higher numbers appear first in the category tab bar (e.g., 30, 20, 10).',
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
        subtitle: `Priority: ${priority ?? 0}`,
      }
    },
  },
})
