import { Pool } from 'pg';
import { config } from '../config';
import { logger } from '../utils/logger';

export const pool = new Pool({
  connectionString: config.database.url,
  max: 1, // Serverless - use single connection
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: {
    rejectUnauthorized: false // Required for Neon
  }
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle PostgreSQL client', err);
  // Don't exit in serverless environment - just log
  if (process.env.VERCEL !== '1') {
    process.exit(-1);
  }
});

export async function connectDatabase(): Promise<void> {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    logger.info('Database connected successfully', { timestamp: result.rows[0].now });
    client.release();
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await pool.end();
  logger.info('Database connection pool closed');
}
