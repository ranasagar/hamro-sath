import { Router } from 'express';
import { RewardController } from '../controllers/reward.controller';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { requireAdmin } from '../middleware/requireAdmin';

const router = Router();
const rewardController = new RewardController();

// Public routes (no auth required)
router.get('/', asyncHandler(rewardController.listRewards.bind(rewardController)));
router.get('/:id', asyncHandler(rewardController.getRewardById.bind(rewardController)));

// Protected routes (auth required)
router.post(
  '/redeem',
  authenticate,
  asyncHandler(rewardController.redeemReward.bind(rewardController))
);
router.get(
  '/my-redemptions',
  authenticate,
  asyncHandler(rewardController.getMyRedemptions.bind(rewardController))
);

// Admin routes (admin role required)
router.post(
  '/',
  authenticate,
  requireAdmin,
  asyncHandler(rewardController.createReward.bind(rewardController))
);
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  asyncHandler(rewardController.updateReward.bind(rewardController))
);
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  asyncHandler(rewardController.deleteReward.bind(rewardController))
);

export default router;
