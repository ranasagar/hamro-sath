# 🚀 Vercel Deployment - Step-by-Step Setup Guide

## Step 1: Supabase PostgreSQL Database (FREE)

### 1.1 Create Supabase Account
1. Go to: **https://supabase.com**
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email

### 1.2 Create New Project
1. Click "New Project"
2. Fill in:
   - **Organization**: Create new or use existing
   - **Name**: `hamro-saath-backend`
   - **Database Password**: Click "Generate a password" and **SAVE IT SECURELY**
   - **Region**: `Southeast Asia (Singapore)` (closest to Nepal)
   - **Pricing Plan**: Free
3. Click "Create new project"
4. Wait ~2 minutes for provisioning

### 1.3 Get Connection String
1. In your project dashboard, go to **Settings** (gear icon) > **Database**
2. Scroll to "Connection string"
3. Select **URI** tab
4. Copy the connection string (looks like this):
   ```
   postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   ```
5. **Replace `[YOUR-PASSWORD]` with the password you saved earlier**
6. **Save this connection string** - you'll need it later for Vercel

### 1.4 Run Database Migrations
**Option A: Using Supabase SQL Editor (EASIEST)**

1. In Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Open `backend/migrations/001_initial_schema.sql` in VS Code
4. **Copy ALL content** (Ctrl+A, Ctrl+C)
5. **Paste into SQL Editor** in Supabase
6. Click **Run** (or press Ctrl+Enter)
7. Wait for success message (should create 20 tables)
8. Click **New query** again
9. Open `backend/migrations/002_seed_data.sql` in VS Code
10. **Copy ALL content**
11. **Paste into SQL Editor**
12. Click **Run**
13. Success! You should see "INSERT 0 32", "INSERT 0 20", "INSERT 0 13"

**Option B: Using psql Command Line**
```bash
# Make sure you have PostgreSQL client installed
psql "postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"

# Once connected:
\i migrations/001_initial_schema.sql
\i migrations/002_seed_data.sql
\q
```

### 1.5 Verify Tables Created
In Supabase:
1. Go to **Table Editor** in left sidebar
2. You should see 21 tables:
   - announcements
   - badges
   - forum_posts
   - forum_tags
   - forum_threads
   - issue_updates
   - issue_upvotes
   - issue_volunteers
   - issues
   - mayor_profiles
   - notifications
   - recycle_logs
   - redemptions
   - rewards
   - sessions
   - supplies
   - supply_logs
   - user_activities
   - user_badges
   - users
   - wards

✅ **Step 1 Complete!** Database is ready.

---

## Step 2: Upstash Redis Cache (FREE)

### 2.1 Create Upstash Account
1. Go to: **https://upstash.com**
2. Click "Sign Up"
3. Sign up with GitHub (recommended) or email

### 2.2 Create Redis Database
1. Click "Create Database"
2. Fill in:
   - **Name**: `hamro-saath-cache`
   - **Type**: `Regional`
   - **Region**: `ap-southeast-1` (Singapore - closest to Nepal)
   - **Eviction**: `allkeys-lru` (automatically remove old cache)
3. Click "Create"

### 2.3 Get Redis URL
1. In your Redis database dashboard, click "REST API" tab
2. You'll see:
   - **UPSTASH_REDIS_REST_URL**: `https://your-db.upstash.io`
   - **UPSTASH_REDIS_REST_TOKEN**: `AXbxASQg...` (long token)
3. **Copy BOTH values** - you'll need them for Vercel

✅ **Step 2 Complete!** Redis cache is ready.

---

## Step 3: Cloudinary Image Storage (FREE)

### 3.1 Create Cloudinary Account
1. Go to: **https://cloudinary.com**
2. Click "Sign Up Free"
3. Fill in your details

### 3.2 Get Cloudinary Credentials
1. After signing up, you'll be on the dashboard
2. You'll see:
   - **Cloud Name**: `dxxxxx` (e.g., "dab12cd34")
   - **API Key**: `123456789012345`
   - **API Secret**: `abcd...` (click "Reveal" to see it)
3. **Copy all three values** - you'll need them for Vercel

### 3.3 Optional: Create Upload Preset
1. Go to **Settings** (gear icon) > **Upload**
2. Scroll to "Upload presets"
3. Click "Add upload preset"
4. Fill in:
   - **Preset name**: `hamro-saath-uploads`
   - **Signing Mode**: `Unsigned`
   - **Folder**: `hamro-saath`
5. Click "Save"

✅ **Step 3 Complete!** Image storage is ready.

---

## Step 4: Configure Backend for Vercel

This is already done! Your backend has:
- ✅ `vercel.json` - Vercel configuration
- ✅ `.vercelignore` - Files to exclude
- ✅ Build scripts configured

Just need to make sure environment variables are set (next step).

---

## Step 5: Deploy Backend to Vercel

### 5.1 Install Vercel CLI
```powershell
npm install -g vercel
```

### 5.2 Login to Vercel
```powershell
cd backend
vercel login
```
Follow the link in your browser to authenticate.

### 5.3 Deploy Backend
```powershell
vercel
```
- Choose "Link to existing project?" → **No**
- "What's your project's name?" → `hamro-saath-backend`
- "In which directory is your code located?" → `./` (press Enter)
- Wait for deployment...

### 5.4 Configure Environment Variables
After first deployment, run:
```powershell
vercel env add DATABASE_URL
```
Paste your Supabase connection string and press Enter.

Repeat for each variable:
```powershell
vercel env add REDIS_URL
vercel env add UPSTASH_REDIS_REST_URL
vercel env add UPSTASH_REDIS_REST_TOKEN
vercel env add JWT_SECRET
vercel env add JWT_REFRESH_SECRET
vercel env add CORS_ORIGIN
vercel env add CLOUDINARY_CLOUD_NAME
vercel env add CLOUDINARY_API_KEY
vercel env add CLOUDINARY_API_SECRET
```

**Values:**
- `DATABASE_URL`: Your Supabase connection string
- `REDIS_URL`: Leave empty (we'll use Upstash REST API)
- `UPSTASH_REDIS_REST_URL`: From Upstash dashboard
- `UPSTASH_REDIS_REST_TOKEN`: From Upstash dashboard
- `JWT_SECRET`: Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `JWT_REFRESH_SECRET`: Generate again (different value)
- `CORS_ORIGIN`: Your frontend URL (e.g., `https://hamro-saath.vercel.app`)
- `CLOUDINARY_CLOUD_NAME`: From Cloudinary dashboard
- `CLOUDINARY_API_KEY`: From Cloudinary dashboard
- `CLOUDINARY_API_SECRET`: From Cloudinary dashboard

### 5.5 Deploy to Production
```powershell
vercel --prod
```

Your backend will be live at: `https://hamro-saath-backend.vercel.app`

✅ **Step 5 Complete!** Backend is deployed.

---

## Step 6: Test Production Endpoints

### 6.1 Test Health Endpoint
```powershell
curl https://hamro-saath-backend.vercel.app/health
```
Should return: `{"status":"ok","timestamp":"..."}`

### 6.2 Test Registration
```powershell
curl -X POST https://hamro-saath-backend.vercel.app/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"SecurePass123!\",\"full_name\":\"Test User\",\"ward_id\":1}'
```

### 6.3 Test Login
```powershell
curl -X POST https://hamro-saath-backend.vercel.app/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"SecurePass123!\"}'
```
Should return JWT tokens.

✅ **Step 6 Complete!** Backend is working.

---

## Step 7: Update Frontend and Deploy

### 7.1 Update Frontend API URL
1. Open `constants.tsx` in your frontend
2. Find `API_BASE_URL`
3. Change to: `https://hamro-saath-backend.vercel.app`

### 7.2 Deploy Frontend
```powershell
cd ..
vercel
```
Follow the prompts to deploy frontend.

### 7.3 Update CORS_ORIGIN
1. Get your frontend URL (e.g., `https://hamro-saath.vercel.app`)
2. Update CORS_ORIGIN environment variable in backend:
   ```powershell
   cd backend
   vercel env add CORS_ORIGIN
   ```
   Enter your frontend URL
3. Redeploy backend:
   ```powershell
   vercel --prod
   ```

✅ **Step 7 Complete!** Everything is deployed!

---

## 🎉 Deployment Complete!

Your app is now live at:
- **Frontend**: `https://hamro-saath.vercel.app`
- **Backend**: `https://hamro-saath-backend.vercel.app`

### Next Steps:
1. Test authentication flow end-to-end
2. Test user registration and login
3. Upload test images
4. Monitor error logs in Vercel dashboard
5. Set up monitoring (Sentry, LogRocket, etc.)

---

## Troubleshooting

### Database Connection Issues
- Verify connection string has correct password
- Check Supabase project is active
- Try connection pooler URL (port 6543)

### Redis Connection Issues
- Verify UPSTASH_REDIS_REST_URL and TOKEN are correct
- Check Upstash database is active
- Try REST API tab in Upstash dashboard

### Image Upload Issues
- Verify Cloudinary credentials are correct
- Check upload preset is created
- Verify /tmp directory is writable (Vercel limitation)

### Cold Start Issues
- First request after inactivity takes 5-10 seconds (normal)
- Consider keeping app warm with uptime monitoring
- Or migrate to Railway ($15/month) for no cold starts

---

## Migration to Railway (Later)

When you're ready to migrate from Vercel to Railway:

1. Create Railway account: https://railway.app
2. Create new project
3. Add PostgreSQL and Redis services (included)
4. Deploy from GitHub
5. Copy data from Supabase to Railway PostgreSQL
6. Update frontend API_BASE_URL
7. Done!

Cost: ~$15/month for everything (better performance, no cold starts)

---

**Need Help?** Check:
- `VERCEL_DEPLOYMENT.md` - Detailed Vercel guide
- `DEPLOYMENT_COMPARISON.md` - Platform comparison
- `API_QUICK_REFERENCE.md` - API testing guide
