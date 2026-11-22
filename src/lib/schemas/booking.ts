import { z } from './zod';

const selectedAddOnSchema = z.object({
  id: z.string().trim().min(1).max(100),
  title: z.string().trim().min(1).max(200),
});

export const bookingFormDataSchema = z.object({
  serviceId: z.string().trim().min(1, 'Service ID is required').max(120),
  serviceSlug: z.string().trim().min(1, 'Service slug is required').max(150),
  serviceTitle: z.string().trim().min(1, 'Service title is required').max(200),
  categorySlug: z.string().trim().min(1, 'Category slug is required').max(120),
  categoryTitle: z.string().trim().min(1, 'Category title is required').max(150),
  selectedAddOns: z.array(selectedAddOnSchema).max(30).default([]),
  clientFullName: z.string().trim().min(2, 'Full name is required').max(120),
  clientEmail: z.string().trim().email('Please enter a valid email address').max(150),
  clientPhone: z.string().trim().max(30).optional().default(''),
  companyName: z.string().trim().max(150).optional(),
  eventType: z.string().trim().max(120).optional(),
  eventTitle: z.string().trim().max(150).optional(),
  eventCountry: z.string().trim().min(2).max(10).default('PH'),
  eventCountryName: z.string().trim().max(100).optional(),
  eventDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Event date must be in YYYY-MM-DD format'),
  isHolidayDate: z.boolean().optional().default(false),
  holidayName: z.string().trim().max(150).optional(),
  venueCity: z.string().trim().min(1, 'Venue city is required').max(150),
  venueAddress: z.string().trim().max(300).optional(),
  specialNotes: z.string().trim().max(2500).optional(),
  paymentProvider: z.enum(['dragonpay', 'paypal']).optional().default('dragonpay'),
  termsAccepted: z.boolean().optional().default(true),
});

export const bookingApiRequestSchema = z.object({
  action: z.enum(['send_preview_email', 'confirm_booking']),
  formData: bookingFormDataSchema,
  verifiedEmail: z.string().trim().email('Valid email is required').max(150).optional(),
  verificationToken: z.string().trim().max(500).optional(),
  recaptchaToken: z.string().optional(),
});

export type ValidatedBookingApiRequest = z.infer<typeof bookingApiRequestSchema>;
