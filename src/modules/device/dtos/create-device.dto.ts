import { z } from 'zod';

/**
 * Create Device DTO Schema
 *
 * Defines the validation schema for creating a new device.
 */

/**
 * Zod schema for device creation
 */
export const createDeviceSchema = z.object({
  deviceId: z
    .string({
      message: 'Device ID is required',
    })
    .min(1, 'Device ID cannot be empty')
    .max(50, 'Device ID must not exceed 50 characters')
    .trim(),

  deviceStatus: z
    .boolean({
      message: 'Device status is required',
    })
    .default(true),
});

/**
 * Type inference from the Zod schema
 */
export type CreateDeviceDTO = z.infer<typeof createDeviceSchema>;
