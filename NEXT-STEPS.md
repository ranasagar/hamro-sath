# 🎯 Next Steps: Database Setup

## Current Status
✅ All migration files are ready
✅ Setup scripts created
✅ Documentation complete
⏳ **Waiting for: Database connection string**

---

## What You Need to Do

### 1. Get Your Neon Connection String (2 minutes)

**Option A: Neon (Recommended)**
1. Go to: **https://console.neon.tech/**
2. Login with your account
3. Select your project (or create a new one)
4. Click **"Dashboard"** or **"Connection Details"**
5. Copy the **Connection String** (starts with `postgresql://`)

**Option B: Supabase** (if you prefer)
1. Go to: **https://supabase.com/dashboard**
2. Select your project
3. Settings → Database
4. Copy **Connection String** (Transaction Pooler)

---

### 2. Update Your .env File

Open `backend/.env` and replace line 6:

```env
DATABASE_URL=postgresql://your-connection-string-here
```

**Important:** Keep `?sslmode=require` at the end of Neon URLs!

---

### 3. Run the Setup

```bash
cd backend

# Test connection first
npm run db:test

# If connection works, run setup
npm run db:setup
```

This will:
- ✅ Create all 20+ tables
- ✅ Add indexes and triggers
- ✅ Seed 32 Kathmandu wards
- ✅ Seed 22 achievement badges
- ✅ Seed 13 rewards

---

## Expected Output

When successful, you'll see:

```
✅ Migrations completed successfully!
✅ Database is now ready with:
  ✓ 32 Wards of Kathmandu
  ✓ Badge system (22 badges)
  ✓ Rewards catalog (13 rewards)
  ✓ All necessary tables and indexes
```

---

## Troubleshooting

### Connection Failed?
```bash
# Run the connection tester
npm run db:test
```

It will tell you exactly what's wrong!

### Need Help?
See detailed guides:
- `DATABASE_CONNECTION_GUIDE.md` - Connection setup
- `backend/DATABASE_SETUP.md` - Technical details
- `backend/migrations/` - See the actual SQL

---

## After Database Setup

### Create an Admin User

**Option 1: Via API** (after starting backend)
```bash
POST http://localhost:3001/api/v1/auth/register
{
  "email": "admin@hamrosaath.com",
  "username": "admin",
  "password": "your-secure-password",
  "full_name": "Admin User",
  "role": "admin"
}
```

**Option 2: Directly in Database**
Run this in Neon SQL Editor:
```sql
INSERT INTO users (email, username, password_hash, full_name, role, is_verified)
VALUES (
  'admin@hamrosaath.com',
  'admin',
  '$2a$10$example_hash',  -- Use bcrypt to hash your password
  'Admin User',
  'admin',
  true
);
```

---

## Quick Commands Reference

```bash
# Test database connection
npm run db:test

# Setup database (first time)
npm run db:setup

# Check migration status
npm run db:status

# Run migrations manually
npm run db:migrate

# Rollback last migration
npm run db:rollback

# Start backend server
npm run dev
```

---

## What Happens Next?

Once the database is set up:

1. **Backend is fully functional** ✅
   - All API endpoints work
   - User authentication works
   - Issues, rewards, challenges all operational

2. **Frontend connects seamlessly** ✅
   - Already configured to use the backend
   - All features will work end-to-end

3. **Production ready** ✅
   - Same process for production Vercel deployment
   - Just set DATABASE_URL in Vercel environment variables

---

## Current Project Structure

```
hamro-saath-safa-nepal-v3/
├── backend/
│   ├── .env                    ← UPDATE THIS with DATABASE_URL
│   ├── migrations/             ← SQL files ready to run
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_seed_data.sql
│   │   └── 003_add_challenges.sql
│   ├── scripts/
│   │   ├── setup-database.js   ← Automated setup
│   │   └── test-connection.js  ← Connection tester
│   └── DATABASE_SETUP.md       ← Detailed guide
├── DATABASE_CONNECTION_GUIDE.md ← You are here!
└── ... frontend files
```

---

## Timeline

- ⏱️ **Getting connection string**: 2 minutes
- ⏱️ **Updating .env**: 30 seconds  
- ⏱️ **Running setup**: 1 minute
- ⏱️ **Creating admin user**: 2 minutes

**Total: ~5 minutes to complete setup!**

---

## Questions?

Run the helper scripts - they provide detailed guidance:

```bash
npm run db:test    # Shows exactly what's configured
npm run db:setup   # Guides you step-by-step
```

Both scripts have color-coded output and helpful error messages!

---

**Ready?** Get your connection string and let's go! 🚀
