# Frontend-Backend Sync Architecture Guide

## 🔴 Current Issue

**The frontend does NOT sync with the backend API.** Changes made in the admin panel are not reflected in the frontend because the app uses **localStorage** for data persistence instead of fetching from the API.

## 📋 Current Architecture

### Data Storage
All app data is stored in **browser localStorage**:
- Issues (`safaNepal-issues`)
- Rewards (`safaNepal-rewards`)
- Users (`safaNepal-allUsers`)
- Merchandise (`safaNepal-merchandise`)
- Forum threads (`safaNepal-forumThreads`)
- And 10+ other data types

### Data Flow
```
App.tsx → localStorage → Components
     ↑         ↓
  useState   JSON.parse/stringify
```

**Backend API is NOT used** for fetching display data.

## ⚠️ Problems This Causes

1. **Admin panel changes invisible** - Editing rewards/issues in admin doesn't update frontend
2. **No real-time sync** - Multiple users see different data
3. **Data loss** - Clearing browser cache = losing all data
4. **No persistence** - Data doesn't survive across devices
5. **Mock API unused** - The mock server on port 3002 is only used for authentication

## ✅ Solution: Migrate to API-First Architecture

### Phase 1: Convert Pages to Use API Hooks

#### HomePage (Issues Display)
**Current:**
```tsx
// App.tsx passes issues from localStorage
<HomePage issues={issues} ... />
```

**Should be:**
```tsx
// HomePage fetches its own data
import { useIssues } from '../hooks/useIssues';

const HomePage = () => {
  const { issues, loading, error, refreshIssues } = useIssues({
    status: filters.status,
    category: filters.category
  });
  
  // Display issues from API
}
```

#### RewardsPage
**Current:**
```tsx
// Uses useRewards hook (✓ correct!) but App.tsx also manages rewards in localStorage
const { rewards } = useRewards();
```

**Issue:** App.tsx `rewards` state conflicts with API-fetched rewards

**Fix:** Remove `rewards` state from App.tsx, let RewardsPage be the source of truth

#### ProfilePage
**Current:** ✅ Already uses API (`useUserProfile` hook)

**Status:** Working correctly

### Phase 2: Update App.tsx

**Remove localStorage-based states:**
```tsx
// DELETE THESE:
const [issues, setIssues] = useState(() => {...});
const [rewards, setRewards] = useState(() => {...});
const [merchandise, setMerchandise] = useState(() => {...});
// ... and 10+ more states
```

**Replace with API hooks:**
```tsx
// ADD THESE:
import { useIssues } from './hooks/useIssues';
import { useRewards } from './hooks/useRewards';

const App = () => {
  const { issues, createIssue, updateIssue } = useIssues();
  const { rewards } = useRewards();
  // Pass API functions to components instead of local state
}
```

### Phase 3: Create Missing API Hooks

#### Hooks to Create:
1. **useIssues.ts** - Issues CRUD
2. **useMerchandise.ts** - Merchandise management
3. **useForumThreads.ts** - Forum data
4. **useDisturbances.ts** - Disturbance reports
5. **useMayors.ts** - Mayor profiles
6. **useWards.ts** - Ward data

#### Example Hook Structure:
```typescript
// hooks/useIssues.ts
export const useIssues = (filters?: IssueFilters) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/v1/issues', { params: filters });
      setIssues(response.data);
    } catch (err) {
      setError('Failed to fetch issues');
    } finally {
      setLoading(false);
    }
  };

  const createIssue = async (data: CreateIssueDto) => {
    const response = await apiClient.post('/api/v1/issues', data);
    setIssues(prev => [...prev, response.data]);
    return response.data;
  };

  useEffect(() => {
    fetchIssues();
  }, [JSON.stringify(filters)]);

  return { issues, loading, error, createIssue, fetchIssues };
};
```

### Phase 4: Update Mock Server Endpoints

**Add missing endpoints:**
```javascript
// mock-server.js

// Issues endpoints
app.get('/api/v1/issues', (req, res) => { /* return issues */ });
app.post('/api/v1/issues', (req, res) => { /* create issue */ });
app.put('/api/v1/issues/:id', (req, res) => { /* update issue */ });
app.delete('/api/v1/issues/:id', (req, res) => { /* delete issue */ });

// Rewards endpoints (already exist ✓)
app.get('/api/v1/rewards', ...);
app.get('/api/v1/rewards/:id', ...);

// Merchandise endpoints
app.get('/api/v1/merchandise', (req, res) => { /* return merchandise */ });
app.post('/api/v1/merchandise', (req, res) => { /* create item */ });

// Forum endpoints
app.get('/api/v1/forum/threads', (req, res) => { /* return threads */ });
app.post('/api/v1/forum/threads', (req, res) => { /* create thread */ });
```

## 🚀 Migration Steps (Recommended Order)

### Step 1: Fix Auto-Login (✅ DONE)
- Clear tokens on app load
- Show login page after splash

### Step 2: Audit Existing Hooks
- ✅ `useUserProfile` - Working
- ✅ `useRewards` - Working
- ✅ `useChallenges` - Working
- ❌ `useIssues` - Doesn't exist
- ❌ `useMerchandise` - Doesn't exist
- ❌ `useForumThreads` - Doesn't exist

### Step 3: Create Missing Hooks (Priority Order)

**High Priority:**
1. **useIssues** - Core feature, most visible
2. **useMerchandise** - Admin panel edits need to sync
3. **useEvents** - Calendar functionality

**Medium Priority:**
4. **useForumThreads** - Community features
5. **useDisturbances** - Safety reports
6. **useMayors** - Leadership profiles

**Low Priority:**
7. **useWards** - Mostly static data
8. **useAnnouncements** - Admin notifications

### Step 4: Update Components (Page by Page)

**Week 1:**
- HomePage (issues display)
- RewardsPage (already mostly done)
- ProfilePage (already done ✓)

**Week 2:**
- SuppliesPage (merchandise)
- RecyclePage (recycling logs)
- ForumPage (threads & posts)

**Week 3:**
- AdminPage (all admin functions)
- LeaderboardsPage (challenges sync)

### Step 5: Remove localStorage Dependencies

After all pages use API hooks:
```tsx
// App.tsx - Remove these:
localStorage.getItem('safaNepal-issues');
localStorage.setItem('safaNepal-issues', ...);

// Only keep user preferences:
localStorage.getItem('safaNepal-theme');
localStorage.getItem('safaNepal-language');
```

### Step 6: Add Real-Time Updates (Optional)

**Option A: Polling**
```tsx
// Refresh data every 30 seconds
useEffect(() => {
  const interval = setInterval(() => {
    refreshIssues();
  }, 30000);
  return () => clearInterval(interval);
}, []);
```

**Option B: WebSocket (Future)**
```tsx
// Real-time updates via socket.io
useEffect(() => {
  socket.on('issue:created', (issue) => {
    setIssues(prev => [...prev, issue]);
  });
}, []);
```

## 🛠️ Quick Fix: Temporary Workaround

If you need admin changes to appear immediately without full migration:

### Option 1: Manual Refresh Button
```tsx
// Add to affected pages
<button onClick={() => {
  localStorage.clear();
  window.location.reload();
}}>
  Refresh Data from Server
</button>
```

### Option 2: Auto-Refresh on Focus
```tsx
// App.tsx
useEffect(() => {
  const handleFocus = () => {
    // Clear localStorage and reload
    localStorage.removeItem('safaNepal-issues');
    localStorage.removeItem('safaNepal-rewards');
    window.location.reload();
  };
  
  window.addEventListener('focus', handleFocus);
  return () => window.removeEventListener('focus', handleFocus);
}, []);
```

### Option 3: Sync Button in Admin
```tsx
// AdminPage.tsx
const handleSyncToFrontend = async () => {
  // Push changes to API
  await apiClient.post('/api/v1/admin/sync');
  
  // Clear frontend cache
  localStorage.clear();
  
  showToast('Changes synced! Frontend users will see updates on next refresh.');
};
```

## 📊 Current API Coverage

### ✅ Working with API:
- Authentication (login, register, logout)
- User profile (get, update)
- Rewards (list, get details, redeem)
- Challenges (list, leaderboard)
- Activities (user activity history)

### ❌ NOT Using API (localStorage only):
- Issues reporting & management
- Forum threads & posts
- Merchandise catalog
- Events & calendar
- Disturbance reports
- Safety kit redemptions
- Mayor profiles
- Ward data
- Hero slider content
- Feature flags

## 🎯 Success Metrics

After full migration, you should see:

1. ✅ Admin panel changes appear immediately in frontend
2. ✅ Multiple users see same data
3. ✅ Data persists across browser sessions
4. ✅ Mock server receives all CRUD requests
5. ✅ localStorage only used for UI preferences
6. ✅ Network tab shows API calls for all data operations
7. ✅ Refresh doesn't reset to INITIAL_* constants

## 🔧 Testing the Fix

### Test 1: Rewards Sync (Already Working)
1. Login to admin panel
2. Edit a reward (change points or title)
3. Go to Rewards page as user
4. ✅ Should see updated reward immediately

### Test 2: Issues Sync (Currently Broken)
1. Report an issue as user
2. Check AdminPage
3. ❌ Won't appear until localStorage cleared
4. After migration: ✅ Will appear immediately

### Test 3: Multi-User Sync
1. Open app in 2 browsers
2. Create issue in Browser A
3. Check Browser B
4. ❌ Won't see it (localStorage is per-browser)
5. After migration: ✅ Both see same data

## 📝 Development Checklist

- [ ] Create useIssues hook
- [ ] Create useMerchandise hook
- [ ] Create useForumThreads hook
- [ ] Add missing mock server endpoints
- [ ] Update HomePage to use useIssues
- [ ] Update SuppliesPage to use useMerchandise
- [ ] Update ForumPage to use useForumThreads
- [ ] Remove localStorage from App.tsx
- [ ] Test admin-to-frontend sync
- [ ] Add loading states for all API calls
- [ ] Add error boundaries for API failures
- [ ] Document new API endpoints

## 🚨 Important Notes

**Do NOT:**
- ❌ Mix localStorage and API for same data type
- ❌ Keep duplicate state in App.tsx and hooks
- ❌ Use INITIAL_* constants after migration

**Do:**
- ✅ One source of truth (API)
- ✅ Loading & error states for every API call
- ✅ Optimistic updates for better UX
- ✅ Cache API responses (React Query recommended)

## 🔗 Recommended Libraries

For production-ready API integration:

1. **TanStack Query (React Query)**
   ```bash
   npm install @tanstack/react-query
   ```
   - Auto caching
   - Auto refetch
   - Optimistic updates
   - Devtools

2. **SWR (Alternative)**
   ```bash
   npm install swr
   ```
   - Simpler than React Query
   - Good for read-heavy apps

## 📞 Next Steps

1. Review this document with team
2. Decide on migration timeline
3. Start with high-priority hooks (useIssues)
4. Test thoroughly in development
5. Deploy incrementally (page by page)

---

**Last Updated:** November 20, 2025
**Status:** ⚠️ Migration Needed - Frontend uses localStorage, not API
