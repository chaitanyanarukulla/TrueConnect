/**
 * Database utility functions for seeding
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database configuration
const dbPath = path.join(__dirname, '../../backend', 'trueconnect.sqlite');

/**
 * Get a database connection
 */
function getDbConnection() {
  return new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Could not connect to database', err);
      process.exit(1);
    }
    console.log('Connected to SQLite database');
  });
}

/**
 * Promisify db.run
 */
function run(db, sql, params = []) {
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
function all(db, sql, params = []) {
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
function get(db, sql, params = []) {
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
 * Check if a table exists in the database
 */
async function tableExists(db, tableName) {
  try {
    const result = await get(
      db,
      `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
      [tableName]
    );
    return !!result;
  } catch (err) {
    console.error('Error checking if table exists:', err);
    return false;
  }
}

module.exports = {
  getDbConnection,
  run,
  all,
  get,
  tableExists
};
