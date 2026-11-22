import { defineField, defineType } from 'sanity'

export const ABOUT_ICON_OPTIONS = [
  { title: 'Heart (Love / Care)', value: 'Heart' },
  { title: 'Sparkles (Creativity)', value: 'Sparkles' },
  { title: 'Award (Excellence)', value: 'Award' },
  { title: 'Shield Check (Integrity)', value: 'ShieldCheck' },
  { title: 'Flame (Resilience)', value: 'Flame' },
  { title: 'Users (Collaboration)', value: 'Users' },
  { title: 'Clock (Experience)', value: 'Clock3' },
  { title: 'Layers (Complete Solutions)', value: 'Layers3' },
  { title: 'Lightbulb (Customized Concepts)', value: 'Lightbulb' },
  { title: 'Video (Production Team)', value: 'Video' },
  { title: 'Map Pin (Nationwide Capability)', value: 'MapPin' },
  { title: 'Handshake (Partnership / Care)', value: 'Handshake' },
  { title: 'Target (Mission)', value: 'Target' },
  { title: 'Eye (Vision)', value: 'Eye' },
  { title: 'Star (Highlight)', value: 'Star' },
  { title: 'Compass (Direction)', value: 'Compass' },
  { title: 'Check Circle (Dependability)', value: 'CheckCircle2' },
  { title: 'Gem (Craftsmanship)', value: 'Gem' },
]

/**
 * Reusable Object Schema for About Us Icon Cards (`_type: 'aboutCardItem'`).
 * Shared across `aboutMissionVision`, `aboutCoreValues`, and `aboutWhyChoose`.
 */
export const aboutCardItem = defineType({
  name: 'aboutCardItem',
  title: 'About Card Item',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Card Title',
      type: 'string',
      description: 'Short headline displayed inside the card.',
      validation: (Rule) => Rule.required().min(2).max(100),
    }),
    defineField({
      name: 'description',
      title: 'Card Description',
      type: 'text',
      rows: 3,
      description: 'Concise supporting description for this item.',
      validation: (Rule) => Rule.required().min(10).max(500),
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'string',
      description: 'Lucide icon displayed in the card badge.',
      options: {
        list: ABOUT_ICON_OPTIONS,
        layout: 'dropdown',
      },
      initialValue: 'Sparkles',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'description',
    },
    prepare({ title, subtitle }) {
      return {
        title: title || 'Untitled Item',
        subtitle: subtitle || '',
      }
    },
  },
})
