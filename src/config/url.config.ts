import { Request } from 'express';
import { env } from './environment.config';

export interface AuthUrls {
  emailVerification: string;
  passwordReset: string;
  passwordResetSuccess: string;
  emailVerificationSuccess: string;
  loginRedirect: string;
}

export class UrlConfig {
  private static getBaseUrl(req?: Request): string {
    // Option 1: Use environment variable (recommended for production)
    if (env.FRONTEND_BASE_URL) {
      return env.FRONTEND_BASE_URL;
    }

    // Option 2: Dynamically get from request (fallback)
    if (req) {
      const protocol = req.secure ? 'https' : 'http';
      const host = req.get('host') || 'localhost:3000';
      return `${protocol}://${host}`;
    }

    // Option 3: Default fallback
    return env.NODE_ENV === 'production' ? 'https://yourdomain.com' : 'http://localhost:3000';
  }

  public static getAuthUrls(req?: Request): AuthUrls {
    const baseUrl = this.getBaseUrl(req);

    return {
      emailVerification: `${baseUrl}/auth/verify-email`,
      passwordReset: `${baseUrl}/auth/reset-password`,
      passwordResetSuccess: `${baseUrl}/auth/reset-success`,
      emailVerificationSuccess: `${baseUrl}/auth/verification-success`,
      loginRedirect: `${baseUrl}/auth/login`,
    };
  }

  public static getVerificationUrl(token: string, req?: Request): string {
    const urls = this.getAuthUrls(req);
    return `${urls.emailVerification}?token=${token}`;
  }

  public static getPasswordResetUrl(token: string, req?: Request): string {
    const urls = this.getAuthUrls(req);
    return `${urls.passwordReset}?token=${token}`;
  }

  public static getFrontendBaseUrl(req?: Request): string {
    return this.getBaseUrl(req);
  }
}

// Constants for internal API paths
export const API_PATHS = {
  AUTH: {
    VERIFY_EMAIL: '/api/auth/verify-email',
    RESET_PASSWORD: '/api/auth/reset-password',
    CONFIRM_RESET: '/api/auth/confirm-reset-password',
    RESEND_VERIFICATION: '/api/auth/resend-verification',
  },
} as const;
