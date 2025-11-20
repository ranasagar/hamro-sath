# 🗄️ Database Setup - Complete Guide

## Current Status
Your backend is configured to use **Neon PostgreSQL** for database hosting.

## Option 1: Use Neon (Recommended - Already Set Up)

### Step 1: Get Connection String from Neon Console

1. **Open Neon Console**: https://console.neon.tech/
2. **Login** with your account
3. **Select or Create Project**:
   - If you already have a project, select it
   - Otherwise, click "New Project"
4. **Get Connection String**:
   - Click on your project
   - Go to "Dashboard" or "Connection Details"
   - Copy the **Connection String** (Node.js format)
   
   It looks like:
   ```
   postgresql://username:password@ep-xxxx-xxxx-xxxx.region.aws.neon.tech/database?sslmode=require
   ```

### Step 2: Update .env File

Open `backend/.env` and replace the DATABASE_URL:

```env
DATABASE_URL=postgresql://your-user:your-pass@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require
```

### Step 3: Run Setup

```bash
cd backend
npm run db:setup
```

This will:
✅ Verify connection
✅ Create all tables (20+ tables)
✅ Seed 32 wards
✅ Seed 22 badges
✅ Seed 13 rewards

---

## Option 2: Use Supabase (Alternative)

I noticed you have Supabase credentials in `.env.production`. If you want to use Supabase instead:

### Step 1: Get Supabase Connection String

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **Database**
4. Copy the **Connection String** (Transaction Pooler recommended)
5. Replace `[YOUR-PASSWORD]` with your actual database password

### Step 2: Update .env

```env
DATABASE_URL=postgresql://postgres.[ref]:[password]@db.[ref].supabase.co:5432/postgres
```

### Step 3: Run Setup

```bash
cd backend
npm run db:setup
```

---

## Which Should You Use?

### Use Neon if:
- ✅ You want serverless PostgreSQL with branching
- ✅ You need instant database branches for development
- ✅ You're already familiar with Neon

### Use Supabase if:
- ✅ You want additional features (auth, storage, realtime)
- ✅ You prefer integrated backend services
- ✅ You already have a Supabase project

**Both work perfectly fine!** The choice is yours.

---

## Quick Commands

### After setting up DATABASE_URL:

```bash
# Setup database (first time)
npm run db:setup

# Check migration status
npm run db:status

# Run migrations manually
npm run db:migrate

# Rollback last migration
npm run db:rollback
```

---

## Troubleshooting

### ❌ "password authentication failed"
- Double-check your connection string
- Verify password is correct
- Ensure no extra spaces

### ❌ "SSL connection required"
- Make sure connection string ends with `?sslmode=require`
- For Supabase: `?sslmode=require`
- For Neon: Already included in their connection strings

### ❌ "relation already exists"
- Tables might already exist
- Check status: `npm run db:status`
- If needed, reset in database console

---

## What Gets Created?

### Core Tables
- `users` - User accounts
- `user_stats` - Points & statistics
- `wards` - 32 Kathmandu wards
- `issues` - Civic issues
- `rewards` - Reward catalog
- `badges` - Achievements
- `challenges` - Mayor's challenges

### Initial Data
- **32 Wards**: Ward 1-32 of Kathmandu
- **22 Badges**: Common to Legendary across 5 categories
- **13 Rewards**: Merchandise, Coupons, Events, Safety Kits

---

## Production Setup

For production (Vercel deployment):

1. Set DATABASE_URL in Vercel dashboard
2. Go to: https://vercel.com/your-team/hamro-saath-backend
3. Settings → Environment Variables
4. Add: `DATABASE_URL` = your connection string
5. Redeploy

---

## Need Help?

Run the setup script for guided instructions:
```bash
npm run db:setup
```

Or check:
- `backend/DATABASE_SETUP.md` - Detailed guide
- `backend/migrations/` - See what SQL runs
- `backend/API_IMPLEMENTATION_STATUS.md` - API docs
