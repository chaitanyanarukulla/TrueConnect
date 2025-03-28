/**
 * Seed runner script
 * 
 * This is the main entry point for seeding the database.
 * For comprehensive database management, please use the db-manager.js script instead.
 */

console.log('TrueConnect Database Seeder');
console.log('----------------------------');
console.log('NOTE: For more functionality, consider using the db-manager.js script:');
console.log('      node db-manager.js seed');
console.log('\nLoading and executing seed modules...');

// Execute the database manager with the seed command
require('child_process').execSync('node db-manager.js seed', { stdio: 'inherit' });
