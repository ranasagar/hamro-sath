import cors from 'cors';
import express from 'express';
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mock database
const users = [
  {
    id: 1,
    email: 'sitarai@safa.com',
    password: 'password123',
    username: 'sitarai',
    fullName: 'Sita Rai',
    wardId: 5,
    karmaBalance: 1250,
    token: 'mock-token-sita',
    avatar_url: 'https://picsum.photos/id/1011/100/100',
    stats: {
      total_points: 1250,
      issues_reported: 8,
      events_joined: 5,
      recycling_logs: 12,
      quest_completed: 3,
    },
    badges: [
      { id: 1, name: 'Tole Trailblazer', earned_at: '2024-11-01T10:00:00Z' },
      { id: 2, name: 'River Guardian', earned_at: '2024-11-05T14:30:00Z' },
      { id: 4, name: 'Civic Champion', earned_at: '2024-11-10T09:15:00Z' },
    ],
  },
  {
    id: 2,
    email: 'aaravsharma@safa.com',
    password: 'password123',
    username: 'aaravsharma',
    fullName: 'Aarav Sharma',
    wardId: 12,
    karmaBalance: 980,
    token: 'mock-token-aarav',
    avatar_url: 'https://picsum.photos/id/1005/100/100',
    stats: {
      total_points: 980,
      issues_reported: 6,
      events_joined: 3,
      recycling_logs: 8,
      quest_completed: 2,
    },
    badges: [
      { id: 1, name: 'Tole Trailblazer', earned_at: '2024-10-28T11:20:00Z' },
      { id: 3, name: 'Waste Warrior', earned_at: '2024-11-08T16:45:00Z' },
    ],
  },
  {
    id: 3,
    email: 'demouser@safa.com',
    password: 'password123',
    username: 'demouser',
    fullName: 'Demo User',
    wardId: 1,
    karmaBalance: 500,
    token: 'mock-token-demo',
    avatar_url: 'https://picsum.photos/id/1043/100/100',
    stats: {
      total_points: 500,
      issues_reported: 2,
      events_joined: 1,
      recycling_logs: 4,
      quest_completed: 1,
    },
    badges: [{ id: 1, name: 'Tole Trailblazer', earned_at: '2024-11-12T13:00:00Z' }],
  },
  {
    id: 4,
    email: 'rajeshhamal@safa.com',
    password: 'password123',
    username: 'rajeshhamal',
    fullName: 'Rajesh Hamal',
    wardId: 20,
    karmaBalance: 2100,
    token: 'mock-token-rajesh',
    avatar_url: 'https://picsum.photos/id/1040/100/100',
    stats: {
      total_points: 2100,
      issues_reported: 15,
      events_joined: 10,
      recycling_logs: 20,
      quest_completed: 5,
    },
    badges: [
      { id: 1, name: 'Tole Trailblazer', earned_at: '2024-10-20T08:30:00Z' },
      { id: 2, name: 'River Guardian', earned_at: '2024-10-25T12:00:00Z' },
      { id: 3, name: 'Waste Warrior', earned_at: '2024-11-01T15:20:00Z' },
      { id: 4, name: 'Civic Champion', earned_at: '2024-11-05T10:45:00Z' },
      { id: 5, name: 'Eco Warrior', earned_at: '2024-11-15T14:00:00Z' },
    ],
  },
];

let nextUserId = 5;

// Auth endpoints
app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;

  console.log('Login attempt:', email);

  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          full_name: user.fullName,
          ward_id: user.wardId,
          karma_balance: user.karmaBalance,
          avatar_url: user.avatar_url,
          stats: user.stats,
          badges: user.badges,
          role: 'citizen',
          is_verified: true,
          created_at: new Date().toISOString(),
        },
        tokens: {
          accessToken: user.token,
          refreshToken: `refresh-${user.token}`,
        },
      },
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  }
});

app.post('/api/v1/auth/register', (req, res) => {
  const { email, password, username, fullName, wardId } = req.body;

  console.log('Register attempt:', email);

  // Check if user already exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists',
    });
  }

  // Create new user
  const newUser = {
    id: nextUserId++,
    email,
    password,
    username: username || email.split('@')[0],
    fullName: fullName || 'New User',
    wardId: wardId || 1,
    karmaBalance: 0,
    avatar_url: `https://picsum.photos/id/${1000 + nextUserId}/100/100`,
    stats: {
      total_points: 0,
      issues_reported: 0,
      events_joined: 0,
      recycling_logs: 0,
      quest_completed: 0,
    },
    badges: [],
    token: `mock-token-${nextUserId}`,
  };

  users.push(newUser);

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        full_name: newUser.fullName,
        ward_id: newUser.wardId,
        karma_balance: newUser.karmaBalance,
        avatar_url: newUser.avatar_url,
        stats: newUser.stats,
        badges: newUser.badges,
        role: 'citizen',
        is_verified: false,
        created_at: new Date().toISOString(),
      },
      tokens: {
        accessToken: newUser.token,
        refreshToken: `refresh-${newUser.token}`,
      },
    },
  });
});

app.get('/api/v1/auth/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  const user = users.find(u => u.token === token);

  if (user) {
    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        wardId: user.wardId,
        karmaBalance: user.karmaBalance,
      },
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
  }
});

// Issues endpoint
app.get('/api/v1/issues', (req, res) => {
  res.json({
    success: true,
    data: {
      issues: [],
      total: 0,
      page: 1,
      limit: 50,
    },
  });
});

// User profile endpoint
app.get('/api/v1/users/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const user = users.find(u => u.token === token);

  if (user) {
    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        full_name: user.fullName,
        ward_id: user.wardId,
        karma_balance: user.karmaBalance,
        avatar_url: user.avatar_url,
        role: 'citizen',
        is_verified: true,
        created_at: new Date().toISOString(),
        stats: user.stats,
        badges: user.badges,
      },
    });
  } else {
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
});

// User activities endpoint
app.get('/api/v1/users/:id/activities', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Generate user-specific activities based on their profile
  const activityTemplates = {
    1: [
      // Sita Rai - Active reporter and event participant
      {
        type: 'issue_reported',
        desc: 'Reported illegal waste dumping near Patan Durbar Square',
        points: 50,
        hours: 3,
      },
      {
        type: 'event_joined',
        desc: 'Participated in Ward 5 cleanliness drive',
        points: 100,
        hours: 18,
      },
      {
        type: 'recycling',
        desc: 'Logged 5kg plastic bottles at collection center',
        points: 75,
        hours: 48,
      },
      {
        type: 'quest_completed',
        desc: 'Completed "River Guardian" quest: Water quality testing',
        points: 50,
        hours: 96,
      },
      {
        type: 'issue_reported',
        desc: 'Reported broken street light on Kupondole Road',
        points: 50,
        hours: 144,
      },
      {
        type: 'recycling',
        desc: 'Dropped off electronic waste for safe disposal',
        points: 75,
        hours: 192,
      },
      {
        type: 'event_joined',
        desc: 'Joined community composting workshop',
        points: 100,
        hours: 240,
      },
      {
        type: 'micro_action',
        desc: 'Cleaned drainage near home after monsoon',
        points: 25,
        hours: 288,
      },
    ],
    2: [
      // Aarav Sharma - Regular user with balanced activity
      { type: 'recycling', desc: 'Recycled newspapers and cardboard boxes', points: 75, hours: 12 },
      {
        type: 'issue_reported',
        desc: 'Reported pothole on Ring Road causing accidents',
        points: 50,
        hours: 36,
      },
      {
        type: 'event_joined',
        desc: 'Attended tree plantation drive in Ward 12',
        points: 100,
        hours: 84,
      },
      {
        type: 'quest_completed',
        desc: 'Finished "Waste Warrior" poster design quest',
        points: 50,
        hours: 132,
      },
      {
        type: 'recycling',
        desc: 'Logged glass bottle recycling at ward office',
        points: 75,
        hours: 180,
      },
      {
        type: 'micro_action',
        desc: 'Picked up plastic bags from Thamel streets',
        points: 10,
        hours: 228,
      },
    ],
    3: [
      // Demo User - New user with basic activity
      {
        type: 'issue_reported',
        desc: 'Reported overflowing garbage bin near home',
        points: 50,
        hours: 24,
      },
      {
        type: 'recycling',
        desc: 'First recycling drop-off: plastic containers',
        points: 75,
        hours: 72,
      },
      {
        type: 'quest_completed',
        desc: 'Completed welcome quest: Learn about waste segregation',
        points: 50,
        hours: 120,
      },
      {
        type: 'event_joined',
        desc: 'Joined neighborhood cleanup initiative',
        points: 100,
        hours: 168,
      },
    ],
    4: [
      // Rajesh Hamal - Power user with extensive history
      {
        type: 'event_joined',
        desc: 'Led Ward 20 mega cleanup with 50+ volunteers',
        points: 150,
        hours: 6,
      },
      {
        type: 'quest_completed',
        desc: 'Completed advanced quest: Zero-waste lifestyle challenge',
        points: 100,
        hours: 20,
      },
      {
        type: 'recycling',
        desc: 'Organized bulk recycling collection in neighborhood',
        points: 100,
        hours: 40,
      },
      {
        type: 'issue_reported',
        desc: 'Filed detailed report on Bishnumati pollution sources',
        points: 75,
        hours: 60,
      },
      {
        type: 'event_joined',
        desc: 'Conducted civic education workshop at local school',
        points: 150,
        hours: 96,
      },
      {
        type: 'recycling',
        desc: 'Logged 20kg mixed recyclables with segregation',
        points: 100,
        hours: 132,
      },
      {
        type: 'issue_reported',
        desc: 'Reported and helped fix broken public water tap',
        points: 75,
        hours: 168,
      },
      {
        type: 'quest_completed',
        desc: 'Mentored 10 students on environmental awareness',
        points: 100,
        hours: 216,
      },
      {
        type: 'event_joined',
        desc: 'Organized monthly community recycling meetup',
        points: 150,
        hours: 264,
      },
      {
        type: 'micro_action',
        desc: 'Daily morning litter patrol near Temple Road',
        points: 50,
        hours: 312,
      },
    ],
  };

  const userActivities = activityTemplates[userId] || activityTemplates[3]; // Default to demo user pattern

  const mockActivities = userActivities.map((activity, index) => ({
    id: index + 1,
    type: activity.type,
    description: activity.desc,
    points_earned: activity.points,
    created_at: new Date(Date.now() - activity.hours * 60 * 60 * 1000).toISOString(),
  }));

  res.json({
    success: true,
    data: {
      activities: mockActivities.slice(
        0,
        Math.min(mockActivities.length, user.stats?.issues_reported || 3)
      ),
      total: user.stats?.issues_reported || 3,
      page: 1,
      limit: 20,
    },
  });
});

// Rewards endpoint
app.get('/api/v1/rewards', (req, res) => {
  const mockRewards = [
    {
      id: 1,
      name: 'Rs. 100 eSewa Top-Up',
      description: 'Instant mobile balance top-up via eSewa',
      category: 'coupon',
      points_required: 1000,
      quantity_available: 100,
      price_npr: 100,
      image_url: 'https://picsum.photos/id/201/400/300',
      is_available: true,
    },
    {
      id: 2,
      name: 'Free Coffee at Himalayan Java',
      description: 'Enjoy a free coffee at any Himalayan Java outlet',
      category: 'coupon',
      points_required: 500,
      quantity_available: 50,
      price_npr: 250,
      image_url: 'https://picsum.photos/id/225/400/300',
      is_available: true,
    },
    {
      id: 3,
      name: '1GB Ncell Data Pack',
      description: 'Get 1GB mobile data for Ncell',
      category: 'coupon',
      points_required: 800,
      quantity_available: 200,
      price_npr: 100,
      image_url: 'https://picsum.photos/id/30/400/300',
      is_available: true,
    },
    {
      id: 4,
      name: '10% off at Bhat-Bhateni',
      description: 'Get 10% discount on purchases at Bhat-Bhateni',
      category: 'coupon',
      points_required: 2000,
      quantity_available: 30,
      price_npr: 500,
      image_url: 'https://picsum.photos/id/211/400/300',
      is_available: true,
    },
    {
      id: 5,
      name: 'Safa Nepal T-Shirt',
      description: 'Official logo, 100% organic cotton',
      category: 'merchandise',
      points_required: 8000,
      quantity_available: 25,
      price_npr: 800,
      image_url:
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1964&auto=format&fit=crop',
      is_available: true,
    },
    {
      id: 6,
      name: 'Safa Nepal Tote Bag',
      description: 'Durable canvas bag for your daily needs',
      category: 'merchandise',
      points_required: 5000,
      quantity_available: 40,
      price_npr: 500,
      image_url:
        'https://images.unsplash.com/photo-1594295343564-972159515939?q=80&w=1964&auto=format&fit=crop',
      is_available: true,
    },
    {
      id: 7,
      name: 'Community Hero Cap',
      description: 'A stylish cap to show your support',
      category: 'merchandise',
      points_required: 4500,
      quantity_available: 35,
      price_npr: 450,
      image_url:
        'https://images.unsplash.com/photo-1588850566953-c42144d283b3?q=80&w=1974&auto=format&fit=crop',
      is_available: true,
    },
  ];

  res.json({
    success: true,
    data: {
      rewards: mockRewards,
      total: mockRewards.length,
      page: 1,
      limit: 50,
    },
  });
});

// Reward details endpoint
app.get('/api/v1/rewards/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const mockReward = {
    id,
    name: 'Eco Tote Bag',
    description: 'Reusable cotton tote bag with SAFA Nepal logo. Perfect for daily shopping.',
    category: 'merchandise',
    points_required: 500,
    quantity_available: 50,
    price_npr: 500,
    image_url:
      'https://images.unsplash.com/photo-1594295343564-972159515939?q=80&w=1964&auto=format&fit=crop',
    is_available: true,
  };

  res.json({
    success: true,
    data: mockReward,
  });
});

// Challenges endpoint
app.get('/api/v1/challenges', (req, res) => {
  const mockChallenges = [
    {
      id: 1,
      name: 'Clean Streets Challenge',
      description: 'Pickup litter in your ward',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      target_actions: 100,
      current_progress: 34,
      karma_reward: 1000,
      is_active: true,
    },
  ];

  res.json({
    success: true,
    data: {
      challenges: mockChallenges,
      total: mockChallenges.length,
    },
  });
});

// Student Quests endpoint
app.post('/api/v1/student-quests/:id/submit', (req, res) => {
  const questId = parseInt(req.params.id);
  res.json({
    success: true,
    data: {
      quest_id: questId,
      status: 'submitted',
      karma_reward: 50,
      message: 'Quest submitted successfully! Teacher will review.',
    },
  });
});

// Civic Nudges endpoint
app.post('/api/v1/civic-nudges', (req, res) => {
  const { friendName, message, memeId } = req.body;
  res.json({
    success: true,
    data: {
      nudge_id: Date.now(),
      sent_to: friendName,
      message,
      meme_id: memeId,
      sent_at: new Date().toISOString(),
    },
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', message: 'Mock server running' } });
});

const PORT = 3002;
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Mock API server running on http://localhost:${PORT}`);
  console.log(`\n📝 Available demo accounts:`);
  console.log('  - sitarai@safa.com / password123');
  console.log('  - aaravsharma@safa.com / password123');
  console.log('  - demouser@safa.com / password123');
  console.log('  - rajeshhamal@safa.com / password123\n');
});

server.on('error', error => {
  if (error.code === 'EADDRINUSE') {
    console.error(
      `❌ Port ${PORT} is already in use. Please close other applications using this port.`
    );
  } else {
    console.error('❌ Server error:', error);
  }
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down mock server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
