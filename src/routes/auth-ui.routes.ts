import { Router, Request, Response } from 'express';
import path from 'path';

const router: import('express').Router = Router();
//This Route is for rendering authentication-related UI pages on the backend
//If you want to set it up on the frontend remove this setup.

// Email verification page
router.get('/verify-email', (req: Request, res: Response) => {
  const { token } = req.query;

  if (!token || typeof token !== 'string') {
    return res.status(400).send(`
      <html>
        <body style="font-family: Arial; text-align: center; margin-top: 50px;">
          <h2>Invalid Verification Link</h2>
          <p>This verification link is invalid or has expired.</p>
        </body>
      </html>
    `);
  }

  // Serve static HTML file
  return res.sendFile(path.join(process.cwd(), 'public', 'auth', 'verify-email.html'));
});

// Password reset page
router.get('/reset-password', (req: Request, res: Response) => {
  const { token } = req.query;

  if (!token || typeof token !== 'string') {
    return res.status(400).send(`
      <html>
        <body style="font-family: Arial; text-align: center; margin-top: 50px;">
          <h2>Invalid Reset Link</h2>
          <p>This password reset link is invalid or has expired.</p>
        </body>
      </html>
    `);
  }

  // Serve static HTML file
  return res.sendFile(path.join(process.cwd(), 'public', 'auth', 'reset-password.html'));
});

// Success pages
router.get('/verification-success', (req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), 'public', 'auth', 'verification-success.html'));
});

router.get('/reset-success', (req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), 'public', 'auth', 'reset-success.html'));
});

export { router as authUiRoutes };
