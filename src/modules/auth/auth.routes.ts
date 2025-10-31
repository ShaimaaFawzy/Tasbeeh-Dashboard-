import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { UserRepository } from '../users/user.repository.js';
import { authenticate } from '../../shared/middlewares/auth.middleware.js';
import { validateBody } from '../../shared/middlewares/validation.middleware.js';
import { registerSchema } from './dtos/register.dto.js';
import { loginSchema } from './dtos/login.dto.js';

/**
 * Auth Routes
 *
 * Defines all routes for authentication endpoints.
 */

// Initialize dependencies
const userRepository = new UserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

const router = Router();

/**
 * @route   POST /auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validateBody(registerSchema), authController.register);

/**
 * @route   POST /auth/login
 * @desc    Login a user
 * @access  Public
 */
router.post('/login', validateBody(loginSchema), authController.login);

/**
 * @route   GET /auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, authController.getCurrentUser);

export default router;
