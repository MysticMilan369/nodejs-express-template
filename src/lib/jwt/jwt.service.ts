import jwt, { Secret } from 'jsonwebtoken';
import { AppError } from '@/lib/errors';
import { HTTP_STATUS_CODES } from '@/lib/constants';
import { config } from '@/config';

export interface JWTPayload {
  userId: string;
  email?: string;
  role?: string;
  username?: string;
  exp?: number;
}

export interface RefreshTokenPayload {
  userId: string;
  exp?: number;
}

export class JWTService {
  private static readonly ACCESS_TOKEN_SECRET = config.jwt.secret || 'fallback-secret';
  private static readonly REFRESH_TOKEN_SECRET =
    config.jwt.refreshSecret || 'fallback-refresh-secret';
  private static readonly ACCESS_TOKEN_EXPIRES = config.jwt.expiresIn || '15m';
  private static readonly REFRESH_TOKEN_EXPIRES = config.jwt.refreshExpiresIn || '30d';

  /**
   * Generate access token
   */
  static generateAccessToken(payload: JWTPayload): string {
    try {
      const expiresIn = JWTService.ACCESS_TOKEN_EXPIRES ?? '15m';
      const options: jwt.SignOptions = {
        expiresIn: expiresIn as unknown as number,
        issuer: 'user-management-api',
        audience: 'user-management-client',
        subject: payload.userId,
      };
      return jwt.sign(payload, JWTService.ACCESS_TOKEN_SECRET, options);
    } catch {
      throw new AppError(
        'Failed to generate access token',
        HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(payload: RefreshTokenPayload): string {
    try {
      const expiresIn = JWTService.REFRESH_TOKEN_EXPIRES ?? '30d';
      const options: jwt.SignOptions = {
        expiresIn: expiresIn as unknown as number,
        issuer: 'user-management-api',
        audience: 'user-management-client',
        subject: payload.userId,
      };
      return jwt.sign(payload, this.REFRESH_TOKEN_SECRET as Secret, options);
    } catch {
      throw new AppError(
        'Failed to generate refresh token',
        HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.ACCESS_TOKEN_SECRET, {
        issuer: 'user-management-api',
        audience: 'user-management-client',
      }) as JWTPayload;

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('Access token expired', HTTP_STATUS_CODES.UNAUTHORIZED);
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError('Invalid access token', HTTP_STATUS_CODES.UNAUTHORIZED);
      }
      throw new AppError('Token verification failed', HTTP_STATUS_CODES.UNAUTHORIZED);
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      const decoded = jwt.verify(token, this.REFRESH_TOKEN_SECRET, {
        issuer: 'user-management-api',
        audience: 'user-management-client',
      }) as RefreshTokenPayload;

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('Refresh token expired', HTTP_STATUS_CODES.UNAUTHORIZED);
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError('Invalid refresh token', HTTP_STATUS_CODES.UNAUTHORIZED);
      }
      throw new AppError('Refresh token verification failed', HTTP_STATUS_CODES.UNAUTHORIZED);
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  static decodeToken(token: string): JWTPayload | RefreshTokenPayload | null {
    try {
      return jwt.decode(token) as JWTPayload | RefreshTokenPayload | null;
    } catch {
      throw new AppError('Failed to decode token', HTTP_STATUS_CODES.BAD_REQUEST);
    }
  }

  /**
   * Get token expiry date
   */
  static getTokenExpiry(token: string): Date | null {
    try {
      const decoded = this.decodeToken(token);
      if (decoded && decoded.exp) {
        return new Date(decoded.exp * 1000);
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    try {
      const expiry = this.getTokenExpiry(token);
      if (!expiry) return true;
      return expiry.getTime() < Date.now();
    } catch {
      return true;
    }
  }
}
