import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../errors/http-errors.js';
import { ErrorCode } from '../errors/error-codes.js';
import { JwtPayload } from '../types/common.types.js';
import { asyncHandler } from '../utils/async-handler.js';
import { env } from '../../config/env.js';

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
      const decoded = jwt.verify(token, env.JWT_SECRET, {
        algorithms: ['HS256'],
      }) as JwtPayload;

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
      const decoded = jwt.verify(token, env.JWT_SECRET, {
        algorithms: ['HS256'],
      }) as JwtPayload;
      req.user = decoded;
    } catch (error) {
      // Silently ignore invalid tokens for optional authentication
    }

    next();
  }
);
