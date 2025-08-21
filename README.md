# User Management API

A comprehensive Node.js/TypeScript REST API for user management with role-based access control, JWT authentication, and MongoDB integration.

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based authentication with refresh tokens
  - Role-based access control (Admin/User)
  - Secure password hashing with bcrypt
  - Token refresh mechanism

- **User Management**
  - User registration and login
  - Profile management
  - Password change functionality
  - Account activation/deactivation
  - User blocking/unblocking
  - Role management (Admin only)

- **Security**
  - Rate limiting
  - CORS configuration
  - Helmet security headers
  - Input validation with Zod
  - Request logging
  - Error handling

- **Developer Experience**
  - TypeScript support
  - Swagger API documentation
  - Comprehensive logging
  - Environment configuration
  - ESLint and Prettier
  - Git hooks with Husky

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v5.0 or higher)
- pnpm (recommended) or npm

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd user-management-api
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/user_management_db
   JWT_SECRET=your-super-secret-jwt-key-here-at-least-32-characters
   JWT_REFRESH_SECRET=your-super-secret-jwt-refresh-key-here
   ```

4. **Start MongoDB**
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Run the application**
   ```bash
   # Development mode
   pnpm dev
   
   # Production build
   pnpm build
   pnpm start
   ```

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:3000/api-docs`
- **Health Check**: `http://localhost:3000/api/health`

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update current user profile
- `PUT /api/auth/change-password` - Change password
- `GET /api/auth/verify` - Verify authentication

### User Management (Admin only)
- `GET /api/users` - Get all users with pagination
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PUT /api/users/:id/activate` - Activate user
- `PUT /api/users/:id/deactivate` - Deactivate user
- `PUT /api/users/:id/block` - Block user
- `PUT /api/users/:id/unblock` - Unblock user
- `PUT /api/users/:id/role` - Update user role
- `GET /api/users/stats` - Get user statistics
- `GET /api/users/search` - Search users

### Health Check
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed health check
- `GET /api/health/ready` - Readiness probe
- `GET /api/health/live` - Liveness probe

## 🏗️ Project Structure

```
src/
├── app.ts                 # Express app configuration
├── server.ts              # Server entry point
├── config/                # Configuration files
│   ├── database.config.ts
│   ├── environment.config.ts
│   └── index.ts
├── controllers/           # Request handlers
│   ├── auth.controller.ts
│   ├── user.controller.ts
│   └── health.controller.ts
├── services/              # Business logic
│   ├── auth.service.ts
│   └── user.service.ts
├── models/                # Database models
│   ├── user.model.ts
│   ├── user.types.ts
│   └── index.ts
├── routes/                # API routes
│   ├── auth.routes.ts
│   ├── user.routes.ts
│   ├── health.routes.ts
│   └── index.ts
├── middleware/            # Custom middleware
│   ├── auth.middleware.ts
│   ├── role.middleware.ts
│   ├── validation.middleware.ts
│   ├── error-handler.middleware.ts
│   ├── rate-limiter.middleware.ts
│   └── request-logger.middleware.ts
├── validators/            # Request validation schemas
│   ├── auth.validators.ts
│   ├── user.validators.ts
│   └── common.validators.ts
├── utils/                 # Utility functions
│   ├── api-response.utils.ts
│   ├── async-handler.utils.ts
│   ├── date.utils.ts
│   ├── file.utils.ts
│   └── crypto.utils.ts
├── lib/                   # Shared libraries
│   ├── errors/            # Error classes
│   │   ├── app.error.ts
│   │   ├── auth.error.ts
│   │   ├── validation.error.ts
│   │   └── index.ts
│   ├── constants/         # Application constants
│   │   ├── user-roles.constants.ts
│   │   ├── http-status-codes.constants.ts
│   │   ├── error-messages.constants.ts
│   │   └── index.ts
│   ├── jwt/               # JWT utilities
│   │   ├── jwt.service.ts
│   │   └── index.ts
│   ├── logger/            # Logging configuration
│   │   ├── logger.service.ts
│   │   ├── logger.config.ts
│   │   └── index.ts
│   ├── pagination/        # Pagination utilities
│   │   ├── pagination.service.ts
│   │   └── index.ts
│   └── swagger/           # API documentation
│       ├── swagger.config.ts
│       ├── swagger.docs.ts
│       └── index.ts
└── types/                 # Shared TypeScript types
    ├── api-response.types.ts
    ├── pagination.types.ts
    └── environment.types.ts
```

## 🔧 Scripts

```bash
# Development
pnpm dev              # Start development server with hot reload

# Build
pnpm build           # Build TypeScript to JavaScript
pnpm start           # Start production server

# Code Quality
pnpm lint            # Run ESLint
pnpm lint:fix        # Fix ESLint issues
pnpm format          # Format code with Prettier

# Testing
pnpm test            # Run tests
pnpm test:watch      # Run tests in watch mode
pnpm test:coverage   # Run tests with coverage
```

## 🔒 Authentication Flow

1. **Registration/Login**: User provides credentials
2. **Token Generation**: Server generates access & refresh tokens
3. **Token Storage**: Refresh token stored as httpOnly cookie
4. **API Access**: Access token sent in Authorization header
5. **Token Refresh**: When access token expires, use refresh token
6. **Logout**: Clear tokens from client and server

## 👤 User Schema

```typescript
{
  name: string;              // User's display name
  username: string;          // Unique username
  email: string;             // Unique email address
  passwordHash: string;      // Bcrypt hashed password
  role: 'admin' | 'user';   // User role
  emailVerified: boolean;    // Email verification status
  isActive: boolean;         // Account active status
  isBlocked: boolean;        // Account blocked status
  deletionRequestedAt: Date; // Soft deletion timestamp
  lastLogin: Date;           // Last login timestamp
  onboardingCompleted: boolean; // Onboarding status
  oauthProviders: [{         // OAuth connections
    provider: string;
    providerId: string;
    email: string;
    connectedAt: Date;
  }];
  refreshTokens: [{          // Active refresh tokens
    token: string;
    createdAt: Date;
    expiresAt: Date;
  }];
  createdAt: Date;
  updatedAt: Date;
}
```

## 🛡️ Security Features

### Password Security
- Minimum 8 characters
- Must contain uppercase, lowercase, number, and special character
- Bcrypt hashing with configurable salt rounds

### Rate Limiting
- Authentication endpoints: 5 requests per 15 minutes
- General API: 100 requests per 15 minutes
- Configurable via environment variables

### Token Security
- JWT access tokens (short-lived: 15 minutes)
- Refresh tokens (long-lived: 30 days)
- Secure httpOnly cookies for refresh tokens
- Token rotation on refresh

## 🔑 Default Admin Account

The system creates a default admin account on first run:
- **Username**: `admin`
- **Email**: `admin@localhost.com`
- **Password**: `Admin@123`
- **Role**: `admin`

⚠️ **Important**: Change the default admin password immediately in production!

## 🌍 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | No |
| `PORT` | Server port | `3000` | No |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/user_management_db` | Yes |
| `JWT_SECRET` | JWT access token secret (min 32 chars) | - | Yes |
| `JWT_REFRESH_SECRET` | JWT refresh token secret (min 32 chars) | - | Yes |
| `JWT_EXPIRES_IN` | Access token expiry | `15m` | No |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `30d` | No |
| `CORS_ORIGIN` | CORS allowed origins | `http://localhost:3000` | No |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 min) | No |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` | No |
| `BCRYPT_SALT_ROUNDS` | Bcrypt salt rounds | `12` | No |
| `LOG_LEVEL` | Logging level | `info` | No |

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test auth.test.ts
```

## 📊 Monitoring & Logging

### Health Checks
- **Basic**: `/api/health` - Server status
- **Detailed**: `/api/health/detailed` - Server + database status
- **Kubernetes**: `/api/health/ready` and `/api/health/live`

### Logging
- Winston-based structured logging
- Daily log rotation
- Different log levels (error, warn, info, debug)
- Request/response logging with Morgan

## 🚀 Deployment

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

### Environment Setup
```bash
# Production environment
NODE_ENV=production
MONGODB_URI=mongodb://your-production-db:27017/user_management
JWT_SECRET=your-super-secure-production-secret-here
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   ```bash
   # Check if MongoDB is running
   sudo systemctl status mongod
   
   # Start MongoDB
   sudo systemctl start mongod
   ```

2. **JWT Secret Too Short**
   ```
   Error: JWT secret must be at least 32 characters
   ```
   Generate a secure secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Port Already in Use**
   ```bash
   # Find process using port 3000
   lsof -ti:3000
   
   # Kill process
   kill -9 $(lsof -ti:3000)
   ```

4. **Permission Errors**
   ```bash
   # Fix npm permissions
   sudo chown -R $(whoami) ~/.npm
   ```

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check existing documentation
- Review the API documentation at `/api-docs`

---

**Built with ❤️ using Node.js, TypeScript, Express, and MongoDB**