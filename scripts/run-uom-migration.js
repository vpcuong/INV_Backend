const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Read DATABASE_URL from .env
require('dotenv').config();

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    const migrationPath = path.join(
      __dirname,
      '..',
      'prisma',
      'migrations',
      '20251221000000_use_code_as_primary_key_for_uom',
      'migration.sql'
    );

    const sql = fs.readFileSync(migrationPath, 'utf-8');

    // Split by semicolon and filter empty statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`\nRunning ${statements.length} SQL statements...\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const preview = statement.length > 80
        ? statement.substring(0, 80) + '...'
        : statement;

      console.log(`[${i + 1}/${statements.length}] ${preview}`);

      try {
        await client.query(statement);
        console.log('  ✓ Success\n');
      } catch (error) {
        console.error(`  ✗ Failed: ${error.message}\n`);
        throw error;
      }
    }

    console.log('\n✓ Migration completed successfully!\n');

    // Update migration record in _prisma_migrations table
    const migrationName = '20251221000000_use_code_as_primary_key_for_uom';
    await client.query(`
      INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
      VALUES ($1, $2, NOW(), $3, NULL, NULL, NOW(), 1)
      ON CONFLICT (migration_name) DO NOTHING
    `, [
      migrationName,
      '0', // checksum placeholder
      migrationName
    ]);

    console.log('✓ Migration record added to _prisma_migrations table\n');

  } catch (error) {
    console.error('\n✗ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

runMigration();
