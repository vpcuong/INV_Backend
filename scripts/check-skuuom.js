const { Client } = require('pg');
require('dotenv').config();

async function checkSKUUOM() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    const result = await client.query(`
      SELECT * FROM "SKUUOM" LIMIT 10;
    `);

    console.log('SKUUOM rows:');
    console.log(result.rows);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkSKUUOM();
