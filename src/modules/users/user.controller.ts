import { Request, Response } from 'express';
import { UserService } from './user.service.js';
import { asyncHandler } from '../../shared/utils/async-handler.js';
import { ApiResponse } from '../../shared/types/common.types.js';

/**
 * User Controller
 *
 * Handles HTTP requests for user-related endpoints.
 * Delegates business logic to UserService.
 */
export class UserController {
  private userService: UserService;

  /**
   * Creates a new UserController instance
   *
   * @param userService - Service for user business logic
   */
  constructor(userService: UserService) {
    this.userService = userService;
  }

  /**
   * Get all users
   * GET /users
   */
  getAllUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const users = await this.userService.getAllUsers();

    const response: ApiResponse = {
      success: true,
      data: users,
    };

    res.json(response);
  });

  /**
   * Get user by ID
   * GET /users/:id
   */
  getUserById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const user = await this.userService.getUserById(id);

    const response: ApiResponse = {
      success: true,
      data: user,
    };

    res.json(response);
  });

  /**
   * Create a new user
   * POST /users
   */
  createUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = await this.userService.createUser(req.body);

    const response: ApiResponse = {
      success: true,
      data: user,
      message: 'User created successfully',
    };

    res.status(201).json(response);
  });

  /**
   * Update a user
   * PUT /users/:id
   */
  updateUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const user = await this.userService.updateUser(id, req.body);

    const response: ApiResponse = {
      success: true,
      data: user,
      message: 'User updated successfully',
    };

    res.json(response);
  });

  /**
   * Delete a user
   * DELETE /users/:id
   */
  deleteUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await this.userService.deleteUser(id);

    const response: ApiResponse = {
      success: true,
      message: 'User deleted successfully',
    };

    res.json(response);
  });
}
