# Advanced Features API Documentation

This document describes the advanced features API endpoints for Hamro Saath, Safa Nepal platform.

## 🌟 Feature Categories

1. **Karma Points & Blockchain Badges** - Gamified civic engagement with NFT rewards
2. **Hyper-Local Civic Hubs** - Ward cleanliness scoring and community projects
3. **Social Accountability Tools** - Civic nudges and school integration
4. **Sustainability Incentives** - Carbon tracking and eco-brand partnerships

---

## 🎯 Karma Points API

### Get User Karma Stats
```http
GET /api/karma/stats
Authorization: Bearer {token}
```

**Response:**
```json
{
  "balance": 1250,
  "recent_transactions": [...],
  "streak": {
    "current": 5,
    "longest": 12,
    "last_activity": "2024-11-20",
    "multiplier": 1.5
  },
  "nft_badges": [...],
  "level": 5,
  "next_level_at": 2500
}
```

### Get Karma Leaderboard
```http
GET /api/karma/leaderboard?limit=10&ward_id=1
```

**Response:**
```json
[
  {
    "rank": 1,
    "id": 123,
    "username": "eco_warrior",
    "total_karma": 5000,
    "current_streak": 15,
    "nft_badges_count": 8,
    "level": 7
  }
]
```

### Award Karma
```http
POST /api/karma/award
Authorization: Bearer {token}
Content-Type: application/json

{
  "user_id": 123,
  "transaction_type": "waste_segregation",
  "amount": 10,
  "description": "Sorted waste properly"
}
```

**Transaction Types:**
- `waste_segregation` (+10 karma)
- `sapling_planted` (+50 karma)
- `neighbor_education` (+15 karma)
- `recycled_item` (+20 karma)
- `compost_created` (+25 karma)
- `cleanup_joined` (+30 karma)
- `report_filed` (+5 karma)
- `event_organized` (+100 karma)
- `public_transport` (+15 karma)
- `cycling` (+20 karma)
- `sajha_bus_used` (+25 karma)

### Redeem Karma
```http
POST /api/karma/redeem
Authorization: Bearer {token}
Content-Type: application/json

{
  "partner_id": 5,
  "karma_amount": 1000
}
```

**Response:**
```json
{
  "redemption": {
    "redemption_code": "SAFA-AB12CD34",
    "partner_name": "Bhatbhateni Supermarket",
    "discount_percentage": 10,
    "expires_at": "2024-11-27"
  },
  "message": "Karma redeemed successfully!"
}
```

### Get NFT Badges
```http
GET /api/karma/badges
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Karma Pioneer",
    "rarity": "Common",
    "category": "Karma Milestones",
    "blockchain_token_id": "SOL-1-123-1700000000",
    "minted_at": "2024-11-15"
  }
]
```

**Badge Categories:**
- Karma Milestones (Pioneer, Champion, Legend, Deity)
- Community Hero (Ward Guardian, Democracy Champion)
- Eco Warrior (Waste Warrior, Sapling Savior, Carbon Crusher)
- Festival Achievements (Dashain Defender, Monsoon Guardian)

---

## 🏛️ Civic Hub API

### Get Ward Cleanliness Scores
```http
GET /api/civic/ward-scores
```

**Response:**
```json
[
  {
    "rank": 1,
    "ward_id": 15,
    "ward_name": "Patan Ward 15",
    "score": 82,
    "previous_score": 78,
    "trend": "improving",
    "calculated_date": "2024-11-20"
  }
]
```

### Get Ward Dashboard
```http
GET /api/civic/ward/15/dashboard
```

**Response:**
```json
{
  "cleanliness": {
    "score": 82,
    "rank": 1,
    "total_wards": 32,
    "trend": "improving"
  },
  "projects": {
    "total": 12,
    "proposed": 3,
    "in_progress": 5,
    "completed": 4,
    "recent": [...]
  },
  "participation": {
    "total_votes": 245,
    "active_voters": 87
  }
}
```

### Propose Community Project
```http
POST /api/civic/projects
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Community Composting Center",
  "description": "Build a composting facility for organic waste",
  "ward_id": 15,
  "category": "waste_management",
  "estimated_cost": 50000
}
```

**Project Categories:**
- `waste_management`
- `green_spaces`
- `infrastructure`
- `education`
- `public_health`

### Vote on Project
```http
POST /api/civic/projects/5/vote
Authorization: Bearer {token}
Content-Type: application/json

{
  "vote": "for",
  "reason": "This will greatly improve our ward's waste management"
}
```

### AI Chatbot
```http
POST /api/civic/chatbot
Authorization: Bearer {token}
Content-Type: application/json

{
  "message": "Where can I recycle plastic?",
  "ward_id": 15,
  "language": "en"
}
```

**Response:**
```json
{
  "response": "Your ward has plastic recycling centers. Find the nearest location on the map.",
  "suggestions": [
    "Show recycling centers",
    "Recycling guidelines",
    "Earn karma by recycling"
  ]
}
```

---

## 👥 Social Accountability API

### Send Civic Nudge
```http
POST /api/social/nudge
Authorization: Bearer {token}
Content-Type: application/json

{
  "recipient_id": 456,
  "nudge_type": "waste_segregation",
  "message": "Hey neighbor! Let's sort our waste together for a cleaner ward!",
  "meme_url": "/memes/recycle-hero.jpg",
  "is_anonymous": false
}
```

**Nudge Types:**
- `waste_segregation`
- `noise_pollution`
- `littering`
- `water_waste`
- `public_urination`
- `spitting`

### Get Nudge Templates
```http
GET /api/social/nudge-templates?type=littering&language=en
```

**Response:**
```json
{
  "templates": [
    "Dustbin is just a few steps away! Let's keep our streets clean. 🗑️",
    "Be a hero, use the trash can! Our ward thanks you. 🦸"
  ],
  "memes": [
    "/memes/trash-hero.jpg",
    "/memes/clean-streets.jpg"
  ]
}
```

### Get Student Quests
```http
GET /api/social/quests?school_id=1
```

**Response:**
```json
[
  {
    "id": 1,
    "school_name": "Rato Bangala School",
    "title": "Waste Audit Challenge",
    "description": "Conduct waste audit in your household",
    "category": "waste_reduction",
    "karma_reward": 50,
    "deadline": "2024-12-01"
  }
]
```

### Submit Quest Completion
```http
POST /api/social/quests/1/complete
Authorization: Bearer {token}
Content-Type: application/json

{
  "proof_image_url": "https://...",
  "description": "Completed waste audit with family. Found 2kg plastic weekly."
}
```

### Get Active Disasters
```http
GET /api/social/disasters
```

**Response:**
```json
[
  {
    "id": 1,
    "disaster_type": "flood",
    "title": "Monsoon Flooding in Terai Wards",
    "severity": "high",
    "affected_ward_ids": [1, 2, 3],
    "started_at": "2024-07-15",
    "is_active": true
  }
]
```

---

## 🌱 Sustainability API

### Log Carbon Activity
```http
POST /api/sustainability/carbon/log
Authorization: Bearer {token}
Content-Type: application/json

{
  "activity_type": "recycled_plastic",
  "amount": 2.5,
  "unit": "kg"
}
```

**Activity Types:**
- `recycled_plastic`, `recycled_paper`, `recycled_metal`
- `composted_waste`
- `tree_planted`
- `solar_used`
- `eco_product`

**Response:**
```json
{
  "carbonEntry": {...},
  "karmaAwarded": 37,
  "message": "Great job! You saved 3.75kg CO2 and earned 37 karma!"
}
```

### Log Transport
```http
POST /api/sustainability/transport/log
Authorization: Bearer {token}
Content-Type: application/json

{
  "transport_type": "sajha_bus",
  "distance_km": 10,
  "route": "Ratna Park to Balaju"
}
```

**Transport Types:**
- `public_transport` (+15 karma/trip)
- `sajha_bus` (+25 karma/trip, +5 bonus)
- `cycling` (+20 karma/trip)
- `walking` (+10 karma/trip)

### Get Carbon Stats
```http
GET /api/sustainability/carbon/stats
Authorization: Bearer {token}
```

**Response:**
```json
{
  "total_carbon_saved_kg": 156.4,
  "total_karma_earned": 1564,
  "total_activities": 45,
  "equivalents": {
    "trees_planted_equivalent": 7,
    "km_driven_avoided": 1303,
    "plastic_recycled_kg": 104,
    "sajha_bus_trips": 195
  },
  "impact_level": "Eco Warrior"
}
```

**Impact Levels:**
- Getting Started (< 50kg CO2)
- Carbon Conscious (50-100kg)
- Green Guardian (100-250kg)
- Eco Warrior (250-500kg)
- Climate Champion (500kg+)

### Get Eco Brands
```http
GET /api/sustainability/eco-brands
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Himalayan Waste Warriors",
    "category": "upcycling",
    "description": "Upcycled products from waste materials",
    "products": ["Backpacks", "Wallets", "Home Decor"],
    "sustainability_score": 95,
    "location": "Kathmandu"
  }
]
```

### Get Sajha Bus Info
```http
GET /api/sustainability/sajha-info
```

**Response:**
```json
{
  "routes": [
    {
      "id": 1,
      "name": "Ratna Park - Balaju",
      "stops": 15,
      "avg_time": "45 min"
    }
  ],
  "benefits": {
    "carbon_saved_per_km": 0.08,
    "karma_per_trip": 25,
    "cost_vs_taxi": "80% cheaper",
    "comfort": "Air-conditioned electric buses"
  }
}
```

### Get Carbon Challenges
```http
GET /api/sustainability/challenges
```

**Response:**
```json
{
  "challenges": [
    {
      "id": 1,
      "title": "Car-Free Week",
      "duration_days": 7,
      "karma_reward": 200,
      "carbon_target_kg": 10
    }
  ],
  "festival_bonus": {
    "active": true,
    "multiplier": 2.0,
    "campaignName": "Dashain Green Campaign"
  }
}
```

---

## 🔐 Authentication

All endpoints (except public ones) require JWT authentication:

```http
Authorization: Bearer <your_jwt_token>
```

The `req.user.id` is automatically populated by auth middleware.

---

## 📊 Admin Endpoints (Future)

Coming soon:
- Partner management (CRUD)
- Project status updates
- Disaster event creation
- Student quest creation
- Festival campaign management
- Analytics dashboard

---

## 🎨 Frontend Integration Examples

### React Hook for Karma Stats
```typescript
const useKarmaStats = () => {
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    fetch('/api/karma/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(setStats);
  }, []);
  
  return stats;
};
```

### Award Karma After Activity
```typescript
// After user reports an issue
await fetch('/api/karma/award', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    user_id: userId,
    transaction_type: 'report_filed',
    amount: 5,
    description: 'Filed waste collection report'
  })
});
```

---

## 🌐 Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Detailed error message"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Resource created
- `400` - Bad request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `404` - Resource not found
- `500` - Server error

---

## 📈 Rate Limiting

- Karma award: Max 100 transactions/hour per user
- Civic nudges: Max 20 nudges/day per user
- Chatbot: Max 50 messages/hour per user
- Carbon logging: Unlimited

---

## 🔄 Database Schema Reference

### Key Tables
- `karma_transactions` - All karma movements
- `karma_streaks` - Daily activity streaks
- `nft_badges` - Available NFT achievements
- `user_nft_badges` - User's earned badges
- `partners` - Redemption partner shops
- `karma_redemptions` - Redemption history
- `ward_cleanliness_scores` - Ward rankings
- `community_projects` - Civic proposals
- `civic_nudges` - Neighbor reminders
- `student_quests` - School integration
- `carbon_footprint` - Environmental impact
- `transport_rewards` - Eco-friendly commutes
- `eco_brands` - Sustainable businesses
- `festival_campaigns` - Seasonal multipliers

---

## 🚀 Next Steps

1. **Frontend Components**: Build UI for all features
2. **Admin Panel**: Management interfaces
3. **Push Notifications**: Real-time alerts
4. **Blockchain Integration**: Actual Solana NFT minting
5. **AI Chatbot**: OpenAI/Gemini integration
6. **Analytics**: Advanced dashboards
7. **Mobile App**: React Native implementation

---

## 📞 Support

For API questions or issues, contact the development team.

**Backend Endpoints Status**: ✅ Implemented
**Database Schema**: ✅ Complete (44 tables)
**Seed Data**: ✅ Loaded
**Documentation**: ✅ Complete
