import { IResetPasswordRequest, User } from '@/models';
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
import {
  hashPassword,
  comparePassword,
  hashToken,
  generatePasswordResetToken,
} from '@/utils/crypto.utils';
import { generateVerificationToken } from '@/utils/crypto.utils';
import { emailService } from '@/lib/email/email.service';
import { UrlConfig } from '@/config/url.config';

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
      const passwordHash = await hashPassword(userData.password);

      const { token, hashedToken, expiresAt } = generateVerificationToken();

      // Create user
      const user = new User({
        ...userData,
        email: userData.email.toLowerCase(),
        username: userData.username.toLowerCase(),
        passwordHash,
        emailVerified: userData.emailVerified || false,
        isActive: userData.isActive !== undefined ? userData.isActive : true,
        onboardingCompleted: userData.onboardingCompleted || false,
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: expiresAt,
      });

      await user.save();

      const emailSent = await emailService.sendVerificationEmail(
        user.email,
        UrlConfig.getVerificationUrl(token),
      );

      // Generate tokens
      const tokens = await this.generateTokens(user);

      if (emailSent) {
        logger.info(`New user registered and verification email sent: ${user.email}`, {
          userId: user._id,
        });
        return {
          user: user.toPublicJSON() as IUserPublic,
          tokens,
          message: 'User registered successfully. Verification email sent.',
        };
      } else {
        logger.warn(`User registered but verification email failed: ${user.email}`, {
          userId: user._id,
        });
        return {
          user: user.toPublicJSON() as IUserPublic,
          tokens,
          message: 'User registered successfully, but verification email could not be sent.',
        };
      }
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

      if (!user.emailVerified) {
        throw new AppError('Email not verified', HTTP_STATUS_CODES.FORBIDDEN);
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
      const isPasswordValid = await comparePassword(password, user.passwordHash);
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
      const { currentPassword, newPassword } = passwordData;
      // Find user
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', HTTP_STATUS_CODES.NOT_FOUND);
      }

      // Verify current password
      const isCurrentPasswordValid = await comparePassword(currentPassword, user.passwordHash);
      if (!isCurrentPasswordValid) {
        throw new AppError('Current password is incorrect', HTTP_STATUS_CODES.UNAUTHORIZED);
      }

      // Hash new password
      const newPasswordHash = await hashPassword(newPassword);

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

  static async verifyEmail(token: string): Promise<{ message: string }> {
    try {
      const hashedToken = hashToken(token);

      const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: { $gt: new Date() },
      });

      if (!user) {
        throw new AppError(
          'Invalid or expired verification token. Please request a new verification email.',
          HTTP_STATUS_CODES.NOT_FOUND,
        );
      }

      user.emailVerified = true;
      user.emailVerificationExpiry = null;
      user.emailVerificationToken = null;
      await user.save();

      logger.info(`Email verified for user: ${user.email}`, {
        userId: user._id,
      });

      return { message: 'Email verified successfully' };
    } catch (error) {
      logger.error('Email verification error:', error);
      throw error;
    }
  }

  static async verifyResetToken(token: string): Promise<IUserPublic> {
    try {
      const hashedToken = hashToken(token);

      const user = await User.findOne({
        resetToken: hashedToken,
        resetTokenExpiry: { $gt: new Date() },
      });

      if (!user) {
        throw new AppError('Invalid or expired reset token', HTTP_STATUS_CODES.NOT_FOUND);
      }

      return user.toPublicJSON() as IUserPublic;
    } catch (error) {
      logger.error('Verify reset token error:', error);
      throw error;
    }
  }

  static async resendVerification(email: string): Promise<{ message: string }> {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        throw new AppError('User not found with this email.', HTTP_STATUS_CODES.NOT_FOUND);
      }

      if (user.emailVerified) {
        throw new AppError('Email is already verified.', HTTP_STATUS_CODES.BAD_REQUEST);
      }

      const { token, hashedToken, expiresAt } = generateVerificationToken();
      user.emailVerificationToken = hashedToken;
      user.emailVerificationExpiry = expiresAt;
      await user.save();

      const emailSent = await emailService.sendVerificationEmail(
        email,
        UrlConfig.getVerificationUrl(token),
      );

      if (!emailSent) {
        throw new AppError(
          'Failed to send verification email.',
          HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        );
      }

      return { message: 'Verification email resent successfully.' };
    } catch (error) {
      logger.error('Resend verification error:', error);
      throw error;
    }
  }

  static async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        throw new AppError('User not found with this email.', HTTP_STATUS_CODES.NOT_FOUND);
      }

      const { token, hashedToken, expiresAt } = generatePasswordResetToken();
      user.resetToken = hashedToken;
      user.resetTokenExpiry = expiresAt;
      await user.save();

      const emailSent = await emailService.sendPasswordResetEmail(
        email,
        UrlConfig.getPasswordResetUrl(token),
      );

      if (!emailSent) {
        throw new AppError(
          'Failed to send password reset email.',
          HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        );
      }
      return { message: 'Password reset email sent successfully.' };
    } catch (error) {
      logger.error('Forgot password error:', error);
      throw error;
    }
  }

  static async resetPassword(
    resetPasswordData: IResetPasswordRequest,
  ): Promise<{ message: string }> {
    try {
      const { token, password } = resetPasswordData;

      const hashedToken = hashToken(token);

      const user = await User.findOne({
        resetToken: hashedToken,
        resetTokenExpiry: { $gt: new Date() },
      });
      if (!user) {
        throw new AppError('Invalid or expired reset token', HTTP_STATUS_CODES.NOT_FOUND);
      }

      user.passwordHash = await hashPassword(password);
      user.resetToken = null;
      user.resetTokenExpiry = null;
      await user.save();

      logger.info(`Password reset for user: ${user.email}`, {
        userId: user._id,
      });

      return { message: 'Password reset successfully' };
    } catch (error) {
      logger.error('Reset password error:', error);
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
