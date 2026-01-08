import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

async function main() {
  console.log('Starting to populate codes...');

  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);

  // 1. Populate ItemCategory codes
  const itemCategories = await prisma.client.itemCategory.findMany({
    where: {
      code: null,
    },
  });

  console.log(`Found ${itemCategories.length} ItemCategories without codes`);

  for (const category of itemCategories) {
    const code = `CAT${category.id.toString().padStart(4, '0')}`;
    await prisma.client.itemCategory.update({
      where: { id: category.id },
      data: { code },
    });
    console.log(`Updated ItemCategory ${category.id} with code: ${code}`);
  }

  // 2. Populate ItemType codes
  const itemTypes = await prisma.client.itemType.findMany({
    where: {
      code: null,
    },
  });

  console.log(`Found ${itemTypes.length} ItemTypes without codes`);

  for (const itemType of itemTypes) {
    const code = `TYPE${itemType.id.toString().padStart(4, '0')}`;
    await prisma.client.itemType.update({
      where: { id: itemType.id },
      data: { code },
    });
    console.log(`Updated ItemType ${itemType.id} with code: ${code}`);
  }

  console.log('Done!');

  await app.close();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });