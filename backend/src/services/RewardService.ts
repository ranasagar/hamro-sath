import { pool } from '../database/connection';
import { redisClient } from '../database/redis';

export interface Reward {
  id: number;
  name: string;
  description: string;
  category: 'merchandise' | 'coupon' | 'event' | 'service' | 'safety_kit';
  points_required: number;
  quantity_available: number;
  image_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RewardFilters {
  category?: string;
  min_points?: number;
  max_points?: number;
  page?: number;
  limit?: number;
}

export interface RedeemRewardData {
  reward_id: number;
  user_id: number;
  delivery_address?: string;
  contact_phone?: string;
  notes?: string;
}

export class RewardService {
  /**
   * List rewards with filters and pagination
   */
  static async list(filters: RewardFilters = {}) {
    const { category, min_points, max_points, page = 1, limit = 20 } = filters;

    const offset = (page - 1) * limit;
    const conditions: string[] = ['is_active = true'];
    const params: any[] = [];
    let paramIndex = 1;

    if (category) {
      conditions.push(`category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    if (min_points !== undefined) {
      conditions.push(`points_required >= $${paramIndex}`);
      params.push(min_points);
      paramIndex++;
    }

    if (max_points !== undefined) {
      conditions.push(`points_required <= $${paramIndex}`);
      params.push(max_points);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM rewards ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get rewards
    const query = `
      SELECT * FROM rewards 
      ${whereClause}
      ORDER BY points_required ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    return {
      rewards: result.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get single reward by ID
   */
  static async getById(rewardId: number) {
    const query = `
      SELECT 
        r.*,
        (SELECT COUNT(*) FROM redemptions WHERE reward_id = r.id) as redemption_count
      FROM rewards r
      WHERE r.id = $1
    `;

    const result = await pool.query(query, [rewardId]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  /**
   * Redeem a reward
   */
  static async redeem(data: RedeemRewardData) {
    const { reward_id, user_id, delivery_address, contact_phone, notes } = data;

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if reward exists and is active
      const rewardResult = await client.query(
        `SELECT * FROM rewards WHERE id = $1 AND is_active = true FOR UPDATE`,
        [reward_id]
      );

      if (rewardResult.rows.length === 0) {
        throw new Error('Reward not found or not available');
      }

      const reward = rewardResult.rows[0];

      // Check if user has enough points
      const userResult = await client.query(
        `SELECT us.total_points as points FROM user_stats us WHERE us.user_id = $1 FOR UPDATE`,
        [user_id]
      );

      if (userResult.rows.length === 0) {
        throw new Error('User stats not found');
      }

      const userPoints = userResult.rows[0].points;

      if (userPoints < reward.points_required) {
        throw new Error(
          `Insufficient points. Required: ${reward.points_required}, Available: ${userPoints}`
        );
      }

      // Check quantity if limited
      if (reward.quantity_available !== null && reward.quantity_available <= 0) {
        throw new Error('Reward is out of stock');
      }

      // Deduct points from user
      await client.query(
        `UPDATE user_stats SET total_points = total_points - $1 WHERE user_id = $2`,
        [reward.points_required, user_id]
      );

      // Decrease quantity if limited
      if (reward.quantity_available !== null) {
        await client.query(
          `UPDATE rewards SET quantity_available = quantity_available - 1 WHERE id = $1`,
          [reward_id]
        );
      }

      // Create redemption record
      const redemptionResult = await client.query(
        `INSERT INTO redemptions (user_id, reward_id, points_spent, status, delivery_address, contact_phone, notes)
         VALUES ($1, $2, $3, 'pending', $4, $5, $6)
         RETURNING *`,
        [user_id, reward_id, reward.points_required, delivery_address, contact_phone, notes]
      );

      // Log activity
      await client.query(
        `INSERT INTO activities (user_id, activity_type, description, points_earned, related_id)
         VALUES ($1, 'reward_redeemed', $2, $3, $4)`,
        [user_id, `Redeemed: ${reward.name}`, -reward.points_required, reward_id]
      );

      await client.query('COMMIT');

      // Invalidate cache
      if (redisClient && redisClient.isOpen) {
        await redisClient.del('rewards:*');
      }

      return redemptionResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get user's redemption history
   */
  static async getUserRedemptions(userId: number, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        rd.*,
        r.name as reward_name,
        r.description as reward_description,
        r.category as reward_category,
        r.image_url as reward_image_url
      FROM redemptions rd
      JOIN rewards r ON rd.reward_id = r.id
      WHERE rd.user_id = $1
      ORDER BY rd.redeemed_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [userId, limit, offset]);

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM redemptions WHERE user_id = $1`,
      [userId]
    );
    const total = parseInt(countResult.rows[0].total);

    return {
      redemptions: result.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Create new reward (Admin only)
   */
  static async create(data: {
    name: string;
    description: string;
    category: string;
    points_required: number;
    quantity_available: number | null;
    image_url: string | null;
  }) {
    const query = `
      INSERT INTO rewards (name, description, category, points_required, quantity_available, image_url, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, true)
      RETURNING *
    `;

    const result = await pool.query(query, [
      data.name,
      data.description,
      data.category,
      data.points_required,
      data.quantity_available,
      data.image_url,
    ]);

    return result.rows[0];
  }

  /**
   * Update reward (Admin only)
   */
  static async update(
    rewardId: number,
    data: {
      name?: string;
      description?: string;
      category?: string;
      points_required?: number;
      quantity_available?: number;
      image_url?: string;
      is_active?: boolean;
    }
  ) {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(data.name);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(data.description);
    }
    if (data.category !== undefined) {
      fields.push(`category = $${paramCount++}`);
      values.push(data.category);
    }
    if (data.points_required !== undefined) {
      fields.push(`points_required = $${paramCount++}`);
      values.push(data.points_required);
    }
    if (data.quantity_available !== undefined) {
      fields.push(`quantity_available = $${paramCount++}`);
      values.push(data.quantity_available);
    }
    if (data.image_url !== undefined) {
      fields.push(`image_url = $${paramCount++}`);
      values.push(data.image_url);
    }
    if (data.is_active !== undefined) {
      fields.push(`is_active = $${paramCount++}`);
      values.push(data.is_active);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push(`updated_at = NOW()`);
    values.push(rewardId);

    const query = `
      UPDATE rewards
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      throw new Error('Reward not found');
    }

    return result.rows[0];
  }

  /**
   * Delete reward (Admin only)
   */
  static async delete(rewardId: number) {
    const query = `DELETE FROM rewards WHERE id = $1`;
    const result = await pool.query(query, [rewardId]);

    if (result.rowCount === 0) {
      throw new Error('Reward not found');
    }

    return true;
  }
}
