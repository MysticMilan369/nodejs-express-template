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
   *
   * Purpose: Validates a single part of the request (body OR query OR params)
   * Example: ValidationMiddleware.validate(userCreateSchema, 'body')
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
        // Handle validation errors - format to match global error handler expectations
        if (error instanceof ZodError) {
          // Format details as array of {path, message} objects
          const validationDetails = error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          }));

          // Create combined message for consistency
          const messages = validationDetails.map((detail) => detail.message);
          const combinedMessage = messages.join(', ');

          return next(
            new ValidationError(`Validation failed: ${combinedMessage}`, validationDetails),
          );
        }

        next(error);
      }
    };
  }

  /**
   * Validate complete request (body, query, and params) against a Zod schema
   * @param schema The Zod schema with body, query, and params properties
   *
   * Purpose: Validates multiple parts of the request simultaneously
   * Example: ValidationMiddleware.validateRequest(z.object({
   *   body: userCreateSchema,
   *   params: z.object({ id: z.string() }),
   *   query: z.object({ page: z.string().optional() })
   * }))
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
        // Handle validation errors - format to match global error handler expectations
        if (error instanceof ZodError) {
          // Format details as array of {path, message} objects
          const validationDetails = error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          }));

          // Create combined message for consistency
          const messages = validationDetails.map((detail) => detail.message);
          const combinedMessage = messages.join(', ');

          return next(
            new ValidationError(`Validation failed: ${combinedMessage}`, validationDetails),
          );
        }

        next(error);
      }
    };
  }
}
