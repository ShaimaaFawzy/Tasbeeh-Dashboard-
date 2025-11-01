import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validateBody } from '../../shared/middlewares/validation.middleware.js';
import { registerSchema } from './dtos/register.dto.js';
import { loginSchema } from './dtos/login.dto.js';

/**
 * Auth Routes
 *
 * Defines all authentication-related routes:
 * - POST /register - User registration
 * - POST /login - User login
 */

const router = Router();
const authController = new AuthController();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account with email, username, mobile, and password. Returns user information upon successful registration.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           example:
 *             name: John Doe
 *             userName: johndoe
 *             email: john.doe@example.com
 *             mobile: '+1234567890'
 *             password: SecurePass123
 *             country: United States
 *             city: New York
 *             userType: Normal
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterResponse'
 *             example:
 *               success: true
 *               message: User registered successfully
 *               data:
 *                 id: 123e4567-e89b-12d3-a456-426614174000
 *                 name: John Doe
 *                 email: john.doe@example.com
 *                 userName: johndoe
 *                 userType: Normal
 *                 country: United States
 *                 city: New York
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         $ref: '#/components/responses/ConflictError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  '/register',
  validateBody(registerSchema),
  authController.register
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user with email/username and password. Returns a JWT token for accessing protected endpoints.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             identifier: johndoe
 *             password: SecurePass123
 *     responses:
 *       200:
 *         description: Login successful, JWT token returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *             example:
 *               success: true
 *               message: Login successful
 *               data:
 *                 token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjNlNDU2Ny1lODliLTEyZDMtYTQ1Ni00MjY2MTQxNzQwMDAiLCJlbWFpbCI6ImpvaG4uZG9lQGV4YW1wbGUuY29tIiwidXNlclR5cGUiOiJOb3JtYWwiLCJpYXQiOjE2MzIxNTAwMDAsImV4cCI6MTYzMjc1NDgwMH0.abc123
 *                 user:
 *                   id: 123e4567-e89b-12d3-a456-426614174000
 *                   name: John Doe
 *                   email: john.doe@example.com
 *                   userName: johndoe
 *                   userType: Normal
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  '/login',
  validateBody(loginSchema),
  authController.login
);

export default router;
