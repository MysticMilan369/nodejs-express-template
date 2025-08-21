import { HTTP_STATUS_CODES } from '@/lib/constants';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: string;

  constructor(
    message: string,
    statusCode: number = HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    isOperational: boolean = true,
  ) {
    super(message);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

export interface ValidationErrorDetail {
  path: string;
  message: string;
}

export class ValidationError extends AppError {
  public readonly details: ValidationErrorDetail[];

  constructor(message: string, details: ValidationErrorDetail[] = []) {
    super(message, HTTP_STATUS_CODES.BAD_REQUEST);
    this.name = 'ValidationError';
    this.details = details;
  }

  toJSON() {
    return {
      error: {
        name: this.name,
        message: this.message,
        status: this.statusCode,
        details: this.details,
      },
    };
  }
}

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

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, HTTP_STATUS_CODES.NOT_FOUND);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, HTTP_STATUS_CODES.CONFLICT);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, HTTP_STATUS_CODES.TOO_MANY_REQUESTS);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false);
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string = 'External service error') {
    super(message, HTTP_STATUS_CODES.SERVICE_UNAVAILABLE, false);
  }
}

export class FileUploadError extends AppError {
  constructor(message: string = 'File upload failed') {
    super(message, HTTP_STATUS_CODES.BAD_REQUEST);
  }
}

export class EmailError extends AppError {
  constructor(message: string = 'Email operation failed') {
    super(message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false);
  }
}

// Error factory functions
export const createAppError = (
  message: string,
  statusCode: number = HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
): AppError => {
  return new AppError(message, statusCode);
};

export const createValidationError = (
  message: string,
  errors: ValidationErrorDetail[] = [],
): ValidationError => {
  return new ValidationError(message, errors);
};

export const createAuthError = (message: string = 'Authentication failed'): AuthenticationError => {
  return new AuthenticationError(message);
};

export const createAuthzError = (message: string = 'Access denied'): AuthorizationError => {
  return new AuthorizationError(message);
};

export const createNotFoundError = (resource: string = 'Resource'): NotFoundError => {
  return new NotFoundError(`${resource} not found`);
};

export const createConflictError = (resource: string = 'Resource'): ConflictError => {
  return new ConflictError(`${resource} already exists`);
};
