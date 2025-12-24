const { Client } = require('pg');
require('dotenv').config();

async function deleteInvalidRows() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Checking and deleting rows with null uomCode...\n');

    // Check each table
    const tables = ['ItemUOM', 'SKUUOM', 'SODetail', 'SupplierItemPackaging'];

    for (const table of tables) {
      const checkResult = await client.query(`
        SELECT COUNT(*) as count FROM "${table}" WHERE "uomCode" IS NULL;
      `);

      const count = parseInt(checkResult.rows[0].count);

      if (count > 0) {
        console.log(`${table}: Found ${count} rows with null uomCode`);

        const deleteResult = await client.query(`
          DELETE FROM "${table}" WHERE "uomCode" IS NULL;
        `);

        console.log(`  ✓ Deleted ${deleteResult.rowCount} rows\n`);
      } else {
        console.log(`${table}: No invalid rows\n`);
      }
    }

    console.log('✓ Cleanup completed!\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

deleteInvalidRows();
