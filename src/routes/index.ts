import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import userRoutes from '../modules/users/user.routes.js';
import permissionRoutes from '../modules/permissions/permission.routes.js';

/**
 * Main Router
 *
 * Aggregates all module routes and exports a single router instance.
 */

const router = Router();

/**
 * Health check endpoint
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
router.use('/users', userRoutes);
router.use('/permissions', permissionRoutes);

export default router;
