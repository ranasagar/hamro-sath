import { NextFunction, Request, Response } from 'express';
import { Database } from '../database/queries';
import { AppError } from '../middleware/errorHandler';
import { JWTService } from '../utils/jwt';
import { PasswordService } from '../utils/password';
import { LoginInput, RegisterInput } from '../validators/auth.validator';

interface User {
  id: number;
  email: string;
  username: string;
  password_hash: string;
  full_name: string;
  phone: string | null;
  ward_id: number | null;
  avatar_url: string | null;
  role: string;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

interface Session {
  id: number;
  user_id: number;
  refresh_token: string;
  ip_address: string | null;
  user_agent: string | null;
  expires_at: Date;
  created_at: Date;
}

export class AuthController {
  /**
   * Register a new user
   */
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, username, password, fullName, phone, wardId } =
        req.body as RegisterInput;

      // Validate password strength
      const passwordValidation = PasswordService.validatePassword(password);
      if (!passwordValidation.valid) {
        throw new AppError(passwordValidation.errors.join(', '), 400);
      }

      // Check if email exists
      const existingEmail = await Database.findOne<User>('users', { email });
      if (existingEmail) {
        throw new AppError('Email already registered', 409);
      }

      // Check if username exists
      const existingUsername = await Database.findOne<User>('users', { username });
      if (existingUsername) {
        throw new AppError('Username already taken', 409);
      }

      // Hash password
      const passwordHash = await PasswordService.hash(password);

      // Create user
      const user = await Database.insert<User>('users', {
        email,
        username,
        password_hash: passwordHash,
        full_name: fullName,
        phone: phone || null,
        ward_id: wardId || null,
        role: 'citizen',
        is_verified: false,
      });

      // Create user stats record
      await Database.insert('user_stats', {
        user_id: user.id,
        total_points: 0,
        issues_reported: 0,
        issues_resolved: 0,
        recycle_count: 0,
        recycle_weight_kg: 0,
        volunteer_hours: 0,
        current_streak: 0,
        longest_streak: 0,
      });

      // Generate tokens
      const tokens = JWTService.generateTokenPair({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Store refresh token
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

      await Database.insert<Session>('sessions', {
        user_id: user.id,
        refresh_token: tokens.refreshToken,
        ip_address: req.ip || null,
        user_agent: req.get('user-agent') || null,
        expires_at: expiresAt,
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            fullName: user.full_name,
            role: user.role,
          },
          tokens,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   */
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body as LoginInput;

      // Find user
      const user = await Database.findOne<User>('users', { email });
      if (!user) {
        throw new AppError('Invalid email or password', 401);
      }

      // Verify password
      const isValidPassword = await PasswordService.compare(password, user.password_hash);
      if (!isValidPassword) {
        throw new AppError('Invalid email or password', 401);
      }

      // Generate tokens
      const tokens = JWTService.generateTokenPair({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Store refresh token
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await Database.insert<Session>('sessions', {
        user_id: user.id,
        refresh_token: tokens.refreshToken,
        ip_address: req.ip || null,
        user_agent: req.get('user-agent') || null,
        expires_at: expiresAt,
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            fullName: user.full_name,
            role: user.role,
            avatarUrl: user.avatar_url,
            wardId: user.ward_id,
          },
          tokens,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new AppError('Refresh token is required', 400);
      }

      // Verify refresh token
      const payload = JWTService.verifyRefreshToken(refreshToken);

      // Check if session exists
      const session = await Database.findOne<Session>('sessions', {
        refresh_token: refreshToken,
      });

      if (!session) {
        throw new AppError('Invalid refresh token', 401);
      }

      // Check if session expired
      if (new Date(session.expires_at) < new Date()) {
        await Database.delete('sessions', { id: session.id });
        throw new AppError('Refresh token expired', 401);
      }

      // Generate new access token
      const newAccessToken = JWTService.generateAccessToken({
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      });

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: newAccessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user
   */
  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        await Database.delete('sessions', { refresh_token: refreshToken });
      }

      res.json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  }
}
