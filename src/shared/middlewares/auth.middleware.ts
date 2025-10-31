import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../errors/http-errors.js';
import { ErrorCode } from '../errors/error-codes.js';
import { JwtPayload } from '../types/common.types.js';
import { asyncHandler } from '../utils/async-handler.js';

/**
 * Authentication Middleware
 *
 * Verifies JWT token and attaches user information to the request object.
 * Throws UnauthorizedError if token is missing or invalid.
 */
export const authenticate = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided', ErrorCode.TOKEN_MISSING);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      throw new UnauthorizedError('No token provided', ErrorCode.TOKEN_MISSING);
    }

    try {
      // Verify token
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET is not defined');
      }

      const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

      // Attach user to request
      req.user = decoded;

      next();
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
);

/**
 * Optional Authentication Middleware
 *
 * Similar to authenticate but doesn't throw an error if token is missing.
 * Useful for routes that have different behavior for authenticated vs anonymous users.
 */
export const optionalAuthenticate = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);

    if (!token) {
      return next();
    }

    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET is not defined');
      }

      const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
      req.user = decoded;
    } catch (error) {
      // Silently ignore invalid tokens for optional authentication
    }

    next();
  }
);
