import { Request, Response } from 'express';
import { AuthService } from '@/services/auth.service';
import { asyncHandler } from '@/utils/async-handler.utils';
import { ApiResponse } from '@/utils/api-response.utils';
import { HTTP_STATUS_CODES } from '@/lib/constants';
import { config } from '@/config';

export class AuthController {
  /**
   * @desc    Register a new user
   * @route   POST /api/auth/register
   * @access  Public
   */
  static register = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.register(req.body);

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: config.server.nodeEnv === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    ApiResponse.success(
      res,
      {
        user: result.user,
        accessToken: result.tokens.accessToken,
      },
      result.message,
      HTTP_STATUS_CODES.CREATED,
    );
  });

  /**
   * @desc    Login user
   * @route   POST /api/auth/login
   * @access  Public
   */
  static login = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.login(req.body);

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: config.server.nodeEnv === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    ApiResponse.success(
      res,
      {
        user: result.user,
        accessToken: result.tokens.accessToken,
      },
      result.message,
    );
  });

  /**
   * @desc    Refresh access token
   * @route   POST /api/auth/refresh
   * @access  Public
   */
  static refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return ApiResponse.error(res, 'Refresh token not provided', HTTP_STATUS_CODES.UNAUTHORIZED);
    }

    const tokens = await AuthService.refreshToken(refreshToken);

    // Set new refresh token as httpOnly cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: config.server.nodeEnv === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    ApiResponse.success(
      res,
      {
        accessToken: tokens.accessToken,
      },
      'Token refreshed successfully',
    );
  });

  /**
   * @desc    Logout user
   * @route   POST /api/auth/logout
   * @access  Private
   */
  static logout = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    const userId = req.user?.userId;

    if (!userId) {
      return ApiResponse.error(res, 'User not authenticated', HTTP_STATUS_CODES.UNAUTHORIZED);
    }

    if (refreshToken) {
      await AuthService.logout(userId, refreshToken);
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    ApiResponse.success(res, null, 'Logout successful');
  });

  /**
   * @desc    Change user password
   * @route   PUT /api/auth/change-password
   * @access  Private
   */
  static changePassword = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return ApiResponse.error(res, 'User not authenticated', HTTP_STATUS_CODES.UNAUTHORIZED);
    }

    const result = await AuthService.changePassword(userId, req.body);

    // Clear refresh token cookie to force re-login
    res.clearCookie('refreshToken');

    ApiResponse.success(res, null, result.message);
  });

  /**
   * @desc    Get current user profile
   * @route   GET /api/auth/profile
   * @access  Private
   */
  static getProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return ApiResponse.error(res, 'User not authenticated', HTTP_STATUS_CODES.UNAUTHORIZED);
    }

    const user = await AuthService.getProfile(userId);

    ApiResponse.success(res, { user }, 'Profile retrieved successfully');
  });

  /**
   * @desc    Update current user profile
   * @route   PUT /api/auth/profile
   * @access  Private
   */
  static updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return ApiResponse.error(res, 'User not authenticated', HTTP_STATUS_CODES.UNAUTHORIZED);
    }

    const { UserService } = await import('@/services/user.service');
    const user = await UserService.updateUserProfile(userId, req.body);

    ApiResponse.success(res, { user }, 'Profile updated successfully');
  });

  /**
   * @desc    Verify if user is authenticated
   * @route   GET /api/auth/verify
   * @access  Private
   */
  static verifyAuth = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return ApiResponse.error(res, 'User not authenticated', HTTP_STATUS_CODES.UNAUTHORIZED);
    }

    const user = await AuthService.getProfile(userId);

    ApiResponse.success(
      res,
      {
        user,
        isAuthenticated: true,
      },
      'User is authenticated',
    );
  });

  /**
   * @desc    Verify user email
   * @route   Post /api/auth/verify-email
   * @access  Private
   */
  static verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.verifyEmail(req.body.token);

    ApiResponse.success(res, null, result.message || 'Email verified successfully');
  });

  /**
   * @desc    Resend email verification link
   * @route   POST /api/auth/resend-verification
   * @access  Public
   */
  static resendVerification = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.resendVerification(req.body.email);

    ApiResponse.success(res, null, result.message || 'Verification email sent successfully');
  });

  /**
   * @desc   Verify password reset token
   * @route  GET /api/auth/verify-reset-token
   * @access Public
   */

  static verifyResetToken = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.params as { token: string };

    const user = await AuthService.verifyResetToken(token);

    if (!user) {
      return ApiResponse.error(res, 'Invalid or expired reset token', HTTP_STATUS_CODES.NOT_FOUND);
    }

    ApiResponse.success(res, { user }, 'Reset token verified successfully');
  });

  /**
   * @desc    Request password reset (Forgot password)
   * @route   POST /api/auth/forgot-password
   * @access  Public
   */
  static forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.forgotPassword(req.body.email);

    ApiResponse.success(res, null, result.message || 'Password reset email sent successfully');
  });

  /**
   * @desc    Reset user password
   * @route   POST /api/auth/reset-password
   * @access  Public
   */
  static resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.resetPassword(req.body);

    ApiResponse.success(res, null, result.message || 'Password reset successfully');
  });
}
