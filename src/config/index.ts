import { version } from 'os';
import { env } from './environment.config';

export const config = {
  server: {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    host: env.HOST,
    version: env.NPM_PACKAGE_VERSION || version(),
  },

  database: {
    uri: env.MONGODB_URI,
    testUri: env.MONGODB_TEST_URI || env.MONGODB_URI.replace(/\/\w+$/, '/user_management_test_db'),
  },

  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshSecret: env.JWT_REFRESH_SECRET,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },

  rateLimiting: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
    authMax: env.AUTH_RATE_LIMIT_MAX,
  },

  email: {
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
    from: env.EMAIL_FROM,
  },

  cors: {
    origin: env.CORS_ORIGIN.split(',').map((origin) => origin.trim()),
  },

  // logging config is now handled in src/lib/logger/logger.config.ts

  security: {
    bcryptSaltRounds: env.BCRYPT_SALT_ROUNDS,
    passwordMinLength: env.PASSWORD_MIN_LENGTH,
    passwordResetExpires: env.PASSWORD_RESET_EXPIRES,
  },

  admin: {
    defaultName: env.DEFAULT_ADMIN_NAME,
    defaultUsername: env.DEFAULT_ADMIN_USERNAME,
    defaultEmail: env.DEFAULT_ADMIN_EMAIL,
    defaultPassword: env.DEFAULT_ADMIN_PASSWORD,
  },
};

export { env };
