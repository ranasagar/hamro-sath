/**
 * Karma Points Service
 * Business logic for karma transactions, streaks, NFT badges, and redemptions
 */

import { karmaQueries, nftBadgeQueries, partnerQueries } from '../database/advancedQueries';
import { KarmaRedemption, KarmaTransaction, NFTBadge } from '../types/advancedFeatures';

export class KarmaService {
  /**
   * Award karma to user with festival multiplier
   */
  async awardKarma(
    userId: number,
    transactionType: KarmaTransaction['transaction_type'],
    baseAmount: number,
    description?: string,
    metadata?: Record<string, any>,
    relatedType?: string,
    relatedId?: number
  ): Promise<{ transaction: KarmaTransaction; earnedBadges: NFTBadge[] }> {
    // Check for active festival campaign
    const festival = await karmaQueries.getActiveFestivalCampaign();
    const multiplier = festival?.karma_multiplier || 1.0;
    const finalAmount = Math.round(baseAmount * multiplier);

    // Create karma transaction
    const transaction = await karmaQueries.createTransaction({
      user_id: userId,
      transaction_type: transactionType,
      amount: finalAmount,
      description: description || `${transactionType.replace(/_/g, ' ')} activity`,
      metadata: {
        ...metadata,
        festival: festival?.name,
        multiplier,
        base_amount: baseAmount,
      },
      related_type: relatedType,
      related_id: relatedId,
    });

    // Check for newly earned badges
    const earnedBadges = await this.checkAndAwardBadges(userId);

    return { transaction, earnedBadges };
  }

  /**
   * Check user's karma and award eligible badges
   */
  async checkAndAwardBadges(userId: number): Promise<NFTBadge[]> {
    const eligibleBadges = await nftBadgeQueries.checkEligibleBadges(userId);
    const awarded: NFTBadge[] = [];

    for (const badge of eligibleBadges) {
      // Generate blockchain token ID (placeholder - would use Solana in production)
      const tokenId = `SOL-${badge.id}-${userId}-${Date.now()}`;

      try {
        await nftBadgeQueries.awardBadge(userId, badge.id, tokenId);
        awarded.push(badge);
      } catch (error) {
        console.error(`Failed to award badge ${badge.id} to user ${userId}:`, error);
      }
    }

    return awarded;
  }

  /**
   * Get user's karma stats including balance, streak, badges
   */
  async getUserStats(userId: number) {
    const [balance, history, streak, badges] = await Promise.all([
      karmaQueries.getUserBalance(userId),
      karmaQueries.getUserHistory(userId, 20),
      karmaQueries.getUserStreak(userId),
      nftBadgeQueries.getUserBadges(userId),
    ]);

    return {
      balance,
      recent_transactions: history,
      streak: {
        current: streak?.current_streak || 0,
        longest: streak?.longest_streak || 0,
        last_activity: streak?.last_activity_date,
        multiplier: streak?.multiplier || 1.0,
      },
      nft_badges: badges,
      level: this.calculateLevel(balance),
      next_level_at: this.getNextLevelKarma(balance),
    };
  }

  /**
   * Calculate user level based on karma balance
   */
  private calculateLevel(karma: number): number {
    if (karma >= 50000) return 10; // Deity
    if (karma >= 25000) return 9; // Legend
    if (karma >= 10000) return 8; // Champion
    if (karma >= 5000) return 7; // Master
    if (karma >= 2500) return 6; // Expert
    if (karma >= 1000) return 5; // Pioneer
    if (karma >= 500) return 4; // Contributor
    if (karma >= 250) return 3; // Active
    if (karma >= 100) return 2; // Beginner
    return 1; // Newbie
  }

  /**
   * Get karma needed for next level
   */
  private getNextLevelKarma(currentKarma: number): number {
    const thresholds = [100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000];
    return thresholds.find((t) => t > currentKarma) || 50000;
  }

  /**
   * Get karma leaderboard with ward filtering
   */
  async getLeaderboard(limit = 10, wardId?: number) {
    let leaderboard = await karmaQueries.getLeaderboard(limit);

    if (wardId) {
      leaderboard = leaderboard.filter((user) => user.ward_id === wardId);
    }

    return leaderboard.map((user, index) => ({
      ...user,
      rank: index + 1,
      level: this.calculateLevel(user.total_karma),
    }));
  }

  /**
   * Redeem karma at partner shop
   */
  async redeemKarma(
    userId: number,
    partnerId: number,
    karmaAmount: number
  ): Promise<KarmaRedemption> {
    // Verify user has enough karma
    const balance = await karmaQueries.getUserBalance(userId);
    if (balance < karmaAmount) {
      throw new Error(`Insufficient karma. Balance: ${balance}, Required: ${karmaAmount}`);
    }

    // Get partner details
    const partner = await partnerQueries.getById(partnerId);
    if (!partner || !partner.is_active) {
      throw new Error('Partner not found or inactive');
    }

    // Find applicable offer
    const offer = partner.offers.find(
      (o: any) => karmaAmount >= o.karma_cost && karmaAmount <= (o.max_karma || Infinity)
    );

    if (!offer) {
      throw new Error('No valid offer for this karma amount');
    }

    // Generate redemption code
    const redemptionCode = this.generateRedemptionCode();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Deduct karma
    await karmaQueries.createTransaction({
      user_id: userId,
      transaction_type: 'karma_redeemed',
      amount: -karmaAmount,
      description: `Redeemed at ${partner.name}`,
      metadata: { partner_id: partnerId, offer },
    });

    // Create redemption record
    const redemption = await partnerQueries.createRedemption({
      user_id: userId,
      partner_id: partnerId,
      karma_spent: karmaAmount,
      discount_amount: offer.discount_amount,
      discount_percentage: offer.discount_percentage,
      redemption_code: redemptionCode,
      expires_at: expiresAt,
    });

    return redemption;
  }

  /**
   * Generate unique redemption code
   */
  private generateRedemptionCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'SAFA-';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Get karma transaction history with filters
   */
  async getTransactionHistory(
    userId: number,
    filters?: {
      transactionType?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    }
  ): Promise<KarmaTransaction[]> {
    // Basic implementation - extend with filter logic
    return karmaQueries.getUserHistory(userId, filters?.limit || 50);
  }

  /**
   * Calculate potential karma earnings for action
   */
  calculatePotentialKarma(actionType: string): {
    base: number;
    withFestival: number;
    description: string;
  } {
    const karmaMap: Record<string, { base: number; description: string }> = {
      waste_segregation: { base: 10, description: 'Sort waste properly' },
      sapling_planted: { base: 50, description: 'Plant a tree' },
      neighbor_education: { base: 15, description: 'Educate your neighbor' },
      recycled_item: { base: 20, description: 'Recycle an item' },
      compost_created: { base: 25, description: 'Create compost' },
      cleanup_joined: { base: 30, description: 'Join cleanup event' },
      report_filed: { base: 5, description: 'Report an issue' },
      event_organized: { base: 100, description: 'Organize community event' },
      public_transport: { base: 15, description: 'Use public transport' },
      cycling: { base: 20, description: 'Cycle instead of driving' },
      walking: { base: 10, description: 'Walk short distances' },
      sajha_bus_used: { base: 25, description: 'Use Sajha Sewa bus' },
      eco_product_bought: { base: 30, description: 'Buy eco-friendly product' },
    };

    const action = karmaMap[actionType] || { base: 5, description: 'Unknown action' };
    // Note: withFestival would be calculated with actual active festival multiplier
    return {
      base: action.base,
      withFestival: action.base * 1.5, // Placeholder
      description: action.description,
    };
  }
}

export default new KarmaService();
