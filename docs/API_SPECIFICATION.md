# API Specification - Hamro Saath, Safa Nepal

## Base URL
```
Development: http://localhost:5000/api/v1
Production: https://api.safanepal.com/v1
```

## Authentication
All authenticated endpoints require Bearer token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 1. Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "ward": "Ward 1",
  "phoneNumber": "+977-9841234567"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_123abc",
      "name": "John Doe",
      "email": "user@example.com",
      "ward": "Ward 1",
      "points": 0,
      "isAdmin": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { /* user object */ },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /auth/logout
Logout current user (invalidate token).

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### GET /auth/me
Get current authenticated user profile.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "usr_123abc",
    "name": "John Doe",
    "email": "user@example.com",
    "ward": "Ward 1",
    "points": 1250,
    "rank": 5,
    "isAdmin": false,
    "stats": {
      "issuesReported": 12,
      "issuesSolved": 8,
      "wasteCollected": 45.5,
      "treesPlanted": 3
    }
  }
}
```

---

## 2. Issue Management Endpoints

### GET /issues
Get all issues (paginated, filterable).

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `status` (enum: Pending, In Progress, Solved)
- `category` (enum: Roads, Waste, Water, etc.)
- `ward` (string)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "issues": [
      {
        "id": "iss_456def",
        "category": "Roads",
        "description": "Pothole on Main Street",
        "location": "Thamel, Ward 26",
        "ward": "Ward 26",
        "imageUrl": "https://cdn.safanepal.com/issues/img123.jpg",
        "status": "Pending",
        "upvotes": 42,
        "user": "John Doe",
        "userAvatar": "https://cdn.safanepal.com/avatars/user123.jpg",
        "timestamp": 1699876543000,
        "volunteersNeeded": 5,
        "volunteersJoined": 2
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "totalPages": 8
    }
  }
}
```

### POST /issues
Report a new issue (requires authentication).

**Request Body:**
```json
{
  "category": "Roads",
  "description": "Large pothole causing traffic issues",
  "location": "Thamel, Ward 26",
  "ward": "Ward 26",
  "imageUrl": "data:image/jpeg;base64,..." // or file upload
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "iss_456def",
    "category": "Roads",
    "description": "Large pothole causing traffic issues",
    "status": "Pending",
    "points": 50
  },
  "message": "Issue reported successfully! Earned 50 SP"
}
```

### GET /issues/:id
Get single issue details.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "iss_456def",
    "category": "Roads",
    "description": "Large pothole causing traffic issues",
    "location": "Thamel, Ward 26",
    "imageUrl": "https://cdn.safanepal.com/issues/img123.jpg",
    "status": "In Progress",
    "upvotes": 42,
    "user": {
      "name": "John Doe",
      "avatar": "https://cdn.safanepal.com/avatars/user123.jpg"
    },
    "volunteers": [
      { "name": "Jane Smith", "avatar": "..." },
      { "name": "Bob Wilson", "avatar": "..." }
    ],
    "updates": [
      {
        "timestamp": 1699876543000,
        "message": "Work started by municipal team",
        "author": "Admin"
      }
    ]
  }
}
```

### PUT /issues/:id/upvote
Upvote an issue (requires authentication).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "upvotes": 43,
    "points": 5
  },
  "message": "Issue upvoted! Earned 5 SP"
}
```

### PUT /issues/:id/volunteer
Join as volunteer to solve issue (requires authentication).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "volunteersJoined": 3,
    "points": 20
  },
  "message": "Joined as volunteer! Earned 20 SP"
}
```

### PUT /issues/:id/complete
Mark issue as complete with proof (requires authentication).

**Request Body:**
```json
{
  "completionPhoto": "data:image/jpeg;base64,...",
  "notes": "Pothole fixed with asphalt"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "status": "Solved",
    "points": 100
  },
  "message": "Issue marked as complete! Earned 100 SP"
}
```

### DELETE /issues/:id
Delete issue (admin only).

---

## 3. User & Leaderboard Endpoints

### GET /users/leaderboard
Get user rankings (paginated).

**Query Parameters:**
- `type` (enum: individual, ward)
- `page` (default: 1)
- `limit` (default: 50)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "rankings": [
      {
        "rank": 1,
        "name": "John Doe",
        "ward": "Ward 26",
        "points": 2450,
        "avatar": "https://cdn.safanepal.com/avatars/user123.jpg",
        "badges": ["eco-warrior", "problem-solver"]
      }
    ],
    "pagination": { /* ... */ }
  }
}
```

### GET /users/:id/profile
Get user public profile.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "name": "John Doe",
    "ward": "Ward 26",
    "points": 2450,
    "rank": 1,
    "joinedDate": 1699876543000,
    "stats": {
      "issuesReported": 25,
      "issuesSolved": 18,
      "wasteCollected": 120.5,
      "treesPlanted": 8
    },
    "badges": [
      {
        "id": "eco-warrior",
        "name": "Eco Warrior",
        "description": "Collected 100kg+ waste",
        "icon": "https://cdn.safanepal.com/badges/eco-warrior.svg"
      }
    ],
    "recentActivity": [/* ... */]
  }
}
```

### PUT /users/profile
Update own profile (requires authentication).

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "phoneNumber": "+977-9841234567",
  "avatar": "data:image/jpeg;base64,..."
}
```

---

## 4. Rewards & Redemption Endpoints

### GET /rewards
Get all available rewards (paginated, filterable).

**Query Parameters:**
- `category` (enum: vouchers, merchandise, safety-kits)
- `minPoints` (number)
- `maxPoints` (number)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "rewards": [
      {
        "id": "rwd_789ghi",
        "title": "Rs. 500 Restaurant Voucher",
        "description": "Valid at partner restaurants",
        "category": "vouchers",
        "cost": 500,
        "points": 500,
        "imageUrl": "https://cdn.safanepal.com/rewards/voucher123.jpg",
        "partner": "Cafe Himalaya",
        "stock": 25,
        "expiryDate": 1735689600000
      }
    ],
    "pagination": { /* ... */ }
  }
}
```

### POST /rewards/:id/redeem
Redeem a reward (requires authentication).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "receipt": {
      "id": "rcpt_abc123",
      "reward": { /* reward object */ },
      "code": "SAFA-2024-XYZ123",
      "redeemedAt": 1699876543000,
      "expiresAt": 1735689600000
    },
    "remainingPoints": 1950
  },
  "message": "Reward redeemed successfully!"
}
```

### GET /rewards/my-purchases
Get user's purchase history (requires authentication).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "purchases": [
      {
        "id": "rcpt_abc123",
        "reward": { /* reward object */ },
        "code": "SAFA-2024-XYZ123",
        "status": "active", // active, used, expired
        "redeemedAt": 1699876543000,
        "usedAt": null
      }
    ]
  }
}
```

---

## 5. Recycle & Waste Management Endpoints

### POST /recycle/log
Log recycling activity (requires authentication).

**Request Body:**
```json
{
  "wasteType": "Plastic",
  "weight": 5.5,
  "location": "Ward 26 Collection Center",
  "photo": "data:image/jpeg;base64,..."
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "rec_xyz789",
    "wasteType": "Plastic",
    "weight": 5.5,
    "points": 55,
    "totalWasteCollected": 120.5
  },
  "message": "Recycling logged! Earned 55 SP"
}
```

### GET /recycle/stats
Get community recycling statistics.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalWasteCollected": 15420.5,
    "goal": 20000,
    "percentComplete": 77.1,
    "topCollectors": [/* user list */],
    "wasteByType": {
      "Plastic": 6250.2,
      "Paper": 4180.5,
      "Metal": 2450.8,
      "Glass": 2539.0
    }
  }
}
```

---

## 6. Forum Endpoints

### GET /forum/threads
Get all forum threads (paginated, filterable).

**Query Parameters:**
- `sortBy` (enum: top, newest)
- `page` (default: 1)
- `limit` (default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "threads": [
      {
        "id": "thd_111aaa",
        "title": "Community Clean-up Event This Saturday",
        "author": "John Doe",
        "authorAvatar": "https://cdn.safanepal.com/avatars/user123.jpg",
        "createdAt": 1699876543000,
        "upvotes": 28,
        "posts": 15,
        "tags": ["event", "cleanup"]
      }
    ],
    "pagination": { /* ... */ }
  }
}
```

### POST /forum/threads
Create new forum thread (requires authentication).

**Request Body:**
```json
{
  "title": "Community Clean-up Event This Saturday",
  "content": "Let's gather at Thamel Square at 8 AM...",
  "tags": ["event", "cleanup"]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "thd_111aaa",
    "title": "Community Clean-up Event This Saturday",
    "points": 10
  },
  "message": "Thread created! Earned 10 SP"
}
```

### GET /forum/threads/:id
Get thread with all posts.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "thread": {
      "id": "thd_111aaa",
      "title": "Community Clean-up Event This Saturday",
      "content": "Let's gather at Thamel Square...",
      "author": {
        "name": "John Doe",
        "avatar": "...",
        "ward": "Ward 26"
      },
      "createdAt": 1699876543000,
      "upvotes": 28,
      "tags": ["event", "cleanup"]
    },
    "posts": [
      {
        "id": "pst_222bbb",
        "content": "Great idea! I'll be there.",
        "user": "Jane Smith",
        "userAvatar": "...",
        "timestamp": 1699876600000,
        "upvotes": 5
      }
    ]
  }
}
```

### POST /forum/threads/:id/posts
Add post to thread (requires authentication).

**Request Body:**
```json
{
  "content": "Great idea! I'll be there."
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "pst_222bbb",
    "points": 5
  },
  "message": "Post added! Earned 5 SP"
}
```

---

## 7. Admin Endpoints

### GET /admin/users
Get all users (admin only, paginated).

### PUT /admin/users/:id/points
Add/subtract points manually (admin only).

### PUT /admin/issues/:id
Update issue status (admin only).

### POST /admin/rewards
Create new reward (admin only).

### DELETE /admin/rewards/:id
Remove reward (admin only).

### GET /admin/analytics
Get platform analytics and statistics (admin only).

---

## Error Responses

All endpoints return consistent error format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": {
      "field": "email",
      "issue": "missing"
    }
  }
}
```

**Common Error Codes:**
- `VALIDATION_ERROR` (400)
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `CONFLICT` (409)
- `INTERNAL_ERROR` (500)

---

## Rate Limiting
- Anonymous: 100 requests/hour
- Authenticated: 1000 requests/hour
- Admin: 5000 requests/hour

## Pagination
All list endpoints support pagination:
```
?page=1&limit=20
```

## Versioning
API version in URL: `/api/v1/...`
