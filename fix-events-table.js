/**
 * Fix Events Table Script
 * 
 * This script adds missing columns to the events table to match the structure
 * expected by the seed scripts. It adds the following columns:
 * - latitude (REAL)
 * - longitude (REAL)
 * - viewCount (INTEGER)
 * - shareCount (INTEGER)
 * - popularityScore (INTEGER)
 * - settings (TEXT)
 * - tags (TEXT)
 * - category (TEXT)
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'backend', 'trueconnect.sqlite');
console.log('Database path:', dbPath);

// Connect to the database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    process.exit(1);
  }
  console.log('Connected to database');
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Begin transaction
db.run('BEGIN TRANSACTION', (err) => {
  if (err) {
    console.error('Error beginning transaction:', err);
    db.close();
    process.exit(1);
  }

  console.log('Adding missing columns to events table...');

  // Add latitude column
  db.run('ALTER TABLE events ADD COLUMN latitude REAL', (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding latitude column:', err);
      db.run('ROLLBACK');
      db.close();
      process.exit(1);
    }
    console.log('Added latitude column (or it already exists)');

    // Add longitude column
    db.run('ALTER TABLE events ADD COLUMN longitude REAL', (err) => {
      if (err && !err.message.includes('duplicate column')) {
        console.error('Error adding longitude column:', err);
        db.run('ROLLBACK');
        db.close();
        process.exit(1);
      }
      console.log('Added longitude column (or it already exists)');

      // Add viewCount column
      db.run('ALTER TABLE events ADD COLUMN viewCount INTEGER DEFAULT 0', (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Error adding viewCount column:', err);
          db.run('ROLLBACK');
          db.close();
          process.exit(1);
        }
        console.log('Added viewCount column (or it already exists)');

        // Add shareCount column
        db.run('ALTER TABLE events ADD COLUMN shareCount INTEGER DEFAULT 0', (err) => {
          if (err && !err.message.includes('duplicate column')) {
            console.error('Error adding shareCount column:', err);
            db.run('ROLLBACK');
            db.close();
            process.exit(1);
          }
          console.log('Added shareCount column (or it already exists)');

          // Add popularityScore column
          db.run('ALTER TABLE events ADD COLUMN popularityScore INTEGER DEFAULT 0', (err) => {
            if (err && !err.message.includes('duplicate column')) {
              console.error('Error adding popularityScore column:', err);
              db.run('ROLLBACK');
              db.close();
              process.exit(1);
            }
            console.log('Added popularityScore column (or it already exists)');

            // Add settings column
            db.run('ALTER TABLE events ADD COLUMN settings TEXT', (err) => {
              if (err && !err.message.includes('duplicate column')) {
                console.error('Error adding settings column:', err);
                db.run('ROLLBACK');
                db.close();
                process.exit(1);
              }
              console.log('Added settings column (or it already exists)');

              // Add tags column
              db.run('ALTER TABLE events ADD COLUMN tags TEXT', (err) => {
                if (err && !err.message.includes('duplicate column')) {
                  console.error('Error adding tags column:', err);
                  db.run('ROLLBACK');
                  db.close();
                  process.exit(1);
                }
                console.log('Added tags column (or it already exists)');

                // Add category column
                db.run('ALTER TABLE events ADD COLUMN category TEXT', (err) => {
                  if (err && !err.message.includes('duplicate column')) {
                    console.error('Error adding category column:', err);
                    db.run('ROLLBACK');
                    db.close();
                    process.exit(1);
                  }
                  console.log('Added category column (or it already exists)');
                
                  // Check if creatorId column exists
                  db.all('PRAGMA table_info(events)', (err, columns) => {
                    if (err) {
                      console.error('Error getting table info:', err);
                      db.run('ROLLBACK');
                      db.close();
                      process.exit(1);
                    }

                    const hasCreatorId = columns.some(col => col.name === 'creatorId');
                    
                    if (!hasCreatorId) {
                      // Add creatorId column
                      db.run('ALTER TABLE events ADD COLUMN creatorId TEXT REFERENCES users(id)', (err) => {
                        if (err && !err.message.includes('duplicate column')) {
                          console.error('Error adding creatorId column:', err);
                          db.run('ROLLBACK');
                          db.close();
                          process.exit(1);
                        }
                        console.log('Added creatorId column');

                        // Set a default creatorId for existing rows
                        db.all('SELECT id FROM users LIMIT 1', (err, users) => {
                          if (err || users.length === 0) {
                            console.log('No users found or error getting users, skipping default creatorId');
                            commitTransaction();
                          } else {
                            const defaultUserId = users[0].id;
                            db.run('UPDATE events SET creatorId = ? WHERE creatorId IS NULL', [defaultUserId], (err) => {
                              if (err) {
                                console.error('Error setting default creatorId:', err);
                                db.run('ROLLBACK');
                                db.close();
                                process.exit(1);
                              }
                              console.log('Set default creatorId for existing events');
                              commitTransaction();
                            });
                          }
                        });
                      });
                    } else {
                      console.log('creatorId column already exists');
                      commitTransaction();
                    }
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});

function commitTransaction() {
  // Commit transaction
  db.run('COMMIT', (err) => {
    if (err) {
      console.error('Error committing transaction:', err);
      db.run('ROLLBACK');
      db.close();
      process.exit(1);
    }
    console.log('Transaction committed successfully');
    console.log('All missing columns added to events table');
    
    // Close the database connection
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
        process.exit(1);
      }
      console.log('Database connection closed');
    });
  });
}
