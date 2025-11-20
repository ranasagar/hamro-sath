#!/usr/bin/env node

/**
 * Direct SQL Migration Runner
 * Runs the advanced features migrations directly without timestamps
 */

require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs').promises;
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    log('\n✅ Connected to database', 'green');

    // Read and execute advanced features migration
    log('\n🔄 Running advanced features migration...', 'blue');
    const migrationSQL = await fs.readFile(
      path.join(__dirname, '../migrations/20251120092300_advanced_features.sql'),
      'utf8'
    );

    await client.query(migrationSQL);
    log('✅ Advanced features tables created!', 'green');

    // Read and execute seed data
    log('\n🔄 Seeding advanced features data...', 'blue');
    const seedSQL = await fs.readFile(
      path.join(__dirname, '../migrations/20251120092400_advanced_features_seed.sql'),
      'utf8'
    );

    await client.query(seedSQL);
    log('✅ Seed data loaded!', 'green');

    // Count new tables
    const result = await client.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);

    log(`\n📊 Total tables in database: ${result.rows[0].count}`, 'blue');

    log('\n🎉 Advanced features migration complete!', 'green');
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    if (error.code) {
      log(`   Code: ${error.code}`, 'yellow');
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
