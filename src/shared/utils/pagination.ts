/**
 * Pagination Utility
 *
 * Provides reusable pagination helpers for consistent pagination across the application.
 */

/**
 * Pagination metadata interface
 */
export interface PaginationMetadata {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Pagination options interface
 */
export interface PaginationOptions {
  page: number;
  limit: number;
}

/**
 * Pagination result interface
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMetadata;
}

/**
 * Calculate pagination metadata
 *
 * @param totalItems - Total number of items in the database
 * @param page - Current page number
 * @param limit - Number of items per page
 * @returns Pagination metadata object
 *
 * @example
 * const metadata = calculatePaginationMetadata(100, 2, 10);
 * // Returns: { page: 2, limit: 10, totalItems: 100, totalPages: 10, hasNextPage: true, hasPreviousPage: true }
 */
export const calculatePaginationMetadata = (
  totalItems: number,
  page: number,
  limit: number
): PaginationMetadata => {
  const totalPages = Math.ceil(totalItems / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage,
    hasPreviousPage,
  };
};

/**
 * Calculate skip value for database queries
 *
 * @param page - Current page number (1-indexed)
 * @param limit - Number of items per page
 * @returns Number of items to skip
 *
 * @example
 * const skip = calculateSkip(2, 10); // Returns 10
 */
export const calculateSkip = (page: number, limit: number): number => {
  return (page - 1) * limit;
};

/**
 * Create a paginated result
 *
 * @param data - Array of data items
 * @param totalItems - Total number of items in database
 * @param page - Current page number
 * @param limit - Number of items per page
 * @returns Paginated result with data and metadata
 *
 * @example
 * const result = createPaginatedResult(users, 100, 2, 10);
 */
export const createPaginatedResult = <T>(
  data: T[],
  totalItems: number,
  page: number,
  limit: number
): PaginatedResult<T> => {
  const pagination = calculatePaginationMetadata(totalItems, page, limit);

  return {
    data,
    pagination,
  };
};
