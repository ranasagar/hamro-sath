#!/usr/bin/env node

/**
 * Database Setup Script
 *
 * This script helps set up the Neon database:
 * 1. Guides you to get your Neon connection string
 * 2. Runs migrations to create schema
 * 3. Seeds initial data (wards, badges, rewards)
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');

const execAsync = promisify(exec);

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function checkEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  try {
    const envContent = await fs.readFile(envPath, 'utf8');

    // Check if DATABASE_URL contains real credentials
    const dbUrlMatch = envContent.match(/DATABASE_URL=(.+)/);
    if (!dbUrlMatch || dbUrlMatch[1].includes('username:password')) {
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
}

async function displayInstructions() {
  log('\n╔════════════════════════════════════════════════════════════════╗', 'bright');
  log('║        Hamro Saath - Database Setup Instructions              ║', 'bright');
  log('╚════════════════════════════════════════════════════════════════╝\n', 'bright');

  log('📋 STEPS TO GET YOUR NEON DATABASE CONNECTION STRING:\n', 'blue');

  log('1. Go to: https://console.neon.tech/', 'yellow');
  log('2. Select your project (or create a new one)', 'yellow');
  log('3. Click "Connection Details" or "Dashboard"', 'yellow');
  log('4. Copy the "Connection String" (it starts with postgresql://)', 'yellow');
  log('5. The format looks like:', 'yellow');
  log('   postgresql://user:password@host.neon.tech/database?sslmode=require\n', 'green');

  log('6. Update your backend/.env file:', 'yellow');
  log('   DATABASE_URL=<paste your connection string here>\n', 'green');

  log('7. Then run this script again: npm run db:setup\n', 'yellow');

  log('💡 TIP: Make sure to keep sslmode=require at the end!\n', 'blue');
}

async function runMigrations() {
  log('\n🔄 Running database migrations...', 'blue');

  try {
    const { stdout, stderr } = await execAsync('npm run migrate up', {
      cwd: path.join(__dirname, '..'),
    });

    if (stderr && !stderr.includes('warning')) {
      log(`⚠️  Migration warnings: ${stderr}`, 'yellow');
    }

    log('✅ Migrations completed successfully!', 'green');
    log(stdout, 'reset');
    return true;
  } catch (error) {
    log('❌ Migration failed:', 'red');
    log(error.message, 'red');
    return false;
  }
}

async function checkMigrationStatus() {
  log('\n📊 Checking migration status...', 'blue');

  try {
    const { stdout } = await execAsync('npm run migrate -- status', {
      cwd: path.join(__dirname, '..'),
    });

    log(stdout, 'reset');
    return true;
  } catch (error) {
    log('⚠️  Could not check migration status', 'yellow');
    return false;
  }
}

async function main() {
  log('\n🚀 Starting Hamro Saath Database Setup...\n', 'bright');

  // Check if .env has valid credentials
  const hasValidEnv = await checkEnvFile();

  if (!hasValidEnv) {
    log('⚠️  No valid DATABASE_URL found in .env file', 'yellow');
    await displayInstructions();
    process.exit(0);
  }

  log('✅ Valid DATABASE_URL found in .env', 'green');

  // Run migrations
  const migrationSuccess = await runMigrations();

  if (!migrationSuccess) {
    log('\n❌ Setup failed. Please check the error messages above.', 'red');
    process.exit(1);
  }

  // Check migration status
  await checkMigrationStatus();

  log('\n╔════════════════════════════════════════════════════════════════╗', 'bright');
  log('║                    ✅ Setup Complete!                          ║', 'green');
  log('╚════════════════════════════════════════════════════════════════╝\n', 'bright');

  log('Your database is now ready with:', 'green');
  log('  ✓ 32 Wards of Kathmandu', 'green');
  log('  ✓ Badge system (22 badges)', 'green');
  log('  ✓ Rewards catalog (13 rewards)', 'green');
  log('  ✓ All necessary tables and indexes\n', 'green');

  log('Next steps:', 'blue');
  log('  1. Create an admin user (via API or directly in Neon console)', 'yellow');
  log('  2. Start the backend: npm run dev', 'yellow');
  log('  3. Test the API endpoints\n', 'yellow');

  log('📚 API Documentation: backend/API_QUICK_REFERENCE.md\n', 'blue');
}

main().catch((error) => {
  log(`\n❌ Unexpected error: ${error.message}`, 'red');
  process.exit(1);
});
