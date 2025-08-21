import { Response } from 'express';
import { HTTP_STATUS_CODES } from '@/lib/constants';

export interface ApiResponseData {
  success: boolean;
  message: string;
  data?: unknown;
  error?: unknown;
  timestamp: string;
  statusCode: number;
}

export class ApiResponse {
  /**
   * Send successful response
   */
  static success(
    res: Response,
    data: unknown = null,
    message: string = 'Operation successful',
    statusCode: number = HTTP_STATUS_CODES.OK,
  ): void {
    const response: ApiResponseData = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
      statusCode,
    };

    res.status(statusCode).json(response);
  }

  /**
   * Send error response
   */
  static error(
    res: Response,
    message: string = 'Something went wrong',
    statusCode: number = HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    error: unknown = null,
  ): void {
    const response: ApiResponseData = {
      success: false,
      message,
      error,
      timestamp: new Date().toISOString(),
      statusCode,
    };

    res.status(statusCode).json(response);
  }

  /**
   * Send validation error response
   */
  static validationError(
    res: Response,
    errors: Record<string, unknown>,
    message: string = 'Validation failed',
  ): void {
    const response: ApiResponseData = {
      success: false,
      message,
      error: {
        type: 'ValidationError',
        details: errors,
      },
      timestamp: new Date().toISOString(),
      statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
    };

    res.status(HTTP_STATUS_CODES.BAD_REQUEST).json(response);
  }

  /**
   * Send paginated response
   */
  static paginated(
    res: Response,
    data: unknown,
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    },
    message: string = 'Data retrieved successfully',
  ): void {
    const response = {
      success: true,
      message,
      data,
      pagination,
      timestamp: new Date().toISOString(),
      statusCode: HTTP_STATUS_CODES.OK,
    };

    res.status(HTTP_STATUS_CODES.OK).json(response);
  }

  /**
   * Send created response
   */
  static created(
    res: Response,
    data: unknown = null,
    message: string = 'Resource created successfully',
  ): void {
    this.success(res, data, message, HTTP_STATUS_CODES.CREATED);
  }

  /**
   * Send no content response
   */
  static noContent(res: Response): void {
    res.status(HTTP_STATUS_CODES.NO_CONTENT).send();
  }

  /**
   * Send unauthorized response
   */
  static unauthorized(res: Response, message: string = 'Unauthorized access'): void {
    this.error(res, message, HTTP_STATUS_CODES.UNAUTHORIZED);
  }

  /**
   * Send forbidden response
   */
  static forbidden(res: Response, message: string = 'Access forbidden'): void {
    this.error(res, message, HTTP_STATUS_CODES.FORBIDDEN);
  }

  /**
   * Send not found response
   */
  static notFound(res: Response, message: string = 'Resource not found'): void {
    this.error(res, message, HTTP_STATUS_CODES.NOT_FOUND);
  }

  /**
   * Send conflict response
   */
  static conflict(res: Response, message: string = 'Resource already exists'): void {
    this.error(res, message, HTTP_STATUS_CODES.CONFLICT);
  }

  /**
   * Send too many requests response
   */
  static tooManyRequests(res: Response, message: string = 'Too many requests'): void {
    this.error(res, message, HTTP_STATUS_CODES.TOO_MANY_REQUESTS);
  }

  /**
   * Send internal server error response
   */
  static internalServerError(
    res: Response,
    message: string = 'Internal server error',
    error: unknown = null,
  ): void {
    this.error(res, message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, error);
  }
}
