import dotenv from 'dotenv';
import app from './app';
import { config } from './config';
import { connectDatabase } from './database/connection';
import { connectRedis } from './database/redis';
import { CacheManager } from './services/cacheManager';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

async function startServer(): Promise<void> {
  try {
    // Connect to PostgreSQL
    await connectDatabase();
    logger.info('Connected to PostgreSQL database');

    // Connect to Redis
    await connectRedis();
    logger.info('Connected to Redis');

    // Start cache manager
    CacheManager.start();

    // Start Express server
    const server = app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port} in ${config.env} mode`);
      logger.info(`API available at http://localhost:${config.port}/api/${config.apiVersion}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string): Promise<void> => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      
      // Stop cache manager
      CacheManager.stop();
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        // Close database connections
        // await pool.end();
        // await redisClient.quit();
        
        logger.info('Database connections closed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer().catch((error) => {
  logger.error('Unhandled error during startup:', error);
  process.exit(1);
});
