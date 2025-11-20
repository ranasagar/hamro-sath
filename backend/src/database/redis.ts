import { createClient } from 'redis';
import { config } from '../config';
import { logger } from '../utils/logger';

// Only create Redis client if URL is properly configured (not localhost in production)
const shouldConnectRedis = config.redis.url && 
  (config.env !== 'production' || !config.redis.url.includes('localhost'));

export const redisClient = shouldConnectRedis ? createClient({
  url: config.redis.url,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        logger.error('Redis: Too many reconnection attempts');
        return new Error('Redis connection failed');
      }
      return retries * 500; // Exponential backoff
    },
  },
}) : null as any;

if (redisClient) {
  redisClient.on('error', (err: Error) => {
    logger.error('Redis Client Error:', err);
  });

  redisClient.on('connect', () => {
    logger.info('Redis client connected');
  });

  redisClient.on('ready', () => {
    logger.info('Redis client ready');
  });

  redisClient.on('reconnecting', () => {
    logger.warn('Redis client reconnecting');
  });
}

export async function connectRedis(): Promise<void> {
  if (!redisClient) {
    logger.warn('Redis not configured, skipping connection');
    return;
  }
  
  try {
    await redisClient.connect();
    await redisClient.ping();
    logger.info('Redis connected successfully');
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    // Don't throw - Redis is optional
  }
}

export async function disconnectRedis(): Promise<void> {
  if (!redisClient || !redisClient.isOpen) {
    return;
  }
  await redisClient.quit();
  logger.info('Redis connection closed');
}
