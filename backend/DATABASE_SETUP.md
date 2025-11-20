# Database Setup Guide

## Quick Start

### 1. Get Your Neon Connection String

1. Go to [Neon Console](https://console.neon.tech/)
2. Select your project (or create one if needed)
3. Click **"Connection Details"** 
4. Copy the **Connection String** (starts with `postgresql://`)

Example format:
```
postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
```

### 2. Update Environment Variables

Open `backend/.env` and update:

```env
DATABASE_URL=postgresql://your-user:your-password@your-host.neon.tech/your-db?sslmode=require
```

**Important:** Keep `?sslmode=require` at the end!

### 3. Run Database Setup

```bash
cd backend
npm run db:setup
```

This will:
- ✅ Check your connection
- ✅ Run all migrations (create tables, indexes, triggers)
- ✅ Seed initial data (wards, badges, rewards)

## Manual Migration Commands

### Run migrations
```bash
npm run db:migrate
```

### Check migration status
```bash
npm run db:status
```

### Rollback last migration
```bash
npm run db:rollback
```

## What Gets Created

### Tables (20+ tables)
- `users` - User accounts and profiles
- `user_stats` - User statistics and points
- `wards` - 32 wards of Kathmandu
- `issues` - Reported civic issues
- `rewards` - Reward catalog
- `badges` - Achievement badges
- `challenges` - Mayor's challenges
- `forum_threads` & `forum_posts` - Community forum
- `recycle_logs` - Recycling activities
- And more...

### Initial Data
- **32 Wards** - All Kathmandu wards with descriptions
- **22 Badges** - Achievement badges across 5 categories
  - Issues (4 badges)
  - Recycling (4 badges)
  - Volunteering (4 badges)
  - Participation (5 badges)
  - Special (5 badges)
- **13 Rewards** - Sample rewards across 4 categories
  - Merchandise (4 items)
  - Coupons (3 items)
  - Events (3 items)
  - Safety Kits (3 items)

## Troubleshooting

### Connection Failed
- Verify DATABASE_URL is correct
- Check if `?sslmode=require` is at the end
- Ensure your Neon project is active

### Migration Errors
- Check if tables already exist: `npm run db:status`
- Review error logs for specific issues
- Contact support if persistent

### Reset Database
⚠️ **Warning:** This deletes all data!

```bash
# In Neon Console SQL Editor:
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

# Then run migrations again:
npm run db:migrate
```

## Next Steps

1. **Create Admin User**
   - Use API: `POST /api/v1/auth/register` with `role: 'admin'`
   - Or insert directly in Neon SQL Editor

2. **Start Backend**
   ```bash
   npm run dev
   ```

3. **Test API**
   - Check health: `http://localhost:3001/health`
   - View docs: `backend/API_QUICK_REFERENCE.md`

## Production Deployment

### Vercel
Already configured! DATABASE_URL is set as environment variable in Vercel dashboard.

### Other Platforms
Set these environment variables:
- `DATABASE_URL` - Your Neon connection string
- `JWT_SECRET` - Strong random secret
- `JWT_REFRESH_SECRET` - Another strong random secret
- `NODE_ENV=production`

## Database Schema Diagram

```
users
├── user_stats (1:1)
├── user_badges (1:M)
├── issues (1:M)
├── redemptions (1:M)
├── recycle_logs (1:M)
├── forum_threads (1:M)
├── activities (1:M)
└── sessions (1:M)

wards (32 wards)
├── users (M:1)
├── issues (M:1)
└── challenges (M:1)

badges (22 badges)
└── user_badges (1:M)

rewards (13+ rewards)
└── redemptions (1:M)

challenges (Mayor's Challenges)
├── created_by → users
└── ward_id → wards
```

## Support

- Documentation: `backend/API_IMPLEMENTATION_STATUS.md`
- Schema: `backend/migrations/001_initial_schema.sql`
- Seed Data: `backend/migrations/002_seed_data.sql`
