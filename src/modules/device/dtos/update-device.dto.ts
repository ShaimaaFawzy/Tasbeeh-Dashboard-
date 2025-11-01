import { z } from 'zod';

/**
 * Update Device DTO Schema
 *
 * Defines the validation schema for updating an existing device.
 * All fields are optional since partial updates are allowed.
 */

/**
 * Zod schema for device update
 */
export const updateDeviceSchema = z.object({
  deviceId: z
    .string()
    .min(1, 'Device ID cannot be empty')
    .max(50, 'Device ID must not exceed 50 characters')
    .trim()
    .optional(),

  deviceStatus: z
    .boolean({
      message: 'Device status must be a boolean',
    })
    .optional(),

  usageCount: z
    .number({
      message: 'Usage count must be a number',
    })
    .int('Usage count must be an integer')
    .min(0, 'Usage count cannot be negative')
    .optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  {
    message: 'At least one field must be provided for update',
  }
);

/**
 * Type inference from the Zod schema
 */
export type UpdateDeviceDTO = z.infer<typeof updateDeviceSchema>;
