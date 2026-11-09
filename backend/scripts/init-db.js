/**
 * Database Initialization Script
 * Executes schema.sql against the configured PostgreSQL instance (Local, AWS EC2, or AWS RDS).
 */

const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function initDatabase() {
  console.log('🚀 Initializing PostgreSQL Database Schema...');
  const schemaPath = path.join(__dirname, '../db/schema.sql');
  
  if (!fs.existsSync(schemaPath)) {
    console.error(`❌ Schema file not found at ${schemaPath}`);
    process.exit(1);
  }

  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  try {
    const health = await db.testConnection();
    if (!health.success) {
      throw new Error(health.error);
    }

    console.log('📄 Executing DDL Schema statements...');
    await db.query(schemaSql);
    console.log('✅ PostgreSQL Schema initialized successfully! All tables & indexes ready.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Database initialization failed:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;
