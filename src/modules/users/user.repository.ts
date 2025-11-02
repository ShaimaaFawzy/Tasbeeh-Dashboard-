/**
 * User Repository
 *
 * Handles all database operations related to users.
 */

import { prisma } from '../../database/prisma.client.js';
import { User, UserDetails } from '@prisma/client';

/**
 * User with details type
 */
export type UserWithDetails = User & {
  userDetails: UserDetails | null;
  devices: Array<{
    id: string;
    deviceId: string;
    deviceStatus: boolean;
    lastSync: Date;
  }>;
};

/**
 * Filters for querying users
 */
export interface UserFilters {
  search?: string;
  filterBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  skip: number;
  take: number;
}

export class UserRepository {
  /**
   * Find a user by ID with optional details
   *
   * @param userId - User ID
   * @param includeDetails - Whether to include user details
   * @returns User with optional details
   */
  async findById(
    userId: string,
    includeDetails: boolean = false
  ): Promise<UserWithDetails | null> {
    return await prisma.user.findUnique({
      where: {
        id: userId,
        isDeleted: false,
      },
      include: {
        userDetails: includeDetails,
        devices: {
          where: { isDeleted: false },
          select: {
            id: true,
            deviceId: true,
            deviceStatus: true,
            lastSync: true,
          }
        },
      },
    });
  }

  /**
   * Find all users with filters and pagination
   *
   * @param filters - Search and filter options
   * @param pagination - Pagination options
   * @returns Array of users with their devices
   */
  async findAllWithFilters(
    filters: UserFilters,
    pagination: PaginationOptions
  ): Promise<Array<User & { devices: Array<{ id: string; deviceId: string; deviceStatus: boolean; lastSync: Date; }>; }>> {
    const { search, filterBy, sortOrder } = filters;
    const { skip, take } = pagination;

    // Build where clause for search
    const where: any = {
      isDeleted: false,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Build orderBy clause
    let orderBy: any = { joinDate: 'desc' };

    if (filterBy === 'joinDate') {
      orderBy = { joinDate: sortOrder || 'desc' };
    } else if (filterBy === 'lastActive') {
      orderBy = { lastActive: sortOrder || 'desc' };
    }
    // Note: deviceStatus is not a direct field on User, so we'll handle it differently

    return await prisma.user.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        devices: {
          where: { isDeleted: false },
          select: {
            id: true,
            deviceId: true,
            deviceStatus: true,
            lastSync: true,
          },
          take: 1,
          orderBy: {
            lastSync: 'desc',
          },
        },
        userDetails: false,
      },
    });
  }

  /**
   * Count all users matching the filters
   *
   * @param filters - Search and filter options
   * @returns Total count of users
   */
  async countAll(filters: UserFilters): Promise<number> {
    const { search } = filters;

    const where: any = {
      isDeleted: false,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    return await prisma.user.count({ where });
  }
}
