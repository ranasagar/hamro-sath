import { NextFunction, Request, Response } from 'express';
import { Database } from '../database/queries';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { CacheService } from '../utils/cache';
import { PasswordService } from '../utils/password';
import { ChangePasswordInput, UpdateProfileInput } from '../validators/auth.validator';

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

interface UserStats {
  id: number;
  user_id: number;
  total_points: number;
  issues_reported: number;
  issues_resolved: number;
  recycle_count: number;
  recycle_weight_kg: number;
  volunteer_hours: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: Date | null;
  updated_at: Date;
}

interface UserBadge {
  id: number;
  user_id: number;
  badge_id: number;
  earned_at: Date;
}

interface Badge {
  id: number;
  name: string;
  description: string | null;
  icon_url: string | null;
  category: string;
  rarity: string;
  points_bonus: number;
}

export class UserController {
  /**
   * Get user profile by ID
   */
  static async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = parseInt(req.params.id, 10);

      if (isNaN(userId)) {
        throw new AppError('Invalid user ID', 400);
      }

      // Try to get from cache first
      const cachedProfile = await CacheService.getUserProfile(userId);
      if (cachedProfile) {
        res.json({
          success: true,
          data: cachedProfile,
          cached: true,
        });
        return;
      }

      // Get user data
      const user = await Database.findOne<User>('users', { id: userId });
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Get user stats
      const stats = await Database.findOne<UserStats>('user_stats', { user_id: userId });

      // Get user badges with badge details
      const userBadges = await Database.query<UserBadge & Badge>(
        `SELECT ub.*, b.name, b.description, b.icon_url, b.category, b.rarity, b.points_bonus
         FROM user_badges ub
         JOIN badges b ON ub.badge_id = b.id
         WHERE ub.user_id = $1
         ORDER BY ub.earned_at DESC`,
        [userId]
      );

      const profileData = {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          fullName: user.full_name,
          phone: user.phone,
          wardId: user.ward_id,
          avatarUrl: user.avatar_url,
          role: user.role,
          isVerified: user.is_verified,
          createdAt: user.created_at,
        },
        stats: stats
          ? {
              totalPoints: stats.total_points,
              issuesReported: stats.issues_reported,
              issuesResolved: stats.issues_resolved,
              recycleCount: stats.recycle_count,
              recycleWeightKg: parseFloat(stats.recycle_weight_kg.toString()),
              volunteerHours: stats.volunteer_hours,
              currentStreak: stats.current_streak,
              longestStreak: stats.longest_streak,
              lastActivityDate: stats.last_activity_date,
            }
          : null,
        badges: userBadges.rows.map((badge) => ({
          id: badge.badge_id,
          name: badge.name,
          description: badge.description,
          iconUrl: badge.icon_url,
          category: badge.category,
          rarity: badge.rarity,
          pointsBonus: badge.points_bonus,
          earnedAt: badge.earned_at,
        })),
      };

      // Cache the profile data
      await CacheService.cacheUserProfile(userId, profileData);

      res.json({
        success: true,
        data: profileData,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user's own profile
   */
  static async getMyProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      // Reuse getProfile logic by setting params
      req.params.id = req.user.userId.toString();
      await UserController.getProfile(req, res, next);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const userId = parseInt(req.params.id, 10);

      // Users can only update their own profile (unless admin)
      if (userId !== req.user.userId && req.user.role !== 'admin') {
        throw new AppError('Forbidden: Cannot update another user\'s profile', 403);
      }

      const { fullName, phone, wardId, avatarUrl } = req.body as UpdateProfileInput;

      const updateData: Record<string, unknown> = {};
      if (fullName !== undefined) updateData.full_name = fullName;
      if (phone !== undefined) updateData.phone = phone;
      if (wardId !== undefined) updateData.ward_id = wardId;
      if (avatarUrl !== undefined) updateData.avatar_url = avatarUrl;

      if (Object.keys(updateData).length === 0) {
        throw new AppError('No fields to update', 400);
      }

      const updatedUser = await Database.update<User>('users', { id: userId }, updateData);

      if (!updatedUser) {
        throw new AppError('User not found', 404);
      }

      // Invalidate user cache after update
      await CacheService.invalidateUserProfile(userId);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            username: updatedUser.username,
            fullName: updatedUser.full_name,
            phone: updatedUser.phone,
            wardId: updatedUser.ward_id,
            avatarUrl: updatedUser.avatar_url,
            role: updatedUser.role,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change user password
   */
  static async changePassword(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const userId = parseInt(req.params.id, 10);

      // Users can only change their own password
      if (userId !== req.user.userId) {
        throw new AppError('Forbidden: Cannot change another user\'s password', 403);
      }

      const { currentPassword, newPassword } = req.body as ChangePasswordInput;

      // Validate new password strength
      const passwordValidation = PasswordService.validatePassword(newPassword);
      if (!passwordValidation.valid) {
        throw new AppError(passwordValidation.errors.join(', '), 400);
      }

      // Get user
      const user = await Database.findOne<User>('users', { id: userId });
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Verify current password
      const isValidPassword = await PasswordService.compare(currentPassword, user.password_hash);
      if (!isValidPassword) {
        throw new AppError('Current password is incorrect', 401);
      }

      // Hash new password
      const newPasswordHash = await PasswordService.hash(newPassword);

      // Update password
      await Database.update('users', { id: userId }, { password_hash: newPasswordHash });

      // Invalidate all sessions for security
      await Database.query('DELETE FROM sessions WHERE user_id = $1', [userId]);

      // Invalidate user cache
      await CacheService.invalidateUserProfile(userId);

      res.json({
        success: true,
        message: 'Password changed successfully. Please login again.',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's activity feed
   */
  static async getActivities(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = parseInt(req.params.id, 10);

      if (isNaN(userId)) {
        throw new AppError('Invalid user ID', 400);
      }

      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const activities = await Database.findMany(
        'activities',
        { user_id: userId },
        {
          orderBy: 'created_at DESC',
          limit,
          offset,
        }
      );

      const total = await Database.count('activities', { user_id: userId });

      res.json({
        success: true,
        data: {
          activities: activities.map((activity: Record<string, unknown>) => ({
            id: activity.id,
            activityType: activity.activity_type,
            relatedId: activity.related_id,
            description: activity.description,
            pointsEarned: activity.points_earned,
            createdAt: activity.created_at,
          })),
          pagination: {
            total,
            limit,
            offset,
            hasMore: offset + limit < total,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get leaderboard
   */
  static async getLeaderboard(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Try to get from cache first
      const cachedLeaderboard = await CacheService.getLeaderboard();
      if (cachedLeaderboard) {
        res.json({
          success: true,
          data: cachedLeaderboard,
          cached: true,
        });
        return;
      }

      const leaderboard = await Database.query<User & UserStats>(
        `SELECT u.id, u.username, u.full_name, u.avatar_url, u.ward_id,
                us.total_points, us.issues_reported, us.issues_resolved, 
                us.recycle_count, us.volunteer_hours
         FROM users u
         JOIN user_stats us ON u.id = us.user_id
         ORDER BY us.total_points DESC
         LIMIT 50`
      );

      const leaderboardData = {
        leaderboard: leaderboard.rows.map((user, index) => ({
          rank: index + 1,
          userId: user.id,
          username: user.username,
          fullName: user.full_name,
          avatarUrl: user.avatar_url,
          wardId: user.ward_id,
          totalPoints: user.total_points,
          issuesReported: user.issues_reported,
          issuesResolved: user.issues_resolved,
          recycleCount: user.recycle_count,
          volunteerHours: user.volunteer_hours,
        })),
      };

      // Cache leaderboard for 5 minutes
      await CacheService.cacheLeaderboard(leaderboardData);

      res.json({
        success: true,
        data: leaderboardData,
      });
    } catch (error) {
      next(error);
    }
  }
}
