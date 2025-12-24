const { Client } = require('pg');
require('dotenv').config();

async function showUOMClass() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    const result = await client.query(`
      SELECT code, name FROM "UOMClass" ORDER BY code;
    `);

    console.log('Available UOMClass:\n');
    result.rows.forEach(row => {
      console.log(`  ${row.code.padEnd(15)} - ${row.name}`);
    });

    console.log('\n\nUOMs needing classCode:\n');

    const uoms = await client.query(`
      SELECT code, name FROM "UOM" WHERE "classCode" IS NULL ORDER BY code;
    `);

    uoms.rows.forEach(row => {
      console.log(`  ${row.code.padEnd(10)} - ${row.name}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

showUOMClass();
