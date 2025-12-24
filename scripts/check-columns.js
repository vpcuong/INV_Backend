const { Client } = require('pg');
require('dotenv').config();

async function checkColumns() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Checking columns...\n');

    const tables = ['ItemUOM', 'SKUUOM', 'UOM', 'UOMClass', 'Item', 'ItemSKU', 'SODetail', 'SupplierItemPackaging', 'UOMConversion'];

    for (const table of tables) {
      const result = await client.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position;
      `, [table]);

      console.log(`\n${table}:`);
      result.rows.forEach(row => {
        console.log(`  - ${row.column_name} (${row.data_type})`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkColumns();
