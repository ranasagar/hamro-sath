/**
 * Sustainability Service
 * Business logic for carbon tracking, eco-brands, and transport rewards
 */

import { sustainabilityQueries } from '../database/advancedQueries';
import { CarbonFootprint, EcoBrand, TransportReward } from '../types/advancedFeatures';
import karmaService from './karmaService';

export class SustainabilityService {
  /**
   * Log carbon footprint activity
   */
  async logCarbonActivity(data: {
    userId: number;
    activityType: CarbonFootprint['activity_type'];
    amount: number;
    unit: string;
  }): Promise<{ carbonEntry: CarbonFootprint; karmaAwarded: number }> {
    // Calculate carbon saved based on activity
    const carbonSaved = this.calculateCarbonSaved(data.activityType, data.amount);

    // Calculate karma based on carbon impact
    const karmaEarned = Math.round(carbonSaved * 10); // 1kg CO2 = 10 karma

    // Log carbon footprint
    const carbonEntry = await sustainabilityQueries.logCarbon({
      user_id: data.userId,
      activity_type: data.activityType,
      amount: data.amount,
      unit: data.unit,
      carbon_saved: carbonSaved,
      karma_earned: karmaEarned,
      date: new Date(),
    });

    // Award karma
    await karmaService.awardKarma(
      data.userId,
      data.activityType as any,
      karmaEarned,
      `Carbon saving activity: ${data.activityType}`,
      { carbon_saved: carbonSaved }
    );

    return { carbonEntry, karmaAwarded: karmaEarned };
  }

  /**
   * Calculate carbon saved based on activity type
   * Values based on Nepal's emission factors
   */
  private calculateCarbonSaved(activityType: string, amount: number): number {
    const conversionFactors: Record<string, number> = {
      recycled_plastic: 1.5, // kg CO2 per kg plastic recycled
      recycled_paper: 0.9, // kg CO2 per kg paper recycled
      recycled_metal: 2.5, // kg CO2 per kg metal recycled
      composted_waste: 0.4, // kg CO2 per kg composted
      tree_planted: 21.0, // kg CO2 per tree per year
      solar_used: 0.85, // kg CO2 per kWh from solar
      public_transport: 0.05, // kg CO2 saved per km
      cycling: 0.12, // kg CO2 saved per km (vs motorbike)
      walking: 0.12, // kg CO2 saved per km (vs motorbike)
      sajha_bus: 0.08, // kg CO2 saved per km (electric bus)
      eco_product: 2.0, // Average kg CO2 saved per eco product
    };

    return (conversionFactors[activityType] || 1.0) * amount;
  }

  /**
   * Log transport activity
   */
  async logTransport(data: {
    userId: number;
    transportType: TransportReward['transport_type'];
    distanceKm: number;
    route?: string;
  }): Promise<{ transportEntry: TransportReward; karmaAwarded: number }> {
    // Calculate carbon saved
    const carbonSaved = this.calculateCarbonSaved(data.transportType, data.distanceKm);

    // Calculate karma (with bonus for public transport)
    const baseKarma = Math.round(carbonSaved * 10);
    const bonusKarma = data.transportType === 'sajha_bus' ? 5 : 0; // Bonus for Sajha
    const totalKarma = baseKarma + bonusKarma;

    // Log transport
    const transportEntry = await sustainabilityQueries.logTransport({
      user_id: data.userId,
      transport_type: data.transportType,
      distance_km: data.distanceKm,
      carbon_saved: carbonSaved,
      karma_earned: totalKarma,
      route: data.route,
    });

    // Award karma
    await karmaService.awardKarma(
      data.userId,
      data.transportType as any,
      totalKarma,
      `Eco-friendly transport: ${data.transportType}`,
      { distance_km: data.distanceKm, carbon_saved: carbonSaved }
    );

    return { transportEntry, karmaAwarded: totalKarma };
  }

  /**
   * Get user's carbon impact statistics
   */
  async getUserCarbonStats(userId: number) {
    const stats = await sustainabilityQueries.getUserCarbonStats(userId);

    // Calculate totals
    const totalCarbonSaved = stats.reduce(
      (sum: number, s: any) => sum + parseFloat(s.total_carbon_saved || 0),
      0
    );
    const totalKarmaEarned = stats.reduce(
      (sum: number, s: any) => sum + parseFloat(s.total_karma_earned || 0),
      0
    );
    const totalActivities = stats.reduce(
      (sum: number, s: any) => sum + parseInt(s.total_activities || 0),
      0
    );

    // Convert to real-world equivalents
    const equivalents = this.calculateEquivalents(totalCarbonSaved);

    return {
      total_carbon_saved_kg: Math.round(totalCarbonSaved * 10) / 10,
      total_karma_earned: totalKarmaEarned,
      total_activities: totalActivities,
      by_activity: stats,
      equivalents,
      impact_level: this.getImpactLevel(totalCarbonSaved),
    };
  }

  /**
   * Calculate real-world equivalents of carbon saved
   */
  private calculateEquivalents(carbonKg: number) {
    return {
      trees_planted_equivalent: Math.round(carbonKg / 21), // 1 tree = 21kg CO2/year
      km_driven_avoided: Math.round(carbonKg / 0.12), // 1km motorbike = 0.12kg CO2
      plastic_recycled_kg: Math.round(carbonKg / 1.5), // 1kg plastic = 1.5kg CO2
      sajha_bus_trips: Math.round(carbonKg / (0.08 * 10)), // Average 10km trip
    };
  }

  /**
   * Get impact level based on carbon saved
   */
  private getImpactLevel(carbonKg: number): string {
    if (carbonKg >= 500) return 'Climate Champion';
    if (carbonKg >= 250) return 'Eco Warrior';
    if (carbonKg >= 100) return 'Green Guardian';
    if (carbonKg >= 50) return 'Carbon Conscious';
    return 'Getting Started';
  }

  /**
   * Get eco-friendly brands
   */
  async getEcoBrands(): Promise<EcoBrand[]> {
    return sustainabilityQueries.getEcoBrands();
  }

  /**
   * Purchase eco-friendly product
   */
  async purchaseEcoProduct(data: {
    userId: number;
    brandId: number;
    productName: string;
    price: number;
  }): Promise<{ karmaAwarded: number }> {
    // Award karma for supporting eco-brands
    const karmaAmount = 30; // Base karma for eco purchase

    await karmaService.awardKarma(
      data.userId,
      'eco_product_bought',
      karmaAmount,
      `Purchased eco product: ${data.productName}`,
      { brand_id: data.brandId, price: data.price }
    );

    // Log carbon impact
    await this.logCarbonActivity({
      userId: data.userId,
      activityType: 'eco_product',
      amount: 1,
      unit: 'item',
    });

    return { karmaAwarded: karmaAmount };
  }

  /**
   * Get transport leaderboard
   */
  async getTransportLeaderboard(limit = 10) {
    // TODO: Implement transport leaderboard query
    // Would show users with most eco-friendly transport usage

    return [];
  }

  /**
   * Get recommended eco actions for user
   */
  getRecommendedActions(userStats: any): Array<{
    action: string;
    description: string;
    potentialKarma: number;
    potentialCarbonSaved: number;
  }> {
    const recommendations = [
      {
        action: 'Take Sajha Bus',
        description: 'Use Sajha Sewa electric bus for your commute',
        potentialKarma: 25,
        potentialCarbonSaved: 0.8,
      },
      {
        action: 'Cycle to Work',
        description: 'Cycle instead of using a vehicle',
        potentialKarma: 20,
        potentialCarbonSaved: 1.2,
      },
      {
        action: 'Recycle Plastic',
        description: 'Take plastic waste to recycling center',
        potentialKarma: 20,
        potentialCarbonSaved: 1.5,
      },
      {
        action: 'Create Compost',
        description: 'Compost your organic waste',
        potentialKarma: 25,
        potentialCarbonSaved: 0.4,
      },
      {
        action: 'Buy Eco Products',
        description: 'Choose eco-friendly alternatives',
        potentialKarma: 30,
        potentialCarbonSaved: 2.0,
      },
      {
        action: 'Plant a Tree',
        description: 'Plant a sapling in your community',
        potentialKarma: 50,
        potentialCarbonSaved: 21.0,
      },
    ];

    // Personalize based on user's current activities
    // TODO: Filter out actions user already does frequently

    return recommendations;
  }

  /**
   * Get Sajha Bus routes and stops
   */
  getSajhaBusInfo() {
    return {
      routes: [
        { id: 1, name: 'Ratna Park - Balaju', stops: 15, avg_time: '45 min' },
        { id: 2, name: 'New Bus Park - Lagankhel', stops: 20, avg_time: '60 min' },
        { id: 3, name: 'Kalanki - Koteshwor', stops: 18, avg_time: '50 min' },
        { id: 4, name: 'Chabahil - Gongabu', stops: 12, avg_time: '35 min' },
      ],
      benefits: {
        carbon_saved_per_km: 0.08,
        karma_per_trip: 25,
        cost_vs_taxi: '80% cheaper',
        comfort: 'Air-conditioned electric buses',
      },
    };
  }

  /**
   * Get carbon saving challenges
   */
  getCarbonChallenges() {
    return [
      {
        id: 1,
        title: 'Car-Free Week',
        description: 'Use only public transport, cycling, or walking for 7 days',
        duration_days: 7,
        karma_reward: 200,
        carbon_target_kg: 10,
      },
      {
        id: 2,
        title: 'Plastic-Free Month',
        description: 'Avoid single-use plastics for 30 days',
        duration_days: 30,
        karma_reward: 500,
        carbon_target_kg: 15,
      },
      {
        id: 3,
        title: 'Recycling Hero',
        description: 'Recycle 10kg of waste this month',
        duration_days: 30,
        karma_reward: 300,
        carbon_target_kg: 15,
      },
      {
        id: 4,
        title: 'Green Commuter',
        description: 'Take Sajha Bus 20 times this month',
        duration_days: 30,
        karma_reward: 400,
        carbon_target_kg: 16,
      },
    ];
  }

  /**
   * Calculate festival campaign carbon bonus
   */
  async getFestivalCarbonBonus(): Promise<{
    active: boolean;
    multiplier: number;
    campaignName?: string;
  }> {
    const festival = await karmaService['karmaQueries'].getActiveFestivalCampaign();

    if (festival && festival.carbon_focus) {
      return {
        active: true,
        multiplier: festival.karma_multiplier,
        campaignName: festival.name,
      };
    }

    return { active: false, multiplier: 1.0 };
  }
}

export default new SustainabilityService();
