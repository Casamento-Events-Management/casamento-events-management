import { defineField, defineType } from 'sanity';

export const articleVlogBanner = defineType({
  name: 'articleVlogBanner',
  title: 'Article Vlog Banner',
  type: 'document',
  fields: [
    defineField({
      name: 'bannerImages',
      title: 'Hero Banner Images (Optional Carousel)',
      type: 'array',
      description:
        'Upload one or more full-width banner images. Multiple images crossfade automatically every 2 seconds. Leave empty to use the brand cream surface.',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alternative Text',
              type: 'string',
              description: 'Descriptive alt text for accessibility and SEO.',
            }),
          ],
        },
      ],
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
      media: 'bannerImages.0',
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
