import { Document, Types } from 'mongoose';

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
  DELETION_REQUESTED = 'deletion_requested',
  DELETED = 'deleted',
}

export interface IOAuthProvider {
  _id?: Types.ObjectId;
  provider: 'google' | 'github' | 'facebook';
  providerId: string;
  email: string;
  connectedAt: Date;
}

export interface IRefreshToken {
  token: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  username: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'user';
  emailVerified: boolean;
  status: UserStatus;

  deletionRequestedAt: Date | null;
  deletionReason?: string;
  deactivationReason?: string;

  lastLogin: Date | null;
  onboardingCompleted: boolean;
  oauthProviders?: IOAuthProvider[];
  refreshTokens?: IRefreshToken[];
  resetToken?: string | null;
  resetTokenExpiry?: Date | null;
  emailVerificationToken?: string | null;
  emailVerificationExpiry?: Date | null;
  createdAt: Date;
  updatedAt: Date;

  isActive(): boolean;
  canLogin(): boolean;
  isBlocked(): boolean;
  isDeletionRequested(): boolean;
  isDeletionExpired(): boolean;
  getDeletionExpiryDate(): Date | null;

  // Instance methods
  toPublicJSON(): IUserPublic;
  isValidRefreshToken(token: string): boolean;
  addRefreshToken(token: string, expiresAt: Date): void;
  removeRefreshToken(token: string): void;

  // Status management methods
  activate(): void;
  deactivate(): void;
  block(reason?: string): void;
  unblock(): void;
  requestDeletion(reason?: string): void;
  cancelDeletionRequest(): void;
  reactivateAccount(): void;
}

// Updated interfaces
export interface IUserCreate {
  name: string;
  username: string;
  email: string;
  password: string;
  role?: 'admin' | 'user';
  emailVerified?: boolean;
  status?: UserStatus;
  onboardingCompleted?: boolean;
}

export interface IUserUpdate {
  name?: string;
  username?: string;
  email?: string;
  role?: 'admin' | 'user';
  emailVerified?: boolean;
  status?: UserStatus;
  onboardingCompleted?: boolean;
}

export interface IUserPublic {
  id: string;
  name: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  emailVerified: boolean;
  status: UserStatus;
  deletionRequestedAt: Date | null;
  deletionExpiryDate: Date | null;
  lastLogin: Date | null;
  onboardingCompleted: boolean;
  oauthProviders?: IOAuthProvider[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserLogin {
  identifier: string; // email or username
  password: string;
}

export interface IUserChangePassword {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface IResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface IUserPublic {
  id: string;
  name: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  emailVerified: boolean;
  isActive: boolean;
  isBlocked: boolean;
  deletionRequestedAt: Date | null;
  lastLogin: Date | null;
  onboardingCompleted: boolean;
  oauthProviders?: IOAuthProvider[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthResponse {
  user: IUserPublic;
  tokens: IAuthTokens;
  message: string;
}
