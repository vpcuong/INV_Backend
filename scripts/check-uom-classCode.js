const { Client } = require('pg');
require('dotenv').config();

async function checkUOM() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    const result = await client.query(`
      SELECT id, code, "classCode"
      FROM "UOM"
      WHERE "classCode" IS NULL
      LIMIT 5;
    `);

    console.log('UOM rows with null classCode:');
    console.log(result.rows);

    // Check if classId exists
    const classIdCheck = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'UOM' AND column_name = 'classId';
    `);

    console.log('\nclassId column exists:', classIdCheck.rowCount > 0);

    if (classIdCheck.rowCount > 0) {
      const withClassId = await client.query(`
        SELECT id, code, "classId", "classCode"
        FROM "UOM"
        LIMIT 5;
      `);

      console.log('\nUOM sample with classId:');
      console.log(withClassId.rows);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkUOM();
