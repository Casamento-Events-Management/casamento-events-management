import { defineArrayMember, defineField, defineType } from 'sanity'

/**
 * Object schema matching `HeroSection` in `src/types/home.ts`
 * Service Carousel configuration and slides.
 */
export const heroSection = defineType({
  name: 'heroSection',
  title: 'Hero / Service Carousel Section',
  type: 'object',
  fields: [
    defineField({
      name: 'autoPlayInterval',
      title: 'Auto-Play Rotation Speed (Seconds)',
      type: 'number',
      description: 'Time in seconds between automatic slide transitions (default: 3 seconds).',
      initialValue: 3,
      validation: (Rule) => Rule.min(1).max(30),
    }),
    defineField({
      name: 'slides',
      title: 'Carousel Slides',
      type: 'array',
      of: [defineArrayMember({ type: 'heroSlide' })],
      description: 'Ordered list of service highlight slides featured in the hero carousel.',
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
})

