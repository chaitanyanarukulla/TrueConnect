/**
 * TrueConnect Test User Registration Script
 * 
 * This script creates a test user in the database for testing purposes.
 */

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Database configuration
const db = new sqlite3.Database(path.join(__dirname, 'backend', 'trueconnect.sqlite'), (err) => {
  if (err) {
    console.error('Could not connect to database', err);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
});

/**
 * Utility function to hash passwords
 */
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

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
 * Create a test user
 */
async function createTestUser() {
  try {
    // Hash password
    const password = await hashPassword('Test123!');
    
    // User data
    const userId = uuidv4();
    const email = 'testuser@example.com';
    const name = 'Test User';
    const birthdate = '1995-01-01';
    const gender = 'other';
    
    // Insert user
    await run(
      'INSERT INTO users (id, email, password, name, birthdate, gender, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, datetime("now"), datetime("now"))',
      [userId, email, password, name, birthdate, gender]
    );
    
    console.log('Test user created successfully!');
    console.log('Email:', email);
    console.log('Password: Test123!');
    console.log('User ID:', userId);
    
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    // Close database connection
    db.close();
  }
}

// Run the function
createTestUser();
