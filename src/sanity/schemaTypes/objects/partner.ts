import { defineField, defineType } from 'sanity'

/**
 * Reusable object matching `Partner` in `src/types/shared.ts`
 */
export const partner = defineType({
  name: 'partner',
  title: 'Partner / Sponsor',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      title: 'Partner Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Partner Logo',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          validation: (Rule) => Rule.required().error('Logo alt text is required.'),
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'Partner Website URL',
      type: 'url',
    }),
    defineField({
      name: 'priority',
      title: 'Display Priority Order',
      type: 'number',
      description: 'Higher value = shown first.',
      initialValue: 0,
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'logo',
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
