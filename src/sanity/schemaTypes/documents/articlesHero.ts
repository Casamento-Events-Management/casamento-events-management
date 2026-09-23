import { defineField, defineType } from 'sanity'

/**
 * Singleton Document Schema for the Articles Page Vlog Gallery section header.
 * Matches `ArticlesHeroContent` in `src/types/articleVlog.ts`.
 *
 * Editors control the eyebrow, title, and description displayed above the
 * Vlog gallery filter bar on the /articles route.
 */
export const articlesHero = defineType({
  name: 'articlesHero',
  title: 'Vlog Section Header',
  type: 'document',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Section Eyebrow',
      type: 'string',
      description: 'Small kicker tag displayed above the section title (e.g. "EVENT JOURNAL").',
      initialValue: 'EVENT JOURNAL',
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: 'title',
      title: 'Section Title',
      type: 'string',
      description: 'Main section headline displayed above the vlog gallery (e.g. "Explore Our Vlogs & Guides").',
      initialValue: 'Explore Our Vlogs & Guides',
      validation: (Rule) => Rule.required().min(5).max(120),
    }),
    defineField({
      name: 'description',
      title: 'Section Description',
      type: 'text',
      rows: 3,
      description: 'Short paragraph below the title. 1–2 sentences recommended.',
      initialValue: 'Behind-the-scenes production insights, luxury styling trends, and cinematic event highlights by Casamento Events.',
      validation: (Rule) => Rule.required().min(20).max(400),
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({ title }) {
      return {
        title: title ?? 'Articles Page Hero',
        subtitle: 'Singleton — Articles vlog gallery section header',
      }
    },
  },
})
