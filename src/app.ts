import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { config } from '@/config';
import { globalErrorHandler, notFoundHandler } from '@/middleware/error-handler.middleware';
import { routes } from '@/routes';
import { swaggerSetup, swaggerSpec } from '@/lib/swagger';
import { logger } from './lib/logger';
import { rateLimiter } from '@/middleware/rate-limiter.middleware';

const app: express.Application = express();

// Trust proxy (for rate limiting and logging)
app.set('trust proxy', 1);

// Security middleware
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  }),
);

// CORS configuration
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }),
);

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parsing middleware
app.use(cookieParser());

// Logging middleware
if (config.server.nodeEnv !== 'test') {
  app.use(
    morgan('combined', {
      stream: { write: (message) => logger.info(message.trim()) },
    }),
  );
}

// Serve Swagger JSON for download
app.get('/swagger/resource/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.attachment('Sample_Project_API_Swagger.json');
  res.send(swaggerSpec);
});

// API Documentation
swaggerSetup(app);

//Rate Limiter
app.use(rateLimiter.general);

// Health check endpoint (before rate limiting)
app.get('/', (req, res) => {
  res.json({
    message: 'User Management API',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    docs: '/api-docs',
  });
});

// API Routes
app.use('/api', routes);

// Handle 404 errors
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
});

app.use(notFoundHandler);

// Global error handler (must be last)
app.use(globalErrorHandler);

export { app };
