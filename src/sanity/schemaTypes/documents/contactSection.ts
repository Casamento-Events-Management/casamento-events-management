import { defineArrayMember, defineField, defineType } from 'sanity'

/**
 * Singleton Document Schema for the Contact Section & Social Links (`_type: 'contactSection'`).
 * Matches `ContactSectionContent` interface in `src/types/contact.ts`.
 */
export const contactSection = defineType({
  name: 'contactSection',
  title: 'Contact Section',
  type: 'document',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Contact Section Eyebrow',
      type: 'string',
      description: 'Tagline displayed above the Contact Section title (e.g. "Join Our Journey").',
      initialValue: 'Join Our Journey',
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: 'title',
      title: 'Contact Section Title',
      type: 'string',
      description: 'Main heading for the Connect & Contact Us section (e.g. "Connect With Us").',
      initialValue: 'Connect With Us',
      validation: (Rule) => Rule.required().min(3).max(120),
    }),
    defineField({
      name: 'description',
      title: 'Contact Section Description',
      type: 'text',
      rows: 3,
      description: 'Introductory copy beneath the section title.',
      initialValue: 'Follow our latest event highlights, behind-the-scenes stories, and creative inspirations across our official channels.',
      validation: (Rule) => Rule.required().min(10).max(400),
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'array',
      of: [defineArrayMember({ type: 'socialLink' })],
      description: 'Social media profile links displayed in the connect section and site footer.',
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Contact Section & Social Links',
        subtitle: 'Singleton — Contact Section Hero copy and official social links',
      }
    },
  },
})
