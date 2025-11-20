/**
 * Sustainability Controller
 * Handles carbon tracking, eco-brands, and transport rewards
 */

import { Request, Response } from 'express';
import sustainabilityService from '../services/sustainabilityService';

export class SustainabilityController {
  /**
   * POST /api/sustainability/carbon/log
   * Log carbon footprint activity
   */
  async logCarbonActivity(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { activity_type, amount, unit } = req.body;

      if (!activity_type || !amount || !unit) {
        return res.status(400).json({ error: 'Activity type, amount, and unit required' });
      }

      const result = await sustainabilityService.logCarbonActivity({
        userId,
        activityType: activity_type,
        amount: parseFloat(amount),
        unit,
      });

      res.status(201).json({
        ...result,
        message: `Great job! You saved ${result.carbonEntry.carbon_saved}kg CO2 and earned ${result.karmaAwarded} karma!`,
      });
    } catch (error) {
      console.error('Log carbon activity error:', error);
      res.status(500).json({ error: 'Failed to log carbon activity' });
    }
  }

  /**
   * POST /api/sustainability/transport/log
   * Log transport activity
   */
  async logTransport(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { transport_type, distance_km, route } = req.body;

      if (!transport_type || !distance_km) {
        return res.status(400).json({ error: 'Transport type and distance required' });
      }

      const result = await sustainabilityService.logTransport({
        userId,
        transportType: transport_type,
        distanceKm: parseFloat(distance_km),
        route,
      });

      res.status(201).json({
        ...result,
        message: `Eco-friendly choice! You saved ${result.transportEntry.carbon_saved}kg CO2!`,
      });
    } catch (error) {
      console.error('Log transport error:', error);
      res.status(500).json({ error: 'Failed to log transport activity' });
    }
  }

  /**
   * GET /api/sustainability/carbon/stats
   * Get user's carbon impact statistics
   */
  async getCarbonStats(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const stats = await sustainabilityService.getUserCarbonStats(userId);
      res.json(stats);
    } catch (error) {
      console.error('Get carbon stats error:', error);
      res.status(500).json({ error: 'Failed to fetch carbon statistics' });
    }
  }

  /**
   * GET /api/sustainability/eco-brands
   * Get eco-friendly brands
   */
  async getEcoBrands(req: Request, res: Response) {
    try {
      const brands = await sustainabilityService.getEcoBrands();
      res.json(brands);
    } catch (error) {
      console.error('Get eco-brands error:', error);
      res.status(500).json({ error: 'Failed to fetch eco-brands' });
    }
  }

  /**
   * POST /api/sustainability/eco-product/purchase
   * Record eco-product purchase
   */
  async purchaseEcoProduct(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { brand_id, product_name, price } = req.body;

      if (!brand_id || !product_name || !price) {
        return res.status(400).json({ error: 'Brand ID, product name, and price required' });
      }

      const result = await sustainabilityService.purchaseEcoProduct({
        userId,
        brandId: brand_id,
        productName: product_name,
        price: parseFloat(price),
      });

      res.json({
        ...result,
        message: 'Thank you for supporting eco-friendly businesses!',
      });
    } catch (error) {
      console.error('Purchase eco-product error:', error);
      res.status(500).json({ error: 'Failed to record purchase' });
    }
  }

  /**
   * GET /api/sustainability/recommendations
   * Get recommended eco actions
   */
  async getRecommendations(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const userStats = await sustainabilityService.getUserCarbonStats(userId);
      const recommendations = sustainabilityService.getRecommendedActions(userStats);

      res.json({
        recommendations,
        user_stats: userStats,
      });
    } catch (error) {
      console.error('Get recommendations error:', error);
      res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
  }

  /**
   * GET /api/sustainability/sajha-info
   * Get Sajha Bus route information
   */
  async getSajhaBusInfo(req: Request, res: Response) {
    try {
      const info = sustainabilityService.getSajhaBusInfo();
      res.json(info);
    } catch (error) {
      console.error('Get Sajha info error:', error);
      res.status(500).json({ error: 'Failed to fetch Sajha Bus information' });
    }
  }

  /**
   * GET /api/sustainability/challenges
   * Get carbon saving challenges
   */
  async getCarbonChallenges(req: Request, res: Response) {
    try {
      const challenges = sustainabilityService.getCarbonChallenges();
      const festivalBonus = await sustainabilityService.getFestivalCarbonBonus();

      res.json({
        challenges,
        festival_bonus: festivalBonus,
      });
    } catch (error) {
      console.error('Get challenges error:', error);
      res.status(500).json({ error: 'Failed to fetch challenges' });
    }
  }

  /**
   * GET /api/sustainability/transport/leaderboard
   * Get transport leaderboard
   */
  async getTransportLeaderboard(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const leaderboard = await sustainabilityService.getTransportLeaderboard(limit);
      res.json(leaderboard);
    } catch (error) {
      console.error('Get transport leaderboard error:', error);
      res.status(500).json({ error: 'Failed to fetch transport leaderboard' });
    }
  }
}

export default new SustainabilityController();
