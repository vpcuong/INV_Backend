const { Client } = require('pg');
require('dotenv').config();

async function checkConstraints() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Checking constraints...\n');

    const result = await client.query(`
      SELECT
        tc.table_name,
        tc.constraint_name,
        tc.constraint_type
      FROM information_schema.table_constraints tc
      WHERE tc.table_schema = 'public'
        AND tc.table_name IN ('ItemUOM', 'SKUUOM', 'UOM', 'UOMClass', 'Item', 'ItemSKU', 'SODetail', 'SupplierItemPackaging', 'UOMConversion')
      ORDER BY tc.table_name, tc.constraint_type;
    `);

    console.log('Found constraints:');
    result.rows.forEach(row => {
      console.log(`${row.table_name}.${row.constraint_name} (${row.constraint_type})`);
    });

    // Check indexes
    const indexResult = await client.query(`
      SELECT
        tablename,
        indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename IN ('ItemUOM', 'SKUUOM')
      ORDER BY tablename;
    `);

    console.log('\nFound indexes:');
    indexResult.rows.forEach(row => {
      console.log(`${row.tablename}.${row.indexname}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkConstraints();
