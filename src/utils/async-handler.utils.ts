import { Request, Response, NextFunction } from 'express';

type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/**
 * Wraps async functions to catch errors and pass them to Express error handler
 */
export const asyncHandler = (fn: AsyncFunction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Creates a delay for testing purposes
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Retry async function with exponential backoff
 */
export const retryAsync = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        throw lastError;
      }

      // Exponential backoff: 1s, 2s, 4s, 8s...
      const delayMs = baseDelay * Math.pow(2, attempt);
      await delay(delayMs);
    }
  }

  throw lastError!;
};

/**
 * Timeout wrapper for async functions
 */
export const withTimeout = <T>(fn: () => Promise<T>, timeoutMs: number = 30000): Promise<T> => {
  return Promise.race([
    fn(),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs),
    ),
  ]);
};

/**
 * Safe async function execution with error handling
 */
export const safeAsync = async <T>(fn: () => Promise<T>, defaultValue: T): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    console.error('Safe async execution failed:', error);
    return defaultValue;
  }
};

/**
 * Batch async operations with concurrency limit
 */
export const batchAsync = async <T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  concurrency: number = 5,
): Promise<R[]> => {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(fn));
    results.push(...batchResults);
  }

  return results;
};

/**
 * Debounced async function
 */
export const debounceAsync = <T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  delay: number,
) => {
  let timeoutId: NodeJS.Timeout;
  let resolve: (value: R) => void;
  let reject: (reason: unknown) => void;

  return (...args: T): Promise<R> => {
    clearTimeout(timeoutId);

    return new Promise<R>((res, rej) => {
      resolve = res;
      reject = rej;

      timeoutId = setTimeout(async () => {
        try {
          const result = await fn(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  };
};
