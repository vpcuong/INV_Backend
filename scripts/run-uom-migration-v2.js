const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database\n');

    const migrationPath = path.join(
      __dirname,
      '..',
      'prisma',
      'migrations',
      '20251221000000_use_code_as_primary_key_for_uom',
      'migration.sql'
    );

    const sql = fs.readFileSync(migrationPath, 'utf-8');

    console.log('Running migration SQL file...\n');

    // Execute the entire file as one transaction
    await client.query(sql);

    console.log('\n✓ Migration completed successfully!\n');

    // Update migration record in _prisma_migrations table
    const migrationName = '20251221000000_use_code_as_primary_key_for_uom';
    await client.query(`
      INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
      VALUES ($1, $2, NOW(), $3, NULL, NULL, NOW(), 1)
      ON CONFLICT (migration_name) DO NOTHING
    `, [
      migrationName,
      '0',
      migrationName
    ]);

    console.log('✓ Migration record added to _prisma_migrations table\n');

  } catch (error) {
    console.error('\n✗ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

runMigration();
