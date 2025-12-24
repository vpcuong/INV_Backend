const { Client } = require('pg');
require('dotenv').config();

async function fixUOMConversion() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    const result = await client.query(`
      SELECT * FROM "UOMConversion" WHERE "fromUOMCode" IS NULL OR "toUOMCode" IS NULL;
    `);

    console.log(`Found ${result.rowCount} UOMConversion rows with null codes:`);
    console.log(result.rows);

    if (result.rowCount > 0) {
      console.log('\n⚠️  These rows cannot be migrated. Deleting...');

      const deleteResult = await client.query(`
        DELETE FROM "UOMConversion" WHERE "fromUOMCode" IS NULL OR "toUOMCode" IS NULL;
      `);

      console.log(`✓ Deleted ${deleteResult.rowCount} rows\n`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

fixUOMConversion();
