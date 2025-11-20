/**
 * Civic Hub Controller
 * Handles ward cleanliness, community projects, and chatbot
 */

import { Request, Response } from 'express';
import civicHubService from '../services/civicHubService';

export class CivicHubController {
  /**
   * GET /api/civic/ward-scores
   * Get all ward cleanliness scores
   */
  async getWardScores(req: Request, res: Response) {
    try {
      const scores = await civicHubService.getWardScores();
      res.json(scores);
    } catch (error) {
      console.error('Get ward scores error:', error);
      res.status(500).json({ error: 'Failed to fetch ward scores' });
    }
  }

  /**
   * GET /api/civic/ward/:id/dashboard
   * Get ward dashboard with stats
   */
  async getWardDashboard(req: Request, res: Response) {
    try {
      const wardId = parseInt(req.params.id);

      if (isNaN(wardId)) {
        return res.status(400).json({ error: 'Invalid ward ID' });
      }

      const dashboard = await civicHubService.getWardDashboard(wardId);
      res.json(dashboard);
    } catch (error) {
      console.error('Get ward dashboard error:', error);
      res.status(500).json({ error: 'Failed to fetch ward dashboard' });
    }
  }

  /**
   * GET /api/civic/projects
   * Get community projects with filters
   */
  async getProjects(req: Request, res: Response) {
    try {
      const status = req.query.status as string;
      const wardId = req.query.ward_id ? parseInt(req.query.ward_id as string) : undefined;
      const category = req.query.category as string;

      const projects = await civicHubService.getCommunityProjects({
        status,
        wardId,
        category,
      });

      res.json(projects);
    } catch (error) {
      console.error('Get projects error:', error);
      res.status(500).json({ error: 'Failed to fetch community projects' });
    }
  }

  /**
   * POST /api/civic/projects
   * Propose new community project
   */
  async proposeProject(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { title, description, ward_id, category, estimated_cost } = req.body;

      if (!title || !description || !ward_id || !category) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const project = await civicHubService.proposeProject({
        title,
        description,
        wardId: ward_id,
        proposedBy: userId,
        category,
        estimatedCost: estimated_cost,
      });

      res.status(201).json({
        project,
        message: 'Project proposed successfully! Community can now vote on it.',
      });
    } catch (error) {
      console.error('Propose project error:', error);
      res.status(500).json({ error: 'Failed to propose project' });
    }
  }

  /**
   * POST /api/civic/projects/:id/vote
   * Vote on community project
   */
  async voteOnProject(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const projectId = parseInt(req.params.id);
      const { vote, reason } = req.body;

      if (isNaN(projectId) || !vote || !['for', 'against'].includes(vote)) {
        return res.status(400).json({ error: 'Invalid project ID or vote' });
      }

      await civicHubService.voteOnProject(projectId, userId, vote, reason);

      res.json({
        message: 'Vote recorded successfully! Thank you for civic participation.',
      });
    } catch (error) {
      console.error('Vote on project error:', error);
      res.status(500).json({ error: 'Failed to record vote' });
    }
  }

  /**
   * POST /api/civic/chatbot
   * Get AI chatbot response
   */
  async getChatbotResponse(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { message, ward_id, language } = req.body;

      if (!message || !ward_id) {
        return res.status(400).json({ error: 'Message and ward ID required' });
      }

      const response = await civicHubService.getChatbotResponse({
        userId,
        wardId: ward_id,
        message,
        language: language || 'en',
      });

      res.json(response);
    } catch (error) {
      console.error('Chatbot error:', error);
      res.status(500).json({ error: 'Failed to get chatbot response' });
    }
  }

  /**
   * GET /api/civic/terrain-tips
   * Get terrain-specific civic tips
   */
  async getTerrainTips(req: Request, res: Response) {
    try {
      const wardId = parseInt(req.query.ward_id as string);
      const terrain = req.query.terrain as 'mountain' | 'hill' | 'terai';

      if (isNaN(wardId) || !terrain) {
        return res.status(400).json({ error: 'Ward ID and terrain required' });
      }

      const tips = civicHubService.getTerrainTips(wardId, terrain);
      res.json({ tips, terrain, ward_id: wardId });
    } catch (error) {
      console.error('Get terrain tips error:', error);
      res.status(500).json({ error: 'Failed to fetch terrain tips' });
    }
  }
}

export default new CivicHubController();
