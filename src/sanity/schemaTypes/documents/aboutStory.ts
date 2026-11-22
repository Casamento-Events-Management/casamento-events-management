import { defineArrayMember, defineField, defineType } from 'sanity'

/**
 * Singleton Document Schema for the About Us "Our Story" Section (`_type: 'aboutStory'`).
 * Matches `AboutStoryContent` in `src/types/about.ts`.
 */
export const aboutStory = defineType({
  name: 'aboutStory',
  title: 'About Us — Our Story',
  type: 'document',
  fields: [
    defineField({
      name: 'paragraphs',
      title: 'Story Paragraphs',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'text',
          rows: 4,
        }),
      ],
      description: 'Narrative paragraphs telling the origin and evolution of Casamento Events Management.',
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'closingStatement',
      title: 'Highlighted Closing Statement',
      type: 'text',
      rows: 2,
      description: 'Emphasized closing line shown just above the core mantras.',
      validation: (Rule) => Rule.max(300),
    }),
    defineField({
      name: 'mantras',
      title: 'Core Mantras',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'string',
        }),
      ],
      description: 'Short signature statements displayed in the 3-column highlight grid at the bottom of the story card.',
      validation: (Rule) => Rule.max(6),
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'About Us — Our Story',
        subtitle: 'Singleton — Brand narrative & core mantras',
      }
    },
  },
})
