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

// Error factory function
export const createAppError = (
  message: string,
  statusCode: number = HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
): AppError => {
  return new AppError(message, statusCode);
};
