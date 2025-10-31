import { PermissionRepository } from './permission.repository.js';
import { ForbiddenError } from '../../shared/errors/http-errors.js';
import { ErrorCode } from '../../shared/errors/error-codes.js';

/**
 * Permission Service
 *
 * Contains business logic for permission-related operations.
 * This is a placeholder implementation. Extend as needed.
 */
export class PermissionService {
  private permissionRepository: PermissionRepository;

  /**
   * Creates a new PermissionService instance
   *
   * @param permissionRepository - Repository for permission data access
   */
  constructor(permissionRepository: PermissionRepository) {
    this.permissionRepository = permissionRepository;
  }

  /**
   * Check if a user has a specific permission
   *
   * @param userId - User ID
   * @param permission - Permission name
   * @returns True if user has permission
   */
  async checkPermission(userId: string, permission: string): Promise<boolean> {
    return this.permissionRepository.userHasPermission(userId, permission);
  }

  /**
   * Get all permissions for a user
   *
   * @param userId - User ID
   * @returns Array of permission names
   */
  async getUserPermissions(userId: string): Promise<string[]> {
    return this.permissionRepository.getUserPermissions(userId);
  }

  /**
   * Assign a permission to a user
   *
   * @param userId - User ID
   * @param permission - Permission name
   */
  async assignPermission(userId: string, permission: string): Promise<void> {
    await this.permissionRepository.assignPermission(userId, permission);
  }

  /**
   * Revoke a permission from a user
   *
   * @param userId - User ID
   * @param permission - Permission name
   */
  async revokePermission(userId: string, permission: string): Promise<void> {
    await this.permissionRepository.revokePermission(userId, permission);
  }

  /**
   * Require that a user has a specific permission
   *
   * @param userId - User ID
   * @param permission - Permission name
   * @throws ForbiddenError if user does not have permission
   */
  async requirePermission(userId: string, permission: string): Promise<void> {
    const hasPermission = await this.checkPermission(userId, permission);

    if (!hasPermission) {
      throw new ForbiddenError(
        `Permission required: ${permission}`,
        ErrorCode.INSUFFICIENT_PERMISSIONS
      );
    }
  }
}
