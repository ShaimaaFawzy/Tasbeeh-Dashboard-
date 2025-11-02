/**
 * Get All Users Response DTO
 *
 * Defines the response structure for getting all users.
 */

import { z } from 'zod';

/**
 * Single user item schema in the list
 */
export const userItemSchema = z.object({
  name: z.string(),
  email: z.string(),
  joinDate: z.string().or(z.date()),
  deviceId: z.string().nullable(),
  deviceStatus: z.string().nullable(),
  lastActive: z.string().or(z.date()).nullable(),
});

/**
 * Type inference for user item
 */
export type UserItemDTO = z.infer<typeof userItemSchema>;
