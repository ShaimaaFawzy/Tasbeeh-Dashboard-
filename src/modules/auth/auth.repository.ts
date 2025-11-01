import { prisma } from '../../database/prisma.client.js';
import { User, Prisma } from '@prisma/client';

/**
 * Auth Repository
 *
 * Handles all database operations related to authentication.
 * Follows the repository pattern to separate data access logic from business logic.
 */

export class AuthRepository {
  /**
   * Find a user by email address
   *
   * @param email - The email address to search for
   * @returns User object if found, null otherwise
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        isDeleted: false,
      },
    });
  }

  /**
   * Find a user by mobile number
   *
   * @param mobile - The mobile number to search for
   * @returns User object if found, null otherwise
   */
  async findByMobile(mobile: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        mobile,
        isDeleted: false,
      },
    });
  }

  /**
   * Find a user by username
   *
   * @param userName - The username to search for
   * @returns User object if found, null otherwise
   */
  async findByUsername(userName: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        userName: userName.toLowerCase(),
        isDeleted: false,
      },
    });
  }

  /**
   * Find a user by email OR username
   * Used for login where identifier can be either email or username
   *
   * @param identifier - The email or username to search for
   * @returns User object if found, null otherwise
   */
  async findByEmailOrUsername(identifier: string): Promise<User | null> {
    const normalizedIdentifier = identifier.toLowerCase();

    return prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedIdentifier },
          { userName: normalizedIdentifier },
        ],
        isDeleted: false,
      },
    });
  }

  /**
   * Create a new user in the database
   *
   * @param userData - The user data to create
   * @returns The created user object
   */
  async create(userData: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({
      data: userData,
    });
  }

  /**
   * Find a user by ID
   *
   * @param id - The user ID to search for
   * @returns User object if found, null otherwise
   */
  async findById(id: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });
  }
}
