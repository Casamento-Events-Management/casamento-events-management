import { defineField, defineType } from 'sanity'

/**
 * Reusable object schema for direct video file uploads (MP4, WebM) inside Portable Text.
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
    },
    prepare({ assetRef, caption }) {
      return {
        title: caption || assetRef || 'Uploaded Video File',
        subtitle: assetRef ? '📁 Sanity CDN Video File' : 'No file uploaded',
      }
    },
  },
})
