import { Request as ExpressRequest } from 'express';
import { User } from '../modules/users/entities/user.entity';

// Extend Express Request type to include user from JWT
export interface Request extends ExpressRequest {
  user: User & {
    id: string; // User ID (from User entity)
    sub?: string; // Original JWT payload sub field
    iat?: number;
    exp?: number;
  };
}
