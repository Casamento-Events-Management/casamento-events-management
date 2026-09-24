import { z } from 'zod';

export const feedbackFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
  email: z
    .string()
    .trim()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  phone: z
    .string()
    .trim()
    .max(20, 'Phone number is too long')
    .optional()
    .or(z.literal('')),
  eventType: z
    .string()
    .trim()
    .min(1, 'Event type is required')
    .max(100, 'Event type is too long'),
  rating: z
    .number()
    .int()
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5'),
  message: z
    .string()
    .trim()
    .min(10, 'Feedback message must be at least 10 characters')
    .max(2000, 'Feedback message cannot exceed 2000 characters'),
  recaptchaToken: z.string().optional(),
});

export type FeedbackFormData = z.infer<typeof feedbackFormSchema>;
