import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { AuthRepository } from './auth.repository.js';
import { RegisterDTO } from './dtos/register.dto.js';
import { LoginDTO } from './dtos/login.dto.js';
import { ConflictError, UnauthorizedError } from '../../shared/errors/http-errors.js';
import { ErrorCode } from '../../shared/errors/error-codes.js';
import { env } from '../../config/env.js';
import { User, UserType } from '@prisma/client';

/**
 * Auth Service
 *
 * Contains all business logic for authentication operations.
 * Handles user registration, login, password hashing, and JWT token generation.
 */

/**
 * Response type for successful registration
 */
export interface RegisterResponse {
  id: string;
  name: string;
  email: string | null;
  userName: string | null;
  userType: UserType;
  country: string | null;
  city: string | null;
}

/**
 * Response type for successful login
 */
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string | null;
    userName: string | null;
    userType: UserType;
  };
}

/**
 * JWT payload structure
 */
export interface JWTPayload {
  userId: string;
  email: string | null;
  userType: UserType;
}

export class AuthService {
  private readonly authRepository: AuthRepository;
  private readonly saltRounds = 10;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  /**
   * Register a new user
   *
   * Validates uniqueness of email and mobile, hashes password,
   * and creates a new user in the database.
   *
   * @param data - Registration data from the client
   * @returns User information (excluding password)
   * @throws {ConflictError} If email or mobile already exists
   */
  async register(data: RegisterDTO): Promise<RegisterResponse> {
    // Check if email already exists
    const existingEmail = await this.authRepository.findByEmail(data.email);
    if (existingEmail) {
      throw new ConflictError(
        'Email address is already registered',
        ErrorCode.USER_ALREADY_EXISTS
      );
    }

    // Check if mobile already exists
    const existingMobile = await this.authRepository.findByMobile(data.mobile);
    if (existingMobile) {
      throw new ConflictError(
        'Mobile number is already registered',
        ErrorCode.USER_ALREADY_EXISTS
      );
    }

    // Check if username already exists
    const existingUsername = await this.authRepository.findByUsername(data.userName);
    if (existingUsername) {
      throw new ConflictError(
        'Username is already taken',
        ErrorCode.USER_ALREADY_EXISTS
      );
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(data.password, this.saltRounds);

    // Create the user
    const user = await this.authRepository.create({
      name: data.name,
      userName: data.userName.toLowerCase(),
      email: data.email.toLowerCase(),
      mobile: data.mobile,
      password: hashedPassword,
      country: data.country,
      city: data.city,
      userType: data.userType,
      accountStatus: 'Active',
      isAnonymous: false,
    });

    // Return user data without sensitive information
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      userName: user.userName,
      userType: user.userType,
      country: user.country,
      city: user.city,
    };
  }

  /**
   * Authenticate a user and generate JWT token
   *
   * Validates credentials and returns a JWT token for authenticated sessions.
   *
   * @param data - Login credentials (email/username and password)
   * @returns JWT token and user information
   * @throws {UnauthorizedError} If credentials are invalid
   */
  async login(data: LoginDTO): Promise<LoginResponse> {
    // Find user by email or username
    const user = await this.authRepository.findByEmailOrUsername(data.identifier);

    if (!user) {
      throw new UnauthorizedError(
        'Invalid credentials',
        ErrorCode.INVALID_CREDENTIALS
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError(
        'Invalid credentials',
        ErrorCode.INVALID_CREDENTIALS
      );
    }

    // Check if account is active
    if (user.accountStatus !== 'Active') {
      throw new UnauthorizedError(
        'Account is not active',
        ErrorCode.FORBIDDEN
      );
    }

    // Generate JWT token
    const token = this.generateToken(user);

    // Return token and user information
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userName: user.userName,
        userType: user.userType,
      },
    };
  }

  /**
   * Generate JWT token for authenticated user
   *
   * @param user - User object from database
   * @returns Signed JWT token
   * @private
   */
  private generateToken(user: User): string {
    const payload = {
      userId: user.id,
      email: user.email,
      userType: user.userType,
    };

    // Type assertion needed due to jsonwebtoken type definitions
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    }) as string;
  }

  /**
   * Verify JWT token and return payload
   *
   * @param token - JWT token to verify
   * @returns Decoded JWT payload
   * @throws {UnauthorizedError} If token is invalid or expired
   */
  async verifyToken(token: string): Promise<JWTPayload> {
    try {
      const payload = jwt.verify(token, env.JWT_SECRET, {
        algorithms: ['HS256'],
      }) as JWTPayload;

      return payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError(
          'Token has expired',
          ErrorCode.TOKEN_EXPIRED
        );
      }

      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError(
          'Invalid token',
          ErrorCode.TOKEN_INVALID
        );
      }

      throw new UnauthorizedError(
        'Token verification failed',
        ErrorCode.TOKEN_INVALID
      );
    }
  }
}
