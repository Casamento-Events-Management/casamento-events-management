import { z } from 'zod';

export const inviteStaffSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address')
    .max(100, 'Email address is too long'),
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name is too long'),
  role: z.enum(['admin', 'super_admin', 'staff'], {
    message: 'Please select a valid role',
  }),
});

export type InviteStaffInput = z.infer<typeof inviteStaffSchema>;

export const toggleStaffStatusSchema = z.object({
  userId: z.string().uuid('Invalid user identifier'),
  isActive: z.boolean(),
});

export type ToggleStaffStatusInput = z.infer<typeof toggleStaffStatusSchema>;

export const updateStaffRoleSchema = z.object({
  userId: z.string().uuid('Invalid user identifier'),
  role: z.enum(['admin', 'super_admin', 'staff'], {
    message: 'Please select a valid role',
  }),
});

export type UpdateStaffRoleInput = z.infer<typeof updateStaffRoleSchema>;

export const updateSelfProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name is too long'),
  phone: z
    .string()
    .max(25, 'Phone number is too long')
    .optional()
    .nullable(),
});

export type UpdateSelfProfileInput = z.infer<typeof updateSelfProfileSchema>;
