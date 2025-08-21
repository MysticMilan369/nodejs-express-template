import rateLimit, { Options } from 'express-rate-limit';
import { config } from '@/config';

export interface IRateLimiter {
  general: ReturnType<typeof rateLimit>;
  custom(options: Options): ReturnType<typeof rateLimit>;
  auth: ReturnType<typeof rateLimit>;
}

class RateLimiter implements IRateLimiter {
  public general = rateLimit({
    windowMs: config.rateLimiting.windowMs,
    max: config.rateLimiting.maxRequests,
    message: {
      status: 429,
      message: 'Too many requests, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  public custom(options: Options) {
    return rateLimit(options);
  }

  public auth = rateLimit({
    windowMs: config.rateLimiting.windowMs,
    max: config.rateLimiting.authMax,
    message: {
      status: 429,
      message: 'Too many authentication attempts, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
}

export const rateLimiter = new RateLimiter();
export type { RateLimiter };
