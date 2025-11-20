# Backend Architecture - Hamro Saath, Safa Nepal

## Technology Stack

### Core
- **Runtime**: Node.js 20+ LTS
- **Framework**: Express.js or NestJS
- **Language**: TypeScript
- **API Style**: RESTful

### Database & Storage
- **Primary Database**: PostgreSQL 15+
- **Cache**: Redis 7+
- **Object Storage**: AWS S3 / Cloudinary (images)
- **Search**: PostgreSQL Full-Text Search (initially), Elasticsearch (future)

### Authentication & Security
- **Auth Strategy**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt (cost factor: 12)
- **Rate Limiting**: express-rate-limit + Redis
- **Input Validation**: Zod
- **Sanitization**: DOMPurify (already integrated in frontend)
- **CORS**: Configured for specific origins only

### DevOps & Deployment
- **Containerization**: Docker + Docker Compose
- **Hosting**: AWS EC2 / DigitalOcean / Heroku
- **CI/CD**: GitHub Actions
- **Monitoring**: PM2 + New Relic / Datadog
- **Logging**: Winston + Morgan

---

## Architecture Layers

```
┌─────────────────────────────────────────┐
│         Client (React Frontend)         │
└──────────────┬──────────────────────────┘
               │ HTTPS/REST
┌──────────────▼──────────────────────────┐
│         API Gateway / Load Balancer     │
│         (Nginx / AWS ALB)               │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Express/NestJS Server           │
│  ┌──────────────────────────────────┐   │
│  │   Middleware Layer               │   │
│  │   - Authentication               │   │
│  │   - Rate Limiting                │   │
│  │   - Request Validation           │   │
│  │   - Error Handling               │   │
│  └──────────┬───────────────────────┘   │
│             │                            │
│  ┌──────────▼───────────────────────┐   │
│  │   Controller Layer               │   │
│  │   - Route handlers               │   │
│  │   - Request/Response mapping     │   │
│  └──────────┬───────────────────────┘   │
│             │                            │
│  ┌──────────▼───────────────────────┐   │
│  │   Service Layer                  │   │
│  │   - Business logic               │   │
│  │   - Transaction management       │   │
│  └──────────┬───────────────────────┘   │
│             │                            │
│  ┌──────────▼───────────────────────┐   │
│  │   Repository Layer               │   │
│  │   - Database queries             │   │
│  │   - Data access abstraction      │   │
│  └──────────┬───────────────────────┘   │
└─────────────┼──────────────────────────┘
              │
    ┌─────────┴─────────┐
    │                   │
┌───▼────┐      ┌──────▼───────┐
│ Postgres│      │    Redis     │
│Database │      │    Cache     │
└─────────┘      └──────────────┘
```

---

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   ├── jwt.ts
│   │   └── cloudinary.ts
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── issue.controller.ts
│   │   ├── reward.controller.ts
│   │   ├── forum.controller.ts
│   │   ├── recycle.controller.ts
│   │   └── admin.controller.ts
│   │
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── issue.service.ts
│   │   ├── reward.service.ts
│   │   ├── forum.service.ts
│   │   ├── recycle.service.ts
│   │   ├── points.service.ts
│   │   ├── notification.service.ts
│   │   ├── badge.service.ts
│   │   └── upload.service.ts
│   │
│   ├── repositories/
│   │   ├── user.repository.ts
│   │   ├── issue.repository.ts
│   │   ├── reward.repository.ts
│   │   ├── forum.repository.ts
│   │   └── base.repository.ts
│   │
│   ├── models/
│   │   ├── user.model.ts
│   │   ├── issue.model.ts
│   │   ├── reward.model.ts
│   │   └── index.ts
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   ├── ratelimit.middleware.ts
│   │   ├── upload.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── admin.middleware.ts
│   │
│   ├── validators/
│   │   ├── auth.validator.ts
│   │   ├── issue.validator.ts
│   │   ├── reward.validator.ts
│   │   └── forum.validator.ts
│   │
│   ├── utils/
│   │   ├── jwt.util.ts
│   │   ├── hash.util.ts
│   │   ├── image.util.ts
│   │   ├── pagination.util.ts
│   │   └── response.util.ts
│   │
│   ├── types/
│   │   ├── express.d.ts
│   │   ├── api.types.ts
│   │   └── models.types.ts
│   │
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── issue.routes.ts
│   │   ├── reward.routes.ts
│   │   ├── forum.routes.ts
│   │   ├── recycle.routes.ts
│   │   ├── admin.routes.ts
│   │   └── index.ts
│   │
│   ├── database/
│   │   ├── migrations/
│   │   │   ├── 001_create_users_table.sql
│   │   │   ├── 002_create_issues_table.sql
│   │   │   └── ...
│   │   └── seeds/
│   │       ├── 001_seed_wards.ts
│   │       ├── 002_seed_badges.ts
│   │       └── ...
│   │
│   ├── jobs/
│   │   ├── badge-checker.job.ts
│   │   ├── leaderboard-cache.job.ts
│   │   └── cleanup-expired.job.ts
│   │
│   ├── constants/
│   │   ├── points.constants.ts
│   │   ├── badges.constants.ts
│   │   └── error-codes.constants.ts
│   │
│   └── app.ts
│   └── server.ts
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── docker-compose.prod.yml
│
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## Key Components

### 1. Authentication Flow

```typescript
// JWT Strategy
{
  "payload": {
    "userId": "uuid",
    "email": "user@example.com",
    "isAdmin": false
  },
  "expiresIn": "7d"
}

// Refresh Token (stored in Redis)
{
  "userId": "uuid",
  "sessionId": "uuid",
  "expiresAt": "timestamp"
}
```

**Login Process:**
1. User submits email + password
2. Validate credentials against database
3. Generate JWT access token (7 days)
4. Generate refresh token (30 days, stored in Redis)
5. Return both tokens + user data
6. Frontend stores in localStorage (access token) and httpOnly cookie (refresh token)

**Protected Route:**
1. Extract Bearer token from Authorization header
2. Verify JWT signature
3. Check token expiry
4. Attach user to request object
5. Proceed to controller

### 2. Points System

```typescript
// Points Service
class PointsService {
  async awardPoints(
    userId: string,
    amount: number,
    transactionType: string,
    referenceId?: string
  ): Promise<void> {
    // 1. Create transaction record
    // 2. Update user.points
    // 3. Check for badge eligibility
    // 4. Invalidate leaderboard cache
    // 5. Create notification
  }

  async deductPoints(
    userId: string,
    amount: number,
    transactionType: string,
    referenceId?: string
  ): Promise<void> {
    // Similar flow but with validation of sufficient points
  }
}
```

**Points Award Amounts:**
```typescript
export const POINTS = {
  ISSUE_REPORT: 50,
  ISSUE_SOLVE: 100,
  ISSUE_UPVOTE: 5,
  VOLUNTEER_JOIN: 20,
  WASTE_LOG: (weight: number) => weight * 10, // 10 points per kg
  FORUM_THREAD: 10,
  FORUM_POST: 5,
  QUIZ_COMPLETE: 25,
  EVENT_ORGANIZE: 200,
  EVENT_PARTICIPATE: 50,
};
```

### 3. Badge System

```typescript
// Badge Checker (Background Job - runs hourly)
class BadgeChecker {
  async checkUserBadges(userId: string): Promise<void> {
    const user = await userRepository.findById(userId);
    const stats = await userStatsRepository.findByUserId(userId);
    const earnedBadges = await userBadgeRepository.findByUserId(userId);
    
    const allBadges = await badgeRepository.findAll();
    
    for (const badge of allBadges) {
      if (earnedBadges.some(b => b.badgeId === badge.id)) continue;
      
      if (this.meetsRequirements(badge, stats)) {
        await this.awardBadge(userId, badge.id);
        await notificationService.create({
          userId,
          title: 'New Badge Earned!',
          message: `You earned the "${badge.name}" badge!`,
          type: 'badge_earned',
        });
      }
    }
  }
}
```

### 4. Leaderboard Caching

```typescript
// Redis caching for performance
class LeaderboardService {
  async getIndividualLeaderboard(page: number, limit: number) {
    const cacheKey = `leaderboard:individual:${page}:${limit}`;
    
    // Try cache first
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
    
    // Query database
    const rankings = await userRepository.getTopUsers(page, limit);
    
    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(rankings));
    
    return rankings;
  }
  
  async invalidateLeaderboardCache(): Promise<void> {
    // Called when user points change
    const keys = await redis.keys('leaderboard:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}
```

### 5. Image Upload Service

```typescript
class UploadService {
  async uploadImage(
    file: Express.Multer.File,
    folder: string
  ): Promise<string> {
    // 1. Validate file type and size
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      throw new Error('Invalid file type');
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      throw new Error('File too large');
    }
    
    // 2. Compress and optimize
    const optimized = await sharp(file.buffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
    
    // 3. Upload to S3/Cloudinary
    const result = await cloudinary.uploader.upload(optimized, {
      folder: `safanepal/${folder}`,
      resource_type: 'image',
    });
    
    return result.secure_url;
  }
}
```

---

## Middleware Pipeline

```typescript
// Example: Issue creation endpoint
router.post('/issues',
  authMiddleware,              // 1. Verify JWT
  rateLimitMiddleware(10, 60), // 2. Rate limit: 10 req/min
  uploadMiddleware.single('image'), // 3. Handle file upload
  validateRequest(issueSchema), // 4. Validate request body
  issueController.create       // 5. Execute controller
);
```

---

## Error Handling

```typescript
// Centralized error handler
class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
  }
}

// Error middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
  }
  
  // Unexpected errors
  console.error('Unexpected error:', err);
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  });
});
```

---

## Background Jobs

```typescript
// Using node-cron
import cron from 'node-cron';

// Check badges every hour
cron.schedule('0 * * * *', async () => {
  await badgeCheckerJob.run();
});

// Refresh leaderboard cache every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  await leaderboardCacheJob.run();
});

// Clean up expired redemptions daily at midnight
cron.schedule('0 0 * * *', async () => {
  await cleanupExpiredJob.run();
});
```

---

## API Response Format

```typescript
// Success response
interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error response
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

---

## Security Best Practices

1. **SQL Injection Prevention**: Use parameterized queries (Prisma/TypeORM)
2. **XSS Prevention**: Sanitize all user inputs
3. **CSRF Protection**: SameSite cookies + CSRF tokens
4. **Rate Limiting**: Per endpoint and global limits
5. **HTTPS Only**: Enforce SSL/TLS
6. **Helmet**: Security headers
7. **Input Validation**: Zod schemas for all inputs
8. **Password Policy**: Min 8 chars, bcrypt hashing
9. **JWT Secret Rotation**: Regular key rotation
10. **Audit Logging**: Log all sensitive operations

---

## Deployment Strategy

### Development
```bash
docker-compose up -d
npm run migrate
npm run seed
npm run dev
```

### Production
```bash
# Build Docker image
docker build -t safanepal-api:latest .

# Run with docker-compose
docker-compose -f docker-compose.prod.yml up -d

# Or deploy to cloud
# - AWS ECS/EKS
# - DigitalOcean App Platform
# - Heroku
```

### Environment Variables
```bash
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:pass@host:5432/safanepal
REDIS_URL=redis://host:6379
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
CORS_ORIGIN=https://safanepal.com
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

---

## Testing Strategy

```typescript
// Unit tests (Jest)
describe('PointsService', () => {
  it('should award points correctly', async () => {
    // ...
  });
});

// Integration tests
describe('POST /api/v1/issues', () => {
  it('should create issue and award points', async () => {
    // ...
  });
});

// E2E tests (Supertest)
describe('Issue reporting flow', () => {
  it('should complete full issue lifecycle', async () => {
    // ...
  });
});
```

---

## Monitoring & Logging

```typescript
// Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Request logging
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
}));
```

---

## Next Steps

1. Choose framework (Express vs NestJS)
2. Set up project structure
3. Configure TypeScript + ESLint
4. Set up PostgreSQL + Prisma/TypeORM
5. Implement authentication system
6. Build API endpoints incrementally
7. Write tests alongside features
8. Deploy to staging environment
9. Performance testing
10. Production deployment
