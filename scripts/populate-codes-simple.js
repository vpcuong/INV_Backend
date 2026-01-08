require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting to populate codes...');

  // 1. Populate ItemCategory codes
  const itemCategories = await prisma.itemCategory.findMany({
    where: {
      code: null,
    },
  });

  console.log(`Found ${itemCategories.length} ItemCategories without codes`);

  for (const category of itemCategories) {
    const code = `CAT${category.id.toString().padStart(4, '0')}`;
    await prisma.itemCategory.update({
      where: { id: category.id },
      data: { code },
    });
    console.log(`Updated ItemCategory ${category.id} with code: ${code}`);
  }

  // 2. Populate ItemType codes
  const itemTypes = await prisma.itemType.findMany({
    where: {
      code: null,
    },
  });

  console.log(`Found ${itemTypes.length} ItemTypes without codes`);

  for (const itemType of itemTypes) {
    const code = `TYPE${itemType.id.toString().padStart(4, '0')}`;
    await prisma.itemType.update({
      where: { id: itemType.id },
      data: { code },
    });
    console.log(`Updated ItemType ${itemType.id} with code: ${code}`);
  }

  // 3. Populate Item codes
  const items = await prisma.item.findMany({
    where: {
      code: null,
    },
  });

  console.log(`Found ${items.length} Items without codes`);

  for (const item of items) {
    const code = `ITEM${item.id.toString().padStart(4, '0')}`;
    await prisma.item.update({
      where: { id: item.id },
      data: { code },
    });
    console.log(`Updated Item ${item.id} with code: ${code}`);
  }

  console.log('Done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });