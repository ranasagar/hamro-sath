/**
 * Karma Points Controller
 * Handles karma transactions, NFT badges, and redemptions
 */

import { Request, Response } from 'express';
import { partnerQueries } from '../database/advancedQueries';
import karmaService from '../services/karmaService';

export class KarmaController {
  /**
   * GET /api/karma/stats
   * Get user's karma statistics
   */
  async getUserStats(req: Request, res: Response) {
    try {
      const userId = req.user?.id; // From auth middleware

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const stats = await karmaService.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error('Get karma stats error:', error);
      res.status(500).json({ error: 'Failed to fetch karma statistics' });
    }
  }

  /**
   * GET /api/karma/leaderboard
   * Get karma leaderboard
   */
  async getLeaderboard(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const wardId = req.query.ward_id ? parseInt(req.query.ward_id as string) : undefined;

      const leaderboard = await karmaService.getLeaderboard(limit, wardId);
      res.json(leaderboard);
    } catch (error) {
      console.error('Get leaderboard error:', error);
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  }

  /**
   * POST /api/karma/award
   * Award karma for activity (used by other endpoints)
   */
  async awardKarma(req: Request, res: Response) {
    try {
      const { user_id, transaction_type, amount, description, metadata } = req.body;

      if (!user_id || !transaction_type || !amount) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const result = await karmaService.awardKarma(
        user_id,
        transaction_type,
        amount,
        description,
        metadata
      );

      res.json({
        transaction: result.transaction,
        earned_badges: result.earnedBadges,
        message:
          result.earnedBadges.length > 0
            ? `Congratulations! You earned ${result.earnedBadges.length} new badge(s)!`
            : 'Karma awarded successfully',
      });
    } catch (error) {
      console.error('Award karma error:', error);
      res.status(500).json({ error: 'Failed to award karma' });
    }
  }

  /**
   * GET /api/karma/history
   * Get user's karma transaction history
   */
  async getHistory(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const limit = parseInt(req.query.limit as string) || 50;
      const transactionType = req.query.transaction_type as string;

      const history = await karmaService.getTransactionHistory(userId, {
        transactionType,
        limit,
      });

      res.json(history);
    } catch (error) {
      console.error('Get karma history error:', error);
      res.status(500).json({ error: 'Failed to fetch karma history' });
    }
  }

  /**
   * GET /api/karma/potential
   * Calculate potential karma for action
   */
  async getPotentialKarma(req: Request, res: Response) {
    try {
      const actionType = req.query.action_type as string;

      if (!actionType) {
        return res.status(400).json({ error: 'Action type required' });
      }

      const potential = karmaService.calculatePotentialKarma(actionType);
      res.json(potential);
    } catch (error) {
      console.error('Get potential karma error:', error);
      res.status(500).json({ error: 'Failed to calculate potential karma' });
    }
  }

  /**
   * GET /api/karma/partners
   * Get redemption partners
   */
  async getPartners(req: Request, res: Response) {
    try {
      const category = req.query.category as string;
      const partners = await partnerQueries.getAll(category);
      res.json(partners);
    } catch (error) {
      console.error('Get partners error:', error);
      res.status(500).json({ error: 'Failed to fetch partners' });
    }
  }

  /**
   * POST /api/karma/redeem
   * Redeem karma at partner shop
   */
  async redeemKarma(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { partner_id, karma_amount } = req.body;

      if (!partner_id || !karma_amount) {
        return res.status(400).json({ error: 'Partner ID and karma amount required' });
      }

      const redemption = await karmaService.redeemKarma(userId, partner_id, karma_amount);

      res.json({
        redemption,
        message: 'Karma redeemed successfully! Show the code at partner shop.',
      });
    } catch (error: any) {
      console.error('Redeem karma error:', error);
      res.status(400).json({ error: error.message || 'Failed to redeem karma' });
    }
  }

  /**
   * GET /api/karma/redemptions
   * Get user's redemption history
   */
  async getRedemptions(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const redemptions = await partnerQueries.getUserRedemptions(userId);
      res.json(redemptions);
    } catch (error) {
      console.error('Get redemptions error:', error);
      res.status(500).json({ error: 'Failed to fetch redemptions' });
    }
  }

  /**
   * GET /api/karma/badges
   * Get user's NFT badges
   */
  async getUserBadges(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const badges = await karmaService.getUserStats(userId);
      res.json(badges.nft_badges);
    } catch (error) {
      console.error('Get badges error:', error);
      res.status(500).json({ error: 'Failed to fetch badges' });
    }
  }

  /**
   * POST /api/karma/check-badges
   * Check for newly earned badges
   */
  async checkNewBadges(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const newBadges = await karmaService.checkAndAwardBadges(userId);

      res.json({
        new_badges: newBadges,
        message:
          newBadges.length > 0
            ? `You earned ${newBadges.length} new badge(s)!`
            : 'No new badges available yet. Keep earning karma!',
      });
    } catch (error) {
      console.error('Check badges error:', error);
      res.status(500).json({ error: 'Failed to check badges' });
    }
  }
}

export default new KarmaController();
