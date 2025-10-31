import { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { asyncHandler } from '../../shared/utils/async-handler.js';
import { ApiResponse } from '../../shared/types/common.types.js';

/**
 * Auth Controller
 *
 * Handles HTTP requests for authentication endpoints.
 * Delegates business logic to AuthService.
 */
export class AuthController {
  private authService: AuthService;

  /**
   * Creates a new AuthController instance
   *
   * @param authService - Service for authentication business logic
   */
  constructor(authService: AuthService) {
    this.authService = authService;
  }

  /**
   * Register a new user
   * POST /auth/register
   */
  register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.register(req.body);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: 'Registration successful',
    };

    res.status(201).json(response);
  });

  /**
   * Login a user
   * POST /auth/login
   */
  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.login(req.body);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: 'Login successful',
    };

    res.json(response);
  });

  /**
   * Get current user profile
   * GET /auth/me
   */
  getCurrentUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const response: ApiResponse = {
      success: true,
      data: req.user,
    };

    res.json(response);
  });
}
