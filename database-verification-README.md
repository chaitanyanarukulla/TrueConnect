# TrueConnect Database Verification Tools

This directory contains a set of scripts to verify and troubleshoot database connections in the TrueConnect application. These tools help ensure that the database is correctly connected to the application and that data is being accurately transferred and saved.

## Available Scripts

1. **verify-database-connection.js** - Main verification script that runs all checks and provides recommendations.
2. **test-db-connection.js** - Tests database connections for both SQLite and PostgreSQL.
3. **test-api-connection.js** - Tests API connectivity between frontend and backend.
4. **fix-database-config.js** - Fixes database configuration discrepancies.

## Prerequisites

These scripts require Node.js and the following npm packages installed in the backend directory:
- sqlite3
- pg
- node-fetch

Install the required dependencies by running:

```bash
cd TrueConnect/backend
npm install --save sqlite3 pg node-fetch
```

The verification script will detect missing dependencies and guide you through the installation process if needed.

## Usage

### Run the Main Verification Script

The easiest way to verify and fix your database connection is to run the main verification script from the project root directory (c:/Users/chain/Projects/personal/):

```bash
# Important: Run from the project root directory
node TrueConnect/verify-database-connection.js
```

Note: Do NOT run these scripts from within the TrueConnect/backend directory as this will cause path resolution errors.

This script will:
1. Check if required dependencies are installed
2. Test connections to both SQLite and PostgreSQL databases
3. Verify if there's test data in the database
4. Offer to fix any detected configuration issues
5. Test the API connection between frontend and backend
6. Provide a summary and recommendations

### Run Individual Scripts

You can also run each script individually:

#### Test Database Connection

```bash
node TrueConnect/test-db-connection.js
```

This script checks connections to both SQLite and PostgreSQL databases and reports which one is active and accessible.

#### Test API Connection

```bash
node TrueConnect/test-api-connection.js
```

This script tests the connection between the frontend and backend, including authentication and data retrieval.

#### Fix Database Configuration

```bash
node TrueConnect/fix-database-config.js
```

This script resolves discrepancies between the database configuration in app.module.ts and the environment variables in .env files.

## Common Issues and Solutions

### Database Configuration Mismatch

If the app.module.ts is configured for SQLite, but your .env file contains PostgreSQL credentials, the application might be using the wrong database. The fix-database-config.js script can detect and fix this issue.

### Missing Test Data

If your database connection is successful but there's no test data, you can run the seed-test-data.js script to populate the database with test data:

```bash
node TrueConnect/seed-test-data.js
```

### Port Mismatch

If the frontend is configured to connect to a different port than what the backend is running on, the API connection will fail. The fix-database-config.js script can detect and fix this issue.

## Troubleshooting

If you encounter issues with these scripts:

1. **Missing Dependencies**: Make sure you have Node.js installed and run the verification script, which will offer to install any missing dependencies.

2. **Database Connection Fails**: Check that the database server is running (for PostgreSQL) or that the SQLite file exists.

3. **API Connection Fails**: Check that the backend server is running. You can start it with `npm run start` in the backend directory.

4. **Permission Issues**: On macOS/Linux, you might need to add execute permissions to the scripts:
   ```bash
   chmod +x TrueConnect/verify-database-connection.js
   ```

## Adding Your Own Tests

If you want to add your own custom tests, you can modify any of these scripts or create new ones. The scripts are designed to be modular and extensible.

For example, to add a new API endpoint test, you can modify the test-api-connection.js file and add a new test function.
