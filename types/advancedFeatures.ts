/**
 * Advanced Features Type Definitions
 * TypeScript interfaces for Karma Points, Blockchain, Civic Hubs, Social Tools
 */

// ============================================================================
// KARMA POINTS & BLOCKCHAIN TYPES
// ============================================================================

export interface KarmaTransaction {
  id: number;
  user_id: number;
  transaction_type:
    | 'waste_segregation'
    | 'sapling_planted'
    | 'neighbor_education'
    | 'video_share'
    | 'drain_cleaning'
    | 'litter_pickup'
    | 'recycling'
    | 'public_transport'
    | 'community_project'
    | 'civic_quest'
    | 'festival_bonus'
    | 'streak_bonus'
    | 'redemption'
    | 'penalty'
    | 'admin_adjustment';
  amount: number;
  description?: string;
  metadata?: Record<string, unknown>;
  blockchain_hash?: string;
  related_type?: string;
  related_id?: number;
  created_at: Date;
}

export interface KarmaStreak {
  id: number;
  user_id: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date?: Date;
  multiplier: number;
  festival_bonus_active: boolean;
  festival_name?: string;
  streak_milestones?: unknown[];
  updated_at: Date;
}

export interface NFTBadge {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  blockchain_contract?: string;
  metadata_uri?: string;
  karma_requirement?: number;
  category: 'karma' | 'civic' | 'environmental' | 'social' | 'special';
  is_active: boolean;
  created_at: Date;
}

export interface UserNFTBadge {
  id: number;
  user_id: number;
  nft_badge_id: number;
  blockchain_token_id?: string;
  wallet_address?: string;
  minted_at: Date;
  metadata?: Record<string, unknown>;
  badge?: NFTBadge;
}

export interface Partner {
  id: number;
  name: string;
  category: 'supermarket' | 'restaurant' | 'cafe' | 'vendor' | 'eco_brand' | 'service' | 'other';
  description?: string;
  logo_url?: string;
  address?: string;
  ward_id?: number;
  latitude?: number;
  longitude?: number;
  contact_phone?: string;
  contact_email?: string;
  offers?: PartnerOffer[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface PartnerOffer {
  karma_required: number;
  discount: string;
  description: string;
}

export interface KarmaRedemption {
  id: number;
  user_id: number;
  partner_id?: number;
  karma_spent: number;
  discount_amount?: number;
  discount_percentage?: number;
  redemption_code: string;
  status: 'pending' | 'approved' | 'used' | 'expired' | 'cancelled';
  expires_at?: Date;
  used_at?: Date;
  created_at: Date;
  partner?: Partner;
}

// ============================================================================
// CIVIC HUBS TYPES
// ============================================================================

export interface WardCleanlinessScore {
  id: number;
  ward_id: number;
  score: number;
  report_count: number;
  resolved_count: number;
  user_votes: number;
  satellite_score?: number;
  calculated_date: Date;
  metadata?: Record<string, unknown>;
  created_at: Date;
}

export interface CommunityProject {
  id: number;
  title: string;
  description: string;
  ward_id?: number;
  proposed_by?: number;
  category: 'infrastructure' | 'cleanliness' | 'safety' | 'environment' | 'social' | 'other';
  estimated_cost?: number;
  status: 'proposed' | 'voting' | 'approved' | 'in_progress' | 'completed' | 'rejected';
  votes_for: number;
  votes_against: number;
  official_response?: string;
  responded_by?: number;
  responded_at?: Date;
  deadline?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CommunityProjectVote {
  id: number;
  project_id: number;
  user_id: number;
  vote: 'for' | 'against';
  reason?: string;
  created_at: Date;
}

export interface ChatbotConversation {
  id: number;
  user_id?: number;
  session_id: string;
  language: 'en' | 'ne';
  messages: ChatMessage[];
  context?: Record<string, unknown>;
  terrain_type?: 'terai' | 'hills' | 'mountains' | 'urban' | 'rural';
  created_at: Date;
  updated_at: Date;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ============================================================================
// SOCIAL ACCOUNTABILITY TYPES
// ============================================================================

export interface CivicNudge {
  id: number;
  sender_id?: number;
  recipient_id: number;
  nudge_type: 'littering' | 'waste_segregation' | 'public_behavior' | 'environmental' | 'custom';
  message?: string;
  meme_url?: string;
  is_anonymous: boolean;
  status: 'sent' | 'acknowledged' | 'ignored';
  acknowledged_at?: Date;
  created_at: Date;
}

export interface School {
  id: number;
  name: string;
  address?: string;
  ward_id?: number;
  principal_name?: string;
  contact_email?: string;
  contact_phone?: string;
  school_code: string;
  is_active: boolean;
  created_at: Date;
}

export interface StudentQuest {
  id: number;
  school_id: number;
  teacher_id: number;
  title: string;
  description: string;
  quest_type:
    | 'litter_pickup'
    | 'recycling'
    | 'awareness'
    | 'tree_planting'
    | 'water_conservation'
    | 'custom';
  grade_level?: string;
  karma_reward: number;
  deadline?: Date;
  is_active: boolean;
  created_at: Date;
  school?: School;
}

export interface QuestCompletion {
  id: number;
  quest_id: number;
  student_id: number;
  proof_image_url?: string;
  description?: string;
  status: 'submitted' | 'approved' | 'rejected';
  karma_earned: number;
  reviewed_by?: number;
  reviewed_at?: Date;
  feedback?: string;
  completed_at: Date;
  quest?: StudentQuest;
}

export interface DisasterEvent {
  id: number;
  event_type: 'flood' | 'landslide' | 'earthquake' | 'fire' | 'other';
  title: string;
  description: string;
  affected_wards: number[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'monitoring';
  coordination_center?: string;
  ngo_partners?: string[];
  volunteer_count: number;
  is_active: boolean;
  started_at: Date;
  resolved_at?: Date;
}

export interface DisasterVolunteer {
  id: number;
  event_id: number;
  user_id: number;
  availability: 'immediate' | 'within_hours' | 'within_day' | 'flexible';
  skills?: string[];
  location?: string;
  contact_phone?: string;
  status: 'registered' | 'deployed' | 'completed';
  hours_contributed: number;
  registered_at: Date;
}

// ============================================================================
// SUSTAINABILITY TYPES
// ============================================================================

export interface EcoBrand {
  id: number;
  name: string;
  description?: string;
  logo_url?: string;
  category: 'upcycled' | 'organic' | 'renewable' | 'zero_waste' | 'local' | 'other';
  website_url?: string;
  contact_email?: string;
  products?: EcoProduct[];
  sustainability_score?: number;
  is_active: boolean;
  created_at: Date;
}

export interface EcoProduct {
  name: string;
  karma: number;
}

export interface CarbonFootprint {
  id: number;
  user_id: number;
  activity_type:
    | 'public_transport'
    | 'private_vehicle'
    | 'walking'
    | 'cycling'
    | 'electricity_use'
    | 'waste_generated'
    | 'water_use'
    | 'food_waste';
  amount: number;
  unit: string;
  carbon_saved: number;
  karma_earned?: number;
  date: Date;
  created_at: Date;
}

export interface TransportReward {
  id: number;
  user_id: number;
  transport_type: 'sajha_bus' | 'electric_vehicle' | 'bicycle' | 'walking' | 'carpool';
  distance_km: number;
  carbon_saved: number;
  karma_earned: number;
  route?: string;
  verified_by?: string;
  created_at: Date;
}

export interface FestivalCampaign {
  id: number;
  name: string;
  festival_name?: string;
  description: string;
  campaign_type:
    | 'anti_litter'
    | 'drain_cleaning'
    | 'tree_planting'
    | 'awareness'
    | 'recycling'
    | 'other';
  karma_multiplier: number;
  bonus_karma: number;
  start_date: Date;
  end_date: Date;
  participating_wards?: number[];
  is_active: boolean;
  created_at: Date;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateKarmaTransactionRequest {
  user_id: number;
  transaction_type: KarmaTransaction['transaction_type'];
  amount: number;
  description?: string;
  metadata?: Record<string, unknown>;
  related_type?: string;
  related_id?: number;
}

export interface CreatePartnerRequest {
  name: string;
  category: Partner['category'];
  description?: string;
  logo_url?: string;
  address?: string;
  ward_id?: number;
  latitude?: number;
  longitude?: number;
  contact_phone?: string;
  contact_email?: string;
  offers?: PartnerOffer[];
}

export interface RedeemKarmaRequest {
  partner_id: number;
  offer_index: number;
}

export interface CreateCommunityProjectRequest {
  title: string;
  description: string;
  ward_id?: number;
  category: CommunityProject['category'];
  estimated_cost?: number;
}

export interface VoteOnProjectRequest {
  vote: 'for' | 'against';
  reason?: string;
}

export interface SendCivicNudgeRequest {
  recipient_id: number;
  nudge_type: CivicNudge['nudge_type'];
  message?: string;
  meme_url?: string;
  is_anonymous?: boolean;
}

export interface CreateStudentQuestRequest {
  school_id: number;
  title: string;
  description: string;
  quest_type: StudentQuest['quest_type'];
  grade_level?: string;
  karma_reward: number;
  deadline?: Date;
}

export interface LogCarbonActivityRequest {
  activity_type: CarbonFootprint['activity_type'];
  amount: number;
  unit: string;
  date?: Date;
}

export interface LogTransportRequest {
  transport_type: TransportReward['transport_type'];
  distance_km: number;
  route?: string;
}

// ============================================================================
// ADMIN TYPES
// ============================================================================

export interface AdminDashboardStats {
  total_karma_issued: number;
  total_karma_redeemed: number;
  active_users_with_karma: number;
  total_nft_badges_minted: number;
  total_partners: number;
  total_redemptions: number;
  average_ward_score: number;
  active_community_projects: number;
  total_civic_nudges: number;
  active_disaster_events: number;
  total_carbon_saved: number;
  active_festival_campaigns: number;
}
