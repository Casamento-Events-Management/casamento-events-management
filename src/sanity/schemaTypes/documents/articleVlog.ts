import { defineField, defineType } from 'sanity'

/**
 * Document Schema for Article Vlog Items (`_type: 'articleVlog'`).
 * Serves both the gallery listing (lean GROQ projection) and the
 * individual detail page at /articles/vlogs/[slug].
 *
 * Matches `ArticleVlogItem` in `src/types/articleVlog.ts`.
 */
export const articleVlog = defineType({
  name: 'articleVlog',
  title: 'Article Vlog',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Headline of the vlog or editorial article.',
      validation: (Rule) => Rule.required().min(5).max(200),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'Auto-generated URL identifier. Powers /articles/vlogs/[slug].',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'portfolioCategory' }],
      description: 'Reuses the Portfolio category taxonomy for filter tabs.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'mediaType',
      title: 'Media Type',
      type: 'string',
      options: {
        list: [
          { title: 'Video Vlog', value: 'video' },
          { title: 'Image / Editorial Guide', value: 'image' },
        ],
        layout: 'radio',
      },
      initialValue: 'video',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail Image',
      type: 'image',
      description: 'Required. High-resolution thumbnail shown in the gallery and as the video poster.',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative Text',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'priority',
          title: 'Display Priority',
          type: 'number',
          initialValue: 0,
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'videoSource',
      title: 'Video Source',
      type: 'videoSource',
      description: 'Populate when Media Type is Video. Supports Sanity CDN, YouTube, Vimeo, or Cloudflare Stream.',
      hidden: ({ document }) => document?.mediaType !== 'video',
    }),
    defineField({
      name: 'videoDuration',
      title: 'Video Duration',
      type: 'string',
      description: 'Display format, e.g. "06:45". Shown as metadata below the title for video items.',
      placeholder: '06:45',
      hidden: ({ document }) => document?.mediaType !== 'video',
    }),
    defineField({
      name: 'readTime',
      title: 'Read Time',
      type: 'string',
      description: 'Display format, e.g. "4 min read". Shown for image/editorial items.',
      placeholder: '4 min read',
      hidden: ({ document }) => document?.mediaType !== 'image',
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 2,
      description: 'Short 2-line excerpt for the gallery grid listing.',
      validation: (Rule) => Rule.required().max(300),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      description: 'Longer editorial description shown in the gallery item action row and on the detail page.',
    }),
    defineField({
      name: 'socialBacklinks',
      title: 'Social Media Backlinks',
      type: 'array',
      description: 'Links to the original social media posts for this vlog.',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'platform',
              title: 'Platform',
              type: 'string',
              options: {
                list: [
                  { title: 'Instagram', value: 'instagram' },
                  { title: 'Facebook', value: 'facebook' },
                  { title: 'YouTube', value: 'youtube' },
                  { title: 'TikTok', value: 'tiktok' },
                  { title: 'X / Twitter', value: 'twitter' },
                ],
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'Post URL',
              type: 'url',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { title: 'platform', subtitle: 'url' },
          },
        },
      ],
    }),
    defineField({
      name: 'content',
      title: 'Full Content',
      type: 'array',
      description: 'Full portable text article body. Only rendered on the /articles/vlogs/[slug] detail page.',
      of: [
        { type: 'block' },
        { type: 'image' },
        { type: 'videoEmbed' },
        { type: 'videoFile' },
        { type: 'videoSource' },
      ],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      description: 'Used for display and chronological sorting.',
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'priority',
      title: 'Display Priority',
      type: 'number',
      description: 'Higher value = shown first in gallery. Tie-break: newer publishedAt wins.',
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      category: 'category.title',
      media: 'thumbnail',
      mediaType: 'mediaType',
    },
    prepare({ title, category, media, mediaType }) {
      return {
        title,
        subtitle: `${mediaType === 'video' ? '🎬' : '📖'} ${category ?? 'Uncategorized'}`,
        media,
      }
    },
  },
})
