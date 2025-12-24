const { Client } = require('pg');
require('dotenv').config();

async function rollback() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Rolling back partial migration...\n');

    // Drop columns that were added
    const rollbackSteps = [
      'ALTER TABLE "ItemUOM" DROP COLUMN IF EXISTS "uomCode"',
      'ALTER TABLE "SKUUOM" DROP COLUMN IF EXISTS "uomCode"',
      'ALTER TABLE "SODetail" DROP COLUMN IF EXISTS "uomCode"',
      'ALTER TABLE "SupplierItemPackaging" DROP COLUMN IF EXISTS "uomCode"',
      'ALTER TABLE "Item" DROP COLUMN IF EXISTS "uomCode"',
      'ALTER TABLE "ItemSKU" DROP COLUMN IF EXISTS "uomCode"',
      'ALTER TABLE "UOM" DROP COLUMN IF EXISTS "classCode"',
      'ALTER TABLE "UOMConversion" DROP COLUMN IF EXISTS "fromUOMCode"',
      'ALTER TABLE "UOMConversion" DROP COLUMN IF EXISTS "toUOMCode"',
    ];

    for (const step of rollbackSteps) {
      console.log(`Executing: ${step}`);
      await client.query(step);
      console.log('  ✓ Success\n');
    }

    console.log('✓ Rollback completed!\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

rollback();
