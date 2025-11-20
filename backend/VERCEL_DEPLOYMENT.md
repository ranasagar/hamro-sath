# Deploy Backend to Vercel

## Overview

Vercel is primarily designed for frontend and serverless functions, but we can deploy the Express backend as a serverless function. This approach has some limitations but offers excellent benefits:

**✅ Advantages:**
- Free tier includes 100GB bandwidth, 100 serverless function invocations
- Automatic HTTPS/SSL
- Global CDN
- Easy GitHub integration
- Zero-config deployments
- Great for moderate traffic

**⚠️ Limitations:**
- Serverless functions have 10-second execution limit (Hobby), 60s (Pro)
- Cold starts (first request after inactivity is slower)
- Not ideal for WebSocket/real-time connections
- File uploads go to `/tmp` (ephemeral) - need S3/Cloudinary for production
- Background tasks need external job queue

**💡 Best For:**
- Low to moderate traffic APIs
- CRUD operations
- Apps that can use external services for databases, caching, file storage

---

## Architecture

```
Vercel (Backend API - Serverless)
├── Express app as serverless function
├── External PostgreSQL (Supabase/Neon/Railway)
├── External Redis (Upstash/Redis Cloud)
└── External Storage (Cloudinary/S3 for images)
```

---

## Prerequisites

1. **Vercel Account**: Sign up at https://vercel.com
2. **GitHub Repository**: Code must be in GitHub
3. **External PostgreSQL**: 
   - Option 1: Supabase (https://supabase.com) - Free tier
   - Option 2: Neon (https://neon.tech) - Free tier
   - Option 3: Railway PostgreSQL (separate service)
4. **External Redis**:
   - Option 1: Upstash (https://upstash.com) - Free tier, serverless-optimized
   - Option 2: Redis Cloud (https://redis.com/cloud) - Free 30MB

---

## Step-by-Step Deployment

### Step 1: Prepare Backend for Vercel

The backend needs a `vercel.json` configuration file:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.ts"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

**I'll create this file for you after the guide.**

### Step 2: Set Up External Services

#### A. PostgreSQL (Using Supabase - Recommended)

1. **Create Account**: Go to https://supabase.com
2. **Create Project**: 
   - Click "New Project"
   - Choose organization
   - Set project name: `hamro-saath`
   - Set database password (save this!)
   - Choose region (closest to your users)
3. **Get Connection String**:
   - Go to Project Settings → Database
   - Copy "Connection string" (URI format)
   - Example: `postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres`
4. **Run Migrations**:
   ```bash
   # Install psql if not already
   # Connect to Supabase database
   psql "postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres"
   
   # Or use Supabase SQL Editor (in dashboard)
   # Copy/paste migrations/001_initial_schema.sql
   # Then migrations/002_seed_data.sql
   ```

**Alternative: Neon (Even simpler)**
1. Go to https://neon.tech
2. Sign up with GitHub
3. Create project → Get connection string
4. Run migrations via SQL Editor

#### B. Redis (Using Upstash - Recommended for Serverless)

1. **Create Account**: Go to https://upstash.com
2. **Create Database**:
   - Click "Create Database"
   - Choose "Global" for best performance
   - Enable "TLS" (recommended)
   - Free tier: 10,000 commands/day
3. **Get Connection Details**:
   - Copy "UPSTASH_REDIS_REST_URL"
   - Copy "UPSTASH_REDIS_REST_TOKEN"
   
   **Note**: Upstash provides HTTP-based Redis (perfect for serverless)

**Update Redis client for Upstash** (optional - use HTTP client):
```typescript
// For serverless, use Upstash REST API instead of direct Redis
import { Redis } from '@upstash/redis'

export const redisClient = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})
```

### Step 3: Push Code to GitHub

```bash
cd "c:\Users\sagar\OneDrive\Documents\apps and websites\hamro-saath,-safa-nepal-v3\backend"

# Initialize git (if not already)
git init

# Create .gitignore if needed
git add .
git commit -m "Backend ready for Vercel deployment"

# Push to GitHub
git remote add origin https://github.com/yourusername/hamro-saath-backend.git
git branch -M main
git push -u origin main
```

### Step 4: Deploy to Vercel

**Option A: Vercel Dashboard (Easiest)**

1. **Go to Vercel**: https://vercel.com/dashboard
2. **Import Project**:
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Select the backend repository
3. **Configure Project**:
   - Framework Preset: "Other"
   - Root Directory: `./` (or `backend` if monorepo)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
4. **Set Environment Variables** (IMPORTANT):
   ```
   NODE_ENV=production
   PORT=3001
   API_VERSION=v1
   BASE_URL=https://your-project.vercel.app
   
   DATABASE_URL=postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres
   
   REDIS_URL=redis://default:[password]@xxx.upstash.io:6379
   # OR for Upstash HTTP:
   UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your-token
   
   JWT_SECRET=your-production-secret-min-32-chars
   JWT_REFRESH_SECRET=your-different-secret-min-32-chars
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_EXPIRES_IN=30d
   
   CORS_ORIGIN=https://your-frontend.vercel.app
   
   UPLOAD_DIR=/tmp
   MAX_FILE_SIZE=5242880
   
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   LOG_LEVEL=info
   ```

5. **Deploy**: Click "Deploy"

**Option B: Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd backend
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? hamro-saath-backend
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add NODE_ENV
vercel env add DATABASE_URL
vercel env add REDIS_URL
# ... (add all variables)

# Deploy to production
vercel --prod
```

### Step 5: Verify Deployment

1. **Check Health Endpoint**:
   ```bash
   curl https://your-project.vercel.app/health
   ```
   Should return: `{"status":"healthy",...}`

2. **Test API**:
   ```bash
   curl https://your-project.vercel.app/api/v1
   ```

3. **Test Authentication**:
   ```bash
   # Register
   curl -X POST https://your-project.vercel.app/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "Test123!@#",
       "fullName": "Test User",
       "phone": "9800000000",
       "wardId": 1
     }'
   ```

---

## Vercel-Specific Optimizations

### 1. Handle Cold Starts

Add a warmup endpoint:
```typescript
// In app.ts
app.get('/api/warmup', (_req, res) => {
  res.json({ status: 'warm', timestamp: Date.now() });
});
```

Use a service like Uptime Robot to ping every 5 minutes.

### 2. File Uploads on Vercel

**Important**: Vercel's `/tmp` is ephemeral (deleted after function execution).

**Solution**: Use Cloudinary for image uploads

```bash
npm install cloudinary
```

```typescript
// src/utils/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (filePath: string) => {
  return await cloudinary.uploader.upload(filePath, {
    folder: 'hamro-saath',
    transformation: [
      { width: 800, height: 600, crop: 'limit' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' }
    ]
  });
};
```

Update upload controller to use Cloudinary instead of local storage.

### 3. Optimize Database Connections

Vercel serverless functions create new connections frequently.

**Solution**: Use connection pooling with smaller pool size:

```typescript
// src/database/connection.ts
const pool = new Pool({
  connectionString: config.database.url,
  max: 1, // Smaller pool for serverless
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});
```

**Better**: Use Supabase/Neon which handle this automatically.

### 4. Background Tasks

Vercel functions end when response is sent - no background tasks.

**Solution**: Use external job queue:
- Vercel Cron Jobs (built-in, free)
- Upstash QStash (serverless job queue)
- Trigger.dev (workflow automation)

**Update cache manager**:
```typescript
// Use Vercel Cron instead
// Create: api/cron/cleanup-sessions.ts
export default async function handler(req, res) {
  // Verify cron secret
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Run cleanup
  await cleanupExpiredSessions();
  
  res.json({ success: true });
}
```

Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/cleanup-sessions",
    "schedule": "0 * * * *"
  }]
}
```

---

## Vercel Configuration Files

### vercel.json (Main Config)

```json
{
  "version": 2,
  "name": "hamro-saath-backend",
  "builds": [
    {
      "src": "dist/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/health",
      "dest": "dist/server.js"
    },
    {
      "src": "/api/(.*)",
      "dest": "dist/server.js"
    },
    {
      "src": "/uploads/(.*)",
      "dest": "dist/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "regions": ["sin1"],
  "functions": {
    "dist/server.js": {
      "maxDuration": 10
    }
  }
}
```

### .vercelignore

```
node_modules
src
*.test.ts
*.spec.ts
.env
.env.local
coverage
.git
README.md
```

---

## Migration from Railway to Vercel (Later)

If you start with Railway and want to migrate:

1. **Keep Database & Redis on Railway** (easier)
2. **Deploy API to Vercel** (just change API deployment)
3. **Update DNS** if using custom domain
4. **Test thoroughly** before switching

**Both running simultaneously**:
- Railway: https://backend.railway.app
- Vercel: https://backend.vercel.app
- Test Vercel first, then switch frontend to Vercel URL

---

## Costs Comparison

| Service | Vercel | Railway | Render |
|---------|--------|---------|--------|
| **API Hosting** | Free (100GB BW) | $5/month | Free tier |
| **PostgreSQL** | External ($0-$25) | $5/month | $7/month |
| **Redis** | External ($0-$10) | $5/month | $10/month |
| **Total (Hobby)** | $0-$35/month | $15/month | $17/month |
| **Cold Starts** | Yes | No | Yes (free tier) |
| **Execution Limit** | 10s (Hobby) | Unlimited | 30s (free) |

---

## Recommended Setup (Best of Both)

**For Your Project**, I recommend:

### Option 1: Vercel + External Services (Most Flexible)
```
✅ Vercel: API deployment (free tier)
✅ Supabase: PostgreSQL (free tier)
✅ Upstash: Redis (free tier)
✅ Cloudinary: Image uploads (free tier)
Total: $0/month for development
```

### Option 2: Railway (Simplest)
```
✅ Railway: Everything in one place
✅ PostgreSQL + Redis + API: $15/month
✅ No cold starts, unlimited execution time
✅ Better for background jobs
Total: $15/month
```

### Option 3: Hybrid (My Recommendation for Production)
```
✅ Vercel: API (free tier)
✅ Railway: PostgreSQL + Redis ($10/month)
✅ Cloudinary: Images (free tier)
Total: $10/month
Best performance + easy migration
```

---

## Frontend Update

After deploying backend to Vercel:

**Update frontend `.env`**:
```env
VITE_API_BASE_URL=https://your-backend.vercel.app
```

Deploy frontend to Vercel (separate project):
```bash
cd frontend
vercel
# Select frontend directory
# Deploy
```

**Result**: Both frontend and backend on Vercel with same domain potential:
- Frontend: `https://hamro-saath.vercel.app`
- Backend: `https://hamro-saath-api.vercel.app`

---

## Troubleshooting

### "Function execution timeout"
- Increase timeout in `vercel.json` (Pro plan only)
- Or optimize slow queries
- Or use Railway for backend instead

### "Cannot connect to database"
- Check DATABASE_URL is correct
- Ensure database allows connections from anywhere (0.0.0.0/0)
- Supabase/Neon handle this automatically

### "Redis connection failed"
- Use Upstash REST API instead of direct Redis
- Or use Redis Cloud with proper connection string

### "File upload doesn't persist"
- Expected on Vercel (serverless /tmp is ephemeral)
- Must use Cloudinary or S3

### "Cold starts are slow"
- Normal for serverless (first request after inactivity)
- Use uptime monitoring to keep warm
- Or use Railway if this is critical

---

## Next Steps

1. ✅ Create `vercel.json` configuration
2. ✅ Set up Supabase/Neon PostgreSQL
3. ✅ Set up Upstash Redis
4. ✅ Push code to GitHub
5. ✅ Deploy to Vercel
6. ✅ Run database migrations
7. ✅ Test all endpoints
8. ✅ Update frontend API_BASE_URL
9. ✅ Deploy frontend to Vercel
10. ✅ Test complete flow

---

**Last Updated**: November 18, 2025  
**Deployment Time**: ~20-30 minutes  
**Difficulty**: Medium (easier than AWS, similar to Railway)  
**Cost**: $0-$10/month (with free tiers)

---

## Quick Deploy Command

```bash
# After setup, deploy with one command:
vercel --prod
```

That's it! Your backend is live on Vercel's global CDN. 🚀
