import { Router } from 'express';
import { AuthController } from '@/controllers/auth.controller';
import { AuthMiddleware } from '@/middleware/auth.middleware';
import { ValidationMiddleware } from '@/middleware/validation.middleware';
import { rateLimiter } from '@/middleware/rate-limiter.middleware';
import { AuthValidators } from '@/validators/auth.validators';

const router: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication endpoints
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - username
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */
router.post(
  '/register',
  rateLimiter.auth,
  ValidationMiddleware.validate(AuthValidators.register),
  AuthController.register,
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email or username
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account blocked/deactivated
 */
router.post(
  '/login',
  rateLimiter.auth,
  ValidationMiddleware.validate(AuthValidators.login),
  AuthController.login,
);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     description: Refreshes access token using httpOnly cookie.
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Missing or invalid refresh token cookie
 */
router.post('/refresh', rateLimiter.auth, AuthController.refreshToken);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Authentication required
 */
router.post('/logout', AuthMiddleware.authenticate, AuthController.logout);

/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     summary: Change user password
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *               confirmPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Password validation error
 *       401:
 *         description: Current password incorrect
 */
router.put(
  '/change-password',
  AuthMiddleware.authenticate,
  ValidationMiddleware.validate(AuthValidators.changePassword),
  AuthController.changePassword,
);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       401:
 *         description: Authentication required
 *   put:
 *     summary: Update current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Username already exists
 */
router.get('/profile', AuthMiddleware.authenticate, AuthController.getProfile);
router.put(
  '/profile',
  AuthMiddleware.authenticate,
  ValidationMiddleware.validate(AuthValidators.updateProfile),
  AuthController.updateProfile,
);

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     summary: Verify if user is authenticated
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User is authenticated
 *       401:
 *         description: Authentication required
 */
router.get('/verify', AuthMiddleware.authenticate, AuthController.verifyAuth);

/**
 * @swagger
 * /api/auth/resend-verification:
 *   post:
 *     summary: Resend email verification link
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *     responses:
 *       200:
 *         description: Verification email sent successfully
 *       400:
 *         description: User not found with this email or already verified
 *       500:
 *         description: Failed to send verification email
 */
router.post(
  '/resend-verification',
  ValidationMiddleware.validate(AuthValidators.resendVerification),
  AuthController.resendVerification,
);

/**
 * @swagger
 * /api/auth/verify-reset-token/{token}:
 *   get:
 *     summary: Verify password reset token
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Password reset token to verify
 *     responses:
 *       200:
 *         description: Reset token verified successfully
 *       400:
 *         description: Invalid or expired reset token
 */
router.get(
  '/verify-reset-token/:token',
  ValidationMiddleware.validate(AuthValidators.verifyToken, 'params'),
  AuthController.verifyResetToken,
);

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Verify user email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Verification token
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired verification token
 */
router.post(
  '/verify-email',
  ValidationMiddleware.validate(AuthValidators.verifyToken),
  AuthController.verifyEmail,
);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Send password reset email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *     responses:
 *       200:
 *         description: Password reset email sent successfully
 *       400:
 *         description: User not found with this email
 *       500:
 *         description: Failed to send password reset email
 */
router.post(
  '/forgot-password',
  ValidationMiddleware.validate(AuthValidators.forgotPassword),
  AuthController.forgotPassword,
);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset user password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               token:
 *                 type: string
 *                 description: Password reset token
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 description: New password
 *               confirmPassword:
 *                 type: string
 *                 minLength: 8
 *                 description: Confirm new password
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired reset token
 */
router.post(
  '/reset-password',
  ValidationMiddleware.validate(AuthValidators.resetPassword),
  AuthController.resetPassword,
);

export { router as authRoutes };
