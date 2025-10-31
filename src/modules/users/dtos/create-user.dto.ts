import { z } from 'zod';

/**
 * Create User DTO Schema
 *
 * Validation schema for creating a new user.
 */
export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.enum(['ADMIN', 'USER']).optional(),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
