const { Client } = require('pg');
require('dotenv').config();

async function fixSODetail() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    // Check SODetail
    const checkResult = await client.query(`
      SELECT * FROM "SODetail" WHERE "uomCode" IS NULL;
    `);

    console.log(`Found ${checkResult.rowCount} SODetail rows with null uomCode:`);
    console.log(checkResult.rows);

    if (checkResult.rowCount > 0) {
      console.log('\nDeleting these rows...');

      const deleteResult = await client.query(`
        DELETE FROM "SODetail" WHERE "uomCode" IS NULL;
      `);

      console.log(`✓ Deleted ${deleteResult.rowCount} rows\n`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

fixSODetail();
