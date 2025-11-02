/**
 * Get All Devices Query DTO
 *
 * Defines the query parameters for getting all devices (admin only).
 * Supports search, filtering, sorting, and pagination.
 */

import { z } from 'zod';

/**
 * Filter options enum
 */
export const deviceFilterByEnum = z.enum(['deviceStatus', 'lastSync']);

/**
 * Sort order enum
 */
export const deviceSortOrderEnum = z.enum(['asc', 'desc']);

/**
 * Get all devices query schema
 */
export const getAllDevicesQuerySchema = z.object({
  search: z.string().optional(),
  filterBy: deviceFilterByEnum.optional(),
  sortOrder: deviceSortOrderEnum.optional().default('desc'),
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1)),
  limit: z
    .string()
    .optional()
    .default('10')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(100)),
});

/**
 * Type inference from schema
 */
export type GetAllDevicesQueryDTO = z.infer<typeof getAllDevicesQuerySchema>;
