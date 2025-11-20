/**
 * Social Accountability Controller
 * Handles civic nudges, school quests, and disaster coordination
 */

import { Request, Response } from 'express';
import socialAccountabilityService from '../services/socialAccountabilityService';

export class SocialAccountabilityController {
  /**
   * POST /api/social/nudge
   * Send civic nudge to neighbor
   */
  async sendNudge(req: Request, res: Response) {
    try {
      const senderId = req.user?.id;

      if (!senderId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { recipient_id, nudge_type, message, meme_url, is_anonymous } = req.body;

      if (!recipient_id || !nudge_type || !message) {
        return res.status(400).json({ error: 'Recipient, nudge type, and message required' });
      }

      const nudge = await socialAccountabilityService.sendCivicNudge({
        senderId,
        recipientId: recipient_id,
        nudgeType: nudge_type,
        message,
        memeUrl: meme_url,
        isAnonymous: is_anonymous,
      });

      res.status(201).json({
        nudge,
        message: 'Civic nudge sent! Your neighbor will appreciate the polite reminder.',
      });
    } catch (error: any) {
      console.error('Send nudge error:', error);
      res.status(400).json({ error: error.message || 'Failed to send nudge' });
    }
  }

  /**
   * GET /api/social/nudges
   * Get user's received nudges
   */
  async getUserNudges(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const nudges = await socialAccountabilityService.getUserNudges(userId);
      res.json(nudges);
    } catch (error) {
      console.error('Get nudges error:', error);
      res.status(500).json({ error: 'Failed to fetch nudges' });
    }
  }

  /**
   * GET /api/social/nudge-templates
   * Get nudge templates for type
   */
  async getNudgeTemplates(req: Request, res: Response) {
    try {
      const nudgeType = req.query.type as any;
      const language = (req.query.language as 'en' | 'ne') || 'en';

      if (!nudgeType) {
        return res.status(400).json({ error: 'Nudge type required' });
      }

      const templates = socialAccountabilityService.getNudgeTemplates(nudgeType, language);
      const memes = socialAccountabilityService.getRecommendedMemes(nudgeType);

      res.json({ templates, memes });
    } catch (error) {
      console.error('Get nudge templates error:', error);
      res.status(500).json({ error: 'Failed to fetch templates' });
    }
  }

  /**
   * GET /api/social/quests
   * Get student quests
   */
  async getQuests(req: Request, res: Response) {
    try {
      const schoolId = req.query.school_id ? parseInt(req.query.school_id as string) : undefined;
      const quests = await socialAccountabilityService.getStudentQuests(schoolId);
      res.json(quests);
    } catch (error) {
      console.error('Get quests error:', error);
      res.status(500).json({ error: 'Failed to fetch quests' });
    }
  }

  /**
   * POST /api/social/quests/:id/complete
   * Submit quest completion
   */
  async submitQuestCompletion(req: Request, res: Response) {
    try {
      const studentId = req.user?.id;

      if (!studentId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const questId = parseInt(req.params.id);
      const { proof_image_url, description } = req.body;

      if (isNaN(questId) || !proof_image_url || !description) {
        return res.status(400).json({ error: 'Quest ID, proof image, and description required' });
      }

      const completion = await socialAccountabilityService.submitQuestCompletion({
        questId,
        studentId,
        proofImageUrl: proof_image_url,
        description,
      });

      res.status(201).json({
        completion,
        message: 'Quest completion submitted! Waiting for teacher verification.',
      });
    } catch (error) {
      console.error('Submit quest completion error:', error);
      res.status(500).json({ error: 'Failed to submit quest completion' });
    }
  }

  /**
   * GET /api/social/disasters
   * Get active disaster events
   */
  async getActiveDisasters(req: Request, res: Response) {
    try {
      const disasters = await socialAccountabilityService.getActiveDisasters();
      res.json(disasters);
    } catch (error) {
      console.error('Get disasters error:', error);
      res.status(500).json({ error: 'Failed to fetch disaster events' });
    }
  }

  /**
   * POST /api/social/disasters/:id/volunteer
   * Register as disaster volunteer
   */
  async registerVolunteer(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const disasterId = parseInt(req.params.id);
      const { skills, availability } = req.body;

      if (isNaN(disasterId) || !skills || !availability) {
        return res.status(400).json({ error: 'Disaster ID, skills, and availability required' });
      }

      await socialAccountabilityService.registerVolunteer({
        userId,
        disasterId,
        skills,
        availability,
      });

      res.json({
        message: 'Thank you for volunteering! Coordination team will contact you soon.',
      });
    } catch (error: any) {
      console.error('Register volunteer error:', error);
      res.status(400).json({ error: error.message || 'Failed to register as volunteer' });
    }
  }
}

export default new SocialAccountabilityController();
