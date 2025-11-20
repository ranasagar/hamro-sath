import { CacheService } from '../utils/cache';
import { logger } from '../utils/logger';

/**
 * Background service for cache management
 */
export class CacheManager {
  private static intervals: NodeJS.Timeout[] = [];

  /**
   * Start all background cache tasks
   */
  static start(): void {
    logger.info('Starting cache manager...');

    // Cleanup expired sessions every hour
    this.intervals.push(
      setInterval(() => {
        this.cleanupExpiredSessions().catch((error) => {
          logger.error('Failed to cleanup expired sessions:', error);
        });
      }, 60 * 60 * 1000) // 1 hour
    );

    logger.info('Cache manager started successfully');
  }

  /**
   * Stop all background tasks
   */
  static stop(): void {
    logger.info('Stopping cache manager...');
    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals = [];
    logger.info('Cache manager stopped');
  }

  /**
   * Cleanup expired sessions from database
   */
  private static async cleanupExpiredSessions(): Promise<void> {
    try {
      const { Database } = await import('../database/queries');
      const result = await Database.query(
        'DELETE FROM sessions WHERE expires_at < NOW()'
      );
      logger.info(`Cleaned up ${result.rowCount || 0} expired sessions`);
    } catch (error) {
      logger.error('Error cleaning up expired sessions:', error);
    }
  }

  /**
   * Manually refresh leaderboard cache
   */
  static async refreshLeaderboard(): Promise<void> {
    try {
      await CacheService.delete('leaderboard:global');
      logger.info('Leaderboard cache refreshed');
    } catch (error) {
      logger.error('Error refreshing leaderboard cache:', error);
    }
  }

  /**
   * Clear all user-related caches
   */
  static async clearUserCaches(userId: number): Promise<void> {
    try {
      await CacheService.invalidateUserCaches(userId);
      logger.info(`Cleared all caches for user ${userId}`);
    } catch (error) {
      logger.error(`Error clearing caches for user ${userId}:`, error);
    }
  }

  /**
   * Get cache statistics
   */
  static async getStats(): Promise<{
    redisConnected: boolean;
    totalKeys: number;
  }> {
    try {
      const { redisClient } = await import('../database/redis');
      const keys = await redisClient.keys('*');
      return {
        redisConnected: redisClient.isOpen,
        totalKeys: keys.length,
      };
    } catch (error) {
      logger.error('Error getting cache stats:', error);
      return {
        redisConnected: false,
        totalKeys: 0,
      };
    }
  }
}
