import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthRequest } from './auth';

/**
 * Optional authentication middleware
 * Attaches user to request if token is valid, but doesn't fail if token is missing
 */
export const optionalAuthMiddleware = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user
      return next();
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as {
        userId: number;
        email: string;
        role: string;
      };

      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };
    } catch (error) {
      // Invalid token, continue without user
      console.log('Optional auth: Invalid token, continuing without user');
    }

    next();
  } catch (error) {
    // Any error, continue without user
    next();
  }
};
