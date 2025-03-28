/**
 * Main Seeding Script
 * 
 * This script coordinates all seed modules to populate the database with test data.
 * Run this script to reset and re-seed the database with fresh data.
 */

const { getDbConnection, tableExists } = require('./utils/db');
const seedUsers = require('./seed-users');
const { seedCommunities, seedCommunityMemberships } = require('./seed-communities');
const { seedEvents, seedEventRSVPs } = require('./seed-events');

async function runSeeds() {
  console.log('Starting database seeding process...');
  
  // Connect to the database
  const db = getDbConnection();
  
  try {
    // Verify database has required tables
    console.log('Verifying database schema...');
    const tablesRequired = ['users', 'communities', 'community_members', 'events', 'event_attendees'];
    
    for (const table of tablesRequired) {
      const exists = await tableExists(db, table);
      if (!exists) {
        console.error(`Required table '${table}' does not exist in the database.`);
        console.error('Please run the database migration script first.');
        process.exit(1);
      }
    }
    
    console.log('Database schema verified ✓');
    
    // Seed in order: users -> communities -> events, etc.
    const users = await seedUsers(db);
    console.log(`Users seeded ✓ (${users.length} records)`);
    
    const communities = await seedCommunities(db, users);
    console.log(`Communities seeded ✓ (${communities.length} records)`);
    
    const membershipCount = await seedCommunityMemberships(db, communities, users);
    console.log(`Community memberships seeded ✓ (${membershipCount} records)`);
    
    const events = await seedEvents(db, communities, users);
    console.log(`Events seeded ✓ (${events.length} records)`);
    
    const rsvpCount = await seedEventRSVPs(db, events, users);
    console.log(`Event RSVPs seeded ✓ (${rsvpCount} records)`);
    
    console.log('All seed data created successfully!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    db.close((err) => {
      if (err) {
        console.error('Error closing database connection:', err);
      } else {
        console.log('Database connection closed');
      }
    });
  }
}

// Run the seeds
runSeeds().catch(console.error);
