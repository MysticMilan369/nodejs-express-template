import { z } from 'zod';

// Define logging environment schema
export const loggerEnvSchema = z.object({
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
  LOG_FILE_ENABLED: z
    .string()
    .default('false')
    .transform((val) => val === 'true'),
  LOG_MAX_FILES: z.string().default('14d'),
  LOG_MAX_SIZE: z.string().default('20m'),
});

export const loggerEnv = loggerEnvSchema.parse({
  LOG_LEVEL: process.env.LOG_LEVEL,
  LOG_FILE_ENABLED: process.env.LOG_FILE_ENABLED,
  LOG_MAX_FILES: process.env.LOG_MAX_FILES,
  LOG_MAX_SIZE: process.env.LOG_MAX_SIZE,
});

export type LoggerEnv = typeof loggerEnv;
