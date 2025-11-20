import { pool } from '../database/connection';
import { redisClient } from '../database/redis';
import { AppError } from '../middleware/errorHandler';

interface IssueFilters {
  status?: string;
  category?: string;
  ward_id?: number;
  severity?: string;
  page: number;
  limit: number;
  userId?: number;
}

interface CreateIssueData {
  reporter_id: number;
  title: string;
  description: string;
  category: string;
  latitude?: number;
  longitude?: number;
  photo_urls?: string[];
}

interface UpdateIssueData {
  title?: string;
  description?: string;
  status?: string;
  severity?: string;
}

export class IssueService {
  /**
   * List issues with filters and pagination
   */
  static async list(filters: IssueFilters) {
    const { status, category, ward_id, severity, page, limit, userId } = filters;
    const offset = (page - 1) * limit;

    const params: any[] = [];

    let query = `
      SELECT 
        i.*,
        u.full_name as reporter_name,
        u.avatar_url as reporter_avatar,
        w.ward_name,
        ${userId ? `EXISTS(SELECT 1 FROM issue_upvotes WHERE issue_id = i.id AND user_id = ${userId}) as user_has_upvoted,` : 'false as user_has_upvoted,'}
        ${userId ? `EXISTS(SELECT 1 FROM issue_volunteers WHERE issue_id = i.id AND user_id = ${userId}) as user_is_volunteer` : 'false as user_is_volunteer'}
      FROM issues i
      JOIN users u ON i.reporter_id = u.id
      LEFT JOIN wards w ON i.ward_id = w.id
      WHERE 1=1
    `;

    if (status) {
      params.push(status);
      query += ` AND i.status = $${params.length}`;
    }

    if (category) {
      params.push(category);
      query += ` AND i.category = $${params.length}`;
    }

    if (ward_id) {
      params.push(ward_id);
      query += ` AND i.ward_id = $${params.length}`;
    }

    if (severity) {
      params.push(severity);
      query += ` AND i.severity = $${params.length}`;
    }

    query += ` ORDER BY i.created_at DESC`;

    // Count total
    const countQuery =
      `SELECT COUNT(*) as total FROM issues i WHERE 1=1` +
      (status ? ` AND i.status = $1` : '') +
      (category ? ` AND i.category = $${status ? 2 : 1}` : '') +
      (ward_id ? ` AND i.ward_id = $${(status ? 1 : 0) + (category ? 1 : 0) + 1}` : '') +
      (severity
        ? ` AND i.severity = $${(status ? 1 : 0) + (category ? 1 : 0) + (ward_id ? 1 : 0) + 1}`
        : '');

    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0]?.total || '0');

    // Add pagination
    params.push(limit, offset);
    query += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const result = await pool.query(query, params);
    const issues = result.rows;

    return {
      issues,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get single issue by ID with full details
   */
  static async getById(issueId: number, userId?: number) {
    try {
      // Basic query
      const query = `
        SELECT 
          i.*,
          u.full_name as reporter_name,
          u.avatar_url as reporter_avatar,
          w.ward_name
        FROM issues i
        JOIN users u ON i.reporter_id = u.id
        LEFT JOIN wards w ON i.ward_id = w.id
        WHERE i.id = $1
      `;

      const result = await pool.query(query, [issueId]);

      if (result.rows.length === 0) {
        return null;
      }

      const issue = result.rows[0];

      // Check user interactions if userId provided
      if (userId) {
        try {
          const [upvoteRes, volunteerRes] = await Promise.all([
            pool.query(
              `SELECT EXISTS(SELECT 1 FROM issue_upvotes WHERE issue_id = $1 AND user_id = $2) as has_upvoted`,
              [issueId, userId]
            ),
            pool.query(
              `SELECT EXISTS(SELECT 1 FROM issue_volunteers WHERE issue_id = $1 AND user_id = $2) as is_volunteer`,
              [issueId, userId]
            ),
          ]);
          issue.user_has_upvoted = upvoteRes.rows[0]?.has_upvoted || false;
          issue.user_is_volunteer = volunteerRes.rows[0]?.is_volunteer || false;
        } catch (err) {
          console.error('Error fetching user interactions:', err);
          issue.user_has_upvoted = false;
          issue.user_is_volunteer = false;
        }
      } else {
        issue.user_has_upvoted = false;
        issue.user_is_volunteer = false;
      }

      // Add photos from image_url
      issue.photos = issue.image_url ? [{ url: issue.image_url }] : [];

      // Fetch volunteers and updates in parallel
      try {
        const [volunteersRes, updatesRes] = await Promise.all([
          pool.query(
            `SELECT iv.id, iv.user_id, u.full_name as user_name, u.avatar_url as user_avatar, iv.joined_at
             FROM issue_volunteers iv
             JOIN users u ON iv.user_id = u.id
             WHERE iv.issue_id = $1
             ORDER BY iv.joined_at`,
            [issueId]
          ),
          pool.query(
            `SELECT iu.id, iu.message, iu.created_by, u.full_name as created_by_name, iu.created_at
             FROM issue_updates iu
             JOIN users u ON iu.created_by = u.id
             WHERE iu.issue_id = $1
             ORDER BY iu.created_at DESC`,
            [issueId]
          ),
        ]);
        issue.volunteers = volunteersRes.rows;
        issue.updates = updatesRes.rows;
      } catch (err) {
        console.error('Error fetching volunteers/updates:', err);
        issue.volunteers = [];
        issue.updates = [];
      }

      return issue;
    } catch (error) {
      console.error('[IssueService.getById] Error:', error);
      throw error;
    }
  }

  /**
   * Create new issue
   */
  static async create(data: CreateIssueData) {
    const {
      reporter_id,
      title,
      description,
      category,
      latitude,
      longitude,
      photo_urls = [],
    } = data;

    // Get user's ward_id
    const userResult = await pool.query(`SELECT ward_id FROM users WHERE id = $1`, [reporter_id]);

    if (userResult.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    const ward_id = userResult.rows[0].ward_id;

    // Insert issue
    const issueResult = await pool.query(
      `INSERT INTO issues (
        reporter_id, title, description, category, 
        latitude, longitude,
        ward_id, status, severity, image_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', 'medium', $8)
      RETURNING *`,
      [
        reporter_id,
        title,
        description,
        category.toLowerCase(),
        latitude,
        longitude,
        ward_id,
        photo_urls[0] || null,
      ]
    );

    const issue = issueResult.rows[0];

    // Award points to reporter
    await pool.query(`UPDATE user_stats SET total_points = total_points + 10 WHERE user_id = $1`, [
      reporter_id,
    ]);

    // Log activity
    await pool.query(
      `INSERT INTO activities (user_id, activity_type, description, points_earned, related_id)
       VALUES ($1, 'issue_reported', $2, 10, $3)`,
      [reporter_id, `Reported issue: ${title}`, issue.id]
    );

    // Invalidate cache
    if (redisClient && redisClient.isOpen) {
      await redisClient.del('issues:*');
    }

    return await this.getById(issue.id, reporter_id);
  }

  /**
   * Update issue (creator or admin only)
   */
  static async update(issueId: number, userId: number, isAdmin: boolean, data: UpdateIssueData) {
    // Check if user is creator or admin
    const issueResult = await pool.query(`SELECT reporter_id FROM issues WHERE id = $1`, [issueId]);

    if (issueResult.rows.length === 0) {
      throw new AppError('Issue not found', 404);
    }

    const isCreator = issueResult.rows[0].reported_by === userId;

    if (!isCreator && !isAdmin) {
      throw new AppError('Not authorized to update this issue', 403);
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.title) {
      updates.push(`title = $${paramCount++}`);
      values.push(data.title);
    }

    if (data.description) {
      updates.push(`description = $${paramCount++}`);
      values.push(data.description);
    }

    if (data.status && isAdmin) {
      updates.push(`status = $${paramCount++}`);
      values.push(data.status);
    }

    if (data.severity && isAdmin) {
      updates.push(`severity = $${paramCount++}`);
      values.push(data.severity);
    }

    if (updates.length === 0) {
      throw new AppError('No valid fields to update', 400);
    }

    updates.push(`updated_at = NOW()`);
    values.push(issueId);

    const query = `UPDATE issues SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    await pool.query(query, values);

    // Invalidate cache
    if (redisClient && redisClient.isOpen) {
      await redisClient.del('issues:*');
      await redisClient.del(`issue:${issueId}:*`);
    }

    return await this.getById(issueId, userId);
  }

  /**
   * Toggle upvote on issue
   */
  static async toggleUpvote(issueId: number, userId: number) {
    // Check if already upvoted
    const existing = await pool.query(
      `SELECT id FROM issue_upvotes WHERE issue_id = $1 AND user_id = $2`,
      [issueId, userId]
    );

    if (existing.rows.length > 0) {
      // Remove upvote
      await pool.query(`DELETE FROM issue_upvotes WHERE issue_id = $1 AND user_id = $2`, [
        issueId,
        userId,
      ]);

      // Decrement upvotes count
      await pool.query(`UPDATE issues SET upvotes_count = upvotes_count - 1 WHERE id = $1`, [
        issueId,
      ]);

      // Invalidate cache
      if (redisClient && redisClient.isOpen) {
        await redisClient.del('issues:*');
        await redisClient.del(`issue:${issueId}:*`);
      }

      return { upvoted: false };
    } else {
      // Add upvote
      await pool.query(`INSERT INTO issue_upvotes (issue_id, user_id) VALUES ($1, $2)`, [
        issueId,
        userId,
      ]);

      // Increment upvotes count
      await pool.query(`UPDATE issues SET upvotes_count = upvotes_count + 1 WHERE id = $1`, [
        issueId,
      ]);

      // Award 1 point to issue reporter
      await pool.query(
        `UPDATE user_stats us SET total_points = total_points + 1 
         FROM issues i
         WHERE us.user_id = i.reporter_id AND i.id = $1`,
        [issueId]
      );

      // Get issue details for activity log
      const issueResult = await pool.query(`SELECT title FROM issues WHERE id = $1`, [issueId]);
      const issueTitle = issueResult.rows[0]?.title || 'Unknown issue';

      // Log activity for upvoter
      await pool.query(
        `INSERT INTO activities (user_id, activity_type, description, points_earned, related_id)
         VALUES ($1, 'issue_upvoted', $2, 0, $3)`,
        [userId, `Upvoted: ${issueTitle}`, issueId]
      );

      // Invalidate cache
      if (redisClient && redisClient.isOpen) {
        await redisClient.del('issues:*');
        await redisClient.del(`issue:${issueId}:*`);
      }

      return { upvoted: true };
    }
  }

  /**
   * Toggle volunteer status for issue
   */
  static async toggleVolunteer(issueId: number, userId: number) {
    // Check if already volunteered
    const existing = await pool.query(
      `SELECT id FROM issue_volunteers WHERE issue_id = $1 AND user_id = $2`,
      [issueId, userId]
    );

    if (existing.rows.length > 0) {
      // Remove volunteer
      await pool.query(`DELETE FROM issue_volunteers WHERE issue_id = $1 AND user_id = $2`, [
        issueId,
        userId,
      ]);

      // Decrement volunteers count
      await pool.query(`UPDATE issues SET volunteers_count = volunteers_count - 1 WHERE id = $1`, [
        issueId,
      ]);

      // Invalidate cache
      if (redisClient && redisClient.isOpen) {
        await redisClient.del('issues:*');
        await redisClient.del(`issue:${issueId}:*`);
      }

      return { volunteered: false };
    } else {
      // Add volunteer
      await pool.query(`INSERT INTO issue_volunteers (issue_id, user_id) VALUES ($1, $2)`, [
        issueId,
        userId,
      ]);

      // Increment volunteers count
      await pool.query(`UPDATE issues SET volunteers_count = volunteers_count + 1 WHERE id = $1`, [
        issueId,
      ]);

      // Award 5 points
      await pool.query(`UPDATE user_stats SET total_points = total_points + 5 WHERE user_id = $1`, [
        userId,
      ]);

      // Log activity
      const issueResult = await pool.query(`SELECT title FROM issues WHERE id = $1`, [issueId]);

      if (issueResult.rows.length > 0) {
        await pool.query(
          `INSERT INTO activities (user_id, activity_type, description, points_earned, related_id)
           VALUES ($1, 'volunteered', $2, 5, $3)`,
          [userId, `Volunteered for: ${issueResult.rows[0].title}`, issueId]
        );
      }

      // Invalidate cache
      if (redisClient && redisClient.isOpen) {
        await redisClient.del('issues:*');
        await redisClient.del(`issue:${issueId}:*`);
      }

      return { volunteered: true };
    }
  }

  /**
   * Mark issue as complete/resolved
   */
  static async markComplete(issueId: number, userId: number, isAdmin: boolean) {
    // Check if user is creator or admin
    const issueResult = await pool.query(`SELECT reporter_id FROM issues WHERE id = $1`, [issueId]);

    if (issueResult.rows.length === 0) {
      throw new AppError('Issue not found', 404);
    }

    const isCreator = issueResult.rows[0].reporter_id === userId;

    if (!isCreator && !isAdmin) {
      throw new AppError('Not authorized to complete this issue', 403);
    }

    // Update issue status
    await pool.query(
      `UPDATE issues 
       SET status = 'resolved', resolved_at = NOW(), updated_at = NOW()
       WHERE id = $1`,
      [issueId]
    );

    // Award bonus points to all volunteers
    await pool.query(
      `UPDATE users 
       SET points = points + 15
       WHERE id IN (
         SELECT user_id FROM issue_volunteers WHERE issue_id = $1
       )`,
      [issueId]
    );

    // Log activities for volunteers
    const volunteersResult = await pool.query(
      `SELECT iv.user_id, i.title
       FROM issue_volunteers iv
       JOIN issues i ON iv.issue_id = i.id
       WHERE iv.issue_id = $1`,
      [issueId]
    );

    for (const volunteer of volunteersResult.rows) {
      await pool.query(
        `INSERT INTO activities (user_id, activity_type, description, points_earned, related_id)
         VALUES ($1, 'issue_resolved', $2, 15, $3)`,
        [volunteer.user_id, `Helped resolve: ${volunteer.title}`, issueId]
      );

      // Update user stats
      await pool.query(
        `UPDATE user_stats SET total_points = total_points + 15, issues_resolved = issues_resolved + 1 WHERE user_id = $1`,
        [volunteer.user_id]
      );
    }

    // Invalidate cache
    if (redisClient && redisClient.isOpen) {
      await redisClient.del('issues:*');
      await redisClient.del(`issue:${issueId}:*`);
    }

    return await this.getById(issueId, userId);
  }

  /**
   * Delete issue (Admin only)
   */
  static async delete(issueId: number) {
    const query = `DELETE FROM issues WHERE id = $1`;
    const result = await pool.query(query, [issueId]);

    if (result.rowCount === 0) {
      throw new AppError('Issue not found', 404);
    }

    // Invalidate cache
    if (redisClient && redisClient.isOpen) {
      await redisClient.del('issues:*');
      await redisClient.del(`issue:${issueId}:*`);
    }

    return true;
  }
}
