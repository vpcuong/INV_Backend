const { Client } = require('pg');
require('dotenv').config();

async function fixSKUUOM() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    console.log('Checking SKUUOM rows with null uomCode...\n');

    const nullRows = await client.query(`
      SELECT * FROM "SKUUOM" WHERE "uomCode" IS NULL;
    `);

    console.log(`Found ${nullRows.rowCount} rows with null uomCode`);
    console.log('Data:', nullRows.rows);

    // Since we lost the uomId column and can't recover the data,
    // we need to delete these rows or the user needs to provide the correct uomCode
    console.log('\n⚠️  WARNING: These rows are missing uomCode and cannot be migrated.');
    console.log('Options:');
    console.log('1. Delete these rows (data loss)');
    console.log('2. Manually update each row with correct uomCode');
    console.log('\nPlease decide how to proceed.');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

fixSKUUOM();
