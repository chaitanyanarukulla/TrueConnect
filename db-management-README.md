# TrueConnect Database Management

This document provides information about the database management utilities available in the TrueConnect project. These tools help with database operations, diagnostics, and data seeding.

## Available Scripts

### Main Database Manager

The primary tool for database management is the `db-manager.js` script, which combines functionality from multiple database scripts:

- **db-manager.js** - All-in-one database management utility

### Database Commands

The database manager supports the following commands:

- **diagnose** - Run diagnostics on the database structure
- **reset** - Reset the database by dropping all tables
- **seed** - Seed the database with test data
- **test-db** - Test database connections
- **test-api** - Test API connections
- **fix** - Apply fixes to common database issues
- **update-schema** - Update database schema to add missing columns
- **all** - Reset, then seed the database

### Additional Utilities

- **db-update-schema.js** - Script to update the database schema with missing columns

## Usage

### Running Database Commands

To use the database manager, run:

```
node db-manager.js [command]
```

For example:

```
# Run database diagnostics
node db-manager.js diagnose

# Reset the database
node db-manager.js reset

# Seed the database with test data
node db-manager.js seed

# Update schema with missing columns
node db-manager.js update-schema
```

## Common Workflows

### Complete Database Reset and Seed

To completely reset and seed your database:

1. Reset the database:
   ```
   node db-manager.js reset
   ```

2. Restart the NestJS server to recreate the schema:
   ```
   cd backend && npm run start:dev
   ```

3. After the server has started and schema is created, seed the database:
   ```
   node db-manager.js seed
   ```

### Fixing Schema Issues

If you encounter issues with missing columns in the database schema:

1. Update the schema:
   ```
   node db-manager.js update-schema
   ```

2. Verify the changes with a diagnostic check:
   ```
   node db-manager.js diagnose
   ```

## Troubleshooting

### Missing Tables Error

If you see an error about missing tables when seeding the database:

```
Error: The following required tables are missing: [table names]
```

Follow these steps:
1. Reset the database: `node db-manager.js reset`
2. Restart the NestJS server to recreate the schema
3. After server has started, run seeding again: `node db-manager.js seed`

### Duplicate Entry Errors

If you see unique constraint errors when seeding:

```
Error: SQLITE_CONSTRAINT: UNIQUE constraint failed: [constraint details]
```

This usually means you're trying to insert data that already exists. Reset the database first with:
```
node db-manager.js reset
```

Then recreate the schema and run seed again.

### Mismatched Schema

If the seed script is trying to insert data into columns that don't exist:

1. First update the schema: `node db-manager.js update-schema`
2. If issues persist, you may need to reset the database and recreate from scratch

## Database Structure

The TrueConnect database includes the following key tables:

- **users** - User accounts and authentication
- **communities** - Community groups
- **community_members** - Community membership
- **events** - Community events
- **event_attendees** - Event attendance records
- **posts** - Community posts
- **comments** - Post comments
- **messages** - User-to-user messages
- **matches** - Dating match records
- **notifications** - User notifications

For a complete view of the database structure, run:
```
node db-manager.js diagnose
