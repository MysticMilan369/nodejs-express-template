import { z } from 'zod';

export class UserValidators {
  static readonly createUser = z.object({
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
      .regex(/(?=.*\d)/, 'Password must contain at least one number'),

    role: z.enum(['admin', 'user']).default('user'),

    isActive: z.boolean().default(true),

    emailVerified: z.boolean().default(false),

    onboardingCompleted: z.boolean().default(false),
  });

  static readonly updateUser = z.object({
    body: z.object({
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

      email: z.string().email('Please provide a valid email address').toLowerCase().optional(),

      role: z.enum(['admin', 'user']).optional(),

      isActive: z.boolean().optional(),

      isBlocked: z.boolean().optional(),

      emailVerified: z.boolean().optional(),

      onboardingCompleted: z.boolean().optional(),
    }),

    params: z.object({
      id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format'),
    }),
  });

  static readonly getUserById = z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format'),
  });

  static readonly deleteUser = z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format'),
  });

  static readonly userAction = z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format'),
  });

  static readonly updateUserRole = z.object({
    body: z.object({
      role: z.enum(['admin', 'user'], {
        error: 'Role must be either admin or user',
      }),
    }),

    params: z.object({
      id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format'),
    }),
  });

  static readonly getAllUsers = z.object({
    page: z
      .string()
      .transform(Number)
      .refine((val) => val > 0, 'Page must be greater than 0')
      .default(1),

    limit: z
      .string()
      .transform(Number)
      .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100')
      .default(10),

    sortBy: z
      .enum(['name', 'email', 'username', 'role', 'createdAt', 'updatedAt', 'lastLogin'])
      .default('createdAt'),

    sortOrder: z.enum(['asc', 'desc']).default('desc'),

    search: z.string().optional(),

    role: z.enum(['admin', 'user']).optional(),

    isActive: z
      .string()
      .transform((val) => val === 'true')
      .optional(),

    emailVerified: z
      .string()
      .transform((val) => val === 'true')
      .optional(),

    isBlocked: z
      .string()
      .transform((val) => val === 'true')
      .optional(),
  });

  static readonly searchUsers = z.object({
    q: z.string().min(1, 'Search query cannot be empty').optional(),

    page: z
      .string()
      .transform(Number)
      .refine((val) => val > 0, 'Page must be greater than 0')
      .default(1),

    limit: z
      .string()
      .transform(Number)
      .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100')
      .default(10),

    role: z.enum(['admin', 'user']).optional(),

    isActive: z
      .string()
      .transform((val) => val === 'true')
      .optional(),
  });
}
