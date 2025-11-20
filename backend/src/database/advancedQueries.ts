/**
 * Database Queries for Advanced Features
 * Karma Points, Blockchain, Civic Hubs, Social Tools
 */

import { pool } from '../database/connection';
import {
  CarbonFootprint,
  CivicNudge,
  CommunityProject,
  DisasterEvent,
  EcoBrand,
  FestivalCampaign,
  KarmaRedemption,
  KarmaStreak,
  KarmaTransaction,
  NFTBadge,
  Partner,
  QuestCompletion,
  StudentQuest,
  TransportReward,
  UserNFTBadge,
  WardCleanlinessScore,
} from '../types/advancedFeatures';

// ============================================================================
// KARMA POINTS QUERIES
// ============================================================================

export const karmaQueries = {
  // Create karma transaction
  async createTransaction(data: Partial<KarmaTransaction>): Promise<KarmaTransaction> {
    const result = await pool.query(
      `INSERT INTO karma_transactions 
        (user_id, transaction_type, amount, description, metadata, blockchain_hash, related_type, related_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        data.user_id,
        data.transaction_type,
        data.amount,
        data.description,
        JSON.stringify(data.metadata),
        data.blockchain_hash,
        data.related_type,
        data.related_id,
      ]
    );
    return result.rows[0];
  },

  // Get user karma balance
  async getUserBalance(userId: number): Promise<number> {
    const result = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as balance 
       FROM karma_transactions 
       WHERE user_id = $1`,
      [userId]
    );
    return parseInt(result.rows[0].balance);
  },

  // Get user karma history
  async getUserHistory(userId: number, limit = 50): Promise<KarmaTransaction[]> {
    const result = await pool.query(
      `SELECT * FROM karma_transactions 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  },

  // Get user streak
  async getUserStreak(userId: number): Promise<KarmaStreak | null> {
    const result = await pool.query(`SELECT * FROM karma_streaks WHERE user_id = $1`, [userId]);
    return result.rows[0] || null;
  },

  // Get active festival campaign
  async getActiveFestivalCampaign(): Promise<FestivalCampaign | null> {
    const result = await pool.query(
      `SELECT * FROM festival_campaigns 
       WHERE is_active = true 
       AND start_date <= NOW() 
       AND end_date >= NOW()
       ORDER BY karma_multiplier DESC
       LIMIT 1`
    );
    return result.rows[0] || null;
  },

  // Get karma leaderboard
  async getLeaderboard(limit = 10): Promise<any[]> {
    const result = await pool.query(
      `SELECT 
        u.id, u.username, u.full_name, u.avatar_url, u.ward_id,
        COALESCE(SUM(kt.amount), 0) as total_karma,
        ks.current_streak,
        ks.longest_streak,
        COUNT(DISTINCT unb.id) as nft_badges_count
       FROM users u
       LEFT JOIN karma_transactions kt ON u.id = kt.user_id
       LEFT JOIN karma_streaks ks ON u.id = ks.user_id
       LEFT JOIN user_nft_badges unb ON u.id = unb.user_id
       GROUP BY u.id, u.username, u.full_name, u.avatar_url, u.ward_id, ks.current_streak, ks.longest_streak
       ORDER BY total_karma DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  },
};

// ============================================================================
// NFT BADGES QUERIES
// ============================================================================

export const nftBadgeQueries = {
  // Get all NFT badges
  async getAll(): Promise<NFTBadge[]> {
    const result = await pool.query(
      `SELECT * FROM nft_badges WHERE is_active = true ORDER BY rarity, karma_requirement`
    );
    return result.rows;
  },

  // Get user's NFT badges
  async getUserBadges(userId: number): Promise<UserNFTBadge[]> {
    const result = await pool.query(
      `SELECT unb.*, nb.name, nb.description, nb.image_url, nb.rarity, nb.category
       FROM user_nft_badges unb
       JOIN nft_badges nb ON unb.nft_badge_id = nb.id
       WHERE unb.user_id = $1
       ORDER BY unb.minted_at DESC`,
      [userId]
    );
    return result.rows;
  },

  // Award badge to user
  async awardBadge(userId: number, badgeId: number, tokenId?: string): Promise<UserNFTBadge> {
    const result = await pool.query(
      `INSERT INTO user_nft_badges (user_id, nft_badge_id, blockchain_token_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, nft_badge_id) DO NOTHING
       RETURNING *`,
      [userId, badgeId, tokenId]
    );
    return result.rows[0];
  },

  // Check eligible badges for user
  async checkEligibleBadges(userId: number): Promise<NFTBadge[]> {
    const result = await pool.query(
      `SELECT nb.*
       FROM nft_badges nb
       WHERE nb.is_active = true
       AND nb.id NOT IN (
         SELECT nft_badge_id FROM user_nft_badges WHERE user_id = $1
       )
       AND (
         (nb.karma_requirement <= (
           SELECT COALESCE(SUM(amount), 0) FROM karma_transactions WHERE user_id = $1
         ))
         OR nb.karma_requirement IS NULL
       )`,
      [userId]
    );
    return result.rows;
  },
};

// ============================================================================
// PARTNERS & REDEMPTIONS QUERIES
// ============================================================================

export const partnerQueries = {
  // Get all partners
  async getAll(category?: string): Promise<Partner[]> {
    let query = 'SELECT * FROM partners WHERE is_active = true';
    const params: any[] = [];

    if (category) {
      query += ' AND category = $1';
      params.push(category);
    }

    query += ' ORDER BY name';
    const result = await pool.query(query, params);
    return result.rows;
  },

  // Get partner by ID
  async getById(id: number): Promise<Partner | null> {
    const result = await pool.query('SELECT * FROM partners WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  // Create partner
  async create(data: Partial<Partner>): Promise<Partner> {
    const result = await pool.query(
      `INSERT INTO partners 
        (name, category, description, logo_url, address, ward_id, latitude, longitude, 
         contact_phone, contact_email, offers)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        data.name,
        data.category,
        data.description,
        data.logo_url,
        data.address,
        data.ward_id,
        data.latitude,
        data.longitude,
        data.contact_phone,
        data.contact_email,
        JSON.stringify(data.offers || []),
      ]
    );
    return result.rows[0];
  },

  // Update partner
  async update(id: number, data: Partial<Partner>): Promise<Partner> {
    const result = await pool.query(
      `UPDATE partners SET
        name = COALESCE($2, name),
        category = COALESCE($3, category),
        description = COALESCE($4, description),
        logo_url = COALESCE($5, logo_url),
        address = COALESCE($6, address),
        ward_id = COALESCE($7, ward_id),
        offers = COALESCE($8, offers),
        is_active = COALESCE($9, is_active),
        updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [
        id,
        data.name,
        data.category,
        data.description,
        data.logo_url,
        data.address,
        data.ward_id,
        data.offers ? JSON.stringify(data.offers) : null,
        data.is_active,
      ]
    );
    return result.rows[0];
  },

  // Create redemption
  async createRedemption(data: Partial<KarmaRedemption>): Promise<KarmaRedemption> {
    const result = await pool.query(
      `INSERT INTO karma_redemptions 
        (user_id, partner_id, karma_spent, discount_amount, discount_percentage, 
         redemption_code, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.user_id,
        data.partner_id,
        data.karma_spent,
        data.discount_amount,
        data.discount_percentage,
        data.redemption_code,
        data.expires_at,
      ]
    );
    return result.rows[0];
  },

  // Get user redemptions
  async getUserRedemptions(userId: number): Promise<KarmaRedemption[]> {
    const result = await pool.query(
      `SELECT kr.*, p.name as partner_name, p.logo_url as partner_logo
       FROM karma_redemptions kr
       LEFT JOIN partners p ON kr.partner_id = p.id
       WHERE kr.user_id = $1
       ORDER BY kr.created_at DESC`,
      [userId]
    );
    return result.rows;
  },
};

// ============================================================================
// CIVIC HUBS QUERIES
// ============================================================================

export const civicHubQueries = {
  // Get ward cleanliness scores
  async getWardScores(): Promise<WardCleanlinessScore[]> {
    const result = await pool.query(
      `SELECT wcs.*, w.ward_name, w.ward_number
       FROM ward_cleanliness_scores wcs
       JOIN wards w ON wcs.ward_id = w.id
       WHERE wcs.calculated_date = (
         SELECT MAX(calculated_date) FROM ward_cleanliness_scores
       )
       ORDER BY wcs.score DESC`
    );
    return result.rows;
  },

  // Get community projects
  async getProjects(status?: string, wardId?: number): Promise<CommunityProject[]> {
    let query =
      'SELECT cp.*, u.username as proposed_by_name FROM community_projects cp LEFT JOIN users u ON cp.proposed_by = u.id WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (status) {
      query += ` AND cp.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (wardId) {
      query += ` AND cp.ward_id = $${paramCount}`;
      params.push(wardId);
      paramCount++;
    }

    query += ' ORDER BY cp.created_at DESC';
    const result = await pool.query(query, params);
    return result.rows;
  },

  // Create project
  async createProject(data: Partial<CommunityProject>): Promise<CommunityProject> {
    const result = await pool.query(
      `INSERT INTO community_projects 
        (title, description, ward_id, proposed_by, category, estimated_cost, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'proposed')
       RETURNING *`,
      [
        data.title,
        data.description,
        data.ward_id,
        data.proposed_by,
        data.category,
        data.estimated_cost,
      ]
    );
    return result.rows[0];
  },

  // Vote on project
  async voteOnProject(
    projectId: number,
    userId: number,
    vote: 'for' | 'against',
    reason?: string
  ): Promise<void> {
    await pool.query('BEGIN');
    try {
      // Insert vote
      await pool.query(
        `INSERT INTO community_project_votes (project_id, user_id, vote, reason)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (project_id, user_id) DO UPDATE SET vote = $3, reason = $4`,
        [projectId, userId, vote, reason]
      );

      // Update project vote counts
      await pool.query(
        `UPDATE community_projects SET
          votes_for = (SELECT COUNT(*) FROM community_project_votes WHERE project_id = $1 AND vote = 'for'),
          votes_against = (SELECT COUNT(*) FROM community_project_votes WHERE project_id = $1 AND vote = 'against')
         WHERE id = $1`,
        [projectId]
      );

      await pool.query('COMMIT');
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  },
};

// ============================================================================
// SOCIAL ACCOUNTABILITY QUERIES
// ============================================================================

export const socialQueries = {
  // Send civic nudge
  async sendNudge(data: Partial<CivicNudge>): Promise<CivicNudge> {
    const result = await pool.query(
      `INSERT INTO civic_nudges 
        (sender_id, recipient_id, nudge_type, message, meme_url, is_anonymous)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        data.sender_id,
        data.recipient_id,
        data.nudge_type,
        data.message,
        data.meme_url,
        data.is_anonymous,
      ]
    );
    return result.rows[0];
  },

  // Get user nudges
  async getUserNudges(userId: number): Promise<CivicNudge[]> {
    const result = await pool.query(
      `SELECT cn.*, 
        CASE WHEN cn.is_anonymous THEN NULL ELSE u.username END as sender_name
       FROM civic_nudges cn
       LEFT JOIN users u ON cn.sender_id = u.id
       WHERE cn.recipient_id = $1
       ORDER BY cn.created_at DESC`,
      [userId]
    );
    return result.rows;
  },

  // Get student quests
  async getQuests(schoolId?: number): Promise<StudentQuest[]> {
    let query =
      'SELECT sq.*, s.name as school_name, u.username as teacher_name FROM student_quests sq JOIN schools s ON sq.school_id = s.id JOIN users u ON sq.teacher_id = u.id WHERE sq.is_active = true';
    const params: any[] = [];

    if (schoolId) {
      query += ' AND sq.school_id = $1';
      params.push(schoolId);
    }

    query += ' ORDER BY sq.created_at DESC';
    const result = await pool.query(query, params);
    return result.rows;
  },

  // Submit quest completion
  async submitQuestCompletion(data: Partial<QuestCompletion>): Promise<QuestCompletion> {
    const result = await pool.query(
      `INSERT INTO quest_completions 
        (quest_id, student_id, proof_image_url, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.quest_id, data.student_id, data.proof_image_url, data.description]
    );
    return result.rows[0];
  },

  // Get disaster events
  async getDisasterEvents(active = true): Promise<DisasterEvent[]> {
    const result = await pool.query(
      `SELECT * FROM disaster_events 
       WHERE is_active = $1 
       ORDER BY started_at DESC`,
      [active]
    );
    return result.rows;
  },
};

// ============================================================================
// SUSTAINABILITY QUERIES
// ============================================================================

export const sustainabilityQueries = {
  // Log carbon footprint
  async logCarbon(data: Partial<CarbonFootprint>): Promise<CarbonFootprint> {
    const result = await pool.query(
      `INSERT INTO carbon_footprint 
        (user_id, activity_type, amount, unit, carbon_saved, karma_earned, date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.user_id,
        data.activity_type,
        data.amount,
        data.unit,
        data.carbon_saved,
        data.karma_earned,
        data.date || new Date(),
      ]
    );
    return result.rows[0];
  },

  // Log transport reward
  async logTransport(data: Partial<TransportReward>): Promise<TransportReward> {
    const result = await pool.query(
      `INSERT INTO transport_rewards 
        (user_id, transport_type, distance_km, carbon_saved, karma_earned, route)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        data.user_id,
        data.transport_type,
        data.distance_km,
        data.carbon_saved,
        data.karma_earned,
        data.route,
      ]
    );
    return result.rows[0];
  },

  // Get eco brands
  async getEcoBrands(): Promise<EcoBrand[]> {
    const result = await pool.query(
      'SELECT * FROM eco_brands WHERE is_active = true ORDER BY sustainability_score DESC'
    );
    return result.rows;
  },

  // Get user carbon stats
  async getUserCarbonStats(userId: number): Promise<any> {
    const result = await pool.query(
      `SELECT 
        SUM(carbon_saved) as total_carbon_saved,
        SUM(karma_earned) as total_karma_earned,
        COUNT(*) as total_activities,
        activity_type
       FROM carbon_footprint
       WHERE user_id = $1
       GROUP BY activity_type`,
      [userId]
    );
    return result.rows;
  },
};

export default {
  karma: karmaQueries,
  nftBadges: nftBadgeQueries,
  partners: partnerQueries,
  civicHub: civicHubQueries,
  social: socialQueries,
  sustainability: sustainabilityQueries,
};
