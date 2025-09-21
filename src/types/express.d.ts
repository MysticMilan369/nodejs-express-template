// This file extends Express types to work with Passport
import 'express';

// Extend the Express Request interface to include the user property from Passport
declare global {
  namespace Express {
    // Define User interface for Passport
    interface User {
      userId: string;
      email: string;
      role: string;
      username: string;
    }

    // Add user to Request
    interface Request {
      user?: User;
    }
  }
}

// Export a properly typed RequestHandler that works with both Express and Passport
import { Request, Response, NextFunction } from 'express';

export type RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void> | void;

export type ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void> | void;
