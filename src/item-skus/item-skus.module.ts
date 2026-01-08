import { Module } from '@nestjs/common';
import { ItemSkusController } from './item-skus.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ItemSkuService } from './application/item-sku.service';
import { ItemSkuRepository } from './infrastructure/item-sku.repository';
import { ITEM_SKU_REPOSITORY } from './constant/item-sku.token';

@Module({
  imports: [PrismaModule],
  controllers: [ItemSkusController],
  providers: [
    ItemSkuService,
    {
      provide: ITEM_SKU_REPOSITORY,
      useClass: ItemSkuRepository,
    },
  ],
  exports: [ItemSkuService],
})
export class ItemSkusModule {}
