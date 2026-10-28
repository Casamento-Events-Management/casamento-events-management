import { defineArrayMember, defineField, defineType } from 'sanity'

/**
 * Singleton Document Schema for the Client Section (`_type: 'clientSection'`).
 * Matches `ClientSectionContent` interface in `src/types/home.ts`.
 *
 * Previously the `partners` array lived inside `homeHero`. This standalone
 * singleton separates content responsibility so editors can manage the
 * "Clients & Brands Served" section independently — including its own
 * section eyebrow, title, and description.
 */
export const clientSection = defineType({
  name: 'clientSection',
  title: 'Client Section',
  type: 'document',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Section Eyebrow',
      type: 'string',
      description: 'Small tagline displayed above the section title (e.g. "Trusted By").',
      initialValue: 'Trusted By',
    }),
    defineField({
      name: 'title',
      title: 'Section Title',
      type: 'string',
      description: 'Main heading for the Clients & Brands Served section.',
      initialValue: "Brands & Organizations We\u2019ve Served",
    }),
    defineField({
      name: 'description',
      title: 'Section Description',
      type: 'text',
      rows: 3,
      description: 'Introductory paragraph beneath the section heading.',
      initialValue:
        'Proud to have orchestrated milestone celebrations, brand activations, and turnkey corporate productions for distinguished companies and organizations across the Philippines.',
    }),
    defineField({
      name: 'partners',
      title: 'Clients & Brands Served',
      type: 'array',
      of: [defineArrayMember({ type: 'partner' })],
      description: 'Logos of corporate clients, brands, and organizations we have served.',
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Client Section',
        subtitle: 'Singleton — Clients & Brands Served section',
      }
    },
  },
})
