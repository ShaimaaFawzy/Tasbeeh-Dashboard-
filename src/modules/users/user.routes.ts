/**
 * User Routes
 *
 * Defines all routes for user-related operations.
 */

import { Router } from 'express';
import { UserController } from './user.controller.js';
import { authenticate } from '../../shared/middlewares/auth.middleware.js';
import { requireAdmin } from '../../shared/middlewares/admin.middleware.js';

const router = Router();
const userController = new UserController();

/**
 * @swagger
 * /api/users/{userId}:
 *   get:
 *     summary: Get user details by ID
 *     description: Retrieve comprehensive user information including profile details, statistics, and streaks. Accessible by any authenticated user.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User details retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: John Doe
 *                     username:
 *                       type: string
 *                       example: johndoe
 *                     accountStatus:
 *                       type: string
 *                       example: Active
 *                     city:
 *                       type: string
 *                       example: New York
 *                     feeling:
 *                       type: string
 *                       example: happy
 *                     email:
 *                       type: string
 *                       example: john@example.com
 *                     mobile:
 *                       type: string
 *                       example: +1234567890
 *                     logo:
 *                       type: string
 *                       nullable: true
 *                       example: https://example.com/avatars/johndoe.jpg
 *                     totalZiker:
 *                       type: number
 *                       example: 1000
 *                     streak:
 *                       type: number
 *                       example: 15
 *                     highestStreak:
 *                       type: number
 *                       example: 30
 *                     activeLoginDays:
 *                       type: number
 *                       example: 45
 *                     joinDate:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-01-15T00:00:00.000Z
 *                     rank:
 *                       type: string
 *                       example: Gold
 *                     inviteCode:
 *                       type: string
 *                       example: ABC123
 *                     totalZikerByInvitedFriends:
 *                       type: number
 *                       example: 500
 *                     friendsInvited:
 *                       type: number
 *                       example: 10
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: User not found
 */
router.get('/:userId', authenticate, userController.getUserById);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     description: Retrieve a paginated list of all users with optional search and filtering. Only accessible by admin users. This action is logged to the audit log.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in user name or email (case-insensitive)
 *         example: john
 *       - in: query
 *         name: filterBy
 *         schema:
 *           type: string
 *           enum: [joinDate, deviceStatus, lastActive]
 *         description: Field to filter/sort by
 *         example: joinDate
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *         example: desc
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *         example: 10
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Users retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           Id:
 *                             type: string
 *                             example: 123e4567-e89b-12d3-a456-426614174000
 *                           name:
 *                             type: string
 *                             example: John Doe
 *                           email:
 *                             type: string
 *                             example: john@example.com
 *                           joinDate:
 *                             type: string
 *                             format: date-time
 *                             example: 2024-01-15T00:00:00.000Z
 *                           deviceId:
 *                             type: string
 *                             nullable: true
 *                             example: DEV123
 *                           deviceStatus:
 *                             type: string
 *                             nullable: true
 *                             example: active
 *                           lastActive:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                             example: 2025-01-02T10:30:00.000Z
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         totalItems:
 *                           type: integer
 *                           example: 50
 *                         totalPages:
 *                           type: integer
 *                           example: 5
 *                         hasNextPage:
 *                           type: boolean
 *                           example: true
 *                         hasPreviousPage:
 *                           type: boolean
 *                           example: false
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin privileges required
 */
router.get('/', authenticate, requireAdmin, userController.getAllUsers);

export default router;
