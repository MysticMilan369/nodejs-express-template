import bcrypt from 'bcryptjs';
import { User } from '@/models';
import {
  IUser,
  IUserCreate,
  IUserLogin,
  IUserChangePassword,
  IAuthResponse,
  IAuthTokens,
  IUserPublic,
} from '@/models';
import { JWTService } from '@/lib/jwt';
import { AppError } from '@/lib/errors';
import { HTTP_STATUS_CODES } from '@/lib/constants';
import dayjs from 'dayjs';
import { logger } from '@/lib/logger';
import { config } from '@/config';

export class AuthService {
  static async register(userData: IUserCreate): Promise<IAuthResponse> {
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

      // Generate tokens
      const tokens = await this.generateTokens(user);

      logger.info(`New user registered: ${user.email}`, { userId: user._id });

      return {
        user: user.toPublicJSON() as IUserPublic,
        tokens,
        message: 'User registered successfully',
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  static async login(loginData: IUserLogin): Promise<IAuthResponse> {
    try {
      const { identifier, password } = loginData;

      // Find user by email or username
      const user = await User.findOne({
        $or: [{ email: identifier.toLowerCase() }, { username: identifier.toLowerCase() }],
      });

      if (!user) {
        throw new AppError('Invalid credentials', HTTP_STATUS_CODES.UNAUTHORIZED);
      }

      // Check if user is active
      if (!user.isActive) {
        throw new AppError(
          'Account is deactivated. Please contact support',
          HTTP_STATUS_CODES.FORBIDDEN,
        );
      }

      // Check if user is blocked
      if (user.isBlocked) {
        throw new AppError(
          'Account is blocked. Please contact support',
          HTTP_STATUS_CODES.FORBIDDEN,
        );
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new AppError('Invalid credentials', HTTP_STATUS_CODES.UNAUTHORIZED);
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate tokens
      const tokens = await this.generateTokens(user);

      logger.info(`User logged in: ${user.email}`, { userId: user._id });

      return {
        user: user.toPublicJSON() as IUserPublic,
        tokens,
        message: 'Login successful',
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  static async refreshToken(refreshToken: string): Promise<IAuthTokens> {
    try {
      // Verify refresh token
      const decoded = JWTService.verifyRefreshToken(refreshToken);

      // Find user
      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new AppError('Invalid refresh token', HTTP_STATUS_CODES.UNAUTHORIZED);
      }

      // Check if refresh token exists in user's tokens
      if (!user.isValidRefreshToken(refreshToken)) {
        throw new AppError('Invalid refresh token', HTTP_STATUS_CODES.UNAUTHORIZED);
      }

      // Check if user is active
      if (!user.isActive) {
        throw new AppError('Account is deactivated', HTTP_STATUS_CODES.FORBIDDEN);
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      // Remove old refresh token and add new one
      user.removeRefreshToken(refreshToken);
      await user.save();

      logger.info(`Token refreshed for user: ${user.email}`, {
        userId: user._id,
      });

      return tokens;
    } catch (error) {
      logger.error('Token refresh error:', error);
      throw error;
    }
  }

  static async logout(userId: string, refreshToken: string): Promise<{ message: string }> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', HTTP_STATUS_CODES.NOT_FOUND);
      }

      // Remove refresh token
      user.removeRefreshToken(refreshToken);
      await user.save();

      logger.info(`User logged out: ${user.email}`, { userId: user._id });

      return { message: 'Logout successful' };
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  }

  static async changePassword(
    userId: string,
    passwordData: IUserChangePassword,
  ): Promise<{ message: string }> {
    try {
      const { currentPassword, newPassword, confirmPassword } = passwordData;

      // Validate new password confirmation
      if (newPassword !== confirmPassword) {
        throw new AppError(
          'New password and confirmation do not match',
          HTTP_STATUS_CODES.BAD_REQUEST,
        );
      }

      // Find user
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', HTTP_STATUS_CODES.NOT_FOUND);
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isCurrentPasswordValid) {
        throw new AppError('Current password is incorrect', HTTP_STATUS_CODES.UNAUTHORIZED);
      }

      // Hash new password
      const saltRounds = parseInt(config.security.bcryptSaltRounds.toString());
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      user.passwordHash = newPasswordHash;

      // Clear all refresh tokens to force re-login on all devices
      user.refreshTokens = [];

      await user.save();

      logger.info(`Password changed for user: ${user.email}`, {
        userId: user._id,
      });

      return { message: 'Password changed successfully' };
    } catch (error) {
      logger.error('Change password error:', error);
      throw error;
    }
  }

  static async getProfile(userId: string): Promise<IUserPublic> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', HTTP_STATUS_CODES.NOT_FOUND);
      }

      return user.toPublicJSON() as IUserPublic;
    } catch (error) {
      logger.error('Get profile error:', error);
      throw error;
    }
  }

  private static async generateTokens(user: IUser): Promise<IAuthTokens> {
    const accessToken = JWTService.generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      username: user.username,
    });

    const refreshToken = JWTService.generateRefreshToken({
      userId: user._id.toString(),
    });

    // Add refresh token to user
    const refreshTokenExpiry = dayjs().add(30, 'days').toDate();
    user.addRefreshToken(refreshToken, refreshTokenExpiry);
    await user.save();

    return {
      accessToken,
      refreshToken,
    };
  }
}
