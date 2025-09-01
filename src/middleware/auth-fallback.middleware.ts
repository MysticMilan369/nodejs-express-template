import { Request, Response, NextFunction } from 'express';

/**
 * Simple fallback middleware for auth routes
 * If /auth/* route is not found, redirect to /auth-ui/* equivalent
 */

export const authFallbackMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Define which auth routes should fallback to backend UI
  const authFallbackRoutes = [
    '/auth/verify-email',
    '/auth/reset-password',
    '/auth/reset-success',
    '/auth/verification-success',
  ];

  // Check if current path matches our fallback routes
  if (authFallbackRoutes.includes(req.path)) {
    // Convert /auth/* to /auth-ui/*
    const fallbackPath = req.path.replace('/auth/', '/auth-ui/');
    const fullUrl = req.originalUrl.replace(req.path, fallbackPath);

    // Redirect to backend UI
    return res.redirect(302, fullUrl);
  }

  // For all other routes, continue to next middleware (will likely 404)
  next();
};
