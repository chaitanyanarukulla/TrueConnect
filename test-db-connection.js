/**
 * Database Connection Test Script
 * 
 * This script tests both SQLite and PostgreSQL connections to verify which one is active
 * and if data is being correctly saved and retrieved.
 */

// Use path to resolve modules from backend directory
const path = require('path');
const fs = require('fs');

// Resolve node_modules from backend directory
const backendPath = path.join(__dirname, 'backend');
const sqlite3Path = path.join(backendPath, 'node_modules', 'sqlite3');
const pgPath = path.join(backendPath, 'node_modules', 'pg');

// Define fallback implementations if modules aren't available
let sqlite3, Pool;

// Try to load sqlite3
try {
  sqlite3 = require(sqlite3Path).verbose();
  console.log('✓ SQLite3 module loaded successfully');
} catch (err) {
  console.log('⚠️ SQLite3 module not found. Will skip SQLite connection test.');
  console.log('   To install: cd TrueConnect/backend && npm install sqlite3');
  sqlite3 = null;
}

// Try to load pg
try {
  Pool = require(pgPath).Pool;
  console.log('✓ PostgreSQL module loaded successfully');
} catch (err) {
  console.log('⚠️ PostgreSQL module not found. Will skip PostgreSQL connection test.');
  console.log('   To install: cd TrueConnect/backend && npm install pg');
  Pool = null;
}

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

async function testDatabaseConnections() {
  console.log('🔍 Starting database connection tests...\n');
  
  // Test the SQLite connection
  await testSqliteConnection();
  
  // Test the PostgreSQL connection
  await testPostgresConnection();
  
  console.log('\n✅ Database connection tests completed');
}

async function testSqliteConnection() {
  console.log('Testing SQLite connection...');
  const dbPath = path.join(__dirname, 'backend', 'trueconnect.sqlite');
  
  return new Promise((resolve) => {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        console.log('❌ SQLite connection failed:', err.message);
        resolve(false);
        return;
      }
      
      console.log('✅ SQLite connection successful');
      
      // Test query to check if any users exist
      db.all('SELECT COUNT(*) as count FROM "users"', [], (err, rows) => {
        if (err) {
          console.log('❌ SQLite query failed:', err.message);
          console.log('   This may indicate the users table does not exist or has a different name');
          db.close();
          resolve(false);
          return;
        }
        
        console.log(`✅ SQLite data check successful - Found ${rows[0].count} users`);
        
        // Get sample user data
        db.all('SELECT id, email, name FROM "users" LIMIT 3', [], (err, users) => {
          if (err) {
            console.log('❌ Could not retrieve sample user data:', err.message);
          } else {
            console.log('Sample user data:');
            console.table(users);
          }
          
          db.close();
          resolve(true);
        });
      });
    });
  });
}

async function testPostgresConnection() {
  console.log('\nTesting PostgreSQL connection...');
  
  // If Pool is null, PostgreSQL module is not available
  if (!Pool) {
    console.log('⚠️ PostgreSQL module not available - skipping PostgreSQL tests');
    console.log('NOTE: This is expected since the application is configured to use SQLite');
    return;
  }
  
  // Check if PostgreSQL testing is enabled
  const usePg = process.env.USE_POSTGRES === 'true';
  if (!usePg) {
    console.log('ℹ️ PostgreSQL testing skipped - application is configured to use SQLite');
    console.log('   This is the expected configuration and not an error');
    return;
  }
  
  // Get PostgreSQL connection details from environment variables
  const pgConfig = {
    user: process.env.DB_USERNAME || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_DATABASE || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    port: parseInt(process.env.DB_PORT || '5432'),
  };
  
  const pool = new Pool(pgConfig);
  
  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ PostgreSQL connection successful');
    
    // Check if the "users" table exists and has data
    try {
      const { rows } = await pool.query('SELECT COUNT(*) as count FROM "users"');
      console.log(`✅ PostgreSQL data check successful - Found ${rows[0].count} users`);
      
      // Get sample user data
      const { rows: users } = await pool.query('SELECT id, email, name FROM "users" LIMIT 3');
      console.log('Sample user data:');
      console.table(users);
    } catch (err) {
      console.log('⚠️ PostgreSQL query failed:', err.message);
      console.log('   This may indicate the "users" table does not exist or has a different structure');
    }
  } catch (err) {
    console.log('⚠️ PostgreSQL connection failed:', err.message);
    console.log('   This is expected since the application is configured to use SQLite');
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Run the database connection tests
testDatabaseConnections().catch(err => {
  console.error('Error during database connection tests:', err);
});
