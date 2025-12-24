import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function runMigration() {
  const migrationPath = path.join(
    __dirname,
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

  console.log(`Running ${statements.length} SQL statements...`);

  try {
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\nExecuting statement ${i + 1}/${statements.length}:`);
      console.log(statement.substring(0, 100) + '...');

      await prisma.$executeRawUnsafe(statement);
      console.log('✓ Success');
    }

    console.log('\n✓ Migration completed successfully!');
  } catch (error) {
    console.error('\n✗ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

runMigration()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
