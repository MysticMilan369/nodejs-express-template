import { AppError } from './app.error';
import { HTTP_STATUS_CODES } from '@/lib/constants';

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, HTTP_STATUS_CODES.UNAUTHORIZED);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, HTTP_STATUS_CODES.FORBIDDEN);
  }
}

export const createAuthError = (message: string = 'Authentication failed'): AuthenticationError => {
  return new AuthenticationError(message);
};

export const createAuthzError = (message: string = 'Access denied'): AuthorizationError => {
  return new AuthorizationError(message);
};
