import { Router } from 'express';
import { PermissionController } from './permission.controller.js';
import { PermissionService } from './permission.service.js';
import { PermissionRepository } from './permission.repository.js';
import { authenticate } from '../../shared/middlewares/auth.middleware.js';
import { requireAdmin } from '../../shared/middlewares/permission.middleware.js';

/**
 * Permission Routes
 *
 * Defines all routes for permission-related endpoints.
 * This is a placeholder implementation. Extend as needed.
 */

// Initialize dependencies
const permissionRepository = new PermissionRepository();
const permissionService = new PermissionService(permissionRepository);
const permissionController = new PermissionController(permissionService);

const router = Router();

/**
 * @route   GET /permissions/user/:userId
 * @desc    Get permissions for a user
 * @access  Private (Admin only)
 */
router.get(
  '/user/:userId',
  authenticate,
  requireAdmin,
  permissionController.getUserPermissions
);

/**
 * @route   POST /permissions/assign
 * @desc    Assign a permission to a user
 * @access  Private (Admin only)
 */
router.post(
  '/assign',
  authenticate,
  requireAdmin,
  permissionController.assignPermission
);

/**
 * @route   POST /permissions/revoke
 * @desc    Revoke a permission from a user
 * @access  Private (Admin only)
 */
router.post(
  '/revoke',
  authenticate,
  requireAdmin,
  permissionController.revokePermission
);

export default router;
