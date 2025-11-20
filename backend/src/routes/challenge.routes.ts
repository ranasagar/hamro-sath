import { Router } from 'express';
import { ChallengeController } from '../controllers/challenge.controller';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/requireAdmin';

const router = Router();
const challengeController = new ChallengeController();

/**
 * @route   GET /api/v1/challenges
 * @desc    Get all challenges
 * @access  Public
 */
router.get('/', challengeController.getAll.bind(challengeController));

/**
 * @route   GET /api/v1/challenges/:id
 * @desc    Get challenge by ID
 * @access  Public
 */
router.get('/:id', challengeController.getById.bind(challengeController));

/**
 * @route   GET /api/v1/challenges/:id/leaderboard
 * @desc    Get challenge leaderboard
 * @access  Public
 */
router.get('/:id/leaderboard', challengeController.getLeaderboard.bind(challengeController));

/**
 * @route   POST /api/v1/challenges
 * @desc    Create new challenge
 * @access  Private (Admin only)
 */
router.post('/', authenticate, requireAdmin, challengeController.create.bind(challengeController));

/**
 * @route   PUT /api/v1/challenges/:id
 * @desc    Update challenge
 * @access  Private (Admin only)
 */
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  challengeController.update.bind(challengeController)
);

/**
 * @route   DELETE /api/v1/challenges/:id
 * @desc    Delete challenge
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  challengeController.delete.bind(challengeController)
);

export default router;
