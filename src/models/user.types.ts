import { Document, Types } from 'mongoose';

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
  isActive: boolean;
  isBlocked: boolean;
  deletionRequestedAt: Date | null;
  lastLogin: Date | null;
  onboardingCompleted: boolean;
  oauthProviders?: IOAuthProvider[];
  refreshTokens?: IRefreshToken[];
  createdAt: Date;
  updatedAt: Date;
  __v: number;

  // Instance methods
  toPublicJSON(): Omit<Omit<IUser, 'passwordHash' | 'refreshTokens' | '__v'>, '_id' | 'id'> & {
    _id: string;
    id: string;
  };
  isValidRefreshToken(token: string): boolean;
  addRefreshToken(token: string, expiresAt: Date): void;
  removeRefreshToken(token: string): void;
}

export interface IUserCreate {
  name: string;
  username: string;
  email: string;
  password: string;
  role?: 'admin' | 'user';
  emailVerified?: boolean;
  isActive?: boolean;
  onboardingCompleted?: boolean;
}

export interface IUserUpdate {
  name?: string;
  username?: string;
  email?: string;
  role?: 'admin' | 'user';
  emailVerified?: boolean;
  isActive?: boolean;
  isBlocked?: boolean;
  onboardingCompleted?: boolean;
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

export interface IUserPublic {
  _id: string;
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
