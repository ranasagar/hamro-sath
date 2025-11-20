# Demo Profile Testing Guide

## ✅ Completed Enhancements

### 1. **Enhanced Login Response**
- Returns complete user profile data including:
  - Karma balance
  - Avatar URL
  - Stats (issues, events, recycling, quests)
  - Earned badges with timestamps

### 2. **User-Specific Activity History**
Each demo account now has realistic activity history based on their engagement level:

#### 🌟 **Rajesh Hamal** (Power User)
- **Email:** rajeshhamal@safa.com
- **Karma:** 2,100 points
- **Stats:** 15 issues, 10 events, 20 recycling logs, 5 quests
- **Badges:** 5 civic badges (all available badges)
- **Activities:** 10 diverse activities including:
  - Leading mega cleanups with 50+ volunteers
  - Organizing community recycling meetups
  - Conducting civic education workshops
  - Daily morning litter patrols

#### 💪 **Sita Rai** (Active User)
- **Email:** sitarai@safa.com
- **Karma:** 1,250 points
- **Stats:** 8 issues, 5 events, 12 recycling logs, 3 quests
- **Badges:** 3 badges (Tole Trailblazer, River Guardian, Civic Champion)
- **Activities:** 8 regular activities including:
  - Reporting illegal waste dumping
  - Participating in ward cleanliness drives
  - Completing River Guardian quest
  - Community composting workshops

#### 👤 **Aarav Sharma** (Regular User)
- **Email:** aaravsharma@safa.com
- **Karma:** 980 points
- **Stats:** 6 issues, 3 events, 8 recycling logs, 2 quests
- **Badges:** 2 badges (Tole Trailblazer, Waste Warrior)
- **Activities:** 6 balanced activities including:
  - Recycling newspapers and cardboard
  - Reporting potholes
  - Tree plantation drives
  - Poster design quests

#### 🆕 **Demo User** (New User)
- **Email:** demouser@safa.com
- **Karma:** 500 points
- **Stats:** 2 issues, 1 event, 4 recycling logs, 1 quest
- **Badges:** 1 badge (Tole Trailblazer)
- **Activities:** 4 basic activities including:
  - First recycling drop-off
  - Reporting overflowing bins
  - Welcome quest completion
  - Neighborhood cleanup

## 📋 Manual Testing Steps

### Prerequisites
1. Mock server running on port 3002
2. Frontend running on port 3001 (or configured port)

### Test Scenario 1: Login with Complete Profile Data

```bash
# Test with cURL
curl -X POST http://localhost:3002/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sitarai@safa.com","password":"password123"}'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "sitarai@safa.com",
      "karma_balance": 1250,
      "avatar_url": "https://picsum.photos/id/1011/100/100",
      "stats": {
        "total_points": 1250,
        "issues_reported": 8,
        "events_joined": 5,
        "recycling_logs": 12,
        "quest_completed": 3
      },
      "badges": [
        {
          "id": 1,
          "name": "Tole Trailblazer",
          "earned_at": "2024-11-01T10:00:00Z"
        },
        ...
      ]
    },
    "tokens": {
      "accessToken": "mock-token-1",
      "refreshToken": "refresh-mock-token-1"
    }
  }
}
```

### Test Scenario 2: Fetch User Activities

```bash
# Get token from login first, then:
curl http://localhost:3002/api/v1/users/1/activities \
  -H "Authorization: Bearer mock-token-1"
```

**Expected Response:**
- Sita Rai (ID 1): 8 activities
- Aarav Sharma (ID 2): 6 activities
- Demo User (ID 3): 4 activities
- Rajesh Hamal (ID 4): 10 activities

Each activity includes:
- Unique ID
- Type (issue_reported, event_joined, recycling, quest_completed, micro_action)
- Descriptive text with location specifics
- Points earned
- Timestamp (hours ago from now)

### Test Scenario 3: Profile Page Display

1. **Login** with any demo account
2. **Navigate** to Profile page
3. **Verify** the following displays correctly:
   - Avatar image (picsum.photos)
   - Karma balance with ⚡ icon
   - Stats tab showing all metrics
   - Activity tab with recent actions
   - Badges tab with earned badges and dates

### Test Scenario 4: Activity Feed Realism

**Check that activities match user engagement level:**
- New User (Demo): Basic activities, learning-focused
- Regular User (Aarav): Balanced mix of issues, events, recycling
- Active User (Sita): Frequent reporting and event participation
- Power User (Rajesh): Leadership activities, mentoring, organizing

## 🎯 What to Verify

### ✅ Data Quality Checks

1. **Timestamps are realistic:**
   - Activities spread across recent days/hours
   - Most recent activity for power users within last 24h
   - New users have activities within last week

2. **Points match activity types:**
   - Issue reports: 50-75 Karma
   - Event participation: 100-150 Karma
   - Recycling: 75-100 Karma
   - Quest completion: 50-100 Karma
   - Micro actions: 10-50 Karma

3. **Descriptions are location-specific:**
   - Real Kathmandu landmarks (Patan Durbar Square, Bagmati River, Ring Road)
   - Ward numbers match user profiles
   - Activity types align with civic engagement

4. **User progression is logical:**
   - Badge count correlates with karma
   - Activity diversity increases with engagement level
   - Stats totals make sense (Rajesh > Sita > Aarav > Demo)

## 🚀 Quick Verification Commands

### Check All Demo Accounts

```bash
# Test all logins
for email in sitarai@safa.com aaravsharma@safa.com demouser@safa.com rajeshhamal@safa.com; do
  echo "Testing: $email"
  curl -s -X POST http://localhost:3002/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"password123\"}" | jq '.data.user | {email, karma_balance, stats, badge_count: (.badges | length)}'
  echo ""
done
```

### Check Activity Counts

```bash
# Get activity counts for each user
for id in 1 2 3 4; do
  echo "User ID $id activities:"
  curl -s http://localhost:3002/api/v1/users/$id/activities \
    -H "Authorization: Bearer mock-token-$id" | jq '.data | length'
done
```

## 📊 Expected Outcomes

| User | Karma | Activities | Badges | Engagement Level |
|------|-------|------------|--------|------------------|
| Rajesh Hamal | 2,100 | 10 | 5 | Power User |
| Sita Rai | 1,250 | 8 | 3 | Active User |
| Aarav Sharma | 980 | 6 | 2 | Regular User |
| Demo User | 500 | 4 | 1 | New User |

## 🎨 Frontend Integration Points

### ProfilePage.tsx
- Should display avatar from `avatar_url`
- Stats tab pulls from `user.stats` object
- Badges tab renders `user.badges` array
- Activity tab fetches from `/api/v1/users/:id/activities`

### RewardsPage.tsx
- Hero slider shows at top
- 7 rewards displayed (4 coupons + 3 merchandise)
- Points displayed as "Karma" not "SP"

### HomePage.tsx
- Seasonal campaign banner displays
- Quest and Nudge buttons in sticky header
- Activity feed uses real-time data

## 🔄 Next Steps After Testing

1. **If all tests pass:**
   - ✅ Demo profiles are ready for showcase
   - ✅ Move to frontend integration testing
   - ✅ Consider backend database migration

2. **If issues found:**
   - Check mock-server.js for data accuracy
   - Verify API response format matches frontend expectations
   - Test individual endpoints with cURL

3. **Production readiness:**
   - Replace mock server with PostgreSQL backend
   - Add real authentication with bcrypt
   - Implement file upload for quest submissions
   - Set up proper JWT token management

## 📝 Notes

- All demo accounts use password: **password123**
- Mock server must be running on port 3002
- Activity timestamps are dynamically generated relative to current time
- Avatar URLs use picsum.photos (requires internet connection)
- GPS watermarking requires HTTPS in production

## 🐛 Troubleshooting

**Issue:** Login returns incomplete data
- **Solution:** Check mock-server.js lines 110-130 for login endpoint

**Issue:** Activities endpoint returns empty array
- **Solution:** Verify user ID matches one of the demo accounts (1-4)

**Issue:** Avatar images not loading
- **Solution:** Check internet connection (picsum.photos requires network)

**Issue:** Timestamps look wrong
- **Solution:** Activities use relative time - check system clock

---

**Last Updated:** November 20, 2025
**Status:** ✅ All enhancements implemented and ready for testing
