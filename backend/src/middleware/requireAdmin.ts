import { NextFunction, Response } from 'express';
import { AuthRequest } from './auth';
import { AppError } from './errorHandler';

/**
 * Middleware to check if authenticated user is an admin
 * Should be used after authenticate middleware
 */
export const requireAdmin = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  if (!req.user) {
    next(new AppError('Authentication required', 401));
    return;
  }

  if (req.user.role !== 'admin') {
    next(new AppError('Admin access required', 403));
    return;
  }

  next();
};
