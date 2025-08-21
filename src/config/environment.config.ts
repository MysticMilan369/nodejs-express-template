import { z } from 'zod';

// Environment variables validation schema
const envSchema = z.object({
  // Server Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default(3000),
  HOST: z.string().default('localhost'),
  NPM_PACKAGE_VERSION: z.string().default('1.0.0'),

  // Database Configuration
  MONGODB_URI: z.string().default('mongodb://localhost:27017/user_management_db'),
  MONGODB_TEST_URI: z.string().optional(),

  // JWT Configuration
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT refresh secret must be at least 32 characters'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default(100),
  AUTH_RATE_LIMIT_MAX: z.string().transform(Number).default(5), // 5 requests per 15 minutes

  // Email Configuration (Optional)
  EMAIL_HOST: z.string().optional(),
  EMAIL_PORT: z.string().transform(Number).optional(),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASS: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  // CORS Configuration
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // Logging (moved to src/lib/logger/logger.config.ts)

  // Security
  BCRYPT_SALT_ROUNDS: z.string().transform(Number).default(12),
  PASSWORD_MIN_LENGTH: z.string().transform(Number).default(8),
  PASSWORD_RESET_EXPIRES: z.string().transform(Number).default(3600000), // 1 hour

  // Admin Default User (for seeding)
  DEFAULT_ADMIN_NAME: z.string().default('Admin User'),
  DEFAULT_ADMIN_USERNAME: z.string().default('admin'),
  DEFAULT_ADMIN_EMAIL: z.string().email().default('admin@localhost.com'),
  DEFAULT_ADMIN_PASSWORD: z.string().min(8).default('Admin@123'),
});

// Validate environment variables
const validateEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((err) => `${err.path.join('.')}: ${err.message}`);
      throw new Error(`Invalid environment variables:\n${missingVars.join('\n')}`);
    }
    throw error;
  }
};

export const env = validateEnv();

export type Environment = z.infer<typeof envSchema>;
