/**
 * Get All Users Query DTO
 *
 * Defines the query parameters for getting all users (admin only).
 * Supports search, filtering, sorting, and pagination.
 */

import { z } from 'zod';

/**
 * Filter options enum
 */
export const filterByEnum = z.enum(['joinDate', 'deviceStatus', 'lastActive']);

/**
 * Sort order enum
 */
export const sortOrderEnum = z.enum(['asc', 'desc']);

/**
 * Get all users query schema
 */
export const getAllUsersQuerySchema = z.object({
  search: z.string().optional(),
  filterBy: filterByEnum.optional(),
  sortOrder: sortOrderEnum.optional().default('desc'),
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
export type GetAllUsersQueryDTO = z.infer<typeof getAllUsersQuerySchema>;
