import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import deviceRoutes from '../modules/device/device.routes.js';
import userRoutes from '../modules/users/user.routes.js';

/**
 * Main Router
 *
 * Aggregates all module routes and exports a single router instance.
 */

const router = Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check
 *     description: Check if the API is running and responsive. Returns current server timestamp.
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: API is healthy and running
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
 *                   example: API is running
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-11-02T10:30:00.000Z
 *             example:
 *               success: true
 *               message: API is running
 *               timestamp: 2025-11-02T10:30:00.000Z
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Module routes
 */
router.use('/auth', authRoutes);
router.use('/devices', deviceRoutes);
router.use('/users', userRoutes);

export default router;
