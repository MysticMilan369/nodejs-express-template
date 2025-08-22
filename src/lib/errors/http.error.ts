import { AppError } from './app.error';
import { HTTP_STATUS_CODES } from '@/lib/constants';

// Resource Errors
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

// Service Errors
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

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, HTTP_STATUS_CODES.TOO_MANY_REQUESTS);
  }
}

export class EmailError extends AppError {
  constructor(message: string = 'Email operation failed') {
    super(message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false);
  }
}

export class FileUploadError extends AppError {
  constructor(message: string = 'File upload failed') {
    super(message, HTTP_STATUS_CODES.BAD_REQUEST);
  }
}

// Factory Functions
export const createNotFoundError = (resource: string = 'Resource'): NotFoundError => {
  return new NotFoundError(`${resource} not found`);
};

export const createConflictError = (resource: string = 'Resource'): ConflictError => {
  return new ConflictError(`${resource} already exists`);
};
