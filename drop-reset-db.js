/**
 * TrueConnect Database Reset and Seed Script
 * 
 * This script resets the SQLite database and seeds it with minimal test data.
 */

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Database configuration
const dbPath = path.join(__dirname, 'backend', 'trueconnect.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Could not connect to database', err);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
});

/**
 * Promisify db.run
 */
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        console.error('Error running query:', sql);
        console.error('Error:', err);
        return reject(err);
      }
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

/**
 * Promisify db.all
 */
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('Error running query:', sql);
        console.error('Error:', err);
        return reject(err);
      }
      resolve(rows);
    });
  });
}

/**
 * Promisify db.get for a single row
 */
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        console.error('Error running query:', sql);
        console.error('Error:', err);
        return reject(err);
      }
      resolve(row);
    });
  });
}

/**
 * Utility function to hash passwords
 */
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Main function to reset and seed the database
 */
async function resetAndSeedDatabase() {
  try {
    // Disable foreign keys for dropping tables
    await run('PRAGMA foreign_keys = OFF');
    
    // Begin transaction
    await run('BEGIN TRANSACTION');
    
    console.log('Starting database reset and seeding...');
    
    // Drop tables in reverse dependency order (child tables first)
    // Note: These will throw errors if tables don't exist, which is fine
    const dropTables = [
      'event_attendees',
      'events',
      'post_reactions',
      'comment_reactions',
      'comments',
      'posts',
      'community_members',
      'conversations',
      'messages',
      'matches',
      'notification_preferences',
      'notifications',
      'reports',
      'content_moderation',
      'communities',
      'users'
    ];
    
    for (const table of dropTables) {
      try {
        await run(`DROP TABLE IF EXISTS "${table}"`);
        console.log(`Dropped table ${table}`);
      } catch (e) {
        console.warn(`Could not drop table ${table}: ${e.message}`);
      }
    }
    
    // Re-enable foreign keys
    await run('PRAGMA foreign_keys = ON');
    
    // Create schema
    console.log('Recreating database schema...');
    // We will use NestJS TypeORM synchronize to recreate the schema when the server starts
    
    // Commit transaction
    await run('COMMIT');
    
    console.log('Database has been reset successfully');
    
    // Restart the server to allow TypeORM to recreate the schema
    console.log('--------------------------------------------');
    console.log('Database has been reset. To complete the process:');
    console.log('1. Restart the NestJS server to recreate the schema');
    console.log('2. Then run node seed-test-data.js to populate with test data');
    console.log('--------------------------------------------');
    
  } catch (e) {
    // Roll back transaction in case of error
    await run('ROLLBACK');
    console.error('Error resetting database:', e);
    throw e;
  } finally {
    // Close database connection
    db.close();
  }
}

// Run the script
resetAndSeedDatabase()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error in database reset script:', err);
    process.exit(1);
  });
