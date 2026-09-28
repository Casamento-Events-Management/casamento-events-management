import { defineField, defineType } from 'sanity'

/**
 * Reusable Object Schema for Hero Carousel Slides (`_type: 'heroSlide'`).
 * Matches `HeroSlide` interface in `src/types/home.ts`.
 */
export const heroSlide = defineType({
  name: 'heroSlide',
  title: 'Hero Carousel Slide',
  type: 'object',
  fields: [
    defineField({
      name: 'serviceCategory',
      title: 'Service Category Link',
      type: 'reference',
      to: [{ type: 'serviceCategory' }],
      description: 'Optional reference to a service category. Auto-links CTA to /services?category={slug}.',
    }),
    defineField({
      name: 'heading',
      title: 'Slide Heading / Service Name',
      type: 'string',
      description: 'Primary title displayed on the left pane (e.g. "Full Planning & Styling").',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Short Description',
      type: 'text',
      rows: 3,
      description: 'Brief 2-3 sentence overview of this service displayed on the left pane.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'ctaText',
      title: 'CTA Button Text',
      type: 'string',
      description: 'Label for the CTA button (defaults to "Explore Service").',
      initialValue: 'Explore Service',
    }),
    defineField({
      name: 'ctaLink',
      title: 'Custom CTA Link URL',
      type: 'string',
      description: 'Optional custom URL path override (e.g. "/services?category=coordination"). Overrides category auto-link.',
    }),
    defineField({
      name: 'mediaType',
      title: 'Media Type',
      type: 'string',
      options: {
        list: [
          { title: 'Image', value: 'image' },
          { title: 'Video', value: 'video' },
        ],
        layout: 'radio',
      },
      initialValue: 'image',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Slide Image',
      type: 'sanityImageWithPriority',
      description: 'High quality background / display image for the right pane.',
      hidden: ({ parent }) => parent?.mediaType === 'video',
      validation: (Rule) =>
        Rule.custom((image, context) => {
          const parent = context.parent as { mediaType?: string; image?: { asset?: unknown } } | undefined
          if (parent?.mediaType === 'image' || !parent?.mediaType) {
            if (!image || !(image as { asset?: unknown })?.asset) {
              return 'Slide image is required when Media Type is set to Image.'
            }
          }
          return true
        }),
    }),
    defineField({
      name: 'video',
      title: 'Slide Video',
      type: 'videoSource',
      description: 'Video source showcasing this service.',
      hidden: ({ parent }) => parent?.mediaType !== 'video',
      validation: (Rule) =>
        Rule.custom((video, context) => {
          const parent = context.parent as { mediaType?: string } | undefined
          if (parent?.mediaType === 'video') {
            if (!video) return 'Video source is required for Video slides.'
            const v = video as { sourceType?: string; asset?: unknown; url?: string }
            if (v.sourceType === 'external' && (!v.url || !v.url.trim())) {
              return 'External video URL is required for external video slides.'
            }
            if (v.sourceType === 'sanity' && !v.asset) {
              return 'Video file asset upload is required for Sanity CDN video slides.'
            }
          }
          return true
        }),
    }),
    defineField({
      name: 'videoPoster',
      title: 'Video Thumbnail / Poster Image',
      type: 'sanityImageWithPriority',
      description: 'Poster thumbnail image displayed before video playback (required for Video slides).',
      hidden: ({ parent }) => parent?.mediaType !== 'video',
      validation: (Rule) =>
        Rule.custom((videoPoster, context) => {
          const parent = context.parent as { mediaType?: string } | undefined
          if (parent?.mediaType === 'video') {
            if (!videoPoster || !(videoPoster as { asset?: unknown })?.asset) {
              return 'Thumbnail / poster image is required for Video slides.'
            }
          }
          return true
        }),
    }),
  ],
  preview: {
    select: {
      title: 'heading',
      subtitle: 'description',
      media: 'image',
    },
    prepare({ title, subtitle, media }) {
      return {
        title: title || 'Hero Slide',
        subtitle: subtitle || 'Service highlight slide',
        media,
      }
    },
  },
})
