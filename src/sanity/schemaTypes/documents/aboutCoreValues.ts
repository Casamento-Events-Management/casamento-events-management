import { defineArrayMember, defineField, defineType } from 'sanity'

/**
 * Singleton Document Schema for the About Us "Our Core Values" Section (`_type: 'aboutCoreValues'`).
 * Matches `AboutCoreValuesContent` in `src/types/about.ts`.
 */
export const aboutCoreValues = defineType({
  name: 'aboutCoreValues',
  title: 'About Us — Core Values',
  type: 'document',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Section Eyebrow',
      type: 'string',
      description: 'Small uppercase tagline displayed above the section title.',
      initialValue: 'Our Foundation',
      validation: (Rule) => Rule.max(80),
    }),
    defineField({
      name: 'title',
      title: 'Section Title',
      type: 'string',
      description: 'Main heading for the Core Values section.',
      initialValue: 'Our Core Values',
      validation: (Rule) => Rule.required().min(3).max(120),
    }),
    defineField({
      name: 'description',
      title: 'Section Description',
      type: 'text',
      rows: 2,
      description: 'Short subtitle displayed beneath the section heading.',
      validation: (Rule) => Rule.max(300),
    }),
    defineField({
      name: 'items',
      title: 'Core Values Cards',
      type: 'array',
      of: [defineArrayMember({ type: 'aboutCardItem' })],
      description: 'Ordered list of core value cards. Drag to reorder.',
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({ title }) {
      return {
        title: title ?? 'Our Core Values',
        subtitle: 'Singleton — About Us Core Values section',
      }
    },
  },
})
