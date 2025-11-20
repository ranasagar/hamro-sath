import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { passwordLimiter } from '../middleware/rateLimiter';
import { validateBody } from '../middleware/validate';
import { changePasswordSchema, updateProfileSchema } from '../validators/auth.validator';

const router = Router();

/**
 * @route   GET /api/v1/users/me
 * @desc    Get current user's profile
 * @access  Private
 */
router.get('/me', authenticate, UserController.getMyProfile);

/**
 * @route   GET /api/v1/users/leaderboard
 * @desc    Get top users leaderboard
 * @access  Public
 */
router.get('/leaderboard', UserController.getLeaderboard);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user profile by ID
 * @access  Public
 */
router.get('/:id', UserController.getProfile);

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update user profile
 * @access  Private (own profile or admin)
 */
router.put('/:id', authenticate, validateBody(updateProfileSchema), UserController.updateProfile);

/**
 * @route   PUT /api/v1/users/:id/password
 * @desc    Change user password
 * @access  Private (own profile only)
 */
router.put(
  '/:id/password',
  passwordLimiter,
  authenticate,
  validateBody(changePasswordSchema),
  UserController.changePassword
);

/**
 * @route   GET /api/v1/users/:id/activities
 * @desc    Get user's activity feed
 * @access  Public
 */
router.get('/:id/activities', UserController.getActivities);

export default router;
