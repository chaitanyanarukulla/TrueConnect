/**
 * TrueConnect Database Fix Script
 * 
 * This script fixes common database schema issues and seeds minimal test data.
 */

const sqlite3 = require('sqlite3').verbose();
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

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

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
 * Check if a table exists
 */
async function tableExists(tableName) {
  try {
    const result = await get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
      [tableName]
    );
    return !!result;
  } catch (error) {
    console.error('Error checking if table exists:', error);
    return false;
  }
}

/**
 * Get table columns
 */
async function getTableColumns(tableName) {
  try {
    const result = await all(`PRAGMA table_info(${tableName})`);
    return result.map(col => col.name);
  } catch (error) {
    console.error(`Error getting columns for table ${tableName}:`, error);
    return [];
  }
}

/**
 * Main function
 */
async function fixDatabaseIssues() {
  try {
    // Begin transaction
    await run('BEGIN TRANSACTION');
    
    console.log('Starting database fixes...');
    
    // Check community_members table
    if (await tableExists('community_members')) {
      const columns = await getTableColumns('community_members');
      console.log('Community members columns:', columns);
      
      // Fix issue with joinedAt vs createdAt
      if (!columns.includes('joinedAt') && columns.includes('createdAt')) {
        console.log('Renaming createdAt to joinedAt in community_members table');
        await run('ALTER TABLE community_members RENAME COLUMN "createdAt" TO "joinedAt"');
      } else if (!columns.includes('joinedAt') && !columns.includes('createdAt')) {
        console.log('Adding joinedAt column to community_members table');
        await run('ALTER TABLE community_members ADD COLUMN "joinedAt" DATETIME');
      }
    }
    
    // Handle profiles vs users table
    if (!await tableExists('profiles')) {
      console.log('Profiles table does not exist, skipping profiles operations');
    }
    
    // Create a test user in users table 
    if (await tableExists('users')) {
      try {
        // First check if test user already exists
        const existingUser = await get('SELECT * FROM users WHERE id = ?', ['test-user-fix']);
        if (!existingUser) {
          console.log('Creating test user...');
          
          const userColumns = await getTableColumns('users');
          console.log('Users columns:', userColumns);
          
          // Build a dynamic query with available columns
          const insertColumns = ['id', 'email', 'password'];
          const insertValues = ['test-user-fix', 'test@example.com', '$2b$10$abcdefghijklmnopqrstuv'];
          const placeholders = ['?', '?', '?'];
          
          // Add name fields
          if (userColumns.includes('name')) {
            insertColumns.push('name');
            insertValues.push('Test User');
            placeholders.push('?');
          } else if (userColumns.includes('firstName') && userColumns.includes('lastName')) {
            insertColumns.push('firstName', 'lastName');
            insertValues.push('Test', 'User');
            placeholders.push('?', '?');
          }
          
          // Add timestamp fields - these usually need to be inserted as string literals
          let query = `INSERT INTO users (${insertColumns.join(', ')})`;
          
          // Handle timestamps
          if (userColumns.includes('createdAt')) {
            insertColumns.push('"createdAt"');
            query += ', datetime("now")';
          }
          
          if (userColumns.includes('updatedAt')) {
            insertColumns.push('"updatedAt"');
            query += ', datetime("now")';
          }
          
          query += ` VALUES (${placeholders.join(', ')})`;
          
          // Execute the query
          await run(query, insertValues);
          console.log('Test user created successfully');
        } else {
          console.log('Test user already exists');
        }
      } catch (e) {
        console.error('Error creating test user:', e);
      }
    }
    
    // Create a test community
    if (await tableExists('communities')) {
      try {
        // Check if test community already exists
        const existingCommunity = await get('SELECT * FROM communities WHERE id = ?', ['test-community-fix']);
        if (!existingCommunity) {
          console.log('Creating test community...');
          
          const communityColumns = await getTableColumns('communities');
          console.log('Communities columns:', communityColumns);
          
          // Build a dynamic query with available columns
          const insertColumns = ['id', 'name', 'description'];
          const insertValues = [
            'test-community-fix', 
            'Test Community', 
            'A test community for development purposes'
          ];
          const placeholders = ['?', '?', '?'];
          
          // Add creatorId if it exists
          if (communityColumns.includes('creatorId')) {
            insertColumns.push('"creatorId"');
            insertValues.push('test-user-fix');
            placeholders.push('?');
          }
          
          // Add tags if it exists
          if (communityColumns.includes('tags')) {
            insertColumns.push('tags');
            insertValues.push(JSON.stringify(['test', 'development']));
            placeholders.push('?');
          }
          
          // Execute the query
          const query = `INSERT INTO communities (${insertColumns.join(', ')}) VALUES (${placeholders.join(', ')})`;
          await run(query, insertValues);
          console.log('Test community created successfully');
        } else {
          console.log('Test community already exists');
        }
      } catch (e) {
        console.error('Error creating test community:', e);
      }
    }
    
    // Add test user to test community
    if (await tableExists('community_members')) {
      try {
        // Check if membership already exists
        const existingMembership = await get(
          'SELECT * FROM community_members WHERE "userId" = ? AND "communityId" = ?', 
          ['test-user-fix', 'test-community-fix']
        );
        
        if (!existingMembership) {
          console.log('Creating test community membership...');
          
          const memberColumns = await getTableColumns('community_members');
          
          // Build a dynamic query with available columns
          const insertColumns = ['id'];
          const insertValues = [uuidv4()];
          const placeholders = ['?'];
          
          // Add userId and communityId
          if (memberColumns.includes('userId')) {
            insertColumns.push('"userId"');
            insertValues.push('test-user-fix');
            placeholders.push('?');
          }
          
          if (memberColumns.includes('communityId')) {
            insertColumns.push('"communityId"');
            insertValues.push('test-community-fix');
            placeholders.push('?');
          }
          
          // Add role if it exists
          if (memberColumns.includes('role')) {
            insertColumns.push('role');
            insertValues.push('admin');
            placeholders.push('?');
          }
          
          // Execute the query
          const query = `INSERT INTO community_members (${insertColumns.join(', ')}) VALUES (${placeholders.join(', ')})`;
          await run(query, insertValues);
          console.log('Test community membership created successfully');
        } else {
          console.log('Test community membership already exists');
        }
      } catch (e) {
        console.error('Error creating test community membership:', e);
      }
    }
    
    console.log('Database fixes completed successfully!');
    
    // Display table structure for troubleshooting
    if (await tableExists('community_members')) {
      console.log('\nCommunity members table structure:');
      const structure = await all('PRAGMA table_info(community_members)');
      console.log(structure);
    }
    
    // Commit transaction
    await run('COMMIT');
    
    console.log('All fixes applied successfully');
    
  } catch (e) {
    // Roll back transaction in case of error
    await run('ROLLBACK');
    console.error('Error fixing database issues:', e);
  } finally {
    // Close database connection
    db.close();
  }
}

// Run the script
fixDatabaseIssues()
  .then(() => {
    console.log('Database repair complete');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error in database repair script:', err);
    process.exit(1);
  });
