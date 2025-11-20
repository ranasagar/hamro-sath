import { redisClient } from '../database/redis';
import { logger } from './logger';

export class CacheService {
  private static readonly DEFAULT_TTL = 300; // 5 minutes in seconds

  /**
   * Get value from cache
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redisClient.get(key);
      if (!value) return null;

      return JSON.parse(value) as T;
    } catch (error) {
      logger.error('Cache get error:', { key, error });
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  static async set(key: string, value: unknown, ttl: number = this.DEFAULT_TTL): Promise<void> {
    try {
      await redisClient.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      logger.error('Cache set error:', { key, error });
    }
  }

  /**
   * Delete key from cache
   */
  static async delete(key: string): Promise<void> {
    try {
      await redisClient.del(key);
    } catch (error) {
      logger.error('Cache delete error:', { key, error });
    }
  }

  /**
   * Delete multiple keys matching pattern
   */
  static async deletePattern(pattern: string): Promise<void> {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (error) {
      logger.error('Cache delete pattern error:', { pattern, error });
    }
  }

  /**
   * Check if key exists
   */
  static async exists(key: string): Promise<boolean> {
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Cache exists error:', { key, error });
      return false;
    }
  }

  /**
   * Get TTL of a key
   */
  static async ttl(key: string): Promise<number> {
    try {
      return await redisClient.ttl(key);
    } catch (error) {
      logger.error('Cache TTL error:', { key, error });
      return -1;
    }
  }

  /**
   * Increment value (useful for counters)
   */
  static async increment(key: string, amount: number = 1): Promise<number> {
    try {
      return await redisClient.incrBy(key, amount);
    } catch (error) {
      logger.error('Cache increment error:', { key, error });
      return 0;
    }
  }

  /**
   * Set value if not exists (useful for distributed locks)
   */
  static async setNX(key: string, value: unknown, ttl: number = this.DEFAULT_TTL): Promise<boolean> {
    try {
      const result = await redisClient.set(key, JSON.stringify(value), {
        NX: true,
        EX: ttl,
      });
      return result === 'OK';
    } catch (error) {
      logger.error('Cache setNX error:', { key, error });
      return false;
    }
  }

  /**
   * Cache leaderboard data
   */
  static async cacheLeaderboard(data: unknown): Promise<void> {
    await this.set('leaderboard:global', data, 300); // 5 minutes
  }

  /**
   * Get cached leaderboard
   */
  static async getLeaderboard<T>(): Promise<T | null> {
    return this.get<T>('leaderboard:global');
  }

  /**
   * Cache user profile
   */
  static async cacheUserProfile(userId: number, data: unknown): Promise<void> {
    await this.set(`user:profile:${userId}`, data, 600); // 10 minutes
  }

  /**
   * Get cached user profile
   */
  static async getUserProfile<T>(userId: number): Promise<T | null> {
    return this.get<T>(`user:profile:${userId}`);
  }

  /**
   * Invalidate user profile cache
   */
  static async invalidateUserProfile(userId: number): Promise<void> {
    await this.delete(`user:profile:${userId}`);
  }

  /**
   * Cache user badges
   */
  static async cacheUserBadges(userId: number, badges: unknown): Promise<void> {
    await this.set(`user:badges:${userId}`, badges, 600); // 10 minutes
  }

  /**
   * Get cached user badges
   */
  static async getUserBadges<T>(userId: number): Promise<T | null> {
    return this.get<T>(`user:badges:${userId}`);
  }

  /**
   * Cache points transaction
   */
  static async cachePointsBalance(userId: number, points: number): Promise<void> {
    await this.set(`user:points:${userId}`, points, 300); // 5 minutes
  }

  /**
   * Get cached points balance
   */
  static async getPointsBalance(userId: number): Promise<number | null> {
    return this.get<number>(`user:points:${userId}`);
  }

  /**
   * Invalidate all user-related caches
   */
  static async invalidateUserCaches(userId: number): Promise<void> {
    await this.deletePattern(`user:*:${userId}`);
  }

  /**
   * Cache issue list
   */
  static async cacheIssues(filters: string, data: unknown): Promise<void> {
    await this.set(`issues:list:${filters}`, data, 180); // 3 minutes
  }

  /**
   * Get cached issues
   */
  static async getIssues<T>(filters: string): Promise<T | null> {
    return this.get<T>(`issues:list:${filters}`);
  }

  /**
   * Invalidate all issue caches
   */
  static async invalidateIssueCaches(): Promise<void> {
    await this.deletePattern('issues:*');
  }
}
