/**
 * Advanced Features API Routes
 * Karma, Civic Hubs, Social Tools, Sustainability
 */

import { Router } from 'express';
import civicHubController from '../controllers/civicHubController';
import karmaController from '../controllers/karmaController';
import socialAccountabilityController from '../controllers/socialAccountabilityController';
import sustainabilityController from '../controllers/sustainabilityController';

const router = Router();

// ============================================================================
// KARMA POINTS ROUTES
// ============================================================================

// Get user karma statistics
router.get('/karma/stats', karmaController.getUserStats.bind(karmaController));

// Get karma leaderboard
router.get('/karma/leaderboard', karmaController.getLeaderboard.bind(karmaController));

// Award karma (internal use or admin)
router.post('/karma/award', karmaController.awardKarma.bind(karmaController));

// Get karma transaction history
router.get('/karma/history', karmaController.getHistory.bind(karmaController));

// Calculate potential karma for action
router.get('/karma/potential', karmaController.getPotentialKarma.bind(karmaController));

// Get redemption partners
router.get('/karma/partners', karmaController.getPartners.bind(karmaController));

// Redeem karma at partner
router.post('/karma/redeem', karmaController.redeemKarma.bind(karmaController));

// Get user redemptions
router.get('/karma/redemptions', karmaController.getRedemptions.bind(karmaController));

// Get user NFT badges
router.get('/karma/badges', karmaController.getUserBadges.bind(karmaController));

// Check for newly earned badges
router.post('/karma/check-badges', karmaController.checkNewBadges.bind(karmaController));

// ============================================================================
// CIVIC HUB ROUTES
// ============================================================================

// Get ward cleanliness scores
router.get('/civic/ward-scores', civicHubController.getWardScores.bind(civicHubController));

// Get ward dashboard
router.get(
  '/civic/ward/:id/dashboard',
  civicHubController.getWardDashboard.bind(civicHubController)
);

// Get community projects
router.get('/civic/projects', civicHubController.getProjects.bind(civicHubController));

// Propose new project
router.post('/civic/projects', civicHubController.proposeProject.bind(civicHubController));

// Vote on project
router.post('/civic/projects/:id/vote', civicHubController.voteOnProject.bind(civicHubController));

// Get chatbot response
router.post('/civic/chatbot', civicHubController.getChatbotResponse.bind(civicHubController));

// Get terrain-specific tips
router.get('/civic/terrain-tips', civicHubController.getTerrainTips.bind(civicHubController));

// ============================================================================
// SOCIAL ACCOUNTABILITY ROUTES
// ============================================================================

// Send civic nudge
router.post(
  '/social/nudge',
  socialAccountabilityController.sendNudge.bind(socialAccountabilityController)
);

// Get received nudges
router.get(
  '/social/nudges',
  socialAccountabilityController.getUserNudges.bind(socialAccountabilityController)
);

// Get nudge templates
router.get(
  '/social/nudge-templates',
  socialAccountabilityController.getNudgeTemplates.bind(socialAccountabilityController)
);

// Get student quests
router.get(
  '/social/quests',
  socialAccountabilityController.getQuests.bind(socialAccountabilityController)
);

// Submit quest completion
router.post(
  '/social/quests/:id/complete',
  socialAccountabilityController.submitQuestCompletion.bind(socialAccountabilityController)
);

// Get active disasters
router.get(
  '/social/disasters',
  socialAccountabilityController.getActiveDisasters.bind(socialAccountabilityController)
);

// Register as volunteer
router.post(
  '/social/disasters/:id/volunteer',
  socialAccountabilityController.registerVolunteer.bind(socialAccountabilityController)
);

// ============================================================================
// SUSTAINABILITY ROUTES
// ============================================================================

// Log carbon footprint activity
router.post(
  '/sustainability/carbon/log',
  sustainabilityController.logCarbonActivity.bind(sustainabilityController)
);

// Log transport activity
router.post(
  '/sustainability/transport/log',
  sustainabilityController.logTransport.bind(sustainabilityController)
);

// Get carbon statistics
router.get(
  '/sustainability/carbon/stats',
  sustainabilityController.getCarbonStats.bind(sustainabilityController)
);

// Get eco-brands
router.get(
  '/sustainability/eco-brands',
  sustainabilityController.getEcoBrands.bind(sustainabilityController)
);

// Purchase eco-product
router.post(
  '/sustainability/eco-product/purchase',
  sustainabilityController.purchaseEcoProduct.bind(sustainabilityController)
);

// Get recommendations
router.get(
  '/sustainability/recommendations',
  sustainabilityController.getRecommendations.bind(sustainabilityController)
);

// Get Sajha Bus info
router.get(
  '/sustainability/sajha-info',
  sustainabilityController.getSajhaBusInfo.bind(sustainabilityController)
);

// Get carbon challenges
router.get(
  '/sustainability/challenges',
  sustainabilityController.getCarbonChallenges.bind(sustainabilityController)
);

// Get transport leaderboard
router.get(
  '/sustainability/transport/leaderboard',
  sustainabilityController.getTransportLeaderboard.bind(sustainabilityController)
);

export default router;
