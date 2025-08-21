import { z } from 'zod';

export class AuthValidators {
  static readonly register = z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters long')
      .max(50, 'Name cannot exceed 50 characters')
      .trim(),

    username: z
      .string()
      .min(3, 'Username must be at least 3 characters long')
      .max(30, 'Username cannot exceed 30 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
      .toLowerCase(),

    email: z.string().email('Please provide a valid email address').toLowerCase(),

    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(/(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
      .regex(/(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
      .regex(/(?=.*\d)/, 'Password must contain at least one number')
      .regex(
        /(?=.*[!@#$%^&*(),.?":{}|<>])/,
        'Password must contain at least one special character',
      ),
  });

  static readonly login = z.object({
    identifier: z.string().min(1, 'Email or username is required').toLowerCase(),

    password: z.string().min(1, 'Password is required'),
  });

  static readonly changePassword = z
    .object({
      currentPassword: z.string().min(1, 'Current password is required'),

      newPassword: z
        .string()
        .min(8, 'New password must be at least 8 characters long')
        .regex(/(?=.*[a-z])/, 'New password must contain at least one lowercase letter')
        .regex(/(?=.*[A-Z])/, 'New password must contain at least one uppercase letter')
        .regex(/(?=.*\d)/, 'New password must contain at least one number')
        .regex(
          /(?=.*[!@#$%^&*(),.?":{}|<>])/,
          'New password must contain at least one special character',
        ),

      confirmPassword: z.string().min(1, 'Password confirmation is required'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "New password and confirmation don't match",
      path: ['confirmPassword'],
    });

  static readonly updateProfile = z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters long')
      .max(50, 'Name cannot exceed 50 characters')
      .trim()
      .optional(),

    username: z
      .string()
      .min(3, 'Username must be at least 3 characters long')
      .max(30, 'Username cannot exceed 30 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
      .toLowerCase()
      .optional(),
  });

  static readonly refreshToken = z.object({
    refreshToken: z.string().optional(),
  });

  static readonly forgotPassword = z.object({
    email: z.string().email('Please provide a valid email address').toLowerCase(),
  });

  static readonly resetPassword = z
    .object({
      token: z.string().min(1, 'Reset token is required'),

      password: z
        .string()
        .min(8, 'Password must be at least 8 characters long')
        .regex(/(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
        .regex(/(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
        .regex(/(?=.*\d)/, 'Password must contain at least one number')
        .regex(
          /(?=.*[!@#$%^&*(),.?":{}|<>])/,
          'Password must contain at least one special character',
        ),

      confirmPassword: z.string().min(1, 'Password confirmation is required'),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Password and confirmation don't match",
      path: ['confirmPassword'],
    });
}
