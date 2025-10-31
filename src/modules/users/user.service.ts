import { User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { UserRepository } from './user.repository.js';
import { CreateUserDto } from './dtos/create-user.dto.js';
import { UpdateUserDto } from './dtos/update-user.dto.js';
import { NotFoundError, ConflictError } from '../../shared/errors/http-errors.js';
import { ErrorCode } from '../../shared/errors/error-codes.js';
import { omit } from '../../shared/utils/helpers.js';

/**
 * User Service
 *
 * Contains business logic for user-related operations.
 * Uses UserRepository for database access.
 */
export class UserService {
  private userRepository: UserRepository;

  /**
   * Creates a new UserService instance
   *
   * @param userRepository - Repository for user data access
   */
  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Get all users
   *
   * @returns Array of users (without password field)
   */
  async getAllUsers(): Promise<Omit<User, 'password'>[]> {
    const users = await this.userRepository.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => omit(user, ['password']));
  }

  /**
   * Get a user by ID
   *
   * @param id - User ID
   * @returns User without password field
   * @throws NotFoundError if user not found
   */
  async getUserById(id: string): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundError('User not found', ErrorCode.USER_NOT_FOUND);
    }

    return omit(user, ['password']);
  }

  /**
   * Create a new user
   *
   * @param dto - User creation data
   * @returns Created user without password field
   * @throws ConflictError if email already exists
   */
  async createUser(dto: CreateUserDto): Promise<Omit<User, 'password'>> {
    // Check if user with email already exists
    const existingUser = await this.userRepository.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictError(
        'User with this email already exists',
        ErrorCode.USER_ALREADY_EXISTS
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    // Create user
    const user = await this.userRepository.create({
      email: dto.email,
      password: hashedPassword,
      role: dto.role || 'USER',
    });

    return omit(user, ['password']);
  }

  /**
   * Update a user
   *
   * @param id - User ID
   * @param dto - User update data
   * @returns Updated user without password field
   * @throws NotFoundError if user not found
   * @throws ConflictError if email already taken by another user
   */
  async updateUser(id: string, dto: UpdateUserDto): Promise<Omit<User, 'password'>> {
    // Check if user exists
    const existingUser = await this.userRepository.findById(id);

    if (!existingUser) {
      throw new NotFoundError('User not found', ErrorCode.USER_NOT_FOUND);
    }

    // If email is being updated, check if it's already taken
    if (dto.email && dto.email !== existingUser.email) {
      const userWithEmail = await this.userRepository.findByEmail(dto.email);

      if (userWithEmail) {
        throw new ConflictError(
          'Email already taken',
          ErrorCode.USER_ALREADY_EXISTS
        );
      }
    }

    // Hash password if being updated
    const updateData: any = { ...dto };
    if (dto.password) {
      updateData.password = await bcrypt.hash(dto.password, 12);
    }

    // Update user
    const user = await this.userRepository.update(id, updateData);

    return omit(user, ['password']);
  }

  /**
   * Delete a user
   *
   * @param id - User ID
   * @throws NotFoundError if user not found
   */
  async deleteUser(id: string): Promise<void> {
    // Check if user exists
    const exists = await this.userRepository.exists(id);

    if (!exists) {
      throw new NotFoundError('User not found', ErrorCode.USER_NOT_FOUND);
    }

    await this.userRepository.delete(id);
  }
}
