/**
 * Database Configuration Fix Script
 * 
 * This script addresses the discrepancy between the database configuration in app.module.ts
 * and the environment variables in .env by updating the application to use the correct
 * database configuration.
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

/**
 * Main function to orchestrate database configuration fixes
 */
async function fixDatabaseConfig() {
  console.log('🔍 Starting database configuration fix...\n');
  
  // Get the current configurations
  const currentConfigs = await getCurrentConfigurations();
  displayCurrentConfigurations(currentConfigs);
  
  // Determine what database system is actually in use
  const dbTypeInUse = determineDbTypeInUse(currentConfigs);
  
  // Update app.module.ts if needed
  await updateAppModule(dbTypeInUse, currentConfigs);
  
  // Update the port configuration if there's a mismatch
  await fixPortMismatch(currentConfigs);
  
  console.log('\n✅ Database configuration fixes completed');
}

/**
 * Get current configurations from various files
 */
async function getCurrentConfigurations() {
  console.log('Gathering current configurations...');
  
  // Read app.module.ts
  const appModulePath = path.join(__dirname, 'backend', 'src', 'app.module.ts');
  const appModuleContent = fs.readFileSync(appModulePath, 'utf8');
  
  // Read backend .env
  const backendEnvPath = path.join(__dirname, 'backend', '.env');
  const backendEnvContent = fs.readFileSync(backendEnvPath, 'utf8');
  
  // Read frontend .env.local
  const frontendEnvPath = path.join(__dirname, 'frontend', '.env.local');
  const frontendEnvContent = fs.readFileSync(frontendEnvPath, 'utf8');
  
  // Extract database type from app.module.ts
  const dbTypeMatch = appModuleContent.match(/type: '(\w+)'/);
  const dbType = dbTypeMatch ? dbTypeMatch[1] : 'unknown';
  
  // Extract database path from app.module.ts if SQLite
  const dbPathMatch = appModuleContent.match(/database: '([^']+)'/);
  const dbPath = dbPathMatch ? dbPathMatch[1] : 'unknown';
  
  // Extract backend API port from .env
  const backendPortMatch = backendEnvContent.match(/PORT=(\d+)/);
  const backendPort = backendPortMatch ? backendPortMatch[1] : '3001';
  
  // Extract frontend API URL from .env.local
  const frontendApiUrlMatch = frontendEnvContent.match(/NEXT_PUBLIC_API_URL=([^\r\n]+)/);
  const frontendApiUrl = frontendApiUrlMatch ? frontendApiUrlMatch[1] : 'http://localhost:5000/api';
  
  // Extract PostgreSQL config from backend .env
  const postgresConfig = {
    host: extractEnvVar(backendEnvContent, 'DB_HOST'),
    port: extractEnvVar(backendEnvContent, 'DB_PORT'),
    username: extractEnvVar(backendEnvContent, 'DB_USERNAME'),
    password: extractEnvVar(backendEnvContent, 'DB_PASSWORD'),
    database: extractEnvVar(backendEnvContent, 'DB_DATABASE'),
  };
  
  // Check if SQLite database file exists
  const sqliteDbPath = path.join(__dirname, 'backend', dbPath);
  const sqliteExists = fs.existsSync(sqliteDbPath);
  
  return {
    appModulePath,
    appModuleContent,
    backendEnvPath,
    frontendEnvPath,
    frontendApiUrl,
    dbType,
    dbPath,
    sqliteExists,
    postgresConfig,
    backendPort,
  };
}

/**
 * Extract an environment variable value from .env content
 */
function extractEnvVar(envContent, varName) {
  const match = envContent.match(new RegExp(`${varName}=([^\\r\\n]+)`));
  return match ? match[1] : '';
}

/**
 * Display the current configurations
 */
function displayCurrentConfigurations(configs) {
  console.log('\nCurrent configurations:');
  console.log('----------------------');
  console.log(`Database type in app.module.ts: ${configs.dbType}`);
  
  if (configs.dbType === 'sqlite') {
    console.log(`SQLite database path: ${configs.dbPath}`);
    console.log(`SQLite database file exists: ${configs.sqliteExists ? 'Yes' : 'No'}`);
  }
  
  console.log('\nPostgreSQL configuration in .env:');
  console.log(`Host: ${configs.postgresConfig.host}`);
  console.log(`Port: ${configs.postgresConfig.port}`);
  console.log(`Username: ${configs.postgresConfig.username}`);
  console.log(`Database: ${configs.postgresConfig.database}`);
  
  console.log('\nBackend API port: ' + configs.backendPort);
  console.log('Frontend API URL: ' + configs.frontendApiUrl);
  
  // Extract port from frontendApiUrl
  const frontendPortMatch = configs.frontendApiUrl.match(/:(\d+)\//);
  const frontendPort = frontendPortMatch ? frontendPortMatch[1] : 'unknown';
  
  if (frontendPort !== configs.backendPort) {
    console.log('\n⚠️ Port mismatch detected:');
    console.log(`   Backend is configured to run on port ${configs.backendPort}`);
    console.log(`   Frontend is configured to connect to port ${frontendPort}`);
  }
}

/**
 * Determine which database system is actually in use
 */
function determineDbTypeInUse(configs) {
  // If SQLite database file exists, it's likely being used
  if (configs.dbType === 'sqlite' && configs.sqliteExists) {
    console.log('\n📊 SQLite database file exists and appears to be in use');
    return 'sqlite';
  }
  
  // If PostgreSQL credentials are provided and SQLite doesn't exist or isn't configured
  if (configs.postgresConfig.host && configs.postgresConfig.database) {
    console.log('\n📊 PostgreSQL configuration is provided in .env');
    return 'postgres';
  }
  
  // Default fallback
  console.log('\n📊 Unable to determine database type, assuming SQLite as fallback');
  return 'sqlite';
}

/**
 * Update app.module.ts to use the correct database configuration
 */
async function updateAppModule(dbTypeInUse, configs) {
  console.log(`\nUpdating app.module.ts to use ${dbTypeInUse} configuration...`);
  
  let newAppModuleContent = configs.appModuleContent;
  
  if (dbTypeInUse === 'sqlite') {
    // If SQLite is in use, but app.module.ts doesn't match
    if (configs.dbType !== 'sqlite') {
      // Replace the TypeORM configuration with SQLite
      newAppModuleContent = newAppModuleContent.replace(
        /TypeOrmModule\.forRoot\({[^}]+}\)/s,
        `TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'trueconnect.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: true,
    })`
      );
    }
  } else if (dbTypeInUse === 'postgres') {
    // If PostgreSQL is in use, but app.module.ts doesn't match
    if (configs.dbType !== 'postgres') {
      // Replace the TypeORM configuration with PostgreSQL using environment variables
      newAppModuleContent = newAppModuleContent.replace(
        /TypeOrmModule\.forRoot\({[^}]+}\)/s,
        `TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: true,
    })`
      );
    }
  }
  
  // Save the updated app.module.ts
  if (newAppModuleContent !== configs.appModuleContent) {
    fs.writeFileSync(configs.appModulePath, newAppModuleContent);
    console.log('✅ Updated app.module.ts with correct database configuration');
  } else {
    console.log('✓ app.module.ts already has the correct configuration');
  }
}

/**
 * Fix port mismatch between backend and frontend
 */
async function fixPortMismatch(configs) {
  // Extract port from frontendApiUrl
  const frontendPortMatch = configs.frontendApiUrl.match(/:(\d+)\//);
  const frontendPort = frontendPortMatch ? frontendPortMatch[1] : null;
  
  if (frontendPort && frontendPort !== configs.backendPort) {
    console.log('\nFixing port mismatch between backend and frontend...');
    
    // Determine which to update based on configuration
    const useBackendPort = parseInt(configs.backendPort, 10) === 5000;
    
    if (useBackendPort) {
      // Update frontend to match backend
      const newFrontendEnvContent = configs.frontendEnvContent.replace(
        /NEXT_PUBLIC_API_URL=([^\r\n]+)/,
        `NEXT_PUBLIC_API_URL=http://localhost:${configs.backendPort}/api`
      );
      
      fs.writeFileSync(configs.frontendEnvPath, newFrontendEnvContent);
      console.log(`✅ Updated frontend API URL to use port ${configs.backendPort}`);
    } else {
      // Update backend to match frontend
      const newBackendEnvContent = fs.readFileSync(configs.backendEnvPath, 'utf8').replace(
        /PORT=(\d+)/,
        `PORT=${frontendPort}`
      );
      
      fs.writeFileSync(configs.backendEnvPath, newBackendEnvContent);
      console.log(`✅ Updated backend port to match frontend (${frontendPort})`);
    }
  } else {
    console.log('\n✓ Backend and frontend ports are in sync');
  }
}

// Run the database configuration fix
fixDatabaseConfig().catch(err => {
  console.error('Error fixing database configuration:', err);
});
