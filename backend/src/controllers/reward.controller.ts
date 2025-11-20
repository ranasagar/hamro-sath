import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { RewardService } from '../services/RewardService';

export class RewardController {
  /**
   * List rewards
   * GET /api/v1/rewards
   */
  async listRewards(req: AuthRequest, res: Response) {
    try {
      const filters = {
        category: req.query.category as string,
        min_points: req.query.min_points ? parseInt(req.query.min_points as string) : undefined,
        max_points: req.query.max_points ? parseInt(req.query.max_points as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      };

      const result = await RewardService.list(filters);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error in listRewards:', error);
      throw new AppError('Failed to fetch rewards', 500);
    }
  }

  /**
   * Get reward by ID
   * GET /api/v1/rewards/:id
   */
  async getRewardById(req: AuthRequest, res: Response) {
    try {
      const rewardId = parseInt(req.params.id);

      if (isNaN(rewardId)) {
        throw new AppError('Invalid reward ID', 400);
      }

      const reward = await RewardService.getById(rewardId);

      if (!reward) {
        throw new AppError('Reward not found', 404);
      }

      res.json({
        success: true,
        data: { reward },
      });
    } catch (error) {
      console.error('Error in getRewardById:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to fetch reward', 500);
    }
  }

  /**
   * Redeem a reward
   * POST /api/v1/rewards/redeem
   */
  async redeemReward(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { reward_id, delivery_address, contact_phone, notes } = req.body;

      if (!reward_id) {
        throw new AppError('reward_id is required', 400);
      }

      const redemption = await RewardService.redeem({
        reward_id: parseInt(reward_id),
        user_id: req.user.userId,
        delivery_address,
        contact_phone,
        notes,
      });

      res.json({
        success: true,
        data: { redemption },
        message: 'Reward redeemed successfully',
      });
    } catch (error) {
      console.error('Error in redeemReward:', error);
      if (error instanceof AppError) throw error;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new AppError(errorMessage, 400);
    }
  }

  /**
   * Get user's redemption history
   * GET /api/v1/rewards/my-redemptions
   */
  async getMyRedemptions(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

      const result = await RewardService.getUserRedemptions(req.user.userId, page, limit);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error in getMyRedemptions:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to fetch redemptions', 500);
    }
  }

  /**
   * Create new reward (Admin only)
   * POST /api/v1/rewards
   */
  async createReward(req: AuthRequest, res: Response) {
    try {
      const { name, description, category, points_required, quantity_available, image_url } =
        req.body;

      if (!name || !description || !category || !points_required) {
        throw new AppError('Missing required fields', 400);
      }

      const reward = await RewardService.create({
        name,
        description,
        category,
        points_required: parseInt(points_required),
        quantity_available: quantity_available ? parseInt(quantity_available) : null,
        image_url: image_url || null,
      });

      res.status(201).json({
        success: true,
        data: { reward },
        message: 'Reward created successfully',
      });
    } catch (error) {
      console.error('Error in createReward:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to create reward', 500);
    }
  }

  /**
   * Update reward (Admin only)
   * PUT /api/v1/rewards/:id
   */
  async updateReward(req: AuthRequest, res: Response) {
    try {
      const rewardId = parseInt(req.params.id);

      if (isNaN(rewardId)) {
        throw new AppError('Invalid reward ID', 400);
      }

      const {
        name,
        description,
        category,
        points_required,
        quantity_available,
        image_url,
        is_active,
      } = req.body;

      const reward = await RewardService.update(rewardId, {
        name,
        description,
        category,
        points_required: points_required ? parseInt(points_required) : undefined,
        quantity_available:
          quantity_available !== undefined ? parseInt(quantity_available) : undefined,
        image_url,
        is_active,
      });

      res.json({
        success: true,
        data: { reward },
        message: 'Reward updated successfully',
      });
    } catch (error) {
      console.error('Error in updateReward:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update reward', 500);
    }
  }

  /**
   * Delete reward (Admin only)
   * DELETE /api/v1/rewards/:id
   */
  async deleteReward(req: AuthRequest, res: Response) {
    try {
      const rewardId = parseInt(req.params.id);

      if (isNaN(rewardId)) {
        throw new AppError('Invalid reward ID', 400);
      }

      await RewardService.delete(rewardId);

      res.json({
        success: true,
        message: 'Reward deleted successfully',
      });
    } catch (error) {
      console.error('Error in deleteReward:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to delete reward', 500);
    }
  }
}
