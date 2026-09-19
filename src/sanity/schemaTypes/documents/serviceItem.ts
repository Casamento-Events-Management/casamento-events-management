import { defineArrayMember, defineField, defineType } from 'sanity'

/**
 * Document Schema for Service Items (`_type: 'serviceItem'`).
 * Matches `SanityServiceItem` interface in `src/types/service.ts`.
 *
 * Defines complete metadata for each event service offered by Casamento Events,
 * including pricing rates, image carousels, default inclusions, add-ons, and booking redirect configurations.
 */
export const serviceItem = defineType({
  name: 'serviceItem',
  title: 'Service Item',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Service Title',
      type: 'string',
      description: 'The main display title of the service package (e.g., "Bespoke Full Wedding Planning & Styling").',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'Unique URL slug used for selection identification and deep-linking.',
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
      to: [{ type: 'serviceCategory' }],
      description: 'The primary service category this item belongs to.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'serviceType',
      title: 'Service Type / Tagline',
      type: 'string',
      description: 'Subtitle tier indicator (e.g. "Full Planning & Execution", "On-the-Day Management", "Broadcast Stream").',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Summary Description',
      type: 'text',
      rows: 3,
      description: 'Concise summary displayed on the 50% vertical service card.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'fullDescription',
      title: 'Full Scope Description',
      type: 'text',
      rows: 6,
      description: 'Comprehensive breakdown displayed inside the 35% appearing detail preview panel when selected.',
    }),
    defineField({
      name: 'images',
      title: 'Service Images (Carousel)',
      type: 'array',
      of: [defineArrayMember({ type: 'sanityImageWithPriority' })],
      description: 'Photo gallery rendered as an interactive image carousel inside the vertical service card and detail panel.',
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'startingPrice',
      title: 'Starting Price Rate (PHP)',
      type: 'number',
      description: 'Numeric value used for calculation and starting price display.',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'priceFormatted',
      title: 'Formatted Price Label (Optional)',
      type: 'string',
      description: 'Custom formatted string override (e.g., "₱150,000" or "Starting at ₱150,000"). If empty, startingPrice is automatically formatted with PHP currency.',
    }),
    defineField({
      name: 'priceUnit',
      title: 'Price Unit / Modifier',
      type: 'string',
      description: 'Price rate interval (e.g., "starting rate", "/ event", "flat package rate").',
      initialValue: 'starting rate',
    }),
    defineField({
      name: 'defaultInclusions',
      title: 'Default Package Inclusions',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      description: 'Bullet points detailing key deliverables packaged by default with this service.',
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'addOns',
      title: 'Available Add-Ons & Upgrades',
      type: 'array',
      of: [defineArrayMember({ type: 'serviceAddOn' })],
      description: 'Optional add-ons available for clients to customize this service package.',
    }),
    defineField({
      name: 'badge',
      title: 'Badge Tag',
      type: 'string',
      description: 'Highlight tag displayed on the card (e.g. "Most Popular", "Signature Service", "Limited Slot").',
    }),
    defineField({
      name: 'isFeatured',
      title: 'Featured Service',
      type: 'boolean',
      description: 'Highlight this service with primary prominence.',
      initialValue: false,
    }),
    defineField({
      name: 'bookingSlug',
      title: 'Custom Booking Slug Override',
      type: 'string',
      description: 'Optional target query parameter passed when redirecting to /book-now. Defaults to this item slug.',
    }),
    defineField({
      name: 'priority',
      title: 'Display Priority Order',
      type: 'number',
      description: 'Higher numbers appear first in the 50% service cards column (e.g., 50, 40, 30).',
      initialValue: 0,
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      category: 'category.title',
      startingPrice: 'startingPrice',
      media: 'images.0',
      badge: 'badge',
    },
    prepare({ title, category, startingPrice, media, badge }) {
      const formattedPrice = typeof startingPrice === 'number' ? `₱${startingPrice.toLocaleString()}` : 'Price on request'
      return {
        title: `${badge ? `[${badge}] ` : ''}${title}`,
        subtitle: `${category || 'Uncategorized'} • ${formattedPrice}`,
        media,
      }
    },
  },
})
