import { Request, Response } from 'express';
import { asyncHandler } from '@/utils/async-handler.utils';
import { ApiResponse } from '@/utils/api-response.utils';
import mongoose from 'mongoose';
import { User } from '@/models/user.model';
import { config } from '@/config';

export class HealthController {
  /**
   * @desc    Basic health check
   * @route   GET /api/health
   * @access  Public
   */
  static healthCheck = asyncHandler(async (req: Request, res: Response) => {
    const healthData = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.server.nodeEnv,
      version: config.server.version,
      node: process.version,
    };

    ApiResponse.success(res, healthData, 'Service is healthy');
  });

  /**
   * @desc    Detailed health check including database
   * @route   GET /api/health/detailed
   * @access  Public
   */
  static detailedHealthCheck = asyncHandler(async (req: Request, res: Response) => {
    const startTime = Date.now();

    // Check database connection
    let dbStatus = 'disconnected';
    let dbResponseTime = 0;
    let userCount = 0;

    try {
      const dbStart = Date.now();
      if (mongoose.connection.db) {
        await mongoose.connection.db.admin().ping();
        dbResponseTime = Date.now() - dbStart;
        dbStatus = 'connected';

        // Get user count as a basic database operation test
        userCount = await User.countDocuments();
      } else {
        dbStatus = 'error';
      }
    } catch {
      dbStatus = 'error';
    }

    const healthData = {
      status: dbStatus === 'connected' ? 'OK' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.server.nodeEnv,
      version: config.server.version,
      node: process.version,
      database: {
        status: dbStatus,
        responseTime: `${dbResponseTime}ms`,
        userCount,
      },
      memory: {
        used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
        total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
        unit: 'MB',
      },
      responseTime: `${Date.now() - startTime}ms`,
    };

    const statusCode = dbStatus === 'connected' ? 200 : 503;
    const message =
      dbStatus === 'connected' ? 'All systems operational' : 'Some systems are experiencing issues';

    ApiResponse.success(res, healthData, message, statusCode);
  });

  /**
   * @desc    Readiness check for Kubernetes/Docker
   * @route   GET /api/health/ready
   * @access  Public
   */
  static readinessCheck = asyncHandler(async (req: Request, res: Response) => {
    try {
      // Check if database is ready
      if (mongoose.connection.db) {
        await mongoose.connection.db.admin().ping();

        ApiResponse.success(
          res,
          {
            status: 'ready',
            timestamp: new Date().toISOString(),
          },
          'Service is ready',
        );
      } else {
        throw new Error('Database connection is not established');
      }
    } catch {
      ApiResponse.error(res, 'Service is not ready', 503, {
        status: 'not ready',
        timestamp: new Date().toISOString(),
        error: 'Database connection failed',
      });
    }
  });

  /**
   * @desc    Liveness check for Kubernetes/Docker
   * @route   GET /api/health/live
   * @access  Public
   */
  static livenessCheck = asyncHandler(async (req: Request, res: Response) => {
    ApiResponse.success(
      res,
      {
        status: 'alive',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
      'Service is alive',
    );
  });
}
