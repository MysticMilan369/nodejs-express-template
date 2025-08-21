import { Request, Response, NextFunction } from 'express';
import { JWTService } from '@/lib/jwt';
import { ApiResponse } from '@/utils/api-response.utils';
import { HTTP_STATUS_CODES } from '@/lib/constants';
import { User } from '@/models';

declare module 'express' {
  interface Request {
    user?: {
      userId: string;
      email: string;
      role: string;
      username: string;
    };
  }
}

export class AuthMiddleware {
  /**
   * Verify JWT token and authenticate user
   */
  static authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get token from header
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

      if (!token) {
        ApiResponse.error(res, 'Access token not provided', HTTP_STATUS_CODES.UNAUTHORIZED);
        return;
      }

      // Verify token
      const decoded = JWTService.verifyAccessToken(token);

      // Check if user still exists and is active
      const user = await User.findById(decoded.userId);
      if (!user) {
        ApiResponse.error(res, 'User no longer exists', HTTP_STATUS_CODES.UNAUTHORIZED);
        return;
      }

      if (!user.isActive) {
        ApiResponse.error(res, 'Account is deactivated', HTTP_STATUS_CODES.FORBIDDEN);
        return;
      }

      if (user.isBlocked) {
        ApiResponse.error(res, 'Account is blocked', HTTP_STATUS_CODES.FORBIDDEN);
        return;
      }

      // Attach user info to request
      req.user = {
        userId: decoded.userId,
        email: user.email,
        role: user.role,
        username: user.username,
      };

      next();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Authentication failed';
      ApiResponse.error(res, message, HTTP_STATUS_CODES.UNAUTHORIZED);
    }
  };

  /**
   * Optional authentication - doesn't fail if no token
   */
  static optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

      if (!token) {
        return next();
      }

      try {
        const decoded = JWTService.verifyAccessToken(token);
        const user = await User.findById(decoded.userId);

        if (user && user.isActive && !user.isBlocked) {
          req.user = {
            userId: decoded.userId,
            email: user.email,
            role: user.role,
            username: user.username,
          };
        }
      } catch {
        // Ignore token errors for optional auth
      }

      next();
    } catch {
      next();
    }
  };
}
