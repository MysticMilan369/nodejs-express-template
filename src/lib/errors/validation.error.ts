import { AppError } from './app.error';
import { HTTP_STATUS_CODES } from '@/lib/constants';

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

export const createValidationError = (
  message: string,
  errors: ValidationErrorDetail[] = [],
): ValidationError => {
  return new ValidationError(message, errors);
};
