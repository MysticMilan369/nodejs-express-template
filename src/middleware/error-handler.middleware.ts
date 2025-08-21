import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { env } from '@/config/environment.config';
import { AppError } from '@/lib/errors';
import { ApiErrorResponse } from '@/types';
export const globalErrorHandler = (err: Error, req: Request, res: Response): void => {
  let error = { ...err } as AppError;
  error.message = err.message;
  // Log error
  console.error(`Error ${req.method} ${req.originalUrl}: ${err.message}`, {
    error: err.stack,
    body: req.body,
    params: req.params,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });
  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new AppError(message, 404);
  }
  // Mongoose duplicate key
  interface MongooseDuplicateKeyError extends Error {
    code: number;
    keyValue: Record<string, unknown>;
  }
  const isDuplicateKeyError = (e: Error): e is MongooseDuplicateKeyError =>
    (e as MongooseDuplicateKeyError).code === 11000 &&
    typeof (e as MongooseDuplicateKeyError).keyValue === 'object';

  if (isDuplicateKeyError(err)) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    error = new AppError(message, 400);
  }
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    interface MongooseValidationErrorItem {
      message: string;
      [key: string]: unknown;
    }
    const message = Object.values(
      (err as unknown as { errors: Record<string, MongooseValidationErrorItem> }).errors,
    )
      .map((val: MongooseValidationErrorItem) => val.message)
      .join(', ');
    error = new AppError(message, 400);
  }
  // Zod validation error
  if (err instanceof ZodError) {
    const message = err.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    error = new AppError(message, 400);
  }
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token', 401);
  }
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expired', 401);
  }
  const response: ApiErrorResponse = {
    success: false,
    message: error.message || 'Internal server error',
    error:
      (error.isOperational ? error.message : 'Internal server error') || 'Internal server error',
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
  };
  // Include stack trace in development
  if (env.NODE_ENV === 'development') {
    response.stack = err.stack ?? '';
  }
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json(response);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  const response: ApiErrorResponse = {
    success: false,
    message: `Route ${req.originalUrl} not found`,
    error: 'Not Found',
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
  };
  res.status(404).json(response);
};
