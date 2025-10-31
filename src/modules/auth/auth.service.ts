import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import { UserRepository } from '../users/user.repository.js';
import { RegisterDto } from './dtos/register.dto.js';
import { LoginDto } from './dtos/login.dto.js';
import { UnauthorizedError, ConflictError } from '../../shared/errors/http-errors.js';
import { ErrorCode } from '../../shared/errors/error-codes.js';
import { omit } from '../../shared/utils/helpers.js';
import { env } from '../../config/env.js';

/**
 * Authentication Response
 */
export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

/**
 * Auth Service
 *
 * Contains business logic for authentication operations.
 */
export class AuthService {
  private userRepository: UserRepository;

  /**
   * Creates a new AuthService instance
   *
   * @param userRepository - Repository for user data access
   */
  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Register a new user
   *
   * @param dto - Registration data
   * @returns User and JWT token
   * @throws ConflictError if email already exists
   */
  async register(dto: RegisterDto): Promise<AuthResponse> {
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
      role: 'USER',
    });

    // Generate token
    const token = this.generateToken(user);

    return {
      user: omit(user, ['password']),
      token,
    };
  }

  /**
   * Login a user
   *
   * @param dto - Login credentials
   * @returns User and JWT token
   * @throws UnauthorizedError if credentials are invalid
   */
  async login(dto: LoginDto): Promise<AuthResponse> {
    // Find user by email
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedError('Invalid credentials', ErrorCode.INVALID_CREDENTIALS);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials', ErrorCode.INVALID_CREDENTIALS);
    }

    // Generate token
    const token = this.generateToken(user);

    return {
      user: omit(user, ['password']),
      token,
    };
  }

  /**
   * Verify a JWT token
   *
   * @param token - JWT token to verify
   * @returns Decoded token payload
   * @throws UnauthorizedError if token is invalid or expired
   */
  async verifyToken(token: string): Promise<any> {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Token expired', ErrorCode.TOKEN_EXPIRED);
      }

      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid token', ErrorCode.TOKEN_INVALID);
      }

      throw error;
    }
  }

  /**
   * Generate a JWT token for a user
   *
   * @param user - User to generate token for
   * @returns JWT token
   */
  private generateToken(user: User): string {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });
  }
}
