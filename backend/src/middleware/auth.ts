import { NextFunction, Request, Response } from 'express';
import { JWTService } from '../utils/jwt';
import { AppError } from './errorHandler';

// AuthRequest now defined in src/types/express.d.ts
export type AuthRequest = Request;

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const payload = JWTService.verifyAccessToken(token);
      req.user = {
        userId: payload.userId,
        id: payload.userId, // Alias for compatibility
        email: payload.email,
        role: payload.role,
      };
      next();
    } catch {
      throw new AppError('Invalid or expired token', 401);
    }
  } catch (error) {
    next(error);
  }
};

export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('Unauthorized', 401));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new AppError('Forbidden: Insufficient permissions', 403));
      return;
    }

    next();
  };
};
