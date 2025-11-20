# API Endpoint Reference - Quick Guide

## Base URL
**Development**: `http://localhost:3001`  
**Production**: `https://your-domain.com`

## Health Check
```http
GET /health
```
**Response**: `{ status: "healthy", timestamp: "...", environment: "..." }`

---

## Authentication Endpoints

### Register New User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe",
  "phone": "9800000000",
  "wardId": 1
}
```
**Rate Limit**: 5 requests / 15 minutes

### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```
**Response**: `{ accessToken: "...", refreshToken: "...", user: {...} }`  
**Rate Limit**: 5 requests / 15 minutes

### Refresh Token
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```
**Response**: `{ accessToken: "..." }`

### Logout
```http
POST /api/v1/auth/logout
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

---

## User Management Endpoints

### Get Own Profile
```http
GET /api/v1/users/me
Authorization: Bearer <access-token>
```
**Cache**: Not cached (always fresh)

### Get User Profile
```http
GET /api/v1/users/:id
```
**Cache**: 10 minutes  
**Example**: `GET /api/v1/users/123`

### Update Profile
```http
PUT /api/v1/users/:id
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "fullName": "Jane Doe",
  "bio": "Civic engagement enthusiast",
  "phone": "9800000001"
}
```
**Cache**: Invalidates user profile cache

### Change Password
```http
PUT /api/v1/users/:id/password
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!"
}
```
**Rate Limit**: 3 requests / 1 hour  
**Cache**: Invalidates all user caches

### Get User Activities
```http
GET /api/v1/users/:id/activities?page=1&limit=20
```
**Pagination**: Default page=1, limit=20  
**Example**: `GET /api/v1/users/123/activities?page=2&limit=10`

### Get Leaderboard
```http
GET /api/v1/users/leaderboard
```
**Cache**: 5 minutes  
**Returns**: Top 50 users by points

---

## Image Upload Endpoints

### Upload Single Image
```http
POST /api/v1/upload/single
Authorization: Bearer <access-token>
Content-Type: multipart/form-data

Form field: image (file)
```
**Response**: `{ url: "http://localhost:3001/uploads/filename.webp", ... }`  
**Max Size**: 5MB  
**Allowed Types**: JPEG, PNG, WebP  
**Processing**: Resize to 800x600, convert to WebP, 85% quality

### Upload Multiple Images
```http
POST /api/v1/upload/multiple
Authorization: Bearer <access-token>
Content-Type: multipart/form-data

Form field: images (files, max 3)
```
**Response**: `{ urls: ["...", "...", "..."], count: 3 }`

### Get Uploaded Image
```http
GET /uploads/:filename
```
**Example**: `GET /uploads/photo-1234567890-processed.webp`  
**Static**: Direct file serving (no authentication required)

---

## Rate Limits

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| General API | 100 requests | 15 minutes |
| Auth (register/login) | 5 requests | 15 minutes |
| Password Change | 3 requests | 1 hour |

**Response on Limit Exceeded**:
```json
{
  "success": false,
  "message": "Too many requests, please try again later."
}
```

---

## Authentication

**All protected endpoints require**:
```http
Authorization: Bearer <access-token>
```

**Token Expiry**:
- Access Token: 7 days
- Refresh Token: 30 days

**Refresh Flow**:
1. Access token expires
2. Client gets 401 Unauthorized
3. Client calls `/auth/refresh` with refresh token
4. Server returns new access token
5. Client retries original request with new token

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "message": "Too many requests, please try again later."
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal Server Error"
}
```

---

## Cache Information

| Resource | TTL | Invalidation |
|----------|-----|--------------|
| Leaderboard | 5 minutes | Manual refresh |
| User Profile | 10 minutes | On profile update |
| User Badges | 10 minutes | On badge award |
| Points Balance | 5 minutes | On points change |

**Cache Headers**: Responses from cached data include `cached: true` in response body.

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "fullName": "Test User",
    "phone": "9800000000",
    "wardId": 1
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

### Get Profile (with auth)
```bash
curl http://localhost:3001/api/v1/users/1 \
  -H "Authorization: Bearer <your-token>"
```

### Upload Image
```bash
curl -X POST http://localhost:3001/api/v1/upload/single \
  -H "Authorization: Bearer <your-token>" \
  -F "image=@/path/to/image.jpg"
```

---

## Testing with Postman

1. **Create Collection**: "Hamro Saath API"
2. **Set Base URL Variable**: `{{baseUrl}}` = `http://localhost:3001`
3. **Set Token Variable**: `{{accessToken}}` (after login)
4. **Add Authorization Header**: 
   - Type: Bearer Token
   - Token: `{{accessToken}}`

### Request Sequence:
1. POST Register → Save response
2. POST Login → Copy `accessToken` to `{{accessToken}}` variable
3. GET /users/me → Verify authenticated access
4. PUT /users/:id → Test profile update
5. GET /users/leaderboard → Verify caching (call twice, check timing)
6. POST /upload/single → Test image upload

---

## Production URL Update

After deployment, update frontend API base URL:

**Frontend `.env` file:**
```env
VITE_API_BASE_URL=https://your-api-domain.com
```

**In frontend code:**
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
```

---

## Support & Troubleshooting

### Common Issues

**"Cannot connect to database"**
- Check DATABASE_URL in .env
- Verify PostgreSQL is running
- Check database credentials

**"Redis connection failed"**
- Check REDIS_URL in .env
- Verify Redis is running
- Check Redis port (default 6379)

**"Invalid or expired token"**
- Token may have expired (7 days)
- Get new token via /auth/refresh
- Or login again

**"Rate limit exceeded"**
- Normal behavior for too many requests
- Wait for window to reset (15 minutes)
- Implement exponential backoff in frontend

---

**Last Updated**: November 18, 2025  
**API Version**: v1  
**Status**: Production Ready
