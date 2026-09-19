import { defineField, defineType } from 'sanity'

/**
 * Object schema matching `HeroSection` in `src/types/home.ts`
 * Note: CTA buttons are hardcoded on the frontend per optimization spec.
 */
export const heroSection = defineType({
  name: 'heroSection',
  title: 'Hero / Landing Section',
  type: 'object',
  fields: [
    defineField({
      name: 'brandline',
      title: 'Brand Headline / Copy',
      type: 'text',
      rows: 2,
      description: 'Primary brand line displayed over the hero showreel.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'showreelVideo',
      title: 'Desktop Showreel Video',
      type: 'videoSource',
      description: 'Full-screen background showreel (click-to-play).',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'showreelMobileVideo',
      title: 'Mobile Showreel Video (9:16 Portrait)',
      type: 'videoSource',
      description: 'Optional vertical showreel version for mobile viewports.',
    }),
    defineField({
      name: 'showreelThumbnail',
      title: 'Hero Poster / Thumbnail Image',
      type: 'sanityImageWithPriority',
      description: 'High quality LCP candidate poster image displayed before playback.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'backgroundMusic',
      title: 'Background Music Track',
      type: 'file',
      options: {
        accept: 'audio/mp3,audio/aac,audio/wav,audio/*',
      },
      description: 'Optional audio-only background track.',
    }),
  ],
})
