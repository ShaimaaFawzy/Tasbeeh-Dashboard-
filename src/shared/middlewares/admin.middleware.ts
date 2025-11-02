/**
 * Admin Middleware
 *
 * Enhanced middleware that checks if the authenticated user is an admin
 * and captures audit information (IP address and User-Agent) for logging.
 */

import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../errors/http-errors.js';
import { ErrorCode } from '../errors/error-codes.js';
import { asyncHandler } from '../utils/async-handler.js';
import { UserType } from '@prisma/client';

/**
 * Middleware that checks if user is an admin and captures audit information
 *
 * This middleware should be used after the authenticate middleware.
 * It performs the following:
 * 1. Checks if req.user exists (from auth middleware)
 * 2. Checks if req.user.userType === 'Admin'
 * 3. Extracts IP address and User-Agent from request headers
 * 4. Attaches audit info to req.auditInfo for use in audit logging
 *
 * @throws {ForbiddenError} If user is not authenticated or not an admin
 */
export const requireAdmin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Check if user is authenticated
    if (!req.user) {
      throw new ForbiddenError(
        'Authentication required',
        ErrorCode.UNAUTHORIZED
      );
    }

    // Check if user is an admin
    if (req.user.userType !== UserType.Admin) {
      throw new ForbiddenError(
        'Access denied. Admin privileges required.',
        ErrorCode.INSUFFICIENT_PERMISSIONS
      );
    }

    // Extract IP address
    // Try x-forwarded-for first (for proxied requests), then fall back to req.ip
    const forwardedFor = req.headers['x-forwarded-for'];
    const ipAddress =
      typeof forwardedFor === 'string'
        ? forwardedFor.split(',')[0].trim()
        : req.ip || 'unknown';

    // Extract User-Agent
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Attach audit info to request
    req.auditInfo = {
      ipAddress,
      userAgent,
    };

    next();
  }
);
