import express from 'express';
import issueController from '../controllers/issue.controller';
import { authenticate } from '../middleware/auth';
import { optionalAuthMiddleware } from '../middleware/optionalAuth';
import { requireAdmin } from '../middleware/requireAdmin';
import { validateBody } from '../middleware/validate';
import { createIssueSchema, updateIssueSchema } from '../validators/issue.validator';

const router = express.Router();

/**
 * @route   GET /api/v1/issues
 * @desc    List all issues with filters
 * @access  Public (but shows user-specific data if authenticated)
 */
router.get('/', optionalAuthMiddleware, issueController.listIssues.bind(issueController));

/**
 * @route   GET /api/v1/issues/:id
 * @desc    Get single issue by ID
 * @access  Public (but shows user-specific data if authenticated)
 */
router.get('/:id', optionalAuthMiddleware, issueController.getIssueById.bind(issueController));

/**
 * @route   POST /api/v1/issues
 * @desc    Create new issue
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  validateBody(createIssueSchema),
  issueController.createIssue.bind(issueController)
);

/**
 * @route   PUT /api/v1/issues/:id
 * @desc    Update issue (creator or admin only)
 * @access  Private
 */
router.put(
  '/:id',
  authenticate,
  validateBody(updateIssueSchema),
  issueController.updateIssue.bind(issueController)
);

/**
 * @route   PUT /api/v1/issues/:id/upvote
 * @desc    Toggle upvote on issue
 * @access  Private
 */
router.put('/:id/upvote', authenticate, issueController.upvoteIssue.bind(issueController));

/**
 * @route   PUT /api/v1/issues/:id/volunteer
 * @desc    Toggle volunteer status for issue
 * @access  Private
 */
router.put('/:id/volunteer', authenticate, issueController.volunteerForIssue.bind(issueController));

/**
 * @route   PUT /api/v1/issues/:id/complete
 * @desc    Mark issue as resolved/complete
 * @access  Private (creator or admin)
 */
router.put('/:id/complete', authenticate, issueController.completeIssue.bind(issueController));

/**
 * @route   DELETE /api/v1/issues/:id
 * @desc    Delete issue (Admin only)
 * @access  Private (admin)
 */
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  issueController.deleteIssue.bind(issueController)
);

export default router;
