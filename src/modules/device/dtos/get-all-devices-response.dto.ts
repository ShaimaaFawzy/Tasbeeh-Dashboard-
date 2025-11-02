/**
 * Get All Devices Response DTO
 *
 * Defines the response structure for getting all devices.
 */

import { z } from 'zod';

/**
 * Single device item schema in the list
 */
export const deviceItemSchema = z.object({
  deviceId: z.string(),
  linkedUser: z.string(),
  pairingDate: z.string().or(z.date()),
  lastSync: z.string().or(z.date()),
  usageCount: z.number(),
});

/**
 * Type inference for device item
 */
export type DeviceItemDTO = z.infer<typeof deviceItemSchema>;
