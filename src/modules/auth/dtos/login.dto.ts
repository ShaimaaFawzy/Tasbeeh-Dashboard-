import { z } from 'zod';

/**
 * Login DTO Schema
 *
 * Validation schema for user login.
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginDto = z.infer<typeof loginSchema>;
