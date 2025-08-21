export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: ['user:read', 'user:write', 'user:delete', 'user:manage', 'system:admin'],
  [USER_ROLES.USER]: ['profile:read', 'profile:write'],
} as const;

export const ROLE_HIERARCHY = {
  [USER_ROLES.ADMIN]: 2,
  [USER_ROLES.USER]: 1,
} as const;

/**
 * Check if a role has higher or equal permission level
 */
export const hasRolePermission = (userRole: UserRole, requiredRole: UserRole): boolean => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};

/**
 * Get all roles with lower or equal permission level
 */
export const getSubordinateRoles = (userRole: UserRole): UserRole[] => {
  const userLevel = ROLE_HIERARCHY[userRole];
  return Object.entries(ROLE_HIERARCHY)
    .filter(([, level]) => level <= userLevel)
    .map(([role]) => role as UserRole);
};

/**
 * Check if user has specific permission
 */
export const hasPermission = (userRole: UserRole, permission: string): boolean => {
  const rolePermissions = ROLE_PERMISSIONS[userRole] as readonly string[];
  return rolePermissions.includes(permission);
};
