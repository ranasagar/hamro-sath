import { pool } from '../database/connection';
import { redisClient } from '../database/redis';
import { AppError } from '../middleware/errorHandler';

export interface Challenge {
  id: number;
  title: string;
  description: string;
  ward_id: number | null;
  target_points: number;
  start_date: Date;
  end_date: Date;
  is_active: boolean;
  created_by: number;
  created_at: Date;
  updated_at: Date;
  ward_name?: string;
}

export interface ChallengeParticipation {
  user_id: number;
  challenge_id: number;
  points_earned: number;
  rank: number;
  full_name: string;
  avatar_url?: string;
}

export class ChallengeService {
  /**
   * Get all challenges with optional filters
   */
  static async getAll(filters?: {
    ward_id?: number;
    is_active?: boolean;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        c.*,
        w.ward_name,
        u.full_name as creator_name
      FROM challenges c
      LEFT JOIN wards w ON c.ward_id = w.id
      LEFT JOIN users u ON c.created_by = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (filters?.ward_id !== undefined) {
      query += ` AND (c.ward_id = $${paramCount} OR c.ward_id IS NULL)`;
      params.push(filters.ward_id);
      paramCount++;
    }

    if (filters?.is_active !== undefined) {
      query += ` AND c.is_active = $${paramCount}`;
      params.push(filters.is_active);
      paramCount++;
    }

    query += ` ORDER BY c.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) FROM challenges c WHERE 1=1`;
    const countParams: any[] = [];
    let countParamIdx = 1;

    if (filters?.ward_id !== undefined) {
      countQuery += ` AND (c.ward_id = $${countParamIdx} OR c.ward_id IS NULL)`;
      countParams.push(filters.ward_id);
      countParamIdx++;
    }

    if (filters?.is_active !== undefined) {
      countQuery += ` AND c.is_active = $${countParamIdx}`;
      countParams.push(filters.is_active);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    return {
      challenges: result.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get single challenge by ID
   */
  static async getById(challengeId: number) {
    const query = `
      SELECT 
        c.*,
        w.ward_name,
        u.full_name as creator_name
      FROM challenges c
      LEFT JOIN wards w ON c.ward_id = w.id
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.id = $1
    `;

    const result = await pool.query(query, [challengeId]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  /**
   * Create new challenge (admin only)
   */
  static async create(data: {
    title: string;
    description: string;
    ward_id: number | null;
    target_points: number;
    start_date: Date;
    end_date: Date;
    created_by: number;
  }) {
    const { title, description, ward_id, target_points, start_date, end_date, created_by } = data;

    const query = `
      INSERT INTO challenges (title, description, ward_id, target_points, start_date, end_date, created_by, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, true)
      RETURNING *
    `;

    const result = await pool.query(query, [
      title,
      description,
      ward_id,
      target_points,
      start_date,
      end_date,
      created_by,
    ]);

    // Invalidate cache
    if (redisClient && redisClient.isOpen) {
      await redisClient.del('challenges:*');
    }

    return result.rows[0];
  }

  /**
   * Update challenge
   */
  static async update(challengeId: number, data: Partial<Challenge>) {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.title !== undefined) {
      updates.push(`title = $${paramCount}`);
      values.push(data.title);
      paramCount++;
    }

    if (data.description !== undefined) {
      updates.push(`description = $${paramCount}`);
      values.push(data.description);
      paramCount++;
    }

    if (data.ward_id !== undefined) {
      updates.push(`ward_id = $${paramCount}`);
      values.push(data.ward_id);
      paramCount++;
    }

    if (data.target_points !== undefined) {
      updates.push(`target_points = $${paramCount}`);
      values.push(data.target_points);
      paramCount++;
    }

    if (data.start_date !== undefined) {
      updates.push(`start_date = $${paramCount}`);
      values.push(data.start_date);
      paramCount++;
    }

    if (data.end_date !== undefined) {
      updates.push(`end_date = $${paramCount}`);
      values.push(data.end_date);
      paramCount++;
    }

    if (data.is_active !== undefined) {
      updates.push(`is_active = $${paramCount}`);
      values.push(data.is_active);
      paramCount++;
    }

    if (updates.length === 0) {
      throw new AppError('No valid fields to update', 400);
    }

    updates.push(`updated_at = NOW()`);
    values.push(challengeId);

    const query = `UPDATE challenges SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      throw new AppError('Challenge not found', 404);
    }

    // Invalidate cache
    if (redisClient && redisClient.isOpen) {
      await redisClient.del('challenges:*');
    }

    return result.rows[0];
  }

  /**
   * Delete challenge
   */
  static async delete(challengeId: number) {
    const query = `DELETE FROM challenges WHERE id = $1`;
    const result = await pool.query(query, [challengeId]);

    if (result.rowCount === 0) {
      throw new AppError('Challenge not found', 404);
    }

    // Invalidate cache
    if (redisClient && redisClient.isOpen) {
      await redisClient.del('challenges:*');
    }

    return true;
  }

  /**
   * Get challenge leaderboard
   */
  static async getLeaderboard(challengeId: number, limit = 50) {
    // Get challenge details first
    const challenge = await this.getById(challengeId);
    if (!challenge) {
      throw new AppError('Challenge not found', 404);
    }

    // Build query based on ward_id
    let query = `
      SELECT 
        u.id as user_id,
        u.full_name,
        u.avatar_url,
        us.total_points as points_earned,
        RANK() OVER (ORDER BY us.total_points DESC) as rank
      FROM users u
      JOIN user_stats us ON u.id = us.user_id
      WHERE 1=1
    `;

    const params: any[] = [];

    // If challenge is ward-specific, filter by ward
    if (challenge.ward_id) {
      query += ` AND u.ward_id = $1`;
      params.push(challenge.ward_id);
    }

    query += ` ORDER BY us.total_points DESC LIMIT ${limit}`;

    const result = await pool.query(query, params);

    return result.rows;
  }
}
