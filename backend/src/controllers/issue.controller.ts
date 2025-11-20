import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { IssueService } from '../services/IssueService';

export class IssueController {
  /**
   * List all issues with filters
   * GET /api/v1/issues
   */
  async listIssues(req: AuthRequest, res: Response) {
    try {
      const { status, category, ward_id, severity, page = 1, limit = 20 } = req.query;

      const userId = req.user?.userId;

      const result = await IssueService.list({
        status: status as string,
        category: category as string,
        ward_id: ward_id ? parseInt(ward_id as string) : undefined,
        severity: severity as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        userId,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      throw new AppError('Failed to fetch issues', 500);
    }
  }

  /**
   * Get single issue by ID
   * GET /api/v1/issues/:id
   */
  async getIssueById(req: AuthRequest, res: Response) {
    try {
      const issueId = parseInt(req.params.id);
      const userId = req.user?.userId;

      if (isNaN(issueId)) {
        throw new AppError('Invalid issue ID', 400);
      }

      const issue = await IssueService.getById(issueId, userId);

      if (!issue) {
        throw new AppError('Issue not found', 404);
      }

      res.json({
        success: true,
        data: { issue },
      });
    } catch (error) {
      console.error('Error in getIssueById:', error);
      if (error instanceof AppError) throw error;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new AppError(`Failed to fetch issue: ${errorMessage}`, 500);
    }
  }

  /**
   * Create new issue
   * POST /api/v1/issues
   */
  async createIssue(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { title, description, category, latitude, longitude, photo_urls } = req.body;

      const newIssue = await IssueService.create({
        reporter_id: userId,
        title,
        description,
        category,
        latitude,
        longitude,
        photo_urls,
      });

      res.status(201).json({
        success: true,
        data: { issue: newIssue },
        message: 'Issue reported successfully',
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to create issue', 500);
    }
  }

  /**
   * Update issue
   * PUT /api/v1/issues/:id
   */
  async updateIssue(req: AuthRequest, res: Response) {
    try {
      const issueId = parseInt(req.params.id);
      const userId = req.user!.userId;
      const isAdmin = req.user!.role === 'admin';

      if (isNaN(issueId)) {
        throw new AppError('Invalid issue ID', 400);
      }

      const { title, description, status, severity } = req.body;

      const issue = await IssueService.update(issueId, userId, isAdmin, {
        title,
        description,
        status,
        severity,
      });

      res.json({
        success: true,
        data: { issue },
        message: 'Issue updated successfully',
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update issue', 500);
    }
  }

  /**
   * Toggle upvote on issue
   * PUT /api/v1/issues/:id/upvote
   */
  async upvoteIssue(req: AuthRequest, res: Response) {
    try {
      const issueId = parseInt(req.params.id);
      const userId = req.user!.userId;

      if (isNaN(issueId)) {
        throw new AppError('Invalid issue ID', 400);
      }

      const result = await IssueService.toggleUpvote(issueId, userId);

      res.json({
        success: true,
        data: result,
        message: result.upvoted ? 'Issue upvoted' : 'Upvote removed',
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to upvote issue', 500);
    }
  }

  /**
   * Toggle volunteer for issue
   * PUT /api/v1/issues/:id/volunteer
   */
  async volunteerForIssue(req: AuthRequest, res: Response) {
    try {
      const issueId = parseInt(req.params.id);
      const userId = req.user!.userId;

      if (isNaN(issueId)) {
        throw new AppError('Invalid issue ID', 400);
      }

      const result = await IssueService.toggleVolunteer(issueId, userId);

      res.json({
        success: true,
        data: result,
        message: result.volunteered ? 'Volunteered for issue' : 'Volunteer status removed',
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to volunteer', 500);
    }
  }

  /**
   * Mark issue as complete/resolved
   * PUT /api/v1/issues/:id/complete
   */
  async completeIssue(req: AuthRequest, res: Response) {
    try {
      const issueId = parseInt(req.params.id);
      const userId = req.user!.userId;
      const isAdmin = req.user!.role === 'admin';

      if (isNaN(issueId)) {
        throw new AppError('Invalid issue ID', 400);
      }

      const issue = await IssueService.markComplete(issueId, userId, isAdmin);

      res.json({
        success: true,
        data: { issue },
        message: 'Issue marked as resolved',
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to complete issue', 500);
    }
  }

  /**
   * Delete issue (Admin only)
   * DELETE /api/v1/issues/:id
   */
  async deleteIssue(req: AuthRequest, res: Response) {
    try {
      const issueId = parseInt(req.params.id);

      if (isNaN(issueId)) {
        throw new AppError('Invalid issue ID', 400);
      }

      await IssueService.delete(issueId);

      res.json({
        success: true,
        message: 'Issue deleted successfully',
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to delete issue', 500);
    }
  }
}

const issueController = new IssueController();
export default issueController;
