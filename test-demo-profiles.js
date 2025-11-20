// Test script for demo profiles and enhanced features
// Run with: node test-demo-profiles.js

const API_BASE = 'http://localhost:3002/api/v1';

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testLogin(email, password) {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      log(`✓ Login successful: ${email}`, 'green');
      log(`  Karma: ${data.data.user.karma_balance}`, 'cyan');
      log(
        `  Stats: ${data.data.user.stats.issues_reported} issues, ${data.data.user.stats.events_joined} events`,
        'cyan'
      );
      log(`  Badges: ${data.data.user.badges.length} earned`, 'cyan');
      return data.data.tokens.accessToken;
    } else {
      log(`✗ Login failed: ${data.message}`, 'red');
      return null;
    }
  } catch (error) {
    log(`✗ Error testing login: ${error.message}`, 'red');
    return null;
  }
}

async function testUserProfile(token) {
  try {
    const response = await fetch(`${API_BASE}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (data.success) {
      log(`✓ Profile fetched successfully`, 'green');
      log(`  Username: ${data.data.username}`, 'cyan');
      log(`  Full Name: ${data.data.full_name}`, 'cyan');
      log(`  Ward: ${data.data.ward_id}`, 'cyan');
      log(
        `  Avatar: ${data.data.avatar_url ? '✓' : '✗'}`,
        data.data.avatar_url ? 'green' : 'yellow'
      );
      return data.data.id;
    } else {
      log(`✗ Profile fetch failed: ${data.message}`, 'red');
      return null;
    }
  } catch (error) {
    log(`✗ Error testing profile: ${error.message}`, 'red');
    return null;
  }
}

async function testUserActivities(userId, token) {
  try {
    const response = await fetch(`${API_BASE}/users/${userId}/activities`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (data.success) {
      log(`✓ Activities fetched: ${data.data.length} activities`, 'green');
      data.data.slice(0, 3).forEach((activity, index) => {
        const timeAgo = getTimeAgo(new Date(activity.created_at));
        log(
          `  ${index + 1}. [${activity.type}] ${activity.description} (+${activity.points_earned} Karma) - ${timeAgo}`,
          'cyan'
        );
      });
      if (data.data.length > 3) {
        log(`  ... and ${data.data.length - 3} more activities`, 'cyan');
      }
      return true;
    } else {
      log(`✗ Activities fetch failed: ${data.message}`, 'red');
      return false;
    }
  } catch (error) {
    log(`✗ Error testing activities: ${error.message}`, 'red');
    return false;
  }
}

async function testRewards() {
  try {
    const response = await fetch(`${API_BASE}/rewards`);
    const data = await response.json();

    if (data.success) {
      log(`✓ Rewards fetched: ${data.data.length} items`, 'green');
      const coupons = data.data.filter(r => r.category === 'coupon').length;
      const merchandise = data.data.filter(r => r.category === 'merchandise').length;
      log(`  Coupons: ${coupons}, Merchandise: ${merchandise}`, 'cyan');
      return true;
    } else {
      log(`✗ Rewards fetch failed`, 'red');
      return false;
    }
  } catch (error) {
    log(`✗ Error testing rewards: ${error.message}`, 'red');
    return false;
  }
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

async function runTests() {
  log('\n========================================', 'bright');
  log('  SAFA NEPAL - Demo Profile Testing', 'bright');
  log('========================================\n', 'bright');

  const demoAccounts = [
    { email: 'sitarai@safa.com', password: 'password123', name: 'Sita Rai (Active User)' },
    { email: 'aaravsharma@safa.com', password: 'password123', name: 'Aarav Sharma (Regular User)' },
    { email: 'demouser@safa.com', password: 'password123', name: 'Demo User (New User)' },
    { email: 'rajeshhamal@safa.com', password: 'password123', name: 'Rajesh Hamal (Power User)' },
  ];

  let passedTests = 0;
  let totalTests = 0;

  for (const account of demoAccounts) {
    log(`\n━━━ Testing: ${account.name} ━━━`, 'yellow');

    // Test 1: Login
    totalTests++;
    const token = await testLogin(account.email, account.password);
    if (token) passedTests++;

    if (token) {
      // Test 2: Profile
      totalTests++;
      const userId = await testUserProfile(token);
      if (userId) passedTests++;

      // Test 3: Activities
      if (userId) {
        totalTests++;
        const activitiesOk = await testUserActivities(userId, token);
        if (activitiesOk) passedTests++;
      }
    }

    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
  }

  // Test 4: Rewards endpoint
  log(`\n━━━ Testing: Rewards Marketplace ━━━`, 'yellow');
  totalTests++;
  const rewardsOk = await testRewards();
  if (rewardsOk) passedTests++;

  // Summary
  log('\n========================================', 'bright');
  log(
    `  Test Results: ${passedTests}/${totalTests} passed`,
    passedTests === totalTests ? 'green' : 'yellow'
  );
  log('========================================\n', 'bright');

  if (passedTests === totalTests) {
    log('🎉 All tests passed! Demo profiles are ready.', 'green');
    log('\nNext steps:', 'cyan');
    log('  1. Start the frontend: npm run dev', 'cyan');
    log('  2. Login with any demo account', 'cyan');
    log('  3. Check Profile page for stats & badges', 'cyan');
    log('  4. Check Rewards page for hero slider', 'cyan');
    log('  5. Try GPS watermarking in Report modal', 'cyan');
    log('  6. Open Student Quests & Civic Nudge modals\n', 'cyan');
  } else {
    log('⚠️  Some tests failed. Check the mock server.', 'yellow');
  }
}

// Run the tests
runTests().catch(error => {
  log(`\n✗ Test suite failed: ${error.message}`, 'red');
  process.exit(1);
});
