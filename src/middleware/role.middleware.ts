import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@/utils/api-response.utils';
import { HTTP_STATUS_CODES } from '@/lib/constants';
import { USER_ROLES } from '@/lib/constants';

export class RoleMiddleware {
  /**
   * Check if user has required role
   */
  static requireRole = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        ApiResponse.error(res, 'Authentication required', HTTP_STATUS_CODES.UNAUTHORIZED);
        return;
      }

      if (!roles.includes(req.user.role)) {
        ApiResponse.error(
          res,
          'Insufficient permissions. Required role(s): ' + roles.join(', '),
          HTTP_STATUS_CODES.FORBIDDEN,
        );
        return;
      }

      next();
    };
  };

  /**
   * Require admin role
   */
  static requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
    RoleMiddleware.requireRole(USER_ROLES.ADMIN)(req, res, next);
  };

  /**
   * Require user role or higher
   */
  static requireUser = (req: Request, res: Response, next: NextFunction): void => {
    RoleMiddleware.requireRole(USER_ROLES.USER, USER_ROLES.ADMIN)(req, res, next);
  };

  /**
   * Check if user can access their own resource or is admin
   */
  static requireOwnershipOrAdmin = (userIdParam: string = 'id') => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        ApiResponse.error(res, 'Authentication required', HTTP_STATUS_CODES.UNAUTHORIZED);
        return;
      }

      const requestedUserId = req.params[userIdParam];
      const currentUserId = req.user.userId;
      const isAdmin = req.user.role === USER_ROLES.ADMIN;

      // Allow if admin or owner
      if (isAdmin || requestedUserId === currentUserId) {
        next();
        return;
      }

      ApiResponse.error(
        res,
        'Access denied. You can only access your own resources',
        HTTP_STATUS_CODES.FORBIDDEN,
      );
    };
  };

  /**
   * Check if user is admin or accessing their own profile
   */
  static requireSelfOrAdmin = (req: Request, res: Response, next: NextFunction): void => {
    RoleMiddleware.requireOwnershipOrAdmin('id')(req, res, next);
  };

  /**
   * Prevent users from modifying admin accounts (unless they are admin themselves)
   */
  static preventAdminModification = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        ApiResponse.error(res, 'Authentication required', HTTP_STATUS_CODES.UNAUTHORIZED);
        return;
      }

      // If current user is admin, allow all operations
      if (req.user.role === USER_ROLES.ADMIN) {
        next();
        return;
      }

      const targetUserId = req.params.id;

      // Import User model dynamically to avoid circular dependency
      const { User } = await import('@/models');
      const targetUser = await User.findById(targetUserId);

      if (!targetUser) {
        ApiResponse.error(res, 'User not found', HTTP_STATUS_CODES.NOT_FOUND);
        return;
      }

      // Prevent non-admin users from modifying admin accounts
      if (targetUser.role === USER_ROLES.ADMIN) {
        ApiResponse.error(res, 'You cannot modify admin accounts', HTTP_STATUS_CODES.FORBIDDEN);
        return;
      }

      next();
    } catch {
      ApiResponse.error(
        res,
        'Error checking user permissions',
        HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      );
    }
  };

  /**
   * Check multiple roles with AND logic
   */
  static requireAllRoles = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        ApiResponse.error(res, 'Authentication required', HTTP_STATUS_CODES.UNAUTHORIZED);
        return;
      }

      const hasAllRoles = roles.every((role) => req.user?.role === role);

      if (!hasAllRoles) {
        ApiResponse.error(
          res,
          'Insufficient permissions. All required roles: ' + roles.join(', '),
          HTTP_STATUS_CODES.FORBIDDEN,
        );
        return;
      }

      next();
    };
  };

  /**
   * Dynamic role check based on request context
   */
  static dynamicRoleCheck = (getRoles: (req: Request) => string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      const requiredRoles = getRoles(req);
      RoleMiddleware.requireRole(...requiredRoles)(req, res, next);
    };
  };
}
