-- Migration: Advanced Features - Karma Points, Blockchain, Civic Hubs, Social Tools
-- Created: 2025-11-20

-- ============================================================================
-- KARMA POINTS & BLOCKCHAIN BADGES SYSTEM
-- ============================================================================

-- Karma transactions table (blockchain-style ledger)
CREATE TABLE karma_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN (
    'waste_segregation', 'sapling_planted', 'neighbor_education', 'video_share',
    'drain_cleaning', 'litter_pickup', 'recycling', 'public_transport', 
    'community_project', 'civic_quest', 'festival_bonus', 'streak_bonus',
    'redemption', 'penalty', 'admin_adjustment'
  )),
  amount INTEGER NOT NULL,
  description TEXT,
  metadata JSONB,
  blockchain_hash VARCHAR(255),
  related_type VARCHAR(50),
  related_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_karma_transactions_user ON karma_transactions(user_id);
CREATE INDEX idx_karma_transactions_type ON karma_transactions(transaction_type);
CREATE INDEX idx_karma_transactions_created ON karma_transactions(created_at DESC);
CREATE INDEX idx_karma_transactions_blockchain ON karma_transactions(blockchain_hash);

-- Karma streaks table
CREATE TABLE karma_streaks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  multiplier DECIMAL(3, 2) DEFAULT 1.00,
  festival_bonus_active BOOLEAN DEFAULT FALSE,
  festival_name VARCHAR(100),
  streak_milestones JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_karma_streaks_user ON karma_streaks(user_id);
CREATE INDEX idx_karma_streaks_current ON karma_streaks(current_streak DESC);

-- NFT badges table (blockchain-backed achievements)
CREATE TABLE nft_badges (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  rarity VARCHAR(20) CHECK (rarity IN ('common', 'rare', 'epic', 'legendary', 'mythic')),
  blockchain_contract VARCHAR(255),
  metadata_uri TEXT,
  karma_requirement INTEGER,
  category VARCHAR(50) CHECK (category IN ('karma', 'civic', 'environmental', 'social', 'special')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_nft_badges_category ON nft_badges(category);
CREATE INDEX idx_nft_badges_rarity ON nft_badges(rarity);

-- User NFT badges table (owned badges)
CREATE TABLE user_nft_badges (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nft_badge_id INTEGER NOT NULL REFERENCES nft_badges(id) ON DELETE CASCADE,
  blockchain_token_id VARCHAR(255),
  wallet_address VARCHAR(255),
  minted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB,
  UNIQUE(user_id, nft_badge_id)
);

CREATE INDEX idx_user_nft_badges_user ON user_nft_badges(user_id);
CREATE INDEX idx_user_nft_badges_badge ON user_nft_badges(nft_badge_id);
CREATE INDEX idx_user_nft_badges_token ON user_nft_badges(blockchain_token_id);

-- Partner shops table (Bhatbhateni, local vendors, etc.) - CREATE FIRST
CREATE TABLE partners (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(50) CHECK (category IN ('supermarket', 'restaurant', 'cafe', 'vendor', 'eco_brand', 'service', 'other')),
  description TEXT,
  logo_url TEXT,
  address TEXT,
  ward_id INTEGER REFERENCES wards(id),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  contact_phone VARCHAR(20),
  contact_email VARCHAR(255),
  offers JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_partners_category ON partners(category);
CREATE INDEX idx_partners_ward ON partners(ward_id);
CREATE INDEX idx_partners_active ON partners(is_active);

-- Karma redemptions table (local shop partnerships)
CREATE TABLE karma_redemptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  partner_id INTEGER REFERENCES partners(id) ON DELETE SET NULL,
  karma_spent INTEGER NOT NULL,
  discount_amount DECIMAL(10, 2),
  discount_percentage DECIMAL(5, 2),
  redemption_code VARCHAR(50) UNIQUE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'used', 'expired', 'cancelled')),
  expires_at TIMESTAMP,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_karma_redemptions_user ON karma_redemptions(user_id);
CREATE INDEX idx_karma_redemptions_partner ON karma_redemptions(partner_id);
CREATE INDEX idx_karma_redemptions_status ON karma_redemptions(status);
CREATE INDEX idx_karma_redemptions_code ON karma_redemptions(redemption_code);

-- ============================================================================
-- HYPER-LOCAL CIVIC HUBS
-- ============================================================================

-- Ward cleanliness scores table
CREATE TABLE ward_cleanliness_scores (
  id SERIAL PRIMARY KEY,
  ward_id INTEGER NOT NULL REFERENCES wards(id) ON DELETE CASCADE,
  score DECIMAL(5, 2) NOT NULL CHECK (score >= 0 AND score <= 100),
  report_count INTEGER DEFAULT 0,
  resolved_count INTEGER DEFAULT 0,
  user_votes INTEGER DEFAULT 0,
  satellite_score DECIMAL(5, 2),
  calculated_date DATE NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(ward_id, calculated_date)
);

CREATE INDEX idx_ward_cleanliness_ward ON ward_cleanliness_scores(ward_id);
CREATE INDEX idx_ward_cleanliness_date ON ward_cleanliness_scores(calculated_date DESC);
CREATE INDEX idx_ward_cleanliness_score ON ward_cleanliness_scores(score DESC);

-- Community projects table (voting system)
CREATE TABLE community_projects (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  ward_id INTEGER REFERENCES wards(id) ON DELETE SET NULL,
  proposed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  category VARCHAR(50) CHECK (category IN ('infrastructure', 'cleanliness', 'safety', 'environment', 'social', 'other')),
  estimated_cost DECIMAL(10, 2),
  status VARCHAR(20) DEFAULT 'proposed' CHECK (status IN ('proposed', 'voting', 'approved', 'in_progress', 'completed', 'rejected')),
  votes_for INTEGER DEFAULT 0,
  votes_against INTEGER DEFAULT 0,
  official_response TEXT,
  responded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  responded_at TIMESTAMP,
  deadline TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_community_projects_ward ON community_projects(ward_id);
CREATE INDEX idx_community_projects_status ON community_projects(status);
CREATE INDEX idx_community_projects_proposed_by ON community_projects(proposed_by);

-- Community project votes table
CREATE TABLE community_project_votes (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES community_projects(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vote VARCHAR(10) CHECK (vote IN ('for', 'against')),
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, user_id)
);

CREATE INDEX idx_project_votes_project ON community_project_votes(project_id);
CREATE INDEX idx_project_votes_user ON community_project_votes(user_id);

-- AI chatbot conversations table
CREATE TABLE chatbot_conversations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  session_id VARCHAR(255) NOT NULL,
  language VARCHAR(10) DEFAULT 'en' CHECK (language IN ('en', 'ne')),
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  context JSONB,
  terrain_type VARCHAR(50) CHECK (terrain_type IN ('terai', 'hills', 'mountains', 'urban', 'rural')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chatbot_user ON chatbot_conversations(user_id);
CREATE INDEX idx_chatbot_session ON chatbot_conversations(session_id);
CREATE INDEX idx_chatbot_created ON chatbot_conversations(created_at DESC);

-- ============================================================================
-- SOCIAL ACCOUNTABILITY TOOLS
-- ============================================================================

-- Civic nudges table (polite reminders)
CREATE TABLE civic_nudges (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nudge_type VARCHAR(50) CHECK (nudge_type IN ('littering', 'waste_segregation', 'public_behavior', 'environmental', 'custom')),
  message TEXT,
  meme_url TEXT,
  is_anonymous BOOLEAN DEFAULT TRUE,
  status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'acknowledged', 'ignored')),
  acknowledged_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_civic_nudges_recipient ON civic_nudges(recipient_id);
CREATE INDEX idx_civic_nudges_sender ON civic_nudges(sender_id);
CREATE INDEX idx_civic_nudges_status ON civic_nudges(status);

-- School integration table
CREATE TABLE schools (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  address TEXT,
  ward_id INTEGER REFERENCES wards(id),
  principal_name VARCHAR(100),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  school_code VARCHAR(50) UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_schools_ward ON schools(ward_id);
CREATE INDEX idx_schools_code ON schools(school_code);

-- Student quests table
CREATE TABLE student_quests (
  id SERIAL PRIMARY KEY,
  school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  quest_type VARCHAR(50) CHECK (quest_type IN ('litter_pickup', 'recycling', 'awareness', 'tree_planting', 'water_conservation', 'custom')),
  grade_level VARCHAR(20),
  karma_reward INTEGER NOT NULL,
  deadline TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_student_quests_school ON student_quests(school_id);
CREATE INDEX idx_student_quests_teacher ON student_quests(teacher_id);
CREATE INDEX idx_student_quests_active ON student_quests(is_active);

-- Quest completions table
CREATE TABLE quest_completions (
  id SERIAL PRIMARY KEY,
  quest_id INTEGER NOT NULL REFERENCES student_quests(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  proof_image_url TEXT,
  description TEXT,
  status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'approved', 'rejected')),
  karma_earned INTEGER DEFAULT 0,
  reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP,
  feedback TEXT,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(quest_id, student_id)
);

CREATE INDEX idx_quest_completions_quest ON quest_completions(quest_id);
CREATE INDEX idx_quest_completions_student ON quest_completions(student_id);
CREATE INDEX idx_quest_completions_status ON quest_completions(status);

-- Class leaderboards table
CREATE TABLE class_leaderboards (
  id SERIAL PRIMARY KEY,
  school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  grade_level VARCHAR(20) NOT NULL,
  section VARCHAR(10),
  ranking JSONB NOT NULL DEFAULT '[]'::jsonb,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_class_leaderboards_school ON class_leaderboards(school_id);
CREATE INDEX idx_class_leaderboards_grade ON class_leaderboards(grade_level);

-- Disaster mode events table
CREATE TABLE disaster_events (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(50) CHECK (event_type IN ('flood', 'landslide', 'earthquake', 'fire', 'other')),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  affected_wards INTEGER[] DEFAULT ARRAY[]::INTEGER[],
  severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'monitoring')),
  coordination_center TEXT,
  ngo_partners TEXT[],
  volunteer_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP
);

CREATE INDEX idx_disaster_events_status ON disaster_events(status);
CREATE INDEX idx_disaster_events_active ON disaster_events(is_active);
CREATE INDEX idx_disaster_events_started ON disaster_events(started_at DESC);

-- Disaster volunteers table
CREATE TABLE disaster_volunteers (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES disaster_events(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  availability VARCHAR(50) CHECK (availability IN ('immediate', 'within_hours', 'within_day', 'flexible')),
  skills TEXT[],
  location TEXT,
  contact_phone VARCHAR(20),
  status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered', 'deployed', 'completed')),
  hours_contributed INTEGER DEFAULT 0,
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(event_id, user_id)
);

CREATE INDEX idx_disaster_volunteers_event ON disaster_volunteers(event_id);
CREATE INDEX idx_disaster_volunteers_user ON disaster_volunteers(user_id);
CREATE INDEX idx_disaster_volunteers_status ON disaster_volunteers(status);

-- ============================================================================
-- SUSTAINABILITY INCENTIVES
-- ============================================================================

-- Eco brands/partners table (upcycled products, etc.)
CREATE TABLE eco_brands (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  logo_url TEXT,
  category VARCHAR(50) CHECK (category IN ('upcycled', 'organic', 'renewable', 'zero_waste', 'local', 'other')),
  website_url TEXT,
  contact_email VARCHAR(255),
  products JSONB DEFAULT '[]'::jsonb,
  sustainability_score DECIMAL(5, 2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_eco_brands_category ON eco_brands(category);
CREATE INDEX idx_eco_brands_active ON eco_brands(is_active);

-- Carbon footprint tracker table
CREATE TABLE carbon_footprint (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) CHECK (activity_type IN (
    'public_transport', 'private_vehicle', 'walking', 'cycling',
    'electricity_use', 'waste_generated', 'water_use', 'food_waste'
  )),
  amount DECIMAL(10, 2),
  unit VARCHAR(20),
  carbon_saved DECIMAL(10, 2),
  karma_earned INTEGER,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_carbon_footprint_user ON carbon_footprint(user_id);
CREATE INDEX idx_carbon_footprint_date ON carbon_footprint(date DESC);
CREATE INDEX idx_carbon_footprint_type ON carbon_footprint(activity_type);

-- Transport rewards table (Sajha bus usage, etc.)
CREATE TABLE transport_rewards (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transport_type VARCHAR(50) CHECK (transport_type IN ('sajha_bus', 'electric_vehicle', 'bicycle', 'walking', 'carpool')),
  distance_km DECIMAL(10, 2),
  carbon_saved DECIMAL(10, 2),
  karma_earned INTEGER NOT NULL,
  route TEXT,
  verified_by VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transport_rewards_user ON transport_rewards(user_id);
CREATE INDEX idx_transport_rewards_type ON transport_rewards(transport_type);
CREATE INDEX idx_transport_rewards_created ON transport_rewards(created_at DESC);

-- Festival campaigns table (Dashain, monsoon drives, etc.)
CREATE TABLE festival_campaigns (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  festival_name VARCHAR(100),
  description TEXT NOT NULL,
  campaign_type VARCHAR(50) CHECK (campaign_type IN ('anti_litter', 'drain_cleaning', 'tree_planting', 'awareness', 'recycling', 'other')),
  karma_multiplier DECIMAL(3, 2) DEFAULT 1.00,
  bonus_karma INTEGER DEFAULT 0,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  participating_wards INTEGER[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_festival_campaigns_active ON festival_campaigns(is_active);
CREATE INDEX idx_festival_campaigns_dates ON festival_campaigns(start_date, end_date);

-- ============================================================================
-- TRIGGERS & FUNCTIONS
-- ============================================================================

-- Function to update karma streaks
CREATE OR REPLACE FUNCTION update_karma_streak()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO karma_streaks (user_id, current_streak, longest_streak, last_activity_date)
  VALUES (NEW.user_id, 1, 1, CURRENT_DATE)
  ON CONFLICT (user_id) DO UPDATE SET
    current_streak = CASE
      WHEN karma_streaks.last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN karma_streaks.current_streak + 1
      WHEN karma_streaks.last_activity_date = CURRENT_DATE THEN karma_streaks.current_streak
      ELSE 1
    END,
    longest_streak = GREATEST(karma_streaks.longest_streak, 
      CASE
        WHEN karma_streaks.last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN karma_streaks.current_streak + 1
        ELSE 1
      END
    ),
    last_activity_date = CURRENT_DATE,
    updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_karma_streak
AFTER INSERT ON karma_transactions
FOR EACH ROW
EXECUTE FUNCTION update_karma_streak();

-- Function to update ward cleanliness score
CREATE OR REPLACE FUNCTION calculate_ward_score()
RETURNS TRIGGER AS $$
DECLARE
  v_ward_id INTEGER;
  v_report_count INTEGER;
  v_resolved_count INTEGER;
  v_score DECIMAL(5, 2);
BEGIN
  v_ward_id := NEW.ward_id;
  
  SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'resolved')
  INTO v_report_count, v_resolved_count
  FROM issues
  WHERE ward_id = v_ward_id
  AND created_at >= CURRENT_DATE - INTERVAL '30 days';
  
  v_score := CASE
    WHEN v_report_count = 0 THEN 50.00
    ELSE LEAST(100.00, (v_resolved_count::DECIMAL / NULLIF(v_report_count, 0)) * 100 + 20)
  END;
  
  INSERT INTO ward_cleanliness_scores (ward_id, score, report_count, resolved_count, calculated_date)
  VALUES (v_ward_id, v_score, v_report_count, v_resolved_count, CURRENT_DATE)
  ON CONFLICT (ward_id, calculated_date) DO UPDATE SET
    score = v_score,
    report_count = v_report_count,
    resolved_count = v_resolved_count;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_ward_score
AFTER INSERT OR UPDATE ON issues
FOR EACH ROW
WHEN (NEW.ward_id IS NOT NULL)
EXECUTE FUNCTION calculate_ward_score();

-- Apply updated_at triggers for new tables
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_projects_updated_at BEFORE UPDATE ON community_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chatbot_conversations_updated_at BEFORE UPDATE ON chatbot_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
