import { z } from 'zod';

/**
 * Login DTO Schema
 *
 * Defines the validation schema for user login requests.
 * The identifier can be either an email address or username.
 */

/**
 * Zod schema for user login
 */
export const loginSchema = z.object({
  identifier: z
    .string({
      message: 'Email or username is required',
    })
    .min(1, 'Email or username cannot be empty')
    .trim(),

  password: z
    .string({
      message: 'Password is required',
    })
    .min(1, 'Password cannot be empty'),
});

/**
 * Type inference from the Zod schema
 */
export type LoginDTO = z.infer<typeof loginSchema>;
