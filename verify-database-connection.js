/**
 * TrueConnect Database and API Verification Script
 * 
 * This script performs a comprehensive verification of:
 * 1. Database connection
 * 2. API connection
 * 3. User authentication
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const axios = require('axios');
const fs = require('fs');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

// Configuration
const dbPath = path.join(__dirname, 'backend', 'trueconnect.sqlite');
const apiBaseUrl = process.env.BACKEND_URL || 'http://localhost:3001';
const frontendEnvPath = path.join(__dirname, 'frontend', '.env.local');

// Test credentials
const testCredentials = {
  email: 'testuser@example.com',
  password: 'Test123!'
};

// Get API URL from frontend .env.local if available
try {
  const frontendEnv = fs.readFileSync(frontendEnvPath, 'utf8');
  const apiUrlMatch = frontendEnv.match(/NEXT_PUBLIC_API_URL=(.*)/);
  if (apiUrlMatch && apiUrlMatch[1]) {
    apiBaseUrl = apiUrlMatch[1].trim().replace(/["']/g, '');
  }
} catch (err) {
  console.log(`${colors.yellow}⚠️ Could not read frontend .env.local file${colors.reset}`);
}

console.log(`
${colors.cyan}==============================================
   TrueConnect Database & API Verification Tool
==============================================
${colors.reset}
`);

// Main verification function
async function verifySystem() {
  const results = {
    databaseConnection: false,
    tablesCreated: false,
    usersExist: false,
    apiConnection: false,
    authWorks: false
  };

  // 1. Verify Database Connection
  console.log(`${colors.blue}[1/5] Testing database connection...${colors.reset}`);
  await verifyDatabaseConnection(results);

  // 2. Verify Tables Created
  console.log(`\n${colors.blue}[2/5] Checking if database tables exist...${colors.reset}`);
  await verifyTablesCreated(results);

  // 3. Verify Users Exist
  console.log(`\n${colors.blue}[3/5] Checking if test users exist...${colors.reset}`);
  await verifyUsersExist(results);

  // 4. Verify API Connection
  console.log(`\n${colors.blue}[4/5] Testing API connection...${colors.reset}`);
  await verifyApiConnection(results);

  // 5. Verify Authentication
  console.log(`\n${colors.blue}[5/5] Testing user authentication...${colors.reset}`);
  await verifyAuthentication(results);

  // Display summary
  displaySummary(results);
}

// Verify database connection
async function verifyDatabaseConnection(results) {
  return new Promise((resolve) => {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        console.log(`${colors.red}❌ SQLite connection failed: ${err.message}${colors.reset}`);
        results.databaseConnection = false;
        db.close();
        resolve(false);
        return;
      }
      
      console.log(`${colors.green}✅ SQLite connection successful${colors.reset}`);
      results.databaseConnection = true;
      db.close();
      resolve(true);
    });
  });
}

// Verify database tables
async function verifyTablesCreated(results) {
  return new Promise((resolve) => {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);
    
    db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
      if (err) {
        console.log(`${colors.red}❌ Failed to query database tables: ${err.message}${colors.reset}`);
        results.tablesCreated = false;
        db.close();
        resolve(false);
        return;
      }
      
      if (tables.length === 0) {
        console.log(`${colors.red}❌ No tables found in database${colors.reset}`);
        results.tablesCreated = false;
        db.close();
        resolve(false);
        return;
      }
      
      const tableNames = tables.map(t => t.name).filter(name => !name.startsWith('sqlite_'));
      console.log(`${colors.green}✅ Found ${tableNames.length} tables in database: ${tableNames.join(', ')}${colors.reset}`);
      
      // Check for essential tables
      const essentialTables = ['users', 'messages', 'conversations', 'matches'];
      const missingTables = essentialTables.filter(t => !tableNames.includes(t));
      
      if (missingTables.length > 0) {
        console.log(`${colors.yellow}⚠️ Missing essential tables: ${missingTables.join(', ')}${colors.reset}`);
        results.tablesCreated = false;
      } else {
        console.log(`${colors.green}✅ All essential tables exist${colors.reset}`);
        results.tablesCreated = true;
      }
      
      db.close();
      resolve(true);
    });
  });
}

// Verify users exist
async function verifyUsersExist(results) {
  return new Promise((resolve) => {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);
    
    db.all('SELECT COUNT(*) as count FROM "users"', [], (err, rows) => {
      if (err) {
        console.log(`${colors.red}❌ Failed to query users table: ${err.message}${colors.reset}`);
        results.usersExist = false;
        db.close();
        resolve(false);
        return;
      }
      
      const userCount = rows[0].count;
      if (userCount === 0) {
        console.log(`${colors.red}❌ No users found in database${colors.reset}`);
        results.usersExist = false;
      } else {
        console.log(`${colors.green}✅ Found ${userCount} users in database${colors.reset}`);
        results.usersExist = true;
        
        // Show sample user data
        db.all('SELECT id, email, name FROM "users" LIMIT 3', [], (err, users) => {
          if (!err && users.length > 0) {
            console.log(`${colors.cyan}Sample user data:${colors.reset}`);
            users.forEach(user => {
              console.log(`  • Name: ${user.name}, Email: ${user.email}, ID: ${user.id}`);
            });
          }
        });
      }
      
      db.close();
      resolve(true);
    });
  });
}

// Verify API connection
async function verifyApiConnection(results) {
  try {
    console.log(`${colors.cyan}Attempting to connect to API at ${apiBaseUrl}${colors.reset}`);
    const response = await axios.get(`${apiBaseUrl}/api/health`, { timeout: 5000 });
    
    if (response.status === 200) {
      console.log(`${colors.green}✅ API connection successful${colors.reset}`);
      results.apiConnection = true;
    } else {
      console.log(`${colors.red}❌ API responded with status ${response.status}${colors.reset}`);
      results.apiConnection = false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ API connection failed: ${error.message}${colors.reset}`);
    
    // Check if it's a connection error and provide helpful suggestions
    if (error.code === 'ECONNREFUSED') {
      console.log(`${colors.yellow}⚠️ Suggestions:${colors.reset}`);
      console.log(`   • Make sure the backend server is running`);
      console.log(`   • Check that the port in .env.local matches the backend port`);
      console.log(`   • Ensure the API URL is correct: ${apiBaseUrl}`);
    }
    
    results.apiConnection = false;
  }
  
  return results.apiConnection;
}

// Verify authentication
async function verifyAuthentication(results) {
  try {
    console.log(`${colors.cyan}Attempting to login with test user: ${testCredentials.email}${colors.reset}`);
    
    const response = await axios.post(
      `${apiBaseUrl}/api/auth/login`, 
      testCredentials, 
      { 
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000 
      }
    );
    
    if (response.status === 200 && response.data && response.data.token) {
      console.log(`${colors.green}✅ Authentication successful${colors.reset}`);
      results.authWorks = true;
    } else {
      console.log(`${colors.red}❌ Authentication failed: Response didn't include a token${colors.reset}`);
      results.authWorks = false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Authentication failed: ${error.message}${colors.reset}`);
    console.log(`${colors.yellow}⚠️ Try running register-test-user.js to create a test user${colors.reset}`);
    results.authWorks = false;
  }
  
  return results.authWorks;
}

// Display summary
function displaySummary(results) {
  const totalChecks = Object.keys(results).length;
  const passedChecks = Object.values(results).filter(v => v).length;
  
  console.log(`\n${colors.cyan}==============================================
   Verification Summary (${passedChecks}/${totalChecks} checks passed)
==============================================${colors.reset}\n`);
  
  console.log(`Database Connection: ${results.databaseConnection ? colors.green + '✅ Success' : colors.red + '❌ Failed'}`);
  console.log(`Database Tables: ${results.tablesCreated ? colors.green + '✅ Created' : colors.red + '❌ Missing'}`);
  console.log(`Test Users: ${results.usersExist ? colors.green + '✅ Exist' : colors.red + '❌ Missing'}`);
  console.log(`API Connection: ${results.apiConnection ? colors.green + '✅ Success' : colors.red + '❌ Failed'}`);
  console.log(`Authentication: ${results.authWorks ? colors.green + '✅ Working' : colors.red + '❌ Failed'}`);
  console.log(colors.reset);
  
  if (passedChecks === totalChecks) {
    console.log(`${colors.green}🎉 All checks passed! TrueConnect is set up correctly.${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠️ Some checks failed. Please review the issues above.${colors.reset}`);
    
    // Provide recommendations
    console.log(`\n${colors.cyan}Recommendations:${colors.reset}`);
    
    if (!results.databaseConnection) {
      console.log(`• Check the database configuration in app.module.ts and .env files`);
    }
    
    if (!results.tablesCreated) {
      console.log(`• Run migrations or restart the backend server to create tables`);
    }
    
    if (!results.usersExist) {
      console.log(`• Run node register-test-user.js to create a test user`);
    }
    
    if (!results.apiConnection) {
      console.log(`• Make sure the backend server is running on the correct port`);
      console.log(`• Check the API URL configuration in frontend/.env.local`);
    }
    
    if (!results.authWorks) {
      console.log(`• Verify that JWT configuration is correct in backend/.env`);
      console.log(`• Check that authentication routes are working properly`);
    }
  }
}

// Run the verification
verifySystem().catch(err => {
  console.error(`${colors.red}Error during verification: ${err.message}${colors.reset}`);
});
