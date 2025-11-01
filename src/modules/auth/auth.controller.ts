import { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { RegisterDTO } from './dtos/register.dto.js';
import { LoginDTO } from './dtos/login.dto.js';
import { asyncHandler } from '../../shared/utils/async-handler.js';

/**
 * Auth Controller
 *
 * Handles HTTP requests for authentication endpoints.
 * Delegates business logic to AuthService.
 */

export class AuthController {
  private readonly authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Handle user registration
   *
   * POST /api/auth/register
   *
   * @param req - Express request object with RegisterDTO in body
   * @param res - Express response object
   */
  register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data: RegisterDTO = req.body;

    const user = await this.authService.register(data);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: user,
    });
  });

  /**
   * Handle user login
   *
   * POST /api/auth/login
   *
   * @param req - Express request object with LoginDTO in body
   * @param res - Express response object
   */
  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data: LoginDTO = req.body;

    const result = await this.authService.login(data);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  });
}
