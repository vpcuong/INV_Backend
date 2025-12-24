const { Client } = require('pg');
require('dotenv').config();

async function deleteInvalidSKUUOM() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    console.log('Deleting SKUUOM rows with null uomCode...\n');

    const result = await client.query(`
      DELETE FROM "SKUUOM" WHERE "uomCode" IS NULL;
    `);

    console.log(`✓ Deleted ${result.rowCount} rows\n`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

deleteInvalidSKUUOM();
