import { Request, Response } from 'express';
import { UserService } from '@/services/user.service';
import { asyncHandler } from '@/utils/async-handler.utils';
import { ApiResponse } from '@/utils/api-response.utils';
import { HTTP_STATUS_CODES } from '@/lib/constants';

export class UserController {
  /**
   * @desc    Get all users (Admin only)
   * @route   GET /api/users
   * @access  Private/Admin
   */
  static getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const users = await UserService.getAllUsers(req.query);

    ApiResponse.success(res, users, 'Users retrieved successfully');
  });

  /**
   * @desc    Get user by ID (Admin only)
   * @route   GET /api/users/:id
   * @access  Private/Admin
   */
  static getUserById = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.id;
    if (!userId) {
      return ApiResponse.error(res, 'User ID is required', HTTP_STATUS_CODES.BAD_REQUEST);
    }
    const user = await UserService.getUserById(userId);

    ApiResponse.success(res, { user }, 'User retrieved successfully');
  });

  /**
   * @desc    Create new user (Admin only)
   * @route   POST /api/users
   * @access  Private/Admin
   */
  static createUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await UserService.createUser(req.body);

    ApiResponse.success(res, { user }, 'User created successfully', HTTP_STATUS_CODES.CREATED);
  });

  /**
   * @desc    Update user (Admin only)
   * @route   PUT /api/users/:id
   * @access  Private/Admin
   */
  static updateUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.id;
    if (!userId) {
      return ApiResponse.error(res, 'User ID is required', HTTP_STATUS_CODES.BAD_REQUEST);
    }
    const user = await UserService.updateUser(userId, req.body);

    ApiResponse.success(res, { user }, 'User updated successfully');
  });

  /**
   * @desc    Delete user (Admin only)
   * @route   DELETE /api/users/:id
   * @access  Private/Admin
   */
  static deleteUser = asyncHandler(async (req: Request, res: Response) => {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user?.userId) {
      return ApiResponse.error(
        res,
        'You cannot delete your own account',
        HTTP_STATUS_CODES.BAD_REQUEST,
      );
    }

    const userId = req.params.id;
    if (!userId) {
      return ApiResponse.error(res, 'User ID is required', HTTP_STATUS_CODES.BAD_REQUEST);
    }

    const result = await UserService.deleteUser(userId);

    ApiResponse.success(res, null, result.message);
  });

  /**
   * @desc    Deactivate user (Admin only)
   * @route   PUT /api/users/:id/deactivate
   * @access  Private/Admin
   */
  static deactivateUser = asyncHandler(async (req: Request, res: Response) => {
    // Prevent admin from deactivating themselves
    if (req.params.id === req.user?.userId) {
      return ApiResponse.error(
        res,
        'You cannot deactivate your own account',
        HTTP_STATUS_CODES.BAD_REQUEST,
      );
    }

    const userId = req.params.id;
    if (!userId) {
      return ApiResponse.error(res, 'User ID is required', HTTP_STATUS_CODES.BAD_REQUEST);
    }

    const user = await UserService.deactivateUser(userId);

    ApiResponse.success(res, { user }, 'User deactivated successfully');
  });

  /**
   * @desc    Activate user (Admin only)
   * @route   PUT /api/users/:id/activate
   * @access  Private/Admin
   */
  static activateUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.id;
    if (!userId) {
      return ApiResponse.error(res, 'User ID is required', HTTP_STATUS_CODES.BAD_REQUEST);
    }
    const user = await UserService.activateUser(userId);

    ApiResponse.success(res, { user }, 'User activated successfully');
  });

  /**
   * @desc    Block user (Admin only)
   * @route   PUT /api/users/:id/block
   * @access  Private/Admin
   */
  static blockUser = asyncHandler(async (req: Request, res: Response) => {
    // Prevent admin from blocking themselves
    if (req.params.id === req.user?.userId) {
      return ApiResponse.error(
        res,
        'You cannot block your own account',
        HTTP_STATUS_CODES.BAD_REQUEST,
      );
    }

    const userId = req.params.id;
    if (!userId) {
      return ApiResponse.error(res, 'User ID is required', HTTP_STATUS_CODES.BAD_REQUEST);
    }

    const user = await UserService.blockUser(userId);

    ApiResponse.success(res, { user }, 'User blocked successfully');
  });

  /**
   * @desc    Unblock user (Admin only)
   * @route   PUT /api/users/:id/unblock
   * @access  Private/Admin
   */
  static unblockUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.id;
    if (!userId) {
      return ApiResponse.error(res, 'User ID is required', HTTP_STATUS_CODES.BAD_REQUEST);
    }
    const user = await UserService.unblockUser(userId);

    ApiResponse.success(res, { user }, 'User unblocked successfully');
  });

  /**
   * @desc    Update user role (Admin only)
   * @route   PUT /api/users/:id/role
   * @access  Private/Admin
   */
  static updateUserRole = asyncHandler(async (req: Request, res: Response) => {
    // Prevent admin from changing their own role
    if (req.params.id === req.user?.userId) {
      return ApiResponse.error(
        res,
        'You cannot change your own role',
        HTTP_STATUS_CODES.BAD_REQUEST,
      );
    }

    const { role } = req.body;
    const userId = req.params.id;
    if (!userId) {
      return ApiResponse.error(res, 'User ID is required', HTTP_STATUS_CODES.BAD_REQUEST);
    }
    const user = await UserService.updateUserRole(userId, role);

    ApiResponse.success(res, { user }, `User role updated to ${role} successfully`);
  });

  /**
   * @desc    Get user statistics (Admin only)
   * @route   GET /api/users/stats
   * @access  Private/Admin
   */
  static getUserStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await UserService.getUserStats();

    ApiResponse.success(res, { stats }, 'User statistics retrieved successfully');
  });

  /**
   * @desc    Search users (Admin only)
   * @route   GET /api/users/search
   * @access  Private/Admin
   */
  static searchUsers = asyncHandler(async (req: Request, res: Response) => {
    const users = await UserService.getAllUsers({
      ...req.query,
      search: req.query.q as string,
    });

    ApiResponse.success(res, users, 'Users search completed successfully');
  });
}
