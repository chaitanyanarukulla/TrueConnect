/**
 * TrueConnect Database Diagnostics Script
 * 
 * This script examines the database structure and helps diagnose issues
 * with tables, columns, and foreign key constraints.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Path to the SQLite database
const DB_PATH = path.join(__dirname, 'backend', 'trueconnect.sqlite');

// Database configuration
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Could not connect to database', err);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

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
 * List all tables in the database
 */
async function listTables() {
  const tables = await all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
  console.log("=== Database Tables ===");
  tables.forEach(table => console.log(table.name));
  return tables.map(t => t.name);
}

/**
 * Show table structure
 */
async function showTableStructure(tableName) {
  console.log(`\n=== Structure of table ${tableName} ===`);
  const columns = await all(`PRAGMA table_info(${tableName})`);
  columns.forEach(col => {
    console.log(`${col.name} (${col.type})${col.pk ? ' PRIMARY KEY' : ''}${col.notnull ? ' NOT NULL' : ''}`);
  });
  return columns;
}

/**
 * Show foreign keys for a table
 */
async function showForeignKeys(tableName) {
  console.log(`\n=== Foreign Keys for table ${tableName} ===`);
  const foreignKeys = await all(`PRAGMA foreign_key_list(${tableName})`);
  if (foreignKeys.length === 0) {
    console.log(`No foreign keys found for table ${tableName}`);
  } else {
    foreignKeys.forEach(fk => {
      console.log(`${fk.from} -> ${fk.table}(${fk.to}) on delete: ${fk.on_delete || 'NO ACTION'}`);
    });
  }
  return foreignKeys;
}

/**
 * Show sample data from a table
 */
async function showSampleData(tableName, limit = 5) {
  console.log(`\n=== Sample data from table ${tableName} (${limit} rows) ===`);
  try {
    const rows = await all(`SELECT * FROM ${tableName} LIMIT ${limit}`);
    if (rows.length === 0) {
      console.log(`No data found in table ${tableName}`);
    } else {
      console.log(JSON.stringify(rows, null, 2));
    }
    return rows;
  } catch (error) {
    console.error(`Error querying table ${tableName}:`, error);
    return [];
  }
}

/**
 * Check for data integrity issues
 */
async function checkDataIntegrity(tableName, foreignKeys) {
  console.log(`\n=== Data Integrity Check for table ${tableName} ===`);
  
  for (const fk of foreignKeys) {
    try {
      const orphans = await all(`
        SELECT ${tableName}.* FROM ${tableName} 
        LEFT JOIN ${fk.table} ON ${tableName}.${fk.from} = ${fk.table}.${fk.to}
        WHERE ${fk.table}.${fk.to} IS NULL AND ${tableName}.${fk.from} IS NOT NULL
      `);
      
      if (orphans.length > 0) {
        console.log(`Found ${orphans.length} orphaned records in ${tableName} where ${fk.from} does not match any ${fk.to} in ${fk.table}`);
        console.log(orphans.slice(0, 3)); // Show first 3 problematic records
      } else {
        console.log(`No orphaned records found for ${tableName}.${fk.from} -> ${fk.table}.${fk.to}`);
      }
    } catch (error) {
      console.error(`Error checking integrity for ${tableName}.${fk.from} -> ${fk.table}.${fk.to}:`, error);
    }
  }
}

/**
 * Show unique constraints for a table
 */
async function showUniqueConstraints(tableName) {
  console.log(`\n=== Unique Constraints for table ${tableName} ===`);
  try {
    const indexes = await all(`PRAGMA index_list(${tableName})`);
    
    for (const index of indexes) {
      if (index.unique) {
        const indexInfo = await all(`PRAGMA index_info(${index.name})`);
        const columns = indexInfo.map(ii => ii.name).join(', ');
        console.log(`Unique constraint: ${index.name} on columns (${columns})`);
      }
    }
  } catch (error) {
    console.error(`Error getting unique constraints for ${tableName}:`, error);
  }
}

/**
 * Run full database diagnostics
 */
async function runDiagnostics() {
  try {
    // List all tables
    const tables = await listTables();
    
    // For each table
    for (const table of tables) {
      // Show structure
      const columns = await showTableStructure(table);
      
      // Show foreign keys
      const foreignKeys = await showForeignKeys(table);
      
      // Show unique constraints
      await showUniqueConstraints(table);
      
      // Check data integrity
      await checkDataIntegrity(table, foreignKeys);
      
      // Show sample data
      await showSampleData(table);
    }
  } catch (error) {
    console.error('Error running diagnostics:', error);
  } finally {
    db.close();
  }
}

// Run the diagnostics
runDiagnostics();
