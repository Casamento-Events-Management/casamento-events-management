import { defineField, defineType } from 'sanity'

/**
 * Object Schema for Service Add-Ons (`_type: 'serviceAddOn'`).
 * Matches `SanityServiceAddOn` interface in `src/types/service.ts`.
 *
 * Represents optional upgrades or supplemental features attached to a Service Item.
 */
export const serviceAddOn = defineType({
  name: 'serviceAddOn',
  title: 'Service Add-On',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Add-On Title',
      type: 'string',
      description: 'Name of the add-on feature (e.g. "Same-Day-Edit (SDE) Video", "LED Wall 10x14ft Setup").',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
      description: 'Explanation of deliverables or scope included with this add-on.',
    }),
    defineField({
      name: 'price',
      title: 'Price Rate (PHP)',
      type: 'number',
      description: 'Numeric price amount in PHP for quote estimations.',
    }),
    defineField({
      name: 'priceUnit',
      title: 'Price Unit / Label',
      type: 'string',
      description: 'Pricing note (e.g. "flat fee", "per day", "starting rate").',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      price: 'price',
      priceUnit: 'priceUnit',
    },
    prepare({ title, price, priceUnit }) {
      const formattedPrice = typeof price === 'number' ? `₱${price.toLocaleString()}` : 'Price on request'
      return {
        title,
        subtitle: `${formattedPrice}${priceUnit ? ` (${priceUnit})` : ''}`,
      }
    },
  },
})
