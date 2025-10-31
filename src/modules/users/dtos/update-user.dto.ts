import { z } from 'zod';

/**
 * Update User DTO Schema
 *
 * Validation schema for updating an existing user.
 * All fields are optional as this is a partial update.
 */
export const updateUserSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .optional(),
  role: z.enum(['ADMIN', 'USER']).optional(),
});

export type UpdateUserDto = z.infer<typeof updateUserSchema>;
