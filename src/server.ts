import 'dotenv/config';
import { app } from './app';
import { config } from '@/config';
import { connectDatabase } from '@/config/database.config';
import mongoose from 'mongoose';
import { logger } from './lib/logger';

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled Rejection:', reason);
  process.exit(1);
});

async function startServer() {
  try {
    // Connect to database
    await connectDatabase();

    // Start server
    const server = app.listen(config.server.port, () => {
      logger.info(`Server running on ${config.server.host}:${config.server.port}`);
      logger.info(`API Documentation: http://${config.server.host}:${config.server.port}/api-docs`);
      logger.info(`Environment: ${config.server.nodeEnv}`);
      logger.info(
        `Swagger JSON Download: http://${config.server.host}:${config.server.port}/swagger/resource/swagger.json`,
      );
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);

      server.close(async (error) => {
        if (error) {
          logger.error('Error during server close:', error);
          process.exit(1);
        }

        try {
          // Close database connection
          if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            logger.info('Database connection closed.');
          }

          logger.info('Graceful shutdown completed.');
          process.exit(0);
        } catch (dbError) {
          logger.error('Error closing database connection:', dbError);
          process.exit(1);
        }
      });

      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('Forcing shutdown after 10 seconds');
        process.exit(1);
      }, 10000);
    };

    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
