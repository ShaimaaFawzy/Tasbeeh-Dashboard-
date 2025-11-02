import { Router } from 'express';
import { DeviceController } from './device.controller.js';
import { validateBody } from '../../shared/middlewares/validation.middleware.js';
import { createDeviceSchema } from './dtos/create-device.dto.js';
import { updateDeviceSchema } from './dtos/update-device.dto.js';
import { authenticate } from '../../shared/middlewares/auth.middleware.js';
import { requireAdmin } from '../../shared/middlewares/admin.middleware.js';

/**
 * Device Routes
 *
 * Defines all device-related routes:
 * - POST /devices - Create a new device
 * - GET /devices - Get all devices (paginated)
 * - GET /devices/:id - Get device by ID
 * - GET /devices/user/:userId - Get all devices for a user
 * - PATCH /devices/:id - Update a device
 * - DELETE /devices/:id - Delete a device
 * - POST /devices/:id/increment-usage - Increment device usage count
 */

const router = Router();
const deviceController = new DeviceController();

/**
 * @swagger
 * /api/devices:
 *   post:
 *     summary: Create a new device
 *     description: Register a new device and pair it with the authenticated user's account. User ID is automatically extracted from JWT token. Device ID must be unique.
 *     tags:
 *       - Devices
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDeviceRequest'
 *           example:
 *             deviceId: DEVICE-ABC-123
 *             deviceStatus: true
 *     responses:
 *       201:
 *         description: Device created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeviceSuccessResponse'
 *             example:
 *               success: true
 *               message: Device created successfully
 *               data:
 *                 id: 987e6543-e21b-12d3-a456-426614174999
 *                 deviceId: DEVICE-ABC-123
 *                 userId: 123e4567-e89b-12d3-a456-426614174000
 *                 paringDate: 2025-11-02T10:30:00Z
 *                 usageCount: 0
 *                 deviceStatus: true
 *                 lastSync: 2025-11-02T10:30:00Z
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       409:
 *         $ref: '#/components/responses/ConflictError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  '/',
  authenticate,
  validateBody(createDeviceSchema),
  deviceController.createDevice
);

/**
 * @swagger
 * /api/devices:
 *   get:
 *     summary: Get all devices (Admin only)
 *     description: Retrieve a paginated list of all devices with optional search and filtering. Only accessible by admin users. This action is logged to the audit log.
 *     tags:
 *       - Devices
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in device ID or linked user name (case-insensitive)
 *         example: DEV123
 *       - in: query
 *         name: filterBy
 *         schema:
 *           type: string
 *           enum: [deviceStatus, lastSync]
 *         description: Field to filter/sort by
 *         example: lastSync
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
 *         description: Devices retrieved successfully
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
 *                   example: Devices retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     devices:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           deviceId:
 *                             type: string
 *                             example: DEV123
 *                           linkedUser:
 *                             type: string
 *                             example: John Doe
 *                           pairingDate:
 *                             type: string
 *                             format: date-time
 *                             example: 2024-01-20T00:00:00.000Z
 *                           lastSync:
 *                             type: string
 *                             format: date-time
 *                             example: 2025-01-02T10:30:00.000Z
 *                           usageCount:
 *                             type: number
 *                             example: 150
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
 *                           example: 30
 *                         totalPages:
 *                           type: integer
 *                           example: 3
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
router.get(
  '/',
  authenticate,
  requireAdmin,
  deviceController.getAllDevicesForAdmin
);

/**
 * @swagger
 * /api/devices/user/{userId}:
 *   get:
 *     summary: Get devices by user ID
 *     description: Retrieve all devices associated with a specific user account.
 *     tags:
 *       - Devices
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User's unique identifier
 *         example: 123e4567-e89b-12d3-a456-426614174000
 *     responses:
 *       200:
 *         description: User's devices retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeviceListResponse'
 *             example:
 *               success: true
 *               message: Devices retrieved successfully
 *               data:
 *                 - id: 987e6543-e21b-12d3-a456-426614174999
 *                   deviceId: DEVICE-ABC-123
 *                   userId: 123e4567-e89b-12d3-a456-426614174000
 *                   paringDate: 2025-11-02T10:30:00Z
 *                   usageCount: 150
 *                   deviceStatus: true
 *                   lastSync: 2025-11-02T10:30:00Z
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  '/user/:userId',
  authenticate,
  deviceController.getDevicesByUserId
);

/**
 * @swagger
 * /api/devices/{id}:
 *   get:
 *     summary: Get device by ID
 *     description: Retrieve detailed information about a specific device.
 *     tags:
 *       - Devices
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Device's unique identifier
 *         example: 987e6543-e21b-12d3-a456-426614174999
 *     responses:
 *       200:
 *         description: Device retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeviceSuccessResponse'
 *             example:
 *               success: true
 *               message: Device retrieved successfully
 *               data:
 *                 id: 987e6543-e21b-12d3-a456-426614174999
 *                 deviceId: DEVICE-ABC-123
 *                 userId: 123e4567-e89b-12d3-a456-426614174000
 *                 paringDate: 2025-11-02T10:30:00Z
 *                 usageCount: 150
 *                 deviceStatus: true
 *                 lastSync: 2025-11-02T10:30:00Z
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  '/:id',
  authenticate,
  deviceController.getDeviceById
);

/**
 * @swagger
 * /api/devices/{id}:
 *   patch:
 *     summary: Update a device
 *     description: Update device information. At least one field must be provided. Device ID must remain unique if changed.
 *     tags:
 *       - Devices
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Device's unique identifier
 *         example: 987e6543-e21b-12d3-a456-426614174999
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateDeviceRequest'
 *           example:
 *             deviceStatus: false
 *             usageCount: 200
 *     responses:
 *       200:
 *         description: Device updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeviceSuccessResponse'
 *             example:
 *               success: true
 *               message: Device updated successfully
 *               data:
 *                 id: 987e6543-e21b-12d3-a456-426614174999
 *                 deviceId: DEVICE-ABC-123
 *                 userId: 123e4567-e89b-12d3-a456-426614174000
 *                 paringDate: 2025-11-02T10:30:00Z
 *                 usageCount: 200
 *                 deviceStatus: false
 *                 lastSync: 2025-11-02T11:00:00Z
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       409:
 *         $ref: '#/components/responses/ConflictError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.patch(
  '/:id',
  authenticate,
  validateBody(updateDeviceSchema),
  deviceController.updateDevice
);

/**
 * @swagger
 * /api/devices/{id}:
 *   delete:
 *     summary: Delete a device
 *     description: Soft delete a device. The device will be marked as deleted but not removed from the database.
 *     tags:
 *       - Devices
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Device's unique identifier
 *         example: 987e6543-e21b-12d3-a456-426614174999
 *     responses:
 *       200:
 *         description: Device deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeviceSuccessResponse'
 *             example:
 *               success: true
 *               message: Device deleted successfully
 *               data:
 *                 id: 987e6543-e21b-12d3-a456-426614174999
 *                 deviceId: DEVICE-ABC-123
 *                 userId: 123e4567-e89b-12d3-a456-426614174000
 *                 paringDate: 2025-11-02T10:30:00Z
 *                 usageCount: 150
 *                 deviceStatus: true
 *                 lastSync: 2025-11-02T10:30:00Z
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete(
  '/:id',
  authenticate,
  deviceController.deleteDevice
);

/**
 * @swagger
 * /api/devices/{id}/increment-usage:
 *   post:
 *     summary: Increment device usage count
 *     description: Increment the usage counter for a device by one. Used to track device activity.
 *     tags:
 *       - Devices
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Device's unique identifier
 *         example: 987e6543-e21b-12d3-a456-426614174999
 *     responses:
 *       200:
 *         description: Usage count incremented successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeviceSuccessResponse'
 *             example:
 *               success: true
 *               message: Device usage count incremented successfully
 *               data:
 *                 id: 987e6543-e21b-12d3-a456-426614174999
 *                 deviceId: DEVICE-ABC-123
 *                 userId: 123e4567-e89b-12d3-a456-426614174000
 *                 paringDate: 2025-11-02T10:30:00Z
 *                 usageCount: 151
 *                 deviceStatus: true
 *                 lastSync: 2025-11-02T10:35:00Z
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  '/:id/increment-usage',
  authenticate,
  deviceController.incrementUsageCount
);

export default router;
