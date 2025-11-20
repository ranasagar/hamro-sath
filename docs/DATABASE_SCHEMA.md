# Database Schema Design - Hamro Saath, Safa Nepal

## Technology Stack
- **Database**: PostgreSQL 15+
- **ORM**: Prisma or TypeORM
- **Cache**: Redis for sessions and leaderboards
- **Storage**: AWS S3 or Cloudinary for images

---

## Schema Overview

### 1. Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  ward VARCHAR(50) NOT NULL,
  avatar_url TEXT,
  points INTEGER DEFAULT 0,
  is_admin BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,
  
  -- Indexes
  INDEX idx_users_email (email),
  INDEX idx_users_ward (ward),
  INDEX idx_users_points (points DESC),
  INDEX idx_users_created_at (created_at)
);
```

### 2. User Stats Table
```sql
CREATE TABLE user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  issues_reported INTEGER DEFAULT 0,
  issues_solved INTEGER DEFAULT 0,
  waste_collected DECIMAL(10,2) DEFAULT 0, -- in kg
  trees_planted INTEGER DEFAULT 0,
  events_organized INTEGER DEFAULT 0,
  volunteer_hours INTEGER DEFAULT 0,
  quiz_completed BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id),
  INDEX idx_user_stats_user_id (user_id)
);
```

### 3. Issues Table
```sql
CREATE TABLE issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  category VARCHAR(50) NOT NULL, -- Roads, Waste, Water, Electricity, etc.
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(255) NOT NULL,
  ward VARCHAR(50) NOT NULL,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  image_url TEXT,
  status VARCHAR(20) DEFAULT 'Pending', -- Pending, In Progress, Solved
  upvotes INTEGER DEFAULT 0,
  volunteers_needed INTEGER DEFAULT 0,
  volunteers_joined INTEGER DEFAULT 0,
  severity VARCHAR(20) DEFAULT 'Medium', -- Low, Medium, High, Critical
  resolved_at TIMESTAMP,
  resolved_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_issues_status (status),
  INDEX idx_issues_category (category),
  INDEX idx_issues_ward (ward),
  INDEX idx_issues_created_at (created_at DESC),
  INDEX idx_issues_upvotes (upvotes DESC)
);
```

### 4. Issue Volunteers Table
```sql
CREATE TABLE issue_volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  contribution_notes TEXT,
  
  UNIQUE(issue_id, user_id),
  INDEX idx_issue_volunteers_issue (issue_id),
  INDEX idx_issue_volunteers_user (user_id)
);
```

### 5. Issue Updates Table
```sql
CREATE TABLE issue_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  message TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_issue_updates_issue (issue_id),
  INDEX idx_issue_updates_created (created_at DESC)
);
```

### 6. Issue Upvotes Table
```sql
CREATE TABLE issue_upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(issue_id, user_id),
  INDEX idx_issue_upvotes_issue (issue_id),
  INDEX idx_issue_upvotes_user (user_id)
);
```

### 7. Rewards Table
```sql
CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- vouchers, merchandise, safety-kits
  cost INTEGER NOT NULL, -- in Safa Points
  partner VARCHAR(255),
  image_url TEXT,
  stock INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  expiry_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_rewards_category (category),
  INDEX idx_rewards_cost (cost),
  INDEX idx_rewards_active (is_active)
);
```

### 8. Redemptions Table
```sql
CREATE TABLE redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  reward_id UUID NOT NULL REFERENCES rewards(id),
  redemption_code VARCHAR(50) UNIQUE NOT NULL,
  points_spent INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'active', -- active, used, expired, cancelled
  redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  used_at TIMESTAMP,
  expires_at TIMESTAMP,
  
  INDEX idx_redemptions_user (user_id),
  INDEX idx_redemptions_reward (reward_id),
  INDEX idx_redemptions_code (redemption_code),
  INDEX idx_redemptions_status (status)
);
```

### 9. Recycle Logs Table
```sql
CREATE TABLE recycle_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  waste_type VARCHAR(50) NOT NULL, -- Plastic, Paper, Metal, Glass, E-waste
  weight DECIMAL(10,2) NOT NULL, -- in kg
  location VARCHAR(255),
  photo_url TEXT,
  verification_status VARCHAR(20) DEFAULT 'pending', -- pending, verified, rejected
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP,
  points_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_recycle_logs_user (user_id),
  INDEX idx_recycle_logs_type (waste_type),
  INDEX idx_recycle_logs_created (created_at DESC)
);
```

### 10. Forum Threads Table
```sql
CREATE TABLE forum_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_post_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_forum_threads_user (user_id),
  INDEX idx_forum_threads_created (created_at DESC),
  INDEX idx_forum_threads_upvotes (upvotes DESC),
  INDEX idx_forum_threads_last_post (last_post_at DESC)
);
```

### 11. Forum Posts Table
```sql
CREATE TABLE forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_forum_posts_thread (thread_id),
  INDEX idx_forum_posts_user (user_id),
  INDEX idx_forum_posts_created (created_at)
);
```

### 12. Forum Tags Table
```sql
CREATE TABLE forum_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  color VARCHAR(7) DEFAULT '#10B981',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_forum_tags_slug (slug)
);

CREATE TABLE thread_tags (
  thread_id UUID NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES forum_tags(id) ON DELETE CASCADE,
  
  PRIMARY KEY (thread_id, tag_id),
  INDEX idx_thread_tags_thread (thread_id),
  INDEX idx_thread_tags_tag (tag_id)
);
```

### 13. Activities Table
```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  activity_type VARCHAR(50) NOT NULL, -- issue_reported, issue_solved, reward_redeemed, etc.
  title VARCHAR(255) NOT NULL,
  description TEXT,
  points_earned INTEGER DEFAULT 0,
  metadata JSONB, -- flexible storage for type-specific data
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_activities_user (user_id),
  INDEX idx_activities_type (activity_type),
  INDEX idx_activities_created (created_at DESC)
);
```

### 14. Points Transactions Table
```sql
CREATE TABLE points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  amount INTEGER NOT NULL, -- positive for earning, negative for spending
  transaction_type VARCHAR(50) NOT NULL, -- issue_report, upvote, redeem_reward, etc.
  reference_id UUID, -- ID of related entity (issue_id, reward_id, etc.)
  reference_type VARCHAR(50), -- issues, rewards, etc.
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_points_transactions_user (user_id),
  INDEX idx_points_transactions_created (created_at DESC)
);
```

### 15. Badges Table
```sql
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon_url TEXT,
  criteria JSONB NOT NULL, -- condition for earning badge
  tier VARCHAR(20) DEFAULT 'bronze', -- bronze, silver, gold, platinum
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_badges_slug (slug)
);

CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, badge_id),
  INDEX idx_user_badges_user (user_id),
  INDEX idx_user_badges_badge (badge_id)
);
```

### 16. Notifications Table
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  notification_type VARCHAR(50) NOT NULL, -- issue_update, reward_expiry, badge_earned, etc.
  reference_id UUID,
  reference_type VARCHAR(50),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_notifications_user (user_id),
  INDEX idx_notifications_unread (user_id, is_read),
  INDEX idx_notifications_created (created_at DESC)
);
```

### 17. Mayor Profiles Table
```sql
CREATE TABLE mayor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  photo_url TEXT,
  bio TEXT,
  term VARCHAR(50),
  promises TEXT[], -- array of promises
  current_works TEXT[], -- array of ongoing projects
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_mayor_profiles_city (city)
);
```

### 18. Wards Table
```sql
CREATE TABLE wards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ward_number INTEGER NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  population INTEGER,
  area_sqkm DECIMAL(10,2),
  facilities TEXT[],
  contact_info JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_wards_number (ward_number)
);
```

### 19. Announcements Table
```sql
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  announcement_type VARCHAR(50) DEFAULT 'general', -- general, urgent, event
  priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high
  target_wards VARCHAR(50)[], -- null means all wards
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  
  INDEX idx_announcements_active (is_active),
  INDEX idx_announcements_created (created_at DESC)
);
```

### 20. Sessions Table
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_sessions_user (user_id),
  INDEX idx_sessions_token (token_hash),
  INDEX idx_sessions_expires (expires_at)
);
```

---

## Relationships Summary

```
users (1) ----< (many) issues
users (1) ----< (many) user_stats (1:1)
users (1) ----< (many) redemptions
users (1) ----< (many) recycle_logs
users (1) ----< (many) forum_threads
users (1) ----< (many) forum_posts
users (1) ----< (many) activities
users (1) ----< (many) points_transactions
users (1) ----< (many) user_badges

issues (1) ----< (many) issue_volunteers
issues (1) ----< (many) issue_updates
issues (1) ----< (many) issue_upvotes

forum_threads (1) ----< (many) forum_posts
forum_threads (many) ----< (many) forum_tags (through thread_tags)

rewards (1) ----< (many) redemptions

badges (many) ----< (many) users (through user_badges)
```

---

## Indexes & Performance

Key indexes for performance:
1. **Leaderboard queries**: `idx_users_points` (DESC)
2. **Issue listing**: `idx_issues_created_at`, `idx_issues_status`, `idx_issues_ward`
3. **Forum threads**: `idx_forum_threads_upvotes`, `idx_forum_threads_last_post`
4. **User activity**: `idx_activities_user`, `idx_activities_created`
5. **Points history**: `idx_points_transactions_user`

---

## Data Constraints

1. **Unique constraints**: email, redemption_code, badge slug
2. **Foreign keys**: All with ON DELETE CASCADE where appropriate
3. **Check constraints**: 
   - points >= 0
   - weight > 0
   - upvotes >= 0

---

## Migration Strategy from localStorage

1. Export current localStorage data
2. Transform to match new schema
3. Bulk insert with proper relationships
4. Validate data integrity
5. Update foreign key references
6. Set appropriate timestamps (preserve original created_at)
