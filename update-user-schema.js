/**
 * Database schema update script for enhanced user profiles
 * 
 * This script adds new columns to the users table for improved matching:
 * - relationshipType
 * - lifestyle
 * - personality
 * - values
 */

const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');

async function updateUserSchema() {
  console.log('Starting database schema update for enhanced user profiles...');
  
  try {
    // Open database connection
    const dbPath = path.join(__dirname, 'backend', 'trueconnect.sqlite');
    console.log(`Opening database at: ${dbPath}`);
    
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    console.log('Connected to database successfully');
    
    // Check if columns already exist
    const tableInfo = await db.all("PRAGMA table_info(users)");
    const columnNames = tableInfo.map(col => col.name);
    
    console.log('Current user table columns:', columnNames);
    
    // Add new columns if they don't exist
    const columnsToAdd = [
      {
        name: 'relationshipType',
        definition: 'TEXT'
      },
      {
        name: 'lifestyle',
        definition: 'TEXT'
      },
      {
        name: 'personality',
        definition: 'TEXT'
      },
      {
        name: 'values',
        definition: 'TEXT'
      }
    ];
    
    let addedColumns = 0;
    
    for (const column of columnsToAdd) {
      if (!columnNames.includes(column.name)) {
        console.log(`Adding column: ${column.name}`);
        await db.exec(`ALTER TABLE users ADD COLUMN ${column.name} ${column.definition}`);
        addedColumns++;
      } else {
        console.log(`Column already exists: ${column.name}`);
      }
    }
    
    // Close database connection
    await db.close();
    
    if (addedColumns > 0) {
      console.log(`Schema update completed successfully! Added ${addedColumns} new columns.`);
    } else {
      console.log('Schema update completed. No new columns were needed.');
    }
    
  } catch (error) {
    console.error('Error updating schema:', error);
  }
}

// Execute the update function
updateUserSchema();
