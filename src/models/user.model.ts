import { Schema, model } from 'mongoose';
import { IUser, IRefreshToken } from './user.types';

const OAuthProviderSchema = new Schema(
  {
    provider: {
      type: String,
      required: true,
      enum: ['google', 'github', 'facebook'],
    },
    providerId: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    connectedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true },
);

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters long'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
      index: true, // Use this instead of separate index declaration
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
      index: true, // Use this instead of separate index declaration
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    deletionRequestedAt: {
      type: Date,
      default: null,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    oauthProviders: [OAuthProviderSchema],
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpiry: {
      type: Date,
      select: false,
    },
    resetToken: {
      type: String,
      select: false,
    },
    resetTokenExpiry: {
      type: Date,
      select: false,
    },
    refreshTokens: [
      {
        token: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        expiresAt: {
          type: Date,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false, // Disable versioning completely
  },
);

// Indexes for better performance (only the ones not already defined in schema)
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ emailVerified: 1 });
UserSchema.index({ createdAt: -1 });

// Virtual for id
UserSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
UserSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete (ret as unknown as Record<string, unknown>).passwordHash;
    delete (ret as unknown as Record<string, unknown>).refreshTokens;
    delete (ret as unknown as Record<string, unknown>).__v;
    return ret;
  },
});

// Pre-save middleware to clean up expired refresh tokens
UserSchema.pre('save', function (next) {
  if (this.refreshTokens) {
    this.refreshTokens = this.refreshTokens.filter((token) => token.expiresAt > new Date());
  }
  next();
});

// Instance methods
UserSchema.methods.toPublicJSON = function () {
  const user = this.toObject({ virtuals: true });
  delete user.passwordHash;
  delete user.refreshTokens;
  delete user.emailVerificationToken;
  delete user.emailVerificationExpiry;
  delete user.resetToken;
  delete user.resetTokenExpiry;
  delete user.__v;

  // Convert _id to string for id field, then remove _id
  if (user._id) {
    user.id = user._id.toString();
    delete user._id;
  }

  return user;
};

UserSchema.methods.isValidRefreshToken = function (token: string) {
  return (
    (this.refreshTokens as IRefreshToken[] | undefined)?.some(
      (refreshToken: IRefreshToken) =>
        refreshToken.token === token && refreshToken.expiresAt > new Date(),
    ) || false
  );
};

UserSchema.methods.addRefreshToken = function (token: string, expiresAt: Date) {
  if (!this.refreshTokens) {
    this.refreshTokens = [];
  }

  // Remove old tokens (keep only last 5)
  if (this.refreshTokens.length >= 5) {
    this.refreshTokens.shift();
  }

  this.refreshTokens.push({
    token,
    createdAt: new Date(),
    expiresAt,
  });
};

UserSchema.methods.removeRefreshToken = function (token: string) {
  if (this.refreshTokens) {
    this.refreshTokens = this.refreshTokens.filter(
      (refreshToken: IRefreshToken) => refreshToken.token !== token,
    );
  }
};

export const User = model<IUser>('User', UserSchema);
