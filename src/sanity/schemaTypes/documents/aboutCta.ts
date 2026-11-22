import { defineField, defineType } from 'sanity'

/**
 * Singleton Document Schema for the About Us Call-to-Action Section (`_type: 'aboutCta'`).
 * Matches `AboutCtaContent` in `src/types/about.ts`.
 */
export const aboutCta = defineType({
  name: 'aboutCta',
  title: 'About Us — Call to Action',
  type: 'document',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Section Eyebrow',
      type: 'string',
      description: 'Small uppercase tagline displayed above the CTA heading.',
      initialValue: 'Begin Your Journey',
      validation: (Rule) => Rule.max(80),
    }),
    defineField({
      name: 'title',
      title: 'CTA Title',
      type: 'string',
      description: 'Primary call-to-action heading.',
      validation: (Rule) => Rule.required().min(5).max(140),
    }),
    defineField({
      name: 'description',
      title: 'CTA Description',
      type: 'text',
      rows: 3,
      description: 'Supporting invitation copy beneath the heading.',
      validation: (Rule) => Rule.required().min(15).max(400),
    }),
    defineField({
      name: 'secondaryCtaText',
      title: 'Secondary Button Label',
      type: 'string',
      description: 'Label for the outline button (e.g. "Explore Services").',
      initialValue: 'Explore Services',
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: 'secondaryCtaLink',
      title: 'Secondary Button Link',
      type: 'string',
      description: 'Relative path, anchor, or full URL for the outline button (e.g. "/services").',
      initialValue: '/services',
      validation: (Rule) => Rule.max(200),
    }),
    defineField({
      name: 'primaryCtaText',
      title: 'Primary Button Label',
      type: 'string',
      description: 'Label for the primary button (e.g. "Get in Touch").',
      initialValue: 'Get in Touch',
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: 'primaryCtaLink',
      title: 'Primary Button Link',
      type: 'string',
      description: 'Relative path, anchor, or full URL for the primary button (e.g. "#contact-form").',
      initialValue: '#contact-form',
      validation: (Rule) => Rule.max(200),
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({ title }) {
      return {
        title: title ?? 'About Us — Call to Action',
        subtitle: 'Singleton — About Us CTA section',
      }
    },
  },
})
