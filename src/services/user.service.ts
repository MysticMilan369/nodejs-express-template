interface CreatedAtFilter {
  $gte?: Date;
  $lte?: Date;
}
import bcrypt from 'bcryptjs';
import { User } from '@/models';
import { IUser, IUserUpdate, IUserCreate, IUserPublic } from '@/models';
import { AppError } from '@/lib/errors';
import { HTTP_STATUS_CODES } from '@/lib/constants';
import { IPaginationQuery, IPaginatedResponse } from '@/types';
import { PaginationService } from '@/lib/pagination';
import { logger } from '@/lib/logger';
import { config } from '@/config';

export class UserService {
  static async getAllUsers(query: IPaginationQuery): Promise<IPaginatedResponse<IUserPublic>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search,
        role,
        isActive,
        emailVerified,
        onboardingCompleted,
        startDate,
        endDate,
      } = query;

      // Build filter object
      const filter: Record<string, unknown> = {};

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      if (role) {
        filter.role = role;
      }

      if (isActive !== undefined) {
        filter.isActive = isActive;
      }

      if (emailVerified !== undefined) {
        filter.emailVerified = emailVerified;
      }

      if (onboardingCompleted !== undefined) {
        filter.onboardingCompleted = onboardingCompleted;
      }

      // Add date range filtering if provided
      if (startDate || endDate) {
        const createdAtFilter: CreatedAtFilter = {};
        if (startDate && typeof startDate === 'string') {
          createdAtFilter.$gte = new Date(startDate);
        }
        if (endDate && typeof endDate === 'string') {
          createdAtFilter.$lte = new Date(endDate);
        }
        filter.createdAt = createdAtFilter;
      }

      const result = await PaginationService.paginate<IUser>(User, filter, {
        page: Number(page),
        limit: Number(limit),
        sortBy,
        sortOrder,
        select: '-passwordHash -refreshTokens -__v',
      });

      // Transform the users to IUserPublic
      const transformedData = result.data.map((user) => user.toPublicJSON() as IUserPublic);

      return {
        data: transformedData,
        meta: result.meta,
      };
    } catch (error) {
      logger.error('Get all users error:', error);
      throw error;
    }
  }

  static async getUserById(userId: string): Promise<IUserPublic> {
    try {
      const user = await User.findById(userId).select('-passwordHash -refreshTokens -__v');

      if (!user) {
        throw new AppError('User not found', HTTP_STATUS_CODES.NOT_FOUND);
      }

      return user.toPublicJSON() as IUserPublic;
    } catch (error) {
      logger.error('Get user by ID error:', error);
      throw error;
    }
  }

  static async updateUser(userId: string, updateData: IUserUpdate): Promise<IUserPublic> {
    try {
      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', HTTP_STATUS_CODES.NOT_FOUND);
      }

      // Check for duplicate email or username if being updated
      if (updateData.email || updateData.username) {
        const duplicateQuery: Record<string, unknown> = { _id: { $ne: userId } };
        const orConditions = [];

        if (updateData.email) {
          orConditions.push({ email: updateData.email.toLowerCase() });
        }
        if (updateData.username) {
          orConditions.push({ username: updateData.username.toLowerCase() });
        }

        duplicateQuery.$or = orConditions;

        const existingUser = await User.findOne(duplicateQuery);
        if (existingUser) {
          if (existingUser.email === updateData.email?.toLowerCase()) {
            throw new AppError('Email already exists', HTTP_STATUS_CODES.CONFLICT);
          }
          if (existingUser.username === updateData.username?.toLowerCase()) {
            throw new AppError('Username already exists', HTTP_STATUS_CODES.CONFLICT);
          }
        }
      }

      // Prepare update data
      const updateFields: Record<string, unknown> = { ...updateData };
      if (updateData.email) {
        updateFields.email = updateData.email.toLowerCase();
      }
      if (updateData.username) {
        updateFields.username = updateData.username.toLowerCase();
      }

      // Update user
      const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
        new: true,
        runValidators: true,
      }).select('-passwordHash -refreshTokens -__v');

      if (!updatedUser) {
        throw new AppError('Failed to update user', HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
      }

      logger.info(`User updated: ${updatedUser.email}`, {
        userId: updatedUser._id,
      });

      return updatedUser.toPublicJSON() as IUserPublic;
    } catch (error) {
      logger.error('Update user error:', error);
      throw error;
    }
  }

  static async updateUserProfile(
    userId: string,
    updateData: Partial<IUserUpdate>,
  ): Promise<IUserPublic> {
    try {
      // Restrict profile updates to certain fields only
      const allowedFields = ['name', 'username'];
      const profileUpdateData: Record<string, unknown> = {};

      Object.keys(updateData).forEach((key) => {
        if (allowedFields.includes(key)) {
          profileUpdateData[key] = updateData[key as keyof IUserUpdate];
        }
      });

      if (Object.keys(profileUpdateData).length === 0) {
        throw new AppError('No valid fields provided for update', HTTP_STATUS_CODES.BAD_REQUEST);
      }

      return await this.updateUser(userId, profileUpdateData);
    } catch (error) {
      logger.error('Update user profile error:', error);
      throw error;
    }
  }

  static async deleteUser(userId: string): Promise<{ message: string }> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', HTTP_STATUS_CODES.NOT_FOUND);
      }

      await User.findByIdAndDelete(userId);

      logger.info(`User deleted: ${user.email}`, { userId: user._id });

      return { message: 'User deleted successfully' };
    } catch (error) {
      logger.error('Delete user error:', error);
      throw error;
    }
  }

  static async deactivateUser(userId: string): Promise<IUserPublic> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', HTTP_STATUS_CODES.NOT_FOUND);
      }

      if (!user.isActive) {
        throw new AppError('User is already deactivated', HTTP_STATUS_CODES.BAD_REQUEST);
      }

      user.isActive = false;
      user.refreshTokens = []; // Clear all refresh tokens
      await user.save();

      logger.info(`User deactivated: ${user.email}`, { userId: user._id });

      return user.toPublicJSON() as IUserPublic;
    } catch (error) {
      logger.error('Deactivate user error:', error);
      throw error;
    }
  }

  static async activateUser(userId: string): Promise<IUserPublic> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', HTTP_STATUS_CODES.NOT_FOUND);
      }

      if (user.isActive) {
        throw new AppError('User is already active', HTTP_STATUS_CODES.BAD_REQUEST);
      }

      user.isActive = true;
      await user.save();

      logger.info(`User activated: ${user.email}`, { userId: user._id });

      return user.toPublicJSON() as IUserPublic;
    } catch (error) {
      logger.error('Activate user error:', error);
      throw error;
    }
  }

  static async blockUser(userId: string): Promise<IUserPublic> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', HTTP_STATUS_CODES.NOT_FOUND);
      }

      if (user.isBlocked) {
        throw new AppError('User is already blocked', HTTP_STATUS_CODES.BAD_REQUEST);
      }

      user.isBlocked = true;
      user.refreshTokens = []; // Clear all refresh tokens
      await user.save();

      logger.info(`User blocked: ${user.email}`, { userId: user._id });

      return user.toPublicJSON() as IUserPublic;
    } catch (error) {
      logger.error('Block user error:', error);
      throw error;
    }
  }

  static async unblockUser(userId: string): Promise<IUserPublic> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', HTTP_STATUS_CODES.NOT_FOUND);
      }

      if (!user.isBlocked) {
        throw new AppError('User is not blocked', HTTP_STATUS_CODES.BAD_REQUEST);
      }

      user.isBlocked = false;
      await user.save();

      logger.info(`User unblocked: ${user.email}`, { userId: user._id });

      return user.toPublicJSON() as IUserPublic;
    } catch (error) {
      logger.error('Unblock user error:', error);
      throw error;
    }
  }

  static async updateUserRole(userId: string, newRole: 'admin' | 'user'): Promise<IUserPublic> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', HTTP_STATUS_CODES.NOT_FOUND);
      }

      if (user.role === newRole) {
        throw new AppError(`User already has ${newRole} role`, HTTP_STATUS_CODES.BAD_REQUEST);
      }

      user.role = newRole;
      await user.save();

      logger.info(`User role updated to ${newRole}: ${user.email}`, {
        userId: user._id,
      });

      return user.toPublicJSON() as IUserPublic;
    } catch (error) {
      logger.error('Update user role error:', error);
      throw error;
    }
  }

  static async createUser(userData: IUserCreate): Promise<IUserPublic> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [
          { email: userData.email.toLowerCase() },
          { username: userData.username.toLowerCase() },
        ],
      });

      if (existingUser) {
        if (existingUser.email === userData.email.toLowerCase()) {
          throw new AppError('User with this email already exists', HTTP_STATUS_CODES.CONFLICT);
        }
        throw new AppError('User with this username already exists', HTTP_STATUS_CODES.CONFLICT);
      }

      // Hash password
      const saltRounds = parseInt(config.security.bcryptSaltRounds.toString());
      const passwordHash = await bcrypt.hash(userData.password, saltRounds);

      // Create user
      const user = new User({
        ...userData,
        email: userData.email.toLowerCase(),
        username: userData.username.toLowerCase(),
        passwordHash,
        emailVerified: userData.emailVerified || false,
        isActive: userData.isActive !== undefined ? userData.isActive : true,
        onboardingCompleted: userData.onboardingCompleted || false,
      });

      await user.save();

      logger.info(`New user created by admin: ${user.email}`, {
        userId: user._id,
      });

      return user.toPublicJSON() as IUserPublic;
    } catch (error) {
      logger.error('Create user error:', error);
      throw error;
    }
  }

  static async searchUsers(searchCriteria: {
    email?: string;
    username?: string;
    role?: string;
    isActive?: boolean;
    emailVerified?: boolean;
    onboardingCompleted?: boolean;
  }): Promise<IUserPublic[]> {
    try {
      const query: Record<string, unknown> = {};

      if (searchCriteria.email) {
        query.email = { $regex: searchCriteria.email, $options: 'i' };
      }

      if (searchCriteria.username) {
        query.username = { $regex: searchCriteria.username, $options: 'i' };
      }

      if (searchCriteria.role) {
        query.role = searchCriteria.role;
      }

      if (searchCriteria.isActive !== undefined) {
        query.isActive = searchCriteria.isActive;
      }

      if (searchCriteria.emailVerified !== undefined) {
        query.emailVerified = searchCriteria.emailVerified;
      }

      if (searchCriteria.onboardingCompleted !== undefined) {
        query.onboardingCompleted = searchCriteria.onboardingCompleted;
      }

      const users = await User.find(query).select('-passwordHash -refreshTokens -__v').limit(100); // Limit to prevent large result sets

      return users.map((user) => user.toPublicJSON() as IUserPublic);
    } catch (error) {
      logger.error('Search users error:', error);
      throw error;
    }
  }

  static async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    blockedUsers: number;
    verifiedUsers: number;
    adminUsers: number;
    regularUsers: number;
  }> {
    try {
      const [
        totalUsers,
        activeUsers,
        inactiveUsers,
        blockedUsers,
        verifiedUsers,
        adminUsers,
        regularUsers,
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isActive: true }),
        User.countDocuments({ isActive: false }),
        User.countDocuments({ isBlocked: true }),
        User.countDocuments({ emailVerified: true }),
        User.countDocuments({ role: 'admin' }),
        User.countDocuments({ role: 'user' }),
      ]);

      return {
        totalUsers,
        activeUsers,
        inactiveUsers,
        blockedUsers,
        verifiedUsers,
        adminUsers,
        regularUsers,
      };
    } catch (error) {
      logger.error('Get user stats error:', error);
      throw error;
    }
  }
}
