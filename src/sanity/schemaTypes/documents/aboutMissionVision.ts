import { defineField, defineType } from 'sanity'

/**
 * Singleton Document Schema for the About Us "Mission & Vision" Section (`_type: 'aboutMissionVision'`).
 * Matches `AboutMissionVisionContent` in `src/types/about.ts`.
 */
export const aboutMissionVision = defineType({
  name: 'aboutMissionVision',
  title: 'About Us — Mission & Vision',
  type: 'document',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Section Eyebrow',
      type: 'string',
      description: 'Small uppercase tagline displayed above the section title.',
      initialValue: 'Our North Star',
      validation: (Rule) => Rule.max(80),
    }),
    defineField({
      name: 'title',
      title: 'Section Title',
      type: 'string',
      description: 'Main heading for the Mission & Vision section.',
      initialValue: 'Mission & Vision',
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
      name: 'mission',
      title: 'Mission Card',
      type: 'aboutCardItem',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'vision',
      title: 'Vision Card',
      type: 'aboutCardItem',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({ title }) {
      return {
        title: title ?? 'Mission & Vision',
        subtitle: 'Singleton — About Us Mission & Vision section',
      }
    },
  },
})
