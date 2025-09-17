import { Schema, model } from 'mongoose';
import { IRefreshToken, IUser, UserStatus } from './user.types';

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
      index: true,
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
      index: true,
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

    // Single source of truth for user status
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.PENDING_VERIFICATION,
    },

    // Simplified deletion management - only need requested date
    deletionRequestedAt: {
      type: Date,
      default: null,
    },
    deletionReason: {
      type: String,
      select: false, // Don't include by default
    },
    deactivationReason: {
      type: String,
      select: false, // Don't include by default
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
    versionKey: false,
  },
);

// Indexes for better performance
UserSchema.index({ role: 1 });
UserSchema.index({ emailVerified: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ status: 1 });
UserSchema.index({ deletionRequestedAt: 1 }); // For cleanup jobs

// Virtual for id
UserSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Computed properties (virtual methods)
UserSchema.methods.isActive = function (): boolean {
  return this.status === UserStatus.ACTIVE;
};

UserSchema.methods.canLogin = function (): boolean {
  // Users can login if they have deletion requested (within 30 days) to reactivate
  if (this.status === UserStatus.DELETION_REQUESTED && !this.isDeletionExpired()) {
    return this.emailVerified;
  }

  return [UserStatus.ACTIVE].includes(this.status) && this.emailVerified;
};

UserSchema.methods.isBlocked = function (): boolean {
  return [UserStatus.BLOCKED, UserStatus.SUSPENDED].includes(this.status);
};

UserSchema.methods.isDeletionRequested = function (): boolean {
  return this.status === UserStatus.DELETION_REQUESTED && this.deletionRequestedAt;
};

UserSchema.methods.isDeletionExpired = function (): boolean {
  if (!this.deletionRequestedAt) return false;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return this.deletionRequestedAt <= thirtyDaysAgo;
};

UserSchema.methods.getDeletionExpiryDate = function (): Date | null {
  if (!this.deletionRequestedAt) return null;

  const expiryDate = new Date(this.deletionRequestedAt);
  expiryDate.setDate(expiryDate.getDate() + 30);

  return expiryDate;
};

// Status management methods
UserSchema.methods.activate = function (): void {
  this.status = UserStatus.ACTIVE;
  this.deactivationReason = undefined;
};

UserSchema.methods.deactivate = function (reason?: string): void {
  this.status = UserStatus.INACTIVE;
  if (reason) {
    this.deactivationReason = reason;
  }
};

UserSchema.methods.block = function (reason?: string): void {
  this.status = UserStatus.BLOCKED;
  if (reason) {
    this.deactivationReason = reason;
  }
  this.refreshTokens = [];
};

UserSchema.methods.unblock = function (): void {
  this.status = UserStatus.ACTIVE;
  this.deactivationReason = undefined;
};

UserSchema.methods.requestDeletion = function (reason?: string): void {
  this.deletionRequestedAt = new Date();
  if (reason) {
    this.deletionReason = reason;
  }

  this.status = UserStatus.DELETION_REQUESTED;
};

UserSchema.methods.cancelDeletionRequest = function (): void {
  this.deletionRequestedAt = null;
  this.deletionReason = undefined;
  this.status = UserStatus.ACTIVE;
};

UserSchema.methods.reactivateAccount = function (): void {
  this.deletionRequestedAt = null;
  this.deletionReason = undefined;
  this.deactivationReason = undefined;
  this.status = UserStatus.ACTIVE;
  this.lastLogin = new Date();
};

// Enhanced toJSON transformation
UserSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete (ret as unknown as Record<string, unknown>).passwordHash;
    delete (ret as unknown as Record<string, unknown>).refreshTokens;
    delete (ret as unknown as Record<string, unknown>).__v;
    delete (ret as unknown as Record<string, unknown>).emailVerificationToken;
    delete (ret as unknown as Record<string, unknown>).resetToken;
    delete (ret as unknown as Record<string, unknown>).deletionReason;
    delete (ret as unknown as Record<string, unknown>).deactivationReason;
    return ret;
  },
});

// Pre-save middleware
UserSchema.pre('save', function (next) {
  // Clean up expired refresh tokens
  if (this.refreshTokens) {
    this.refreshTokens = this.refreshTokens.filter((token) => token.expiresAt > new Date());
  }

  // Auto-update status based on email verification
  if (
    this.isModified('emailVerified') &&
    this.emailVerified &&
    this.status === UserStatus.PENDING_VERIFICATION
  ) {
    this.status = UserStatus.ACTIVE;
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
  delete user.deletionReason;
  delete user.deactivationReason;
  delete user.__v;

  if (user._id) {
    user.id = user._id.toString();
    delete user._id;
  }

  // Add calculated deletion expiry date
  user.deletionExpiryDate = this.getDeletionExpiryDate();

  return user;
};

// Existing refresh token methods remain the same
UserSchema.methods.isValidRefreshToken = function (token: string) {
  return (
    this.refreshTokens?.some(
      (refreshToken: IRefreshToken) =>
        refreshToken.token === token && refreshToken.expiresAt > new Date(),
    ) || false
  );
};

UserSchema.methods.addRefreshToken = function (token: string, expiresAt: Date) {
  if (!this.refreshTokens) {
    this.refreshTokens = [];
  }

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
