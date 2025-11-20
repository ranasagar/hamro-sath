#!/usr/bin/env node

/**
 * Database Connection Tester
 *
 * Tests your DATABASE_URL connection and provides helpful feedback
 */

require('dotenv').config();
const { Client } = require('pg');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function parseConnectionString(url) {
  if (!url) return null;

  try {
    const matches = url.match(/postgresql:\/\/([^:]+):([^@]+)@([^:\/]+):?(\d+)?\/([^?]+)(\?.*)?/);
    if (!matches) return null;

    return {
      user: matches[1],
      password: matches[2],
      host: matches[3],
      port: matches[4] || '5432',
      database: matches[5],
      params: matches[6] || '',
    };
  } catch {
    return null;
  }
}

async function testConnection() {
  log('\n╔════════════════════════════════════════════════════════════════╗', 'bright');
  log('║         Database Connection Test                              ║', 'bright');
  log('╚════════════════════════════════════════════════════════════════╝\n', 'bright');

  const DATABASE_URL = process.env.DATABASE_URL;

  // Check if DATABASE_URL exists
  if (!DATABASE_URL) {
    log('❌ DATABASE_URL not found in environment variables', 'red');
    log('\n📋 Steps to fix:', 'yellow');
    log('   1. Create a .env file in the backend directory', 'yellow');
    log('   2. Add: DATABASE_URL=your_connection_string', 'yellow');
    log('   3. Run this test again\n', 'yellow');
    return;
  }

  // Check if it's a placeholder
  if (DATABASE_URL.includes('username:password') || DATABASE_URL.includes('localhost')) {
    log('⚠️  DATABASE_URL contains placeholder values', 'yellow');
    log('\nCurrent value:', 'blue');
    log(`   ${DATABASE_URL}\n`, 'magenta');

    log('📋 Get your real connection string:', 'yellow');
    log('   Neon: https://console.neon.tech/', 'yellow');
    log('   Supabase: https://supabase.com/dashboard\n', 'yellow');

    log('📖 See: DATABASE_CONNECTION_GUIDE.md for detailed instructions\n', 'blue');
    return;
  }

  // Parse and display connection info
  const parsed = parseConnectionString(DATABASE_URL);
  if (parsed) {
    log('📊 Connection Details:', 'blue');
    log(`   Host: ${parsed.host}`, 'reset');
    log(`   Port: ${parsed.port}`, 'reset');
    log(`   Database: ${parsed.database}`, 'reset');
    log(`   User: ${parsed.user}`, 'reset');
    log(`   SSL: ${parsed.params.includes('ssl') ? '✓ Enabled' : '✗ Disabled'}`, 'reset');
  }

  // Test actual connection
  log('\n🔄 Testing connection...', 'blue');

  const client = new Client({
    connectionString: DATABASE_URL,
  });

  try {
    await client.connect();
    log('✅ Connection successful!', 'green');

    // Check PostgreSQL version
    const versionResult = await client.query('SELECT version()');
    const version = versionResult.rows[0].version;
    log(`\n📌 PostgreSQL Version:`, 'blue');
    log(`   ${version.split(',')[0]}`, 'reset');

    // Check if migrations table exists
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    const tableCount = tablesResult.rows.length;
    log(`\n📊 Database Status:`, 'blue');
    log(`   Tables found: ${tableCount}`, 'reset');

    if (tableCount === 0) {
      log('\n💡 Database is empty. Run migrations:', 'yellow');
      log('   npm run db:setup', 'green');
    } else if (tableCount < 10) {
      log('\n⚠️  Some tables missing. You may need to:', 'yellow');
      log('   npm run db:migrate', 'green');
    } else {
      log('\n✅ Database appears to be set up!', 'green');

      // Show sample table names
      const tables = tablesResult.rows.map((r) => r.table_name).slice(0, 5);
      log('\n   Sample tables:', 'blue');
      tables.forEach((t) => log(`   - ${t}`, 'reset'));
      if (tableCount > 5) {
        log(`   ... and ${tableCount - 5} more`, 'reset');
      }

      // Check for seed data
      const wardsResult = await client.query('SELECT COUNT(*) FROM wards');
      const wardsCount = parseInt(wardsResult.rows[0].count);

      const badgesResult = await client.query('SELECT COUNT(*) FROM badges');
      const badgesCount = parseInt(badgesResult.rows[0].count);

      const rewardsResult = await client.query('SELECT COUNT(*) FROM rewards');
      const rewardsCount = parseInt(rewardsResult.rows[0].count);

      log('\n📦 Seed Data:', 'blue');
      log(`   Wards: ${wardsCount} (expected: 32)`, wardsCount === 32 ? 'green' : 'yellow');
      log(`   Badges: ${badgesCount} (expected: 22)`, badgesCount === 22 ? 'green' : 'yellow');
      log(`   Rewards: ${rewardsCount} (expected: 13+)`, rewardsCount >= 13 ? 'green' : 'yellow');
    }

    await client.end();

    log('\n╔════════════════════════════════════════════════════════════════╗', 'bright');
    log('║                    ✅ All Systems Go!                         ║', 'green');
    log('╚════════════════════════════════════════════════════════════════╝\n', 'bright');
  } catch (error) {
    log('❌ Connection failed!', 'red');
    log(`\n   Error: ${error.message}`, 'red');

    if (error.code === 'ENOTFOUND') {
      log('\n💡 DNS resolution failed. Check your host address.', 'yellow');
    } else if (error.code === '28P01') {
      log('\n💡 Authentication failed. Check your username and password.', 'yellow');
    } else if (error.code === 'ECONNREFUSED') {
      log('\n💡 Connection refused. Check if database is running.', 'yellow');
    } else if (error.message.includes('SSL')) {
      log('\n💡 SSL issue. Make sure your connection string includes:', 'yellow');
      log('   ?sslmode=require', 'green');
    }

    log('\n📖 See DATABASE_CONNECTION_GUIDE.md for help\n', 'blue');
    process.exit(1);
  }
}

testConnection().catch((error) => {
  log(`\n❌ Unexpected error: ${error.message}`, 'red');
  process.exit(1);
});
