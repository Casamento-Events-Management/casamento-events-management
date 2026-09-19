import { defineField, defineType } from 'sanity'

/**
 * Reusable object schema matching `TeaserVideo` in `src/types/shared.ts`
 */
export const teaserVideo = defineType({
  name: 'teaserVideo',
  title: 'Teaser Video',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'video',
      title: 'Video Source',
      type: 'videoSource',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'thumbnail',
      title: 'Poster / Thumbnail Image',
      type: 'sanityImageWithPriority',
      description: 'Click-to-play poster image required per SEO & performance policy.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'priority',
      title: 'Display Priority Order',
      type: 'number',
      description: 'Higher value = leftmost position.',
      initialValue: 0,
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'thumbnail',
      priority: 'priority',
    },
    prepare({ title, media, priority }) {
      return {
        title,
        subtitle: priority !== undefined ? `Priority: ${priority}` : undefined,
        media,
      }
    },
  },
})
