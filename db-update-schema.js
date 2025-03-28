/**
 * TrueConnect Database Schema Update Script
 * 
 * This script updates the database schema to add missing columns required by the application.
 * It's called by the db-manager.js script when running the 'update-schema' command.
 */

const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');

// Database configuration
const dbPath = path.join(__dirname, 'backend', 'trueconnect.sqlite');
const log = (...args) => console.log('[Schema Update]', ...args);

// Main function
async function main() {
  log('Starting schema update...');
  
  let db;
  try {
    db = await connectToDatabase();
    
    // Begin transaction
    await run(db, 'BEGIN TRANSACTION');
    
    // Check and update events table
    await checkAndUpdateEventsTable(db);
    
    // Check and update community_members table
    await checkAndUpdateCommunityMembersTable(db);
    
    // Check and update other tables as needed
    // Add more table checks here as needed
    
    // Commit transaction
    await run(db, 'COMMIT');
    
    log('Schema update completed successfully');
  } catch (error) {
    if (db) await run(db, 'ROLLBACK');
    log('Error updating schema:', error);
    throw error;
  } finally {
    if (db) db.close();
  }
}

/**
 * Connect to the database
 */
function connectToDatabase() {
  return new Promise((resolve, reject) => {
    log('Connecting to database at:', dbPath);
    
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        log('Could not connect to database:', err);
        reject(err);
        return;
      }
      log('Connected to SQLite database');
      resolve(db);
    });
  });
}

/**
 * Promisify db.run
 */
function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        log('Error running query:', sql);
        log('Error:', err);
        return reject(err);
      }
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

/**
 * Promisify db.all
 */
function all(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        log('Error running query:', sql);
        log('Error:', err);
        return reject(err);
      }
      resolve(rows);
    });
  });
}

/**
 * Check if a column exists in a table
 */
async function columnExists(db, tableName, columnName) {
  try {
    const columns = await all(db, `PRAGMA table_info(${tableName})`);
    return columns.some(column => column.name === columnName);
  } catch (error) {
    log(`Error checking if column ${columnName} exists in table ${tableName}:`, error);
    return false;
  }
}

/**
 * Check if a table exists in the database
 */
async function tableExists(db, tableName) {
  try {
    const result = await all(db, 
      "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
      [tableName]
    );
    return result.length > 0;
  } catch (error) {
    log('Error checking if table exists:', error);
    return false;
  }
}

/**
 * Check and update the events table schema
 */
async function checkAndUpdateEventsTable(db) {
  log('Checking events table schema...');
  
  // Check if events table exists
  if (!(await tableExists(db, 'events'))) {
    log('Events table does not exist yet, skipping update');
    return;
  }
  
  // Add creatorId column if it doesn't exist
  if (!(await columnExists(db, 'events', 'creatorId'))) {
    log('Adding creatorId column to events table');
    await run(db, `ALTER TABLE events ADD COLUMN creatorId TEXT REFERENCES users(id)`);
    
    // Set default values for existing rows
    // Get a random user ID to set as creator for existing events
    const users = await all(db, 'SELECT id FROM users LIMIT 1');
    if (users.length > 0) {
      const defaultUserId = users[0].id;
      log(`Setting default creatorId (${defaultUserId}) for existing events`);
      await run(db, 'UPDATE events SET creatorId = ? WHERE creatorId IS NULL', [defaultUserId]);
    }
  }
  
  // Add latitude column if it doesn't exist
  if (!(await columnExists(db, 'events', 'latitude'))) {
    log('Adding latitude column to events table');
    await run(db, 'ALTER TABLE events ADD COLUMN latitude REAL');
  }
  
  // Add longitude column if it doesn't exist
  if (!(await columnExists(db, 'events', 'longitude'))) {
    log('Adding longitude column to events table');
    await run(db, 'ALTER TABLE events ADD COLUMN longitude REAL');
  }
  
  // Add viewCount column if it doesn't exist
  if (!(await columnExists(db, 'events', 'viewCount'))) {
    log('Adding viewCount column to events table');
    await run(db, 'ALTER TABLE events ADD COLUMN viewCount INTEGER DEFAULT 0');
  }
  
  // Add shareCount column if it doesn't exist
  if (!(await columnExists(db, 'events', 'shareCount'))) {
    log('Adding shareCount column to events table');
    await run(db, 'ALTER TABLE events ADD COLUMN shareCount INTEGER DEFAULT 0');
  }
  
  // Add popularityScore column if it doesn't exist
  if (!(await columnExists(db, 'events', 'popularityScore'))) {
    log('Adding popularityScore column to events table');
    await run(db, 'ALTER TABLE events ADD COLUMN popularityScore INTEGER DEFAULT 0');
  }
  
  // Add settings column if it doesn't exist
  if (!(await columnExists(db, 'events', 'settings'))) {
    log('Adding settings column to events table');
    await run(db, 'ALTER TABLE events ADD COLUMN settings TEXT');
  }
  
  // Add tags column if it doesn't exist
  if (!(await columnExists(db, 'events', 'tags'))) {
    log('Adding tags column to events table');
    await run(db, 'ALTER TABLE events ADD COLUMN tags TEXT');
  }
  
  log('Events table schema check completed');
}

/**
 * Check and update the community_members table schema
 */
async function checkAndUpdateCommunityMembersTable(db) {
  log('Checking community_members table schema...');
  
  // Check if community_members table exists
  if (!(await tableExists(db, 'community_members'))) {
    log('Community members table does not exist yet, skipping update');
    return;
  }
  
  // Check for joinedAt vs createdAt column
  const hasJoinedAt = await columnExists(db, 'community_members', 'joinedAt');
  const hasCreatedAt = await columnExists(db, 'community_members', 'createdAt');
  
  if (!hasJoinedAt && hasCreatedAt) {
    log('Renaming createdAt to joinedAt in community_members table');
    
    // Create temporary table with correct structure
    await run(db, `
      CREATE TABLE community_members_temp (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        communityId TEXT NOT NULL,
        role TEXT NOT NULL,
        isActive INTEGER NOT NULL,
        joinedAt DATETIME,
        updatedAt DATETIME,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (communityId) REFERENCES communities(id)
      )
    `);
    
    // Copy data with column rename
    await run(db, `
      INSERT INTO community_members_temp
      SELECT id, userId, communityId, role, isActive, createdAt as joinedAt, updatedAt
      FROM community_members
    `);
    
    // Drop old table and rename new one
    await run(db, 'DROP TABLE community_members');
    await run(db, 'ALTER TABLE community_members_temp RENAME TO community_members');
    
  } else if (!hasJoinedAt && !hasCreatedAt) {
    log('Adding joinedAt column to community_members table');
    await run(db, 'ALTER TABLE community_members ADD COLUMN joinedAt DATETIME');
    await run(db, 'UPDATE community_members SET joinedAt = CURRENT_TIMESTAMP WHERE joinedAt IS NULL');
  }
  
  log('Community members table schema check completed');
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
