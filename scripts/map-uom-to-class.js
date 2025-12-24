const { Client } = require('pg');
require('dotenv').config();

async function mapUOMToClass() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    console.log('Mapping UOMs to UOMClass...\n');

    // Define the mapping
    const mapping = {
      // LENGTH class
      'CM': 'LENGTH',
      'M': 'LENGTH',
      'IN': 'LENGTH',

      // WEIGHT class
      'G': 'WEIGHT',
      'KG': 'WEIGHT',

      // VOLUME class
      'L': 'VOLUME',
      'ML': 'VOLUME',

      // AREA class
      'CM2': 'AREA',
      'M2': 'AREA',

      // COUNT class
      'EA': 'COUNT',
      'PA': 'COUNT',
      'SET': 'COUNT',
      'BOX': 'COUNT',
      'CTN': 'COUNT',
    };

    for (const [uomCode, classCode] of Object.entries(mapping)) {
      const result = await client.query(`
        UPDATE "UOM"
        SET "classCode" = $1
        WHERE code = $2 AND "classCode" IS NULL;
      `, [classCode, uomCode]);

      if (result.rowCount > 0) {
        console.log(`✓ ${uomCode.padEnd(10)} → ${classCode}`);
      }
    }

    // Check if any UOMs still have null classCode
    const remaining = await client.query(`
      SELECT code, name FROM "UOM" WHERE "classCode" IS NULL;
    `);

    if (remaining.rowCount > 0) {
      console.log('\n⚠️  UOMs still missing classCode:');
      remaining.rows.forEach(row => {
        console.log(`  ${row.code} - ${row.name}`);
      });
    } else {
      console.log('\n✓ All UOMs have been mapped to UOMClass!');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

mapUOMToClass();
