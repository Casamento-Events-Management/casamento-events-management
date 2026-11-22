import { defineArrayMember, defineField, defineType } from 'sanity'

/**
 * Singleton Document Schema for the About Us "Why Choose Casamento?" Section (`_type: 'aboutWhyChoose'`).
 * Matches `AboutWhyChooseContent` in `src/types/about.ts`.
 */
export const aboutWhyChoose = defineType({
  name: 'aboutWhyChoose',
  title: 'About Us — Why Choose Us',
  type: 'document',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Section Eyebrow',
      type: 'string',
      description: 'Small uppercase tagline displayed above the section title.',
      initialValue: 'The Casamento Distinction',
      validation: (Rule) => Rule.max(80),
    }),
    defineField({
      name: 'title',
      title: 'Section Title',
      type: 'string',
      description: 'Main heading for the Why Choose section.',
      initialValue: 'Why Choose Casamento?',
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
      title: 'Distinction Cards',
      type: 'array',
      of: [defineArrayMember({ type: 'aboutCardItem' })],
      description: 'Ordered list of differentiators and capabilities. Drag to reorder.',
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({ title }) {
      return {
        title: title ?? 'Why Choose Casamento?',
        subtitle: 'Singleton — About Us Why Choose Us section',
      }
    },
  },
})
