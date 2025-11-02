/**
 * User Service
 *
 * Contains business logic for user operations.
 */

import { UserRepository } from './user.repository.js';
import { NotFoundError } from '../../shared/errors/http-errors.js';
import { ErrorCode } from '../../shared/errors/error-codes.js';
import { UserDetailsResponseDTO } from './dtos/user-details-response.dto.js';
import { GetAllUsersQueryDTO } from './dtos/get-all-users-query.dto.js';
import { UserItemDTO } from './dtos/get-all-users-response.dto.js';
import { calculateSkip, createPaginatedResult, PaginatedResult } from '../../shared/utils/pagination.js';
import { AuditLogService } from '../../shared/services/audit-log.service.js';
import { Request } from 'express';

export class UserService {
  private readonly userRepository: UserRepository;
  private readonly auditLogService: AuditLogService;

  constructor() {
    this.userRepository = new UserRepository();
    this.auditLogService = new AuditLogService();
  }

  /**
   * Get user details by ID
   *
   * Retrieves comprehensive user information including user details.
   * This endpoint is accessible by any authenticated user.
   *
   * @param userId - User ID to retrieve
   * @returns User details
   * @throws {NotFoundError} If user not found
   */
  async getUserById(userId: string): Promise<UserDetailsResponseDTO> {
    const user = await this.userRepository.findById(userId, true);
    if (!user || !user.userDetails) {
      throw new NotFoundError('User not found', ErrorCode.RESOURCE_NOT_FOUND);
    }

    // Map database fields to DTO fields
    return {
      name: user.name,
      username: user.userName || '',
      accountStatus: user.accountStatus,
      city: user.city || '',
      feeling: user.userDetails.feeling,
      email: user.email || '',
      mobile: user.mobile || '',
      logo: user.logo,
      totalZiker: user.userDetails.totalZiker,
      streak: user.userDetails.currentStreak,
      highestStreak: user.userDetails.totalStreak,
      activeLoginDays: user.userDetails.activeLoginDays,
      joinDate: user.joinDate.toISOString(),
      rank: user.userDetails.rank,
      inviteCode: user.userDetails.inviteCode,
      totalZikerByInvitedFriends: user.userDetails.totalZikerByInvitedFriends,
      friendsInvited: user.userDetails.friendsInvited,
    };
  }

  /**
   * Get all users with filters and pagination (Admin only)
   *
   * Retrieves a paginated list of users with optional search and filtering.
   * Logs the admin action to audit log.
   *
   * @param query - Query parameters for filtering and pagination
   * @param req - Express request object (for audit logging)
   * @returns Paginated users list
   */
  async getAllUsers(
    query: GetAllUsersQueryDTO,
    req: Request
  ): Promise<PaginatedResult<UserItemDTO>> {
    const { search, filterBy, sortOrder, page, limit } = query;

    // Calculate pagination
    const skip = calculateSkip(page, limit);

    // Get users and total count
    const [users, totalItems] = await Promise.all([
      this.userRepository.findAllWithFilters(
        { search, filterBy, sortOrder },
        { skip, take: limit }
      ),
      this.userRepository.countAll({ search }),
    ]);

    // Map users to response DTO
    const mappedUsers: UserItemDTO[] = users.map((user) => ({
      Id: user.id,
      name: user.name,
      email: user.email || '',
      joinDate: user.joinDate.toISOString(),
      deviceId: user.devices.length > 0 ? user.devices[0].deviceId : null,
      deviceStatus: user.devices.length > 0 ? (user.devices[0].deviceStatus ? 'active' : 'inactive') : null,
      lastActive: user.devices.length > 0 ? user.devices[0].lastSync.toISOString() : null,
    }));

    // Log admin action to audit log
    if (req.user && req.auditInfo) {
      await this.auditLogService.logAdminAction({
        adminId: req.user.userId,
        adminEmail: req.user.email || '',
        action: 'GET_ALL_USERS',
        resourceType: 'users',
        details: { search, filterBy, sortOrder, page, limit },
        ipAddress: req.auditInfo.ipAddress,
        userAgent: req.auditInfo.userAgent,
        status: 'success',
      });
    }

    return createPaginatedResult(mappedUsers, totalItems, page, limit);
  }
}
