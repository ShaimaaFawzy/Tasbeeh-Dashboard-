import { Request, Response } from 'express';
import { PermissionService } from './permission.service.js';
import { asyncHandler } from '../../shared/utils/async-handler.js';
import { ApiResponse } from '../../shared/types/common.types.js';

/**
 * Permission Controller
 *
 * Handles HTTP requests for permission-related endpoints.
 * This is a placeholder implementation. Extend as needed.
 */
export class PermissionController {
  private permissionService: PermissionService;

  /**
   * Creates a new PermissionController instance
   *
   * @param permissionService - Service for permission business logic
   */
  constructor(permissionService: PermissionService) {
    this.permissionService = permissionService;
  }

  /**
   * Get permissions for a user
   * GET /permissions/user/:userId
   */
  getUserPermissions = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { userId } = req.params;
      const permissions = await this.permissionService.getUserPermissions(userId);

      const response: ApiResponse = {
        success: true,
        data: permissions,
      };

      res.json(response);
    }
  );

  /**
   * Assign a permission to a user
   * POST /permissions/assign
   */
  assignPermission = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { userId, permission } = req.body;
    await this.permissionService.assignPermission(userId, permission);

    const response: ApiResponse = {
      success: true,
      message: 'Permission assigned successfully',
    };

    res.json(response);
  });

  /**
   * Revoke a permission from a user
   * POST /permissions/revoke
   */
  revokePermission = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { userId, permission } = req.body;
    await this.permissionService.revokePermission(userId, permission);

    const response: ApiResponse = {
      success: true,
      message: 'Permission revoked successfully',
    };

    res.json(response);
  });
}
