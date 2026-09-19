import { defineField, defineType } from 'sanity'

/**
 * Reusable image schema matching `SanityImageWithPriority` in `src/types/sanity.ts`
 * Includes hotspot/crop, required accessibility alt text, optional caption, and display priority.
 */
export const sanityImageWithPriority = defineType({
  name: 'sanityImageWithPriority',
  title: 'Image with Priority',
  type: 'image',
  options: {
    hotspot: true,
  },
  fields: [
    defineField({
      name: 'alt',
      title: 'Alternative Text (Alt Text)',
      type: 'string',
      description: 'Important for accessibility and SEO.',
      validation: (Rule) => Rule.required().error('Alt text is required for accessibility and SEO.'),
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
      description: 'Optional caption displayed beneath the image.',
    }),
    defineField({
      name: 'priority',
      title: 'Display Priority Order',
      type: 'number',
      description: 'Higher value = displayed first. Used when ordering gallery items or thumbnails.',
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: 'alt',
      media: 'asset',
      priority: 'priority',
    },
    prepare({ title, media, priority }) {
      return {
        title: title || 'Image (No alt text)',
        subtitle: priority !== undefined ? `Priority: ${priority}` : undefined,
        media,
      }
    },
  },
})
