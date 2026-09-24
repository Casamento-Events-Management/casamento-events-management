import { defineField, defineType } from 'sanity'

/**
 * Reusable object schema for embedding YouTube, Vimeo, or external video URLs inside Portable Text.
 * Auto-fetches YouTube high-res thumbnail.
 */
export const videoEmbed = defineType({
  name: 'videoEmbed',
  title: 'Video Embed (YouTube / Vimeo)',
  type: 'object',
  fields: [
    defineField({
      name: 'url',
      title: 'Video URL',
      type: 'url',
      description: 'Paste YouTube link (e.g. https://www.youtube.com/watch?v=...) or Vimeo link',
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
      url: 'url',
      caption: 'caption',
    },
    prepare({ url, caption }) {
      return {
        title: caption || url || 'Video Embed',
        subtitle: url ? `🎥 ${url}` : 'No URL provided',
      }
    },
  },
})
