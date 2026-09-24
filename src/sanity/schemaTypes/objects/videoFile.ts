import { defineField, defineType } from 'sanity'

/**
 * Reusable object schema for direct video file uploads (MP4, WebM) inside Portable Text.
 * Supports optional custom poster/thumbnail image for LCP optimization.
 */
export const videoFile = defineType({
  name: 'videoFile',
  title: 'Video File Upload',
  type: 'object',
  fields: [
    defineField({
      name: 'asset',
      title: 'Video File (MP4, WebM)',
      type: 'file',
      options: {
        accept: 'video/mp4,video/webm,video/ogg,video/*',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'poster',
      title: 'Custom Thumbnail / Poster Image',
      type: 'image',
      description: 'Optional custom poster image displayed before playing.',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative Text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
      description: 'Optional caption displayed below the video',
    }),
  ],
  preview: {
    select: {
      assetRef: 'asset.asset._ref',
      caption: 'caption',
      media: 'poster',
    },
    prepare({ assetRef, caption, media }) {
      return {
        title: caption || assetRef || 'Uploaded Video File',
        subtitle: assetRef ? '📁 Sanity CDN Video File' : 'No file uploaded',
        media,
      }
    },
  },
})
