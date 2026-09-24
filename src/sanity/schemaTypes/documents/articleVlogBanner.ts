import { defineField, defineType } from 'sanity';

export const articleVlogBanner = defineType({
  name: 'articleVlogBanner',
  title: 'Article Vlog Banner',
  type: 'document',
  fields: [
    defineField({
      name: 'backgroundImage',
      title: 'Background Image',
      type: 'image',
      description: 'Full-width banner background image. High resolution recommended.',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative Text',
          type: 'string',
          description: 'Accessibility label for screen readers.',
          validation: (Rule) => Rule.required(),
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Banner Title (Optional)',
      type: 'string',
      description: 'Optional headline text overlay. Leave blank to display image only.',
    }),
    defineField({
      name: 'description',
      title: 'Banner Description (Optional)',
      type: 'text',
      rows: 3,
      description: 'Optional summary paragraph overlay. Leave blank to display image only.',
    }),
    defineField({
      name: 'ctaButton',
      title: 'CTA Button (Optional)',
      type: 'object',
      description: 'Optional call-to-action button overlay.',
      fields: [
        defineField({
          name: 'label',
          title: 'Button Label',
          type: 'string',
        }),
        defineField({
          name: 'href',
          title: 'Destination URL',
          type: 'string',
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'backgroundImage',
    },
    prepare({ title, media }) {
      return {
        title: title || 'Image-Only Banner',
        subtitle: 'Article Vlog Banner',
        media,
      };
    },
  },
});
