import { NextFunction, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { ChallengeService } from '../services/ChallengeService';

export class ChallengeController {
  /**
   * GET /api/v1/challenges
   */
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const ward_id = req.query.ward_id ? parseInt(req.query.ward_id as string) : undefined;
      const is_active =
        req.query.is_active === 'true' ? true : req.query.is_active === 'false' ? false : undefined;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

      const result = await ChallengeService.getAll({
        ward_id,
        is_active,
        page,
        limit,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/challenges/:id
   */
  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const challengeId = parseInt(req.params.id, 10);

      if (isNaN(challengeId)) {
        throw new AppError('Invalid challenge ID', 400);
      }

      const challenge = await ChallengeService.getById(challengeId);

      if (!challenge) {
        throw new AppError('Challenge not found', 404);
      }

      res.json({
        success: true,
        data: { challenge },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/challenges
   */
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { title, description, ward_id, target_points, start_date, end_date } = req.body;

      if (!title || !description || !target_points || !start_date || !end_date) {
        throw new AppError('Missing required fields', 400);
      }

      const challenge = await ChallengeService.create({
        title,
        description,
        ward_id: ward_id || null,
        target_points: parseInt(target_points),
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        created_by: req.user.userId,
      });

      res.status(201).json({
        success: true,
        data: { challenge },
        message: 'Challenge created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/challenges/:id
   */
  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const challengeId = parseInt(req.params.id, 10);

      if (isNaN(challengeId)) {
        throw new AppError('Invalid challenge ID', 400);
      }

      const challenge = await ChallengeService.update(challengeId, req.body);

      res.json({
        success: true,
        data: { challenge },
        message: 'Challenge updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/challenges/:id
   */
  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const challengeId = parseInt(req.params.id, 10);

      if (isNaN(challengeId)) {
        throw new AppError('Invalid challenge ID', 400);
      }

      await ChallengeService.delete(challengeId);

      res.json({
        success: true,
        message: 'Challenge deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/challenges/:id/leaderboard
   */
  async getLeaderboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const challengeId = parseInt(req.params.id, 10);

      if (isNaN(challengeId)) {
        throw new AppError('Invalid challenge ID', 400);
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

      const leaderboard = await ChallengeService.getLeaderboard(challengeId, limit);

      res.json({
        success: true,
        data: { leaderboard },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const challengeController = new ChallengeController();
