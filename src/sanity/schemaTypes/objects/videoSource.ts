import { defineField, defineType } from 'sanity'

/**
 * Reusable object schema matching `VideoSource` in `src/types/sanity.ts`
 * Supports either direct Sanity CDN video file uploads ('sanity') or external stream URLs ('external').
 */
export const videoSource = defineType({
  name: 'videoSource',
  title: 'Video Source',
  type: 'object',
  fields: [
    defineField({
      name: 'sourceType',
      title: 'Source Type',
      type: 'string',
      options: {
        list: [
          { title: 'Sanity CDN File Upload', value: 'sanity' },
          { title: 'External Provider (YouTube / Vimeo / Cloudflare Stream)', value: 'external' },
        ],
        layout: 'radio',
      },
      initialValue: 'sanity',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'asset',
      title: 'Video Asset (Sanity CDN)',
      type: 'file',
      options: {
        accept: 'video/mp4,video/webm,video/ogg,video/*',
      },
      hidden: ({ parent }) => parent?.sourceType !== 'sanity',
    }),
    defineField({
      name: 'mimeType',
      title: 'MIME Type (e.g. video/mp4, video/webm)',
      type: 'string',
      hidden: ({ parent }) => parent?.sourceType !== 'sanity',
    }),
    defineField({
      name: 'url',
      title: 'External Video URL',
      type: 'url',
      description: 'Full embed URL or video link (YouTube, Vimeo, Cloudflare Stream)',
      hidden: ({ parent }) => parent?.sourceType !== 'external',
    }),
    defineField({
      name: 'provider',
      title: 'External Video Provider',
      type: 'string',
      options: {
        list: [
          { title: 'Cloudflare Stream', value: 'cloudflare' },
          { title: 'YouTube', value: 'youtube' },
          { title: 'Vimeo', value: 'vimeo' },
        ],
      },
      hidden: ({ parent }) => parent?.sourceType !== 'external',
    }),
  ],
  preview: {
    select: {
      sourceType: 'sourceType',
      url: 'url',
    },
    prepare({ sourceType, url }) {
      return {
        title: sourceType === 'external' ? `External Video (${url || 'No URL'})` : 'Sanity CDN Video Upload',
      }
    },
  },
})
