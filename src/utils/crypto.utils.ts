import bcrypt from 'bcryptjs';
import { config } from '@/config';
import crypto from 'crypto';

/**
 * Compare a plain text password with a hashed password
 */
export async function comparePassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Hash a password for storage in database
 */

export async function hashPassword(password: string) {
  const saltRounds = parseInt(config.security.bcryptSaltRounds.toString());
  return bcrypt.hash(password, saltRounds);
}

/**
 * Generate a secure random token for email verification or password reset
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate a verification token with expiry
 */
export function generateVerificationToken(): {
  token: string;
  hashedToken: string;
  expiresAt: Date;
} {
  const token = generateSecureToken();
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + config.security.emailVerificationExpires);

  return { token, hashedToken, expiresAt };
}

/**
 * Generate a password reset token with shorter expiry
 */
export function generatePasswordResetToken(): {
  token: string;
  hashedToken: string;
  expiresAt: Date;
} {
  const token = generateSecureToken();
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + config.security.passwordResetExpires);

  return { token, hashedToken, expiresAt };
}

/**
 * Hash a token for storage in database
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Verify if a token matches the hashed version
 */
export function verifyToken(token: string, hashedToken: string): boolean {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  return tokenHash === hashedToken;
}
