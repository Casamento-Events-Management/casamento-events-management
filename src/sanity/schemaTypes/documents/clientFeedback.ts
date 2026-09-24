import { defineField, defineType } from 'sanity';

/**
 * Document Schema for Client Feedback (`_type: 'clientFeedback'`).
 * Stores client testimonials submitted via the website public form.
 *
 * Public client submissions default to status: 'pending'.
 * Only status: 'approved' items are queried and displayed on the public Articles page.
 */
export const clientFeedback = defineType({
  name: 'clientFeedback',
  title: 'Client Feedback',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Client Name',
      type: 'string',
      description: 'Display name of the client (shown publicly).',
      validation: (Rule) => Rule.required().min(2).max(100),
    }),
    defineField({
      name: 'email',
      title: 'Email Address',
      type: 'string',
      description: 'Client contact email (Admin reference & approval email target; NOT displayed publicly).',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'phone',
      title: 'Contact Phone Number',
      type: 'string',
      description: 'Optional client phone number (Admin reference only; NOT displayed publicly).',
    }),
    defineField({
      name: 'eventType',
      title: 'Event Type',
      type: 'string',
      description: 'Type of event e.g. "Wedding", "Debut", "Corporate Event".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'rating',
      title: 'Star Rating',
      type: 'number',
      description: 'Client rating from 1 to 5 stars.',
      options: {
        list: [1, 2, 3, 4, 5],
      },
      initialValue: 5,
      validation: (Rule) => Rule.required().min(1).max(5),
    }),
    defineField({
      name: 'message',
      title: 'Feedback Message',
      type: 'text',
      rows: 4,
      description: 'The testimonial content written by the client (shown publicly).',
      validation: (Rule) => Rule.required().min(10).max(2000),
    }),
    defineField({
      name: 'photo',
      title: 'Client Photo (Admin Upload)',
      type: 'image',
      description: 'Optional photo uploaded by Casamento team. If omitted, public website displays initials avatar.',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative Text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'isFeatured',
      title: 'Featured on Articles Page',
      type: 'boolean',
      description: 'Toggle ON to feature this review in the featured slider on the Articles hub page.',
      initialValue: false,
    }),
    defineField({
      name: 'priority',
      title: 'Display Priority',
      type: 'number',
      description: 'Higher value = shown first in the featured slider and grid. Tie-break: newer submittedAt wins.',
      initialValue: 0,
    }),
    defineField({
      name: 'status',
      title: 'Approval Status',
      type: 'string',
      description: 'Admin review status. Only "Approved" feedbacks appear on the public website.',
      options: {
        list: [
          { title: '⏳ Pending Review', value: 'pending' },
          { title: '✅ Approved & Published', value: 'approved' },
          { title: '❌ Rejected', value: 'rejected' },
        ],
        layout: 'radio',
      },
      initialValue: 'pending',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'submittedAt',
      title: 'Submitted At',
      type: 'datetime',
      description: 'Date and time the feedback was submitted.',
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'adminNote',
      title: 'Admin Internal Note',
      type: 'text',
      rows: 2,
      description: 'Private notes or reason for rejection (Admin only; NOT displayed publicly).',
    }),
  ],
  preview: {
    select: {
      name: 'name',
      eventType: 'eventType',
      rating: 'rating',
      status: 'status',
      media: 'photo',
    },
    prepare({ name, eventType, rating, status, media }) {
      const statusIcon = status === 'approved' ? '✅' : status === 'rejected' ? '❌' : '⏳';
      const stars = '★'.repeat(rating || 5);
      return {
        title: `${statusIcon} ${name} (${stars})`,
        subtitle: `${eventType || 'General'} | Status: ${status}`,
        media,
      };
    },
  },
});
