import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { env } from '@/config/environment.config';
import { AppError, ValidationError } from '@/lib/errors';
import { ApiResponse } from '@/utils/api-response.utils';
import { HTTP_STATUS_CODES } from '@/lib/constants';

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  // Log error with context
  console.error(`Error ${req.method} ${req.originalUrl}: ${err.message}`, {
    error: err.stack,
    body: req.body,
    params: req.params,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Handle custom ValidationError
  if (err instanceof ValidationError) {
    const errorData = {
      type: 'ValidationError',
      details: err.details,
    };
    return ApiResponse.error(res, err.message, err.statusCode, errorData, err.stack);
  }

  // Handle AppError (custom application errors)
  if (err instanceof AppError) {
    const errorData = {
      type: 'AppError',
      isOperational: err.isOperational,
    };
    return ApiResponse.error(res, err.message, err.statusCode, errorData, err.stack);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const errorData = {
      type: 'CastError',
    };
    return ApiResponse.error(
      res,
      'Resource not found',
      HTTP_STATUS_CODES.NOT_FOUND,
      errorData,
      err.stack,
    );
  }

  // Mongoose duplicate key error
  interface MongooseDuplicateKeyError extends Error {
    code: number;
    keyValue: Record<string, unknown>;
  }

  const isDuplicateKeyError = (e: Error): e is MongooseDuplicateKeyError =>
    (e as MongooseDuplicateKeyError).code === 11000 &&
    typeof (e as MongooseDuplicateKeyError).keyValue === 'object';

  if (isDuplicateKeyError(err)) {
    const field = Object.keys(err.keyValue)[0];
    const value = field !== undefined ? err.keyValue[field] : undefined;
    const errorData = {
      type: 'DuplicateKeyError',
      field,
      value,
    };
    return ApiResponse.error(
      res,
      `${field ?? 'Field'} already exists`,
      HTTP_STATUS_CODES.CONFLICT,
      errorData,
      err.stack,
    );
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    interface MongooseValidationErrorItem {
      message: string;
      path: string;
      kind: string;
      value: unknown;
      [key: string]: unknown;
    }

    const mongooseError = err as unknown as {
      errors: Record<string, MongooseValidationErrorItem>;
    };

    // Format like your desired structure - array of {path, message}
    const validationDetails = Object.keys(mongooseError.errors).map((key) => {
      const error = mongooseError.errors[key];
      return {
        path: error?.path || key,
        message: error?.message || 'Validation failed',
      };
    });

    // Extract just the messages for the main error message
    const messages = validationDetails.map((detail) => detail.message);
    const combinedMessage = messages.join(', ');

    const errorData = {
      type: 'MongooseValidationError',
      details: validationDetails,
    };

    return ApiResponse.error(
      res,
      'Validation failed: ' + combinedMessage || 'Validation failed',
      HTTP_STATUS_CODES.BAD_REQUEST,
      errorData,
      err.stack,
    );
  }

  // Zod validation error
  if (err instanceof ZodError) {
    // Format like MongoDB structure - array of {path, message}
    const validationDetails = err.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));

    // Extract messages for the main error message (consistent with MongoDB handling)
    const messages = validationDetails.map((detail) => detail.message);
    const combinedMessage = messages.join(', ');

    const errorData = {
      type: 'ZodValidationError',
      details: validationDetails,
      issues: err.issues, // Keep original issues for debugging
    };

    return ApiResponse.error(
      res,
      'Validation failed: ' + combinedMessage || 'Validation failed',
      HTTP_STATUS_CODES.BAD_REQUEST,
      errorData,
      err.stack,
    );
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const errorData = {
      type: 'JsonWebTokenError',
    };
    return ApiResponse.error(
      res,
      'Invalid token',
      HTTP_STATUS_CODES.UNAUTHORIZED,
      errorData,
      err.stack,
    );
  }

  if (err.name === 'TokenExpiredError') {
    const errorData = {
      type: 'TokenExpiredError',
    };
    return ApiResponse.error(
      res,
      'Token expired',
      HTTP_STATUS_CODES.UNAUTHORIZED,
      errorData,
      err.stack,
    );
  }

  // Default to internal server error
  return ApiResponse.internalServerError(
    res,
    env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    { type: 'InternalServerError' },
    err.stack,
  );
};

export const notFoundHandler = (req: Request, res: Response): void => {
  ApiResponse.notFound(res, `Route ${req.originalUrl} not found`);
};
