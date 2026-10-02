import { z } from 'zod';

export const serviceInquirySchema = z.object({
  clientName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters'),
  clientEmail: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  clientPhone: z
    .string()
    .max(30, 'Contact number cannot exceed 30 characters')
    .optional(),
  clientAddress: z
    .string()
    .max(200, 'Address cannot exceed 200 characters')
    .optional(),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(3000, 'Message cannot exceed 3000 characters'),

  // Service specs attached to payload
  serviceId: z.string().min(1, 'Service ID is required'),
  serviceTitle: z.string().min(1, 'Service Title is required'),
  serviceSlug: z.string().min(1, 'Service Slug is required'),
  categoryTitle: z.string().min(1, 'Category Title is required'),
  serviceType: z.string().optional(),
  shortDescription: z.string().optional(),
  defaultInclusions: z.array(z.string()).optional(),
  availableAddOns: z.array(z.string()).optional(),

  recaptchaToken: z.string().optional(),
});

export type ServiceInquiryFormData = z.infer<typeof serviceInquirySchema>;
