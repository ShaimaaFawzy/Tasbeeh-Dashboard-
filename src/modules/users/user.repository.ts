import { User, Prisma } from '@prisma/client';
import { prisma } from '../../database/prisma.client.js';

/**
 * User Repository
 *
 * Handles all database operations related to users.
 * Provides a clean abstraction over Prisma for user data access.
 */
export class UserRepository {
  /**
   * Find a user by ID
   *
   * @param id - User ID
   * @returns User or null if not found
   */
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Find a user by email
   *
   * @param email - User email
   * @returns User or null if not found
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find all users with optional filtering
   *
   * @param options - Prisma query options
   * @returns Array of users
   */
  async findMany(options?: Prisma.UserFindManyArgs): Promise<User[]> {
    return prisma.user.findMany(options);
  }

  /**
   * Create a new user
   *
   * @param data - User creation data
   * @returns Created user
   */
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  /**
   * Update a user
   *
   * @param id - User ID
   * @param data - User update data
   * @returns Updated user
   */
  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a user
   *
   * @param id - User ID
   * @returns Deleted user
   */
  async delete(id: string): Promise<User> {
    return prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Count users with optional filtering
   *
   * @param options - Prisma count options
   * @returns Number of users
   */
  async count(options?: Prisma.UserCountArgs): Promise<number> {
    return prisma.user.count(options);
  }

  /**
   * Check if user exists by ID
   *
   * @param id - User ID
   * @returns True if user exists
   */
  async exists(id: string): Promise<boolean> {
    const count = await prisma.user.count({
      where: { id },
    });
    return count > 0;
  }
}
