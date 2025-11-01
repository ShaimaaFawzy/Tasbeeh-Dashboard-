import { z } from 'zod';
import { UserType } from '@prisma/client';

/**
 * Registration DTO Schema
 *
 * Defines the validation schema for user registration requests.
 * All fields are validated for proper format and constraints.
 */

/**
 * Password validation regex
 * Must contain at least one uppercase letter, one lowercase letter, and one number
 */
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

/**
 * Mobile number validation regex
 * Accepts international format with optional + and country code
 */
const mobileRegex = /^\+?[1-9]\d{1,14}$/;

/**
 * Username validation regex
 * Alphanumeric characters only (letters and numbers)
 */
const usernameRegex = /^[a-zA-Z0-9]+$/;

/**
 * Zod schema for user registration
 */
export const registerSchema = z.object({
  name: z
    .string({
      message: 'Name is required',
    })
    .min(2, 'Name must be at least 2 characters long')
    .max(200, 'Name must not exceed 200 characters')
    .trim(),

  userName: z
    .string({
      message: 'Username is required',
    })
    .min(3, 'Username must be at least 3 characters long')
    .max(200, 'Username must not exceed 200 characters')
    .regex(usernameRegex, 'Username must contain only alphanumeric characters')
    .trim()
    .toLowerCase(),

  email: z
    .string({
      message: 'Email is required',
    })
    .email('Invalid email format')
    .max(250, 'Email must not exceed 250 characters')
    .trim()
    .toLowerCase(),

  mobile: z
    .string({
      message: 'Mobile number is required',
    })
    .regex(mobileRegex, 'Invalid mobile number format. Use international format (e.g., +1234567890)')
    .max(20, 'Mobile number must not exceed 20 characters')
    .trim(),

  password: z
    .string({
      message: 'Password is required',
    })
    .min(8, 'Password must be at least 8 characters long')
    .regex(
      passwordRegex,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),

  country: z
    .string({
      message: 'Country is required',
    })
    .min(2, 'Country must be at least 2 characters long')
    .max(50, 'Country must not exceed 50 characters')
    .trim(),

  city: z
    .string({
      message: 'City is required',
    })
    .min(2, 'City must be at least 2 characters long')
    .max(50, 'City must not exceed 50 characters')
    .trim(),

  userType: z
    .nativeEnum(UserType, {
      message: 'Invalid user type. Must be either "Admin" or "Normal"',
    })
    .default(UserType.Normal),
});

/**
 * Type inference from the Zod schema
 */
export type RegisterDTO = z.infer<typeof registerSchema>;
