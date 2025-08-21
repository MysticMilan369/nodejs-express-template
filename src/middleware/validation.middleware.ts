import { Request, Response, NextFunction } from 'express';
import { ParsedQs } from 'qs';
import { ZodType, ZodError } from 'zod';
import { ValidationError } from '@/lib/errors';

// Local type for Express params
type ParamsDictionary = { [key: string]: string };

export class ValidationMiddleware {
  /**
   * Validate request body, query, or params against a Zod schema
   * @param schema The Zod schema to validate against
   * @param type The part of the request to validate ('body', 'query', or 'params')
   */
  static validate(schema: ZodType<unknown>, type: 'body' | 'query' | 'params' = 'body') {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // Select the appropriate part of the request based on type
        const data = type === 'body' ? req.body : type === 'query' ? req.query : req.params;

        // Validate the data against the schema
        const validatedData = await schema.parseAsync(data);

        // Replace the request data with the validated data
        if (type === 'body') {
          req.body = validatedData;
        } else if (type === 'query') {
          req.query = validatedData as ParsedQs;
        } else {
          req.params = validatedData as ParamsDictionary;
        }

        next();
      } catch (error) {
        // Handle validation errors
        if (error instanceof ZodError) {
          const validationErrors = error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          }));

          return next(new ValidationError('Validation failed', validationErrors));
        }

        next(error);
      }
    };
  }

  /**
   * Validate complete request (body, query, and params) against a Zod schema
   * @param schema The Zod schema with body, query, and params properties
   */
  static validateRequest(schema: ZodType<unknown>) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // Validate each part of the request if the schema defines it
        const result = await schema.parseAsync({
          body: req.body,
          query: req.query,
          params: req.params,
        });

        // Update the request objects with validated data
        const resultObj = result as {
          body?: unknown;
          query?: ParsedQs;
          params?: ParamsDictionary;
        };
        req.body = resultObj.body || req.body;
        req.query = resultObj.query || req.query;
        req.params = resultObj.params || req.params;

        next();
      } catch (error) {
        // Handle validation errors
        if (error instanceof ZodError) {
          const validationErrors = error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          }));

          return next(new ValidationError('Validation failed', validationErrors));
        }

        next(error);
      }
    };
  }
}
