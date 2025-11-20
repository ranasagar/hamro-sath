import axios, { AxiosError, AxiosInstance } from 'axios';
import type {
  // API request/response types
  AwardKarmaRequest,
  CarbonChallenge,
  // Sustainability types
  CarbonFootprint,
  CarbonStats,
  ChatbotResponse,
  CheckNewBadgesResponse,
  // Social Accountability types
  CivicNudge,
  CommunityProject,
  DisasterEvent,
  DisasterVolunteer,
  EcoBrand,
  EcoPurchase,
  KarmaRedemption,
  // Karma types
  KarmaStats,
  KarmaTransaction,
  LeaderboardEntry,
  LogCarbonActivityRequest,
  LogTransportRequest,
  NudgeTemplate,
  Partner,
  PotentialKarmaResponse,
  ProposeProjectRequest,
  PurchaseEcoProductRequest,
  RecommendedAction,
  RedeemKarmaRequest,
  SajhaBusInfo,
  SendNudgeRequest,
  StudentQuest,
  TerrainTip,
  TransportReward,
  UserNFTBadge,
  VoteOnProjectRequest,
  // Civic Hub types
  WardCleanlinessScore,
  WardDashboardData,
} from '../types/advancedFeatures';

// API base URL - use environment variable or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

class AdvancedFeaturesAPI {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth interceptor
    this.client.interceptors.request.use(config => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Redirect to login or refresh token
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // ==================== KARMA POINTS API ====================

  /**
   * Get user's karma stats including balance, level, streak, and badges
   */
  async getKarmaStats(): Promise<KarmaStats> {
    const { data } = await this.client.get('/karma/stats');
    return data;
  }

  /**
   * Get karma leaderboard with optional ward filtering
   */
  async getLeaderboard(wardId?: number): Promise<LeaderboardEntry[]> {
    const { data } = await this.client.get('/karma/leaderboard', {
      params: { wardId },
    });
    return data;
  }

  /**
   * Award karma points to a user
   */
  async awardKarma(request: AwardKarmaRequest): Promise<KarmaTransaction> {
    const { data } = await this.client.post('/karma/award', request);
    return data;
  }

  /**
   * Get user's karma transaction history
   */
  async getKarmaHistory(limit = 20, offset = 0): Promise<KarmaTransaction[]> {
    const { data } = await this.client.get('/karma/history', {
      params: { limit, offset },
    });
    return data;
  }

  /**
   * Calculate potential karma for an action
   */
  async getPotentialKarma(
    transactionType: string,
    metadata?: Record<string, any>
  ): Promise<PotentialKarmaResponse> {
    const { data } = await this.client.post('/karma/potential', {
      transactionType,
      metadata,
    });
    return data;
  }

  /**
   * Get list of partner shops for redemption
   */
  async getPartners(): Promise<Partner[]> {
    const { data } = await this.client.get('/karma/partners');
    return data;
  }

  /**
   * Redeem karma points at a partner shop
   */
  async redeemKarma(request: RedeemKarmaRequest): Promise<KarmaRedemption> {
    const { data } = await this.client.post('/karma/redeem', request);
    return data;
  }

  /**
   * Get user's redemption history
   */
  async getRedemptions(limit = 20, offset = 0): Promise<KarmaRedemption[]> {
    const { data } = await this.client.get('/karma/redemptions', {
      params: { limit, offset },
    });
    return data;
  }

  /**
   * Get user's earned NFT badges
   */
  async getUserBadges(): Promise<UserNFTBadge[]> {
    const { data } = await this.client.get('/karma/badges');
    return data;
  }

  /**
   * Check for newly earned badges
   */
  async checkNewBadges(): Promise<CheckNewBadgesResponse> {
    const { data } = await this.client.get('/karma/badges/new');
    return data;
  }

  // ==================== CIVIC HUB API ====================

  /**
   * Get ward cleanliness scores with rankings
   */
  async getWardScores(): Promise<WardCleanlinessScore[]> {
    const { data } = await this.client.get('/civic/wards');
    return data;
  }

  /**
   * Get comprehensive ward dashboard data
   */
  async getWardDashboard(wardId: number): Promise<WardDashboardData> {
    const { data } = await this.client.get(`/civic/wards/${wardId}`);
    return data;
  }

  /**
   * Get community projects with optional filtering
   */
  async getCommunityProjects(
    status?: 'proposed' | 'approved' | 'in_progress' | 'completed',
    wardId?: number
  ): Promise<CommunityProject[]> {
    const { data } = await this.client.get('/civic/projects', {
      params: { status, wardId },
    });
    return data;
  }

  /**
   * Propose a new community project
   */
  async proposeProject(request: ProposeProjectRequest): Promise<CommunityProject> {
    const { data } = await this.client.post('/civic/projects', request);
    return data;
  }

  /**
   * Vote on a community project
   */
  async voteOnProject(request: VoteOnProjectRequest): Promise<{ success: boolean }> {
    const { data } = await this.client.post('/civic/projects/vote', request);
    return data;
  }

  /**
   * Chat with the AI civic assistant
   */
  async chatWithBot(message: string, conversationId?: string): Promise<ChatbotResponse> {
    const { data } = await this.client.post('/civic/chatbot', {
      message,
      conversationId,
    });
    return data;
  }

  /**
   * Get terrain-specific tips for ward
   */
  async getTerrainTips(wardId: number): Promise<TerrainTip[]> {
    const { data } = await this.client.get(`/civic/terrain-tips/${wardId}`);
    return data;
  }

  // ==================== SOCIAL ACCOUNTABILITY API ====================

  /**
   * Send a civic nudge to other users
   */
  async sendNudge(request: SendNudgeRequest): Promise<CivicNudge> {
    const { data } = await this.client.post('/social/nudges', request);
    return data;
  }

  /**
   * Get nudges received by user
   */
  async getUserNudges(limit = 20, offset = 0): Promise<CivicNudge[]> {
    const { data } = await this.client.get('/social/nudges', {
      params: { limit, offset },
    });
    return data;
  }

  /**
   * Get nudge templates with meme suggestions
   */
  async getNudgeTemplates(): Promise<NudgeTemplate[]> {
    const { data } = await this.client.get('/social/nudges/templates');
    return data;
  }

  /**
   * Get student quests for school integration
   */
  async getStudentQuests(schoolId?: number): Promise<StudentQuest[]> {
    const { data } = await this.client.get('/social/quests', {
      params: { schoolId },
    });
    return data;
  }

  /**
   * Submit quest completion (requires teacher verification)
   */
  async submitQuestCompletion(
    questId: number,
    proof: string
  ): Promise<{ success: boolean; message: string }> {
    const { data } = await this.client.post('/social/quests/complete', {
      questId,
      proof,
    });
    return data;
  }

  /**
   * Get active disaster events
   */
  async getActiveDisasters(): Promise<DisasterEvent[]> {
    const { data } = await this.client.get('/social/disasters');
    return data;
  }

  /**
   * Register as volunteer for disaster response
   */
  async registerVolunteer(disasterId: number, skills: string[]): Promise<DisasterVolunteer> {
    const { data } = await this.client.post('/social/disasters/volunteer', {
      disasterId,
      skills,
    });
    return data;
  }

  // ==================== SUSTAINABILITY API ====================

  /**
   * Log a carbon-saving activity
   */
  async logCarbonActivity(request: LogCarbonActivityRequest): Promise<CarbonFootprint> {
    const { data } = await this.client.post('/sustainability/carbon', request);
    return data;
  }

  /**
   * Log transport usage (with Sajha bus bonus)
   */
  async logTransport(request: LogTransportRequest): Promise<TransportReward> {
    const { data } = await this.client.post('/sustainability/transport', request);
    return data;
  }

  /**
   * Get user's carbon footprint statistics
   */
  async getCarbonStats(): Promise<CarbonStats> {
    const { data } = await this.client.get('/sustainability/carbon/stats');
    return data;
  }

  /**
   * Get list of eco-friendly brands
   */
  async getEcoBrands(): Promise<EcoBrand[]> {
    const { data } = await this.client.get('/sustainability/eco-brands');
    return data;
  }

  /**
   * Purchase from eco-brand and earn karma
   */
  async purchaseEcoProduct(request: PurchaseEcoProductRequest): Promise<EcoPurchase> {
    const { data } = await this.client.post('/sustainability/eco-brands/purchase', request);
    return data;
  }

  /**
   * Get personalized sustainability recommendations
   */
  async getRecommendations(): Promise<RecommendedAction[]> {
    const { data } = await this.client.get('/sustainability/recommendations');
    return data;
  }

  /**
   * Get Sajha bus information and benefits
   */
  async getSajhaBusInfo(): Promise<SajhaBusInfo> {
    const { data } = await this.client.get('/sustainability/sajha');
    return data;
  }

  /**
   * Get active carbon challenges
   */
  async getCarbonChallenges(): Promise<CarbonChallenge[]> {
    const { data } = await this.client.get('/sustainability/challenges');
    return data;
  }

  /**
   * Get transport usage leaderboard
   */
  async getTransportLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
    const { data } = await this.client.get('/sustainability/transport/leaderboard', {
      params: { limit },
    });
    return data;
  }
}

// Export singleton instance
export const advancedFeaturesAPI = new AdvancedFeaturesAPI();

// Export class for testing
export default AdvancedFeaturesAPI;
