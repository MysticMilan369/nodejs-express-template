export const ERROR_MESSAGES = {
  // Authentication errors
  INVALID_CREDENTIALS: 'Invalid email/username or password',
  ACCOUNT_DEACTIVATED: 'Account is deactivated. Please contact support',
  ACCOUNT_BLOCKED: 'Account is blocked. Please contact support',
  UNAUTHORIZED: 'You are not authorized to access this resource',
  TOKEN_EXPIRED: 'Access token has expired',
  INVALID_TOKEN: 'Invalid or malformed token',
  TOKEN_REQUIRED: 'Access token is required',

  // User errors
  USER_NOT_FOUND: 'User not found',
  USER_ALREADY_EXISTS: 'User with this email already exists',
  USERNAME_TAKEN: 'Username is already taken',
  EMAIL_TAKEN: 'Email is already registered',

  // Password errors
  CURRENT_PASSWORD_INCORRECT: 'Current password is incorrect',
  PASSWORD_MISMATCH: 'Password confirmation does not match',
  WEAK_PASSWORD: 'Password does not meet security requirements',

  // Validation errors
  VALIDATION_FAILED: 'Request validation failed',
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please provide a valid email address',
  INVALID_FORMAT: 'Invalid data format',

  // Permission errors
  INSUFFICIENT_PERMISSIONS: 'You do not have permission to perform this action',
  ADMIN_REQUIRED: 'Administrator privileges required',
  CANNOT_MODIFY_SELF: 'You cannot perform this action on your own account',
  CANNOT_MODIFY_ADMIN: 'You cannot modify administrator accounts',

  // Resource errors
  RESOURCE_NOT_FOUND: 'Requested resource not found',
  RESOURCE_ALREADY_EXISTS: 'Resource already exists',
  RESOURCE_IN_USE: 'Resource is currently in use and cannot be deleted',

  // Rate limiting
  TOO_MANY_REQUESTS: 'Too many requests. Please try again later',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',

  // Server errors
  INTERNAL_SERVER_ERROR: 'Internal server error occurred',
  SERVICE_UNAVAILABLE: 'Service is temporarily unavailable',
  DATABASE_ERROR: 'Database operation failed',
  EXTERNAL_SERVICE_ERROR: 'External service error',

  // File upload errors
  FILE_TOO_LARGE: 'File size exceeds maximum limit',
  INVALID_FILE_TYPE: 'File type is not supported',
  UPLOAD_FAILED: 'File upload failed',

  // Email errors
  EMAIL_SEND_FAILED: 'Failed to send email',
  EMAIL_VERIFICATION_FAILED: 'Email verification failed',
  EMAIL_NOT_VERIFIED: 'Email address is not verified',

  // Session errors
  SESSION_EXPIRED: 'Your session has expired',
  SESSION_INVALID: 'Invalid session',
  CONCURRENT_SESSION_LIMIT: 'Maximum concurrent sessions exceeded',

  // Network errors
  NETWORK_ERROR: 'Network connection error',
  REQUEST_TIMEOUT: 'Request timed out',
  CONNECTION_REFUSED: 'Connection refused',
} as const;

export type ErrorMessage = (typeof ERROR_MESSAGES)[keyof typeof ERROR_MESSAGES];

// Error categories
export const AUTH_ERRORS = [
  ERROR_MESSAGES.INVALID_CREDENTIALS,
  ERROR_MESSAGES.ACCOUNT_DEACTIVATED,
  ERROR_MESSAGES.ACCOUNT_BLOCKED,
  ERROR_MESSAGES.UNAUTHORIZED,
  ERROR_MESSAGES.TOKEN_EXPIRED,
  ERROR_MESSAGES.INVALID_TOKEN,
  ERROR_MESSAGES.TOKEN_REQUIRED,
] as const;

export const USER_ERRORS = [
  ERROR_MESSAGES.USER_NOT_FOUND,
  ERROR_MESSAGES.USER_ALREADY_EXISTS,
  ERROR_MESSAGES.USERNAME_TAKEN,
  ERROR_MESSAGES.EMAIL_TAKEN,
] as const;

export const VALIDATION_ERRORS = [
  ERROR_MESSAGES.VALIDATION_FAILED,
  ERROR_MESSAGES.REQUIRED_FIELD,
  ERROR_MESSAGES.INVALID_EMAIL,
  ERROR_MESSAGES.INVALID_FORMAT,
] as const;

export const PERMISSION_ERRORS = [
  ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS,
  ERROR_MESSAGES.ADMIN_REQUIRED,
  ERROR_MESSAGES.CANNOT_MODIFY_SELF,
  ERROR_MESSAGES.CANNOT_MODIFY_ADMIN,
] as const;
