import { QueryResult, QueryResultRow } from 'pg';
import { pool } from './connection';

export class Database {
  /**
   * Execute a query with parameters
   */
  static async query<T extends QueryResultRow>(
    text: string,
    params?: unknown[]
  ): Promise<QueryResult<T>> {
    const start = Date.now();
    try {
      const result = await pool.query<T>(text, params);
      const duration = Date.now() - start;
      
      // Log slow queries (>1000ms)
      if (duration > 1000) {
        console.warn('Slow query detected:', {
          text,
          duration: `${duration}ms`,
          rows: result.rowCount,
        });
      }
      
      return result;
    } catch (error) {
      console.error('Database query error:', {
        text,
        params,
        error,
      });
      throw error;
    }
  }

  /**
   * Execute a transaction
   */
  static async transaction<T>(callback: () => Promise<T>): Promise<T> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback();
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Find one record
   */
  static async findOne<T extends QueryResultRow>(
    table: string,
    where: Record<string, unknown>
  ): Promise<T | null> {
    const keys = Object.keys(where);
    const values = Object.values(where);
    const whereClause = keys.map((key, i) => `${key} = $${i + 1}`).join(' AND ');
    
    const result = await this.query<T>(
      `SELECT * FROM ${table} WHERE ${whereClause} LIMIT 1`,
      values
    );
    
    return result.rows[0] || null;
  }

  /**
   * Find many records
   */
  static async findMany<T extends QueryResultRow>(
    table: string,
    where?: Record<string, unknown>,
    options?: {
      orderBy?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<T[]> {
    let query = `SELECT * FROM ${table}`;
    const params: unknown[] = [];
    
    if (where) {
      const keys = Object.keys(where);
      const values = Object.values(where);
      const whereClause = keys.map((key, i) => `${key} = $${i + 1}`).join(' AND ');
      query += ` WHERE ${whereClause}`;
      params.push(...values);
    }
    
    if (options?.orderBy) {
      query += ` ORDER BY ${options.orderBy}`;
    }
    
    if (options?.limit) {
      query += ` LIMIT ${options.limit}`;
    }
    
    if (options?.offset) {
      query += ` OFFSET ${options.offset}`;
    }
    
    const result = await this.query<T>(query, params);
    return result.rows;
  }

  /**
   * Insert a record
   */
  static async insert<T extends QueryResultRow>(
    table: string,
    data: Record<string, unknown>
  ): Promise<T> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    
    const result = await this.query<T>(
      `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    
    return result.rows[0];
  }

  /**
   * Update a record
   */
  static async update<T extends QueryResultRow>(
    table: string,
    where: Record<string, unknown>,
    data: Record<string, unknown>
  ): Promise<T | null> {
    const dataKeys = Object.keys(data);
    const dataValues = Object.values(data);
    const setClause = dataKeys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    
    const whereKeys = Object.keys(where);
    const whereValues = Object.values(where);
    const whereClause = whereKeys
      .map((key, i) => `${key} = $${i + dataKeys.length + 1}`)
      .join(' AND ');
    
    const result = await this.query<T>(
      `UPDATE ${table} SET ${setClause} WHERE ${whereClause} RETURNING *`,
      [...dataValues, ...whereValues]
    );
    
    return result.rows[0] || null;
  }

  /**
   * Delete a record
   */
  static async delete(
    table: string,
    where: Record<string, unknown>
  ): Promise<number> {
    const keys = Object.keys(where);
    const values = Object.values(where);
    const whereClause = keys.map((key, i) => `${key} = $${i + 1}`).join(' AND ');
    
    const result = await this.query(
      `DELETE FROM ${table} WHERE ${whereClause}`,
      values
    );
    
    return result.rowCount || 0;
  }

  /**
   * Count records
   */
  static async count(
    table: string,
    where?: Record<string, unknown>
  ): Promise<number> {
    let query = `SELECT COUNT(*) FROM ${table}`;
    const params: unknown[] = [];
    
    if (where) {
      const keys = Object.keys(where);
      const values = Object.values(where);
      const whereClause = keys.map((key, i) => `${key} = $${i + 1}`).join(' AND ');
      query += ` WHERE ${whereClause}`;
      params.push(...values);
    }
    
    const result = await this.query<{ count: string }>(query, params);
    return parseInt(result.rows[0].count, 10);
  }
}
