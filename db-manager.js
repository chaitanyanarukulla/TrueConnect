/**
 * TrueConnect Database Manager
 * 
 * A comprehensive utility script for managing the TrueConnect database.
 * This script combines functionality from multiple database scripts:
 * - Database diagnostics (from db-diagnostics.js)
 * - Database reset (from drop-reset-db.js)
 * - Database seeding (from seed.js)
 * - Connection testing (from test-db-connection.js)
 * - API connection testing (from test-api-connection.js)
 * 
 * Usage:
 * node db-manager.js [command]
 * 
 * Commands:
 * - diagnose: Run diagnostics on the database structure
 * - reset: Reset the database by dropping all tables
 * - seed: Seed the database with test data
 * - test-db: Test database connections
 * - test-api: Test API connections
 * - fix: Apply fixes to common database issues
 * - all: Reset, then seed the database
 */

const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

// Database configuration
const dbPath = path.join(__dirname, 'backend', 'trueconnect.sqlite');
const log = (...args) => console.log('[DB Manager]', ...args);

// Command line arguments
const command = process.argv[2] || 'help';

// Main function
async function main() {
  log('TrueConnect Database Manager');
  log('==========================');
  
  switch (command) {
    case 'diagnose':
      await diagnoseDatabaseStructure();
      break;
    case 'reset':
      await resetDatabase();
      break;
    case 'seed':
      await seedDatabase();
      break;
    case 'test-db':
      await testDatabaseConnection();
      break;
    case 'test-api':
      await testApiConnection();
      break;
    case 'fix':
      await fixDatabaseIssues();
      break;
    case 'fix-events':
      log('Running events table fix script...');
      await exec(`node ${path.join(__dirname, 'fix-events-table.js')}`);
      log('Events table fix completed.');
      break;
    case 'update-schema':
      log('Running schema update script...');
      await exec(`node ${path.join(__dirname, 'db-update-schema.js')}`);
      log('Schema update completed.');
      break;
    case 'all':
      await resetDatabase();
      log('Database reset complete. Waiting for schema recreation...');
      log('Please restart the NestJS server to recreate the schema.');
      log('After server restart, run "node db-manager.js seed" to populate with test data.');
      break;
    case 'help':
    default:
      showHelp();
      break;
  }
}

/**
 * Show help information
 */
function showHelp() {
  log('Available commands:');
  log('  diagnose       - Run diagnostics on the database structure');
  log('  reset          - Reset the database by dropping all tables');
  log('  seed           - Seed the database with test data');
  log('  test-db        - Test database connections');
  log('  test-api       - Test API connections');
  log('  fix            - Apply fixes to common database issues');
  log('  fix-events     - Add missing columns to the events table');
  log('  update-schema  - Update database schema to add missing columns');
  log('  all            - Reset, then seed the database');
  log('  help           - Show this help message');
  log('');
  log('Example: node db-manager.js diagnose');
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
 * Promisify db.get for a single row
 */
function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        log('Error running query:', sql);
        log('Error:', err);
        return reject(err);
      }
      resolve(row);
    });
  });
}

/**
 * Check if a table exists in the database
 */
async function tableExists(db, tableName) {
  try {
    const result = await get(db, 
      "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
      [tableName]
    );
    return !!result;
  } catch (error) {
    log('Error checking if table exists:', error);
    return false;
  }
}

/**
 * Get all tables in the database
 */
async function listTables(db) {
  try {
    const tables = await all(db, "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
    return tables.map(t => t.name);
  } catch (error) {
    log('Error listing tables:', error);
    return [];
  }
}

/**
 * Diagnose database structure
 */
async function diagnoseDatabaseStructure() {
  log('Running database structure diagnostics...');
  
  let db;
  try {
    db = await connectToDatabase();
    
    // Enable foreign keys
    await run(db, 'PRAGMA foreign_keys = ON');
    
    // List all tables
    const tables = await listTables(db);
    log("=== Database Tables ===");
    tables.forEach(table => log(table));
    
    // For each table
    for (const table of tables) {
      // Show structure
      log(`\n=== Structure of table ${table} ===`);
      const columns = await all(db, `PRAGMA table_info(${table})`);
      columns.forEach(col => {
        log(`${col.name} (${col.type})${col.pk ? ' PRIMARY KEY' : ''}${col.notnull ? ' NOT NULL' : ''}`);
      });
      
      // Show foreign keys
      log(`\n=== Foreign Keys for table ${table} ===`);
      const foreignKeys = await all(db, `PRAGMA foreign_key_list(${table})`);
      if (foreignKeys.length === 0) {
        log(`No foreign keys found for table ${table}`);
      } else {
        foreignKeys.forEach(fk => {
          log(`${fk.from} -> ${fk.table}(${fk.to}) on delete: ${fk.on_delete || 'NO ACTION'}`);
        });
      }
      
      // Show unique constraints
      log(`\n=== Unique Constraints for table ${table} ===`);
      try {
        const indexes = await all(db, `PRAGMA index_list(${table})`);
        
        for (const index of indexes) {
          if (index.unique) {
            const indexInfo = await all(db, `PRAGMA index_info(${index.name})`);
            const columns = indexInfo.map(ii => ii.name).join(', ');
            log(`Unique constraint: ${index.name} on columns (${columns})`);
          }
        }
      } catch (error) {
        log(`Error getting unique constraints for ${table}:`, error);
      }
      
      // Show sample data
      log(`\n=== Sample data from table ${table} (5 rows) ===`);
      try {
        const rows = await all(db, `SELECT * FROM ${table} LIMIT 5`);
        if (rows.length === 0) {
          log(`No data found in table ${table}`);
        } else {
          log(JSON.stringify(rows, null, 2));
        }
      } catch (error) {
        log(`Error querying table ${table}:`, error);
      }
    }
    
    log('\nDiagnostics completed successfully');
  } catch (error) {
    log('Error diagnosing database structure:', error);
  } finally {
    if (db) db.close();
  }
}

/**
 * Reset the database by dropping all tables
 */
async function resetDatabase() {
  log('Resetting database...');
  
  let db;
  try {
    db = await connectToDatabase();
    
    // Disable foreign keys for dropping tables
    await run(db, 'PRAGMA foreign_keys = OFF');
    
    // Begin transaction
    await run(db, 'BEGIN TRANSACTION');
    
    // Drop tables in reverse dependency order (child tables first)
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
        await run(db, `DROP TABLE IF EXISTS "${table}"`);
        log(`Dropped table ${table}`);
      } catch (e) {
        log(`Could not drop table ${table}: ${e.message}`);
      }
    }
    
    // Re-enable foreign keys
    await run(db, 'PRAGMA foreign_keys = ON');
    
    // Commit transaction
    await run(db, 'COMMIT');
    
    log('Database has been reset successfully');
    log('--------------------------------------------');
    log('To complete the process:');
    log('1. Restart the NestJS server to recreate the schema');
    log('2. Then run node db-manager.js seed to populate with test data');
    log('--------------------------------------------');
    
  } catch (error) {
    // Roll back transaction in case of error
    if (db) await run(db, 'ROLLBACK');
    log('Error resetting database:', error);
  } finally {
    if (db) db.close();
  }
}

/**
 * Seed the database with test data
 */
async function seedDatabase() {
  log('Seeding database...');
  
  try {
    // Check if all required tables exist
    const db = await connectToDatabase();
    const requiredTables = ['users', 'communities', 'community_members', 'events', 'event_attendees'];
    let missingTables = [];
    
    for (const table of requiredTables) {
      const exists = await tableExists(db, table);
      if (!exists) {
        missingTables.push(table);
      }
    }
    
    if (missingTables.length > 0) {
      log(`Error: The following required tables are missing: ${missingTables.join(', ')}`);
      log('Please follow these steps to complete the setup:');
      log('1. Run "node db-manager.js reset" to reset the database');
      log('2. Restart the NestJS server to recreate the schema:');
      log('   cd backend && npm run start:dev');
      log('3. After server has started and schema is created, run "node db-manager.js seed" again');
      db.close();
      return;
    }
    
    db.close();
    
    // Run the seed.js script
    await exec(`node ${path.join(__dirname, 'seeds', 'index.js')}`);
    log('Database seeded successfully');
  } catch (error) {
    log('Error seeding database:', error);
    if (error.stderr && error.stderr.includes('does not exist in the database')) {
      log('\nThe database schema is not set up correctly.');
      log('Please follow these steps:');
      log('1. Run "node db-manager.js reset" to reset the database');
      log('2. Restart the NestJS server to recreate the schema:');
      log('   cd backend && npm run start:dev');
      log('3. After server has started and schema is created, run "node db-manager.js seed" again');
    }
  }
}

/**
 * Test database connection
 */
async function testDatabaseConnection() {
  log('Testing database connection...');
  
  let db;
  try {
    db = await connectToDatabase();
    
    // Check if tables exist
    log('Verifying database schema...');
    const tables = await listTables(db);
    
    log(`Found ${tables.length} tables in the database:`);
    tables.forEach(table => log(`- ${table}`));
    
    if (tables.includes('users')) {
      // Count users
      const userCount = await get(db, 'SELECT COUNT(*) as count FROM users');
      log(`Found ${userCount.count} users in the database`);
      
      // Get sample user data
      if (userCount.count > 0) {
        const users = await all(db, 'SELECT id, name, email FROM users LIMIT 3');
        log('Sample user data:');
        users.forEach(user => {
          log(`- ${user.name} (${user.email})`);
        });
      }
    } else {
      log('Users table not found in the database');
    }
    
    if (tables.includes('communities')) {
      // Count communities
      const communityCount = await get(db, 'SELECT COUNT(*) as count FROM communities');
      log(`Found ${communityCount.count} communities in the database`);
      
      // Get sample community data
      if (communityCount.count > 0) {
        const communities = await all(db, 'SELECT id, name FROM communities LIMIT 3');
        log('Sample community data:');
        communities.forEach(community => {
          log(`- ${community.name}`);
        });
      }
    } else {
      log('Communities table not found in the database');
    }
    
    log('Database connection test completed successfully');
  } catch (error) {
    log('Error testing database connection:', error);
  } finally {
    if (db) db.close();
  }
}

/**
 * Test API connection
 */
async function testApiConnection() {
  log('Testing API connection...');
  
  try {
    // Run the test-api-connection.js script
    await exec('node ./test-api-connection.js');
    log('API connection test completed');
  } catch (error) {
    log('Error testing API connection:', error);
  }
}

/**
 * Fix database issues
 */
async function fixDatabaseIssues() {
  log('Fixing database issues...');
  
  let db;
  try {
    db = await connectToDatabase();
    
    // Enable foreign keys
    await run(db, 'PRAGMA foreign_keys = ON');
    
    // Begin transaction
    await run(db, 'BEGIN TRANSACTION');
    
    // Check community_members table
    if (await tableExists(db, 'community_members')) {
      const columns = await all(db, 'PRAGMA table_info(community_members)');
      const columnNames = columns.map(col => col.name);
      
      log('Community members columns:', columnNames);
      
      // Fix issue with joinedAt vs createdAt
      if (!columnNames.includes('joinedAt') && columnNames.includes('createdAt')) {
        log('Renaming createdAt to joinedAt in community_members table');
        await run(db, 'ALTER TABLE community_members RENAME COLUMN "createdAt" TO "joinedAt"');
      } else if (!columnNames.includes('joinedAt') && !columnNames.includes('createdAt')) {
        log('Adding joinedAt column to community_members table');
        await run(db, 'ALTER TABLE community_members ADD COLUMN "joinedAt" DATETIME');
      }
    }
    
    // Commit transaction
    await run(db, 'COMMIT');
    
    log('Database fixes applied successfully');
  } catch (error) {
    // Roll back transaction in case of error
    if (db) await run(db, 'ROLLBACK');
    log('Error fixing database issues:', error);
  } finally {
    if (db) db.close();
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
