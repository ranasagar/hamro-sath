/**
 * KARMA POINTS SYSTEM - Complete Configuration
 *
 * This file defines all point values for user activities across the entire app.
 * Points are awarded for civic engagement, community participation, and positive actions.
 *
 * Philosophy: Every positive action should be rewarded to encourage sustained engagement.
 */

export const KARMA_POINTS = {
  // 🗺️ ISSUE REPORTING & RESOLUTION
  REPORT_ISSUE: 50, // Report a civic issue (litter, broken bench, etc.)
  REPORT_DISTURBANCE: 20, // Report noise/traffic disturbance
  PARTICIPATE_IN_EVENT: 100, // Join an organized cleanup event
  ORGANIZE_EVENT: 250, // Organize and complete a cleanup event
  RESOLVE_ISSUE: 150, // Mark an issue as resolved with proof

  // ♻️ RECYCLING & ENVIRONMENTAL
  RECYCLE_LOG: 75, // Log recycling activity
  RECYCLE_BONUS_LARGE: 25, // Bonus for recycling 5+ items at once
  PLANT_TREE: 100, // Plant a tree or sapling
  CLEAN_DRAIN: 80, // Clean a blocked drainage

  // 📦 SUPPLY & SAFETY
  SUPPLY_KIT_PICKUP: 25, // Pick up cleaning supplies
  SAFETY_KIT_REDEMPTION: 100, // Redeem safety kit for volunteers
  SUPPLY_DISTRIBUTION: 50, // Help distribute supplies to others

  // 💬 FORUM & COMMUNITY ENGAGEMENT
  CREATE_THREAD: 10, // Start a new discussion thread
  CREATE_THREAD_WITH_MEDIA: 15, // Start thread with image/video
  POST_REPLY: 5, // Reply to a forum post
  POST_REPLY_WITH_MEDIA: 8, // Reply with image/video
  RECEIVE_UPVOTE: 2, // Each upvote on your post/reply
  GIVE_HELPFUL_UPVOTE: 1, // Upvote someone else's helpful content
  THREAD_FIRST_REPLY: 5, // Be the first to reply to a thread
  POPULAR_POST_BONUS: 25, // Post reaches 10+ upvotes
  VIRAL_POST_BONUS: 50, // Post reaches 25+ upvotes

  // 🏛️ CIVIC EDUCATION & AWARENESS
  COMPLETE_QUIZ: 50, // Complete civic awareness quiz
  QUEST_COMPLETION: 50, // Complete a community quest
  SHARE_EDUCATIONAL_CONTENT: 15, // Share educational post with media
  ATTEND_WORKSHOP: 75, // Attend civic education workshop

  // 🎯 MICRO ACTIONS (Quick Civic Tasks)
  MICRO_ACTION_BASIC: 5, // Basic micro-action (< 5 min)
  MICRO_ACTION_MEDIUM: 10, // Medium micro-action (5-15 min)
  MICRO_ACTION_COMPLEX: 20, // Complex micro-action (15+ min)
  DAILY_MICRO_ACTION_STREAK_3: 15, // Bonus for 3-day streak
  DAILY_MICRO_ACTION_STREAK_7: 50, // Bonus for 7-day streak
  DAILY_MICRO_ACTION_STREAK_30: 200, // Bonus for 30-day streak

  // 🎁 REWARDS & REDEMPTIONS
  REDEEM_REWARD: 0, // No points (deducts cost instead)
  REVIEW_REWARD: 5, // Write a review for redeemed reward
  PHOTO_PROOF_REWARD: 10, // Upload photo proof of reward usage

  // 👑 LEADERBOARD & ACHIEVEMENTS
  WEEKLY_TOP_10: 100, // Finish in top 10 weekly
  MONTHLY_TOP_3: 500, // Finish in top 3 monthly
  YEARLY_TOP_1: 2000, // Finish #1 yearly
  FIRST_IN_WARD: 50, // Become #1 in your ward

  // 🏆 BADGES & MILESTONES
  EARN_BADGE_COMMON: 10, // Earn a common badge
  EARN_BADGE_RARE: 25, // Earn a rare badge
  EARN_BADGE_EPIC: 100, // Earn an epic badge
  EARN_BADGE_LEGENDARY: 250, // Earn a legendary badge
  COMPLETE_BADGE_SET: 150, // Complete a set of related badges

  // 👥 SOCIAL & REFERRAL
  REFER_NEW_USER: 50, // Refer someone who registers
  REFERRED_USER_COMPLETES_ACTION: 25, // Bonus when your referral acts
  JOIN_TEAM: 20, // Join a community cleanup team
  CREATE_TEAM: 50, // Create a new cleanup team
  TEAM_ACHIEVEMENT: 75, // Your team completes a goal

  // ⭐ SPECIAL EVENTS & CAMPAIGNS
  FESTIVAL_CAMPAIGN_PARTICIPATION: 100, // Join festival cleanup campaign
  MAYOR_CHALLENGE_COMPLETION: 200, // Complete mayor's special challenge
  EMERGENCY_RESPONSE: 150, // Respond to civic emergency
  VOLUNTEER_SHIFT: 100, // Complete a volunteer shift

  // 📊 ADMIN & MODERATION (If user becomes moderator)
  MODERATE_CONTENT: 10, // Moderate forum content (spam removal)
  VERIFY_ISSUE: 15, // Verify reported issue is legitimate
  RESOLVE_DISPUTE: 25, // Help resolve community dispute

  // 🎉 BONUS MULTIPLIERS
  WEEKEND_MULTIPLIER: 1.5, // 50% bonus on weekends
  FESTIVAL_MULTIPLIER: 2.0, // 2x points during festivals
  EMERGENCY_MULTIPLIER: 1.5, // 50% bonus during emergencies
  EARLY_BIRD_BONUS: 1.25, // 25% bonus for actions 6-9 AM
  NIGHT_OWL_BONUS: 1.25, // 25% bonus for actions 9 PM-12 AM

  // 🚫 PENALTIES (Negative Points for Bad Behavior)
  SPAM_POST: -50, // Posting spam content
  FALSE_REPORT: -100, // Filing false issue report
  ABUSIVE_CONTENT: -200, // Posting abusive content
  ACCOUNT_WARNING: -50, // Moderator warning
} as const;

/**
 * Karma to NPR conversion rate
 * 10 Karma Points = 1 NPR (Nepalese Rupee)
 */
export const KARMA_TO_NPR_RATE = 10;

/**
 * Point thresholds for badge tiers
 */
export const BADGE_THRESHOLDS = {
  CIVIC_NOVICE: 0,
  ACTIVE_CITIZEN: 100,
  COMMUNITY_CHAMPION: 500,
  CIVIC_HERO: 1000,
  LEGEND_OF_NEPAL: 5000,
  NATIONAL_TREASURE: 10000,
} as const;

/**
 * Daily point limits to prevent gaming the system
 */
export const DAILY_LIMITS = {
  MAX_FORUM_POSTS: 20, // Max forum posts per day for points
  MAX_FORUM_REPLIES: 50, // Max replies per day for points
  MAX_UPVOTES_GIVEN: 100, // Max upvotes that award points per day
  MAX_MICRO_ACTIONS: 10, // Max micro actions per day
  MAX_RECYCLE_LOGS: 5, // Max recycle logs per day
  MAX_ISSUE_REPORTS: 3, // Max issue reports per day
} as const;

/**
 * Calculate points with multipliers
 */
export function calculatePoints(
  basePoints: number,
  options?: {
    isWeekend?: boolean;
    isFestival?: boolean;
    isEmergency?: boolean;
    isEarlyBird?: boolean;
    isNightOwl?: boolean;
  }
): number {
  let points = basePoints;

  if (options?.isWeekend) points *= KARMA_POINTS.WEEKEND_MULTIPLIER;
  if (options?.isFestival) points *= KARMA_POINTS.FESTIVAL_MULTIPLIER;
  if (options?.isEmergency) points *= KARMA_POINTS.EMERGENCY_MULTIPLIER;
  if (options?.isEarlyBird) points *= KARMA_POINTS.EARLY_BIRD_BONUS;
  if (options?.isNightOwl) points *= KARMA_POINTS.NIGHT_OWL_BONUS;

  return Math.round(points);
}

/**
 * Get appropriate reward message for activity
 */
export function getRewardMessage(activityType: keyof typeof KARMA_POINTS, points: number): string {
  const messages: Record<string, string> = {
    CREATE_THREAD: `+${points} KP for starting a discussion!`,
    POST_REPLY: `+${points} KP for sharing your thoughts!`,
    RECEIVE_UPVOTE: `+${points} KP - Someone found your post helpful!`,
    REPORT_ISSUE: `+${points} KP for reporting an issue!`,
    RECYCLE_LOG: `+${points} KP for recycling!`,
    PARTICIPATE_IN_EVENT: `+${points} KP for joining the cleanup!`,
    COMPLETE_QUIZ: `+${points} KP for completing the quiz!`,
    MICRO_ACTION_BASIC: `+${points} KP for your quick civic action!`,
  };

  return messages[activityType] || `+${points} Karma Points earned!`;
}

export type KarmaActivity = keyof typeof KARMA_POINTS;
