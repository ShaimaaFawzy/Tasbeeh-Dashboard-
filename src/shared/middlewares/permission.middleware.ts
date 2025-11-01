import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../errors/http-errors.js';
import { ErrorCode } from '../errors/error-codes.js';
import { asyncHandler } from '../utils/async-handler.js';

/**
 * Permission Middleware
 *
 * Checks if the authenticated user has the required role(s) to access a resource.
 * Must be used after the authenticate middleware.
 */

/**
 * Creates a middleware that checks if user has one of the required roles
 *
 * @param roles - Array of allowed roles
 * @returns Express middleware function
 *
 * @example
 * router.delete('/users/:id',
 *   authenticate,
 *   requireRole(['ADMIN']),
 *   userController.deleteUser
 * );
 */
export const requireRole = (roles: string[]) => {
  return asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      if (!req.user) {
        throw new ForbiddenError('Authentication required', ErrorCode.UNAUTHORIZED);
      }

      if (!roles.includes(req.user.userType)) {
        throw new ForbiddenError(
          'Insufficient permissions',
          ErrorCode.INSUFFICIENT_PERMISSIONS
        );
      }

      next();
    }
  );
};

/**
 * Middleware that checks if user is an admin
 */
export const requireAdmin = requireRole(['Admin']);

/**
 * Middleware that checks if user owns the resource or is an admin
 *
 * @param getUserId - Function to extract user ID from request (e.g., from params)
 * @returns Express middleware function
 *
 * @example
 * router.put('/users/:id',
 *   authenticate,
 *   requireOwnershipOrAdmin((req) => req.params.id),
 *   userController.updateUser
 * );
 */
export const requireOwnershipOrAdmin = (getUserId: (req: Request) => string) => {
  return asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      if (!req.user) {
        throw new ForbiddenError('Authentication required', ErrorCode.UNAUTHORIZED);
      }

      const resourceUserId = getUserId(req);
      const isOwner = req.user.userId === resourceUserId;
      const isAdmin = req.user.userType === 'Admin';

      if (!isOwner && !isAdmin) {
        throw new ForbiddenError(
          'You do not have permission to access this resource',
          ErrorCode.INSUFFICIENT_PERMISSIONS
        );
      }

      next();
    }
  );
};
