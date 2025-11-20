# Backend Deployment Guide

## Deployment Options

### Option 1: Railway (Recommended for Beginners)

Railway provides easy deployment with automatic database and Redis provisioning.

**Steps:**
1. **Create Railway Account**: https://railway.app
2. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   railway login
   ```
3. **Create New Project**:
   ```bash
   cd backend
   railway init
   ```
4. **Add PostgreSQL**:
   - Go to Railway dashboard
   - Click "New" → "Database" → "PostgreSQL"
   - Database will be automatically provisioned
5. **Add Redis**:
   - Click "New" → "Database" → "Redis"
   - Redis will be automatically provisioned
6. **Set Environment Variables**:
   ```bash
   railway variables set NODE_ENV=production
   railway variables set PORT=3001
   railway variables set JWT_SECRET="your-production-secret-change-this"
   railway variables set JWT_REFRESH_SECRET="your-refresh-secret-change-this"
   railway variables set BASE_URL="https://your-app.railway.app"
   railway variables set CORS_ORIGIN="https://your-frontend-domain.com"
   ```
   - DATABASE_URL and REDIS_URL are automatically set
7. **Deploy**:
   ```bash
   railway up
   ```
8. **Run Migrations**:
   ```bash
   railway run psql $DATABASE_URL -f migrations/001_initial_schema.sql
   railway run psql $DATABASE_URL -f migrations/002_seed_data.sql
   ```
9. **Get URL**: Railway will provide your deployment URL

**Estimated Cost**: $5-10/month for hobby usage

---

### Option 2: Render

Render offers free tier with automatic deploys from GitHub.

**Steps:**
1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Backend ready for deployment"
   git push origin main
   ```
2. **Create Render Account**: https://render.com
3. **Create PostgreSQL Database**:
   - Dashboard → "New PostgreSQL"
   - Choose free tier or paid
   - Note the Internal/External URLs
4. **Create Redis Instance**:
   - Dashboard → "New Redis"
   - Note the Redis URL
5. **Create Web Service**:
   - Dashboard → "New Web Service"
   - Connect GitHub repository
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `node dist/server.js`
6. **Set Environment Variables** (in Render dashboard):
   ```
   NODE_ENV=production
   PORT=3001
   BASE_URL=https://your-app.onrender.com
   DATABASE_URL=<from Render PostgreSQL>
   REDIS_URL=<from Render Redis>
   JWT_SECRET=your-production-secret
   JWT_REFRESH_SECRET=your-refresh-secret
   CORS_ORIGIN=https://your-frontend.com
   ```
7. **Deploy**: Render will auto-deploy on git push
8. **Run Migrations**: Use Render shell or connect via psql

**Estimated Cost**: Free tier available (limited), or $7/month

---

### Option 3: AWS (Most Scalable)

Best for production with high traffic expectations.

**Architecture:**
- EC2 or ECS for Node.js app
- RDS PostgreSQL for database
- ElastiCache Redis for caching
- S3 for image uploads (recommended over local storage)
- CloudFront CDN for static assets
- Load Balancer for high availability

**Steps:**
1. **Create RDS PostgreSQL**:
   - AWS Console → RDS → Create Database
   - Engine: PostgreSQL 15
   - Instance: db.t3.micro (free tier eligible)
   - Note endpoint and credentials
2. **Create ElastiCache Redis**:
   - AWS Console → ElastiCache → Create
   - Engine: Redis 7
   - Node type: cache.t3.micro
   - Note endpoint
3. **Deploy to EC2**:
   ```bash
   # SSH into EC2 instance
   ssh -i your-key.pem ec2-user@your-instance-ip
   
   # Install Node.js 20
   curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
   sudo yum install -y nodejs
   
   # Clone repository
   git clone your-repo-url
   cd backend
   
   # Install dependencies
   npm install
   npm run build
   
   # Set up environment
   nano .env  # Add production variables
   
   # Install PM2 for process management
   sudo npm install -g pm2
   pm2 start dist/server.js --name hamro-saath-api
   pm2 startup
   pm2 save
   ```
4. **Configure Security Groups**:
   - Allow inbound on port 3001 (or use reverse proxy with Nginx)
   - Allow PostgreSQL port (5432) from EC2 security group
   - Allow Redis port (6379) from EC2 security group
5. **Set Up Load Balancer** (optional):
   - Create Application Load Balancer
   - Configure target group pointing to EC2 instance
   - Set up health check: `/health`
6. **Set Up S3 for Images** (recommended):
   - Create S3 bucket for uploads
   - Update backend to use AWS SDK instead of local storage
   - Enable CloudFront CDN for faster delivery

**Estimated Cost**: $30-100/month depending on usage

---

### Option 4: Docker + Any Cloud

Use Docker for consistent deployment across any platform.

**Build Docker Image:**
```bash
cd backend
docker build -t hamro-saath-backend .
```

**Run Locally with Docker Compose:**
```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/hamro_saath
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=your-secret
      - JWT_REFRESH_SECRET=your-refresh-secret
    depends_on:
      - db
      - redis
  
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=hamro_saath
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

**Deploy to Cloud:**
- **AWS ECS**: Push to ECR, deploy to Fargate
- **Google Cloud Run**: Deploy container with one command
- **Azure Container Instances**: Deploy from Docker Hub
- **DigitalOcean App Platform**: Connect GitHub, auto-deploy

---

## Post-Deployment Checklist

### 1. Run Database Migrations
```bash
# Connect to production database
psql $DATABASE_URL -f migrations/001_initial_schema.sql
psql $DATABASE_URL -f migrations/002_seed_data.sql
```

### 2. Verify Health Endpoint
```bash
curl https://your-api-url.com/health
# Should return: {"status":"healthy",...}
```

### 3. Test Authentication
```bash
# Register a test user
curl -X POST https://your-api-url.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#","fullName":"Test User","phone":"9800000000","wardId":1}'

# Login
curl -X POST https://your-api-url.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}'
```

### 4. Test Redis Connection
Check server logs for "Redis connected successfully" message.

### 5. Test Image Upload
```bash
curl -X POST https://your-api-url.com/api/v1/upload/single \
  -H "Authorization: Bearer <your-token>" \
  -F "image=@test-image.jpg"
```

### 6. Update Frontend
Update frontend `API_BASE_URL` environment variable to your production API URL.

### 7. Set Up Monitoring
- **Sentry**: Error tracking → https://sentry.io
- **Datadog/New Relic**: Performance monitoring
- **UptimeRobot**: Uptime monitoring (free)

### 8. Configure HTTPS
- Railway/Render: Automatic HTTPS
- AWS: Use AWS Certificate Manager + Load Balancer
- Other: Use Let's Encrypt with Certbot

### 9. Set Up Backups
- **PostgreSQL**: Enable automated backups (most platforms do this automatically)
- **Redis**: Redis persistence is enabled by default
- **Uploads**: If using local storage, back up uploads directory
- **Recommended**: Use S3 for uploads (automatic durability)

### 10. Enable Logging
- Check that Winston logs are being written
- Set up log aggregation (Papertrail, Loggly, CloudWatch)
- Monitor error rates and response times

---

## Environment Variables Reference

**Required:**
```env
NODE_ENV=production
PORT=3001
BASE_URL=https://your-api-domain.com
DATABASE_URL=postgresql://user:pass@host:5432/dbname
REDIS_URL=redis://host:6379
JWT_SECRET=<strong-random-string-min-32-chars>
JWT_REFRESH_SECRET=<different-strong-random-string>
CORS_ORIGIN=https://your-frontend-domain.com
```

**Optional:**
```env
API_VERSION=v1
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

**For S3 (if using AWS S3 for uploads):**
```env
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

---

## Production Best Practices

✅ Use strong, random JWT secrets (32+ characters)  
✅ Enable HTTPS (required for production)  
✅ Set up database backups (daily recommended)  
✅ Monitor error logs (Sentry, DataDog)  
✅ Use managed databases (easier scaling)  
✅ Enable Redis persistence  
✅ Set up rate limiting (already configured)  
✅ Use S3/CDN for image uploads (recommended over local storage)  
✅ Set up CI/CD pipeline (GitHub Actions)  
✅ Monitor uptime (UptimeRobot)  
✅ Set up alerts for errors/downtime  
✅ Use environment variables for secrets (never commit .env)  
✅ Enable CORS only for your frontend domain  
✅ Set up horizontal scaling for high traffic  

---

## Troubleshooting

### "Cannot connect to database"
- Check DATABASE_URL is correct
- Verify network access (security groups, firewalls)
- Check database is running and accepting connections

### "Redis connection failed"
- Check REDIS_URL is correct
- Verify Redis is running
- Check network access to Redis

### "JWT verification failed"
- Ensure JWT_SECRET matches between environments
- Check token hasn't expired (7 days default)
- Verify Authorization header format: `Bearer <token>`

### "CORS error"
- Set CORS_ORIGIN to exact frontend URL (no trailing slash)
- Check frontend is sending requests to correct API URL
- Verify CORS middleware is configured

### "File upload fails"
- Check uploads directory exists and is writable
- Verify file size under 5MB limit
- Check file type is JPEG/PNG/WebP
- Ensure multer middleware is applied to route

### "Rate limit exceeded"
- Normal behavior for too many requests
- Wait for rate limit window to reset (15 minutes)
- Adjust rate limits in .env if needed for development

---

## Support

- **Documentation**: See IMPLEMENTATION_SUMMARY.md
- **Issues**: Create GitHub issue
- **Contact**: [Your contact information]

---

**Last Updated**: November 18, 2025  
**Status**: Production Ready
