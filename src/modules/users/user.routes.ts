import { Router } from 'express';
import { UserController } from './user.controller.js';
import { UserService } from './user.service.js';
import { UserRepository } from './user.repository.js';
import { authenticate } from '../../shared/middlewares/auth.middleware.js';
import { requireAdmin, requireOwnershipOrAdmin } from '../../shared/middlewares/permission.middleware.js';
import { validateBody } from '../../shared/middlewares/validation.middleware.js';
import { createUserSchema } from './dtos/create-user.dto.js';
import { updateUserSchema } from './dtos/update-user.dto.js';

/**
 * User Routes
 *
 * Defines all routes for user-related endpoints.
 * Applies authentication, authorization, and validation middleware.
 */

// Initialize dependencies
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

const router = Router();

/**
 * @route   GET /users
 * @desc    Get all users
 * @access  Private (Admin only)
 */
router.get('/', authenticate, requireAdmin, userController.getAllUsers);

/**
 * @route   GET /users/:id
 * @desc    Get user by ID
 * @access  Private (Owner or Admin)
 */
router.get(
  '/:id',
  authenticate,
  requireOwnershipOrAdmin((req) => req.params.id),
  userController.getUserById
);

/**
 * @route   POST /users
 * @desc    Create a new user
 * @access  Private (Admin only)
 */
router.post(
  '/',
  authenticate,
  requireAdmin,
  validateBody(createUserSchema),
  userController.createUser
);

/**
 * @route   PUT /users/:id
 * @desc    Update a user
 * @access  Private (Owner or Admin)
 */
router.put(
  '/:id',
  authenticate,
  requireOwnershipOrAdmin((req) => req.params.id),
  validateBody(updateUserSchema),
  userController.updateUser
);

/**
 * @route   DELETE /users/:id
 * @desc    Delete a user
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticate, requireAdmin, userController.deleteUser);

export default router;
