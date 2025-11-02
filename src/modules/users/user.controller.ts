/**
 * User Controller
 *
 * Handles HTTP requests for user-related operations.
 */

import { Request, Response } from 'express';
import { UserService } from './user.service.js';
import { asyncHandler } from '../../shared/utils/async-handler.js';
import { getAllUsersQuerySchema } from './dtos/get-all-users-query.dto.js';

export class UserController {
  private readonly userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * Get user details by ID
   *
   * @route GET /api/users/:userId
   * @access Protected (any authenticated user)
   */
  getUserById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;
    const userDetails = await this.userService.getUserById(userId);

    res.json({
      success: true,
      message: 'User details retrieved successfully',
      data: userDetails,
    });
  });

  /**
   * Get all users with filters and pagination
   *
   * @route GET /api/users
   * @access Admin only
   */
  getAllUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Validate and parse query parameters
    const query = getAllUsersQuerySchema.parse(req.query);

    const result = await this.userService.getAllUsers(query, req);

    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users: result.data,
        pagination: result.pagination,
      },
    });
  });
}
